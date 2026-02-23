const axios = require("axios");
const logger = require("../../utils/logger");
const fs = require("fs");
const mongoose = require("mongoose");
const NFT = require("../../models/NFT");

class AIVisionService {
  /**
   * Prevents plagiarism by extracting a visual embedding from the NFT image.
   * Uses Groq for image-to-text description, and Gemini to embed that text.
   * @param {String} imagePath - Absolute local path to uploaded image.
   * @returns {Array<Number>} - Dense vector array of image features.
   */
  async getImageEmbedding(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      const base64Image = imageBuffer.toString("base64");

      // 1. Get image description using Groq Vision
      const groqApiKey = process.env.GROQ_API_KEY;
      if (!groqApiKey)
        throw new Error("GROQ_API_KEY is missing from environment variables");

      const groqResponse = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "meta-llama/llama-4-scout-17b-16e-instruct",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Describe this image in detail for a vector search database.",
                },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:image/jpeg;base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${groqApiKey}`,
            "Content-Type": "application/json",
          },
        },
      );

      const imageDescription = groqResponse.data.choices[0].message.content;
      logger.info("Successfully got image description from Groq.");

      // 2. Convert description to embeddings using Gemini
      const geminiApiKey = process.env.GEMINI_API_KEY;
      if (!geminiApiKey)
        throw new Error("GEMINI_API_KEY is missing from environment variables");

      const geminiResponse = await axios.post(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent",
        {
          model: "models/gemini-embedding-001",
          content: {
            parts: [
              {
                text: imageDescription,
              },
            ],
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": geminiApiKey,
          },
        },
      );

      const embeddingVector = geminiResponse.data.embedding.values;

      // 3. Database Plagiarism Check via MongoDB Atlas Vector Search
      // We look for existing NFTs that share a > 95% similarity to this new image.
      try {
        const plagiarismCheck = await NFT.aggregate([
          {
            $vectorSearch: {
              index: "vector_index", // This MUST match the Search Index name on Atlas
              path: "embedding",
              queryVector: embeddingVector,
              numCandidates: 10,
              limit: 1,
            },
          },
          {
            $project: {
              _id: 0,
              tokenId: 1,
              name: 1,
              score: { $meta: "vectorSearchScore" },
            },
          },
        ]);

        if (plagiarismCheck.length > 0 && plagiarismCheck[0].score > 0.95) {
          throw new Error(
            `Plagiarism Detected: Image bears a ${(plagiarismCheck[0].score * 100).toFixed(2)}% similarity to existing NFT #${plagiarismCheck[0].tokenId} (${plagiarismCheck[0].name}).`,
          );
        }

        logger.info(
          "AI Vision Safety Check passed. No significant plagiarism detected.",
        );
      } catch (vectorError) {
        // If the error message is explicitly thrown by our plagiarism filter, forward it
        if (vectorError.message.includes("Plagiarism Detected")) {
          throw vectorError;
        }

        // Non-destructive fallback if the vector index simply hasn't been created yet by the user
        logger.warn(
          `Vector Search Error (Proceeding without plagiarism block): ${vectorError.message}`,
        );
      }

      // Return the embedding array to the caller so they can securely store it
      return embeddingVector;
    } catch (error) {
      if (error.message.includes("Plagiarism Detected")) {
        throw error;
      }
      logger.error(
        `AI Vision Service Error: ${error.response ? JSON.stringify(error.response.data) : error.message}`,
      );
      throw new Error(
        "Failed to calculate image uniqueness for Plagiarism test via Groq/Gemini APIs",
      );
    }
  }
}

module.exports = new AIVisionService();
