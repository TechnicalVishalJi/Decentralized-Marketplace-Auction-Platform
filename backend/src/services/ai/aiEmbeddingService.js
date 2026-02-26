const axios = require("axios");
const logger = require("../../utils/logger");

class AIEmbeddingService {
  /**
   * Converts a text string (NFT description) into a vector array
   * using the Google Gemini text-embedding-004 API.
   * @param {String} text - The text to vectorize
   * @returns {Array<Number>} - Floating-point vector embeddings
   */
  async generateTextEmbedding(text) {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey)
        throw new Error("GEMINI_API_KEY is missing from environment variables");

      const url =
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-001:embedContent";

      const response = await axios.post(
        url,
        {
          model: "models/gemini-embedding-001",
          content: {
            parts: [{ text: text }],
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
        },
      );

      // Return the array to be indexed into MongoDB Vector Search
      return response.data.embedding.values;
    } catch (error) {
      logger.error(`AI Embedding Service Error: ${error.message}`);
      throw new Error("Failed to generate vector embedding via Gemini API");
    }
  }
}

module.exports = new AIEmbeddingService();
