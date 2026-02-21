const axios = require("axios");
const logger = require("../../utils/logger");
const fs = require("fs");

class AIVisionService {
  /**
   * Prevents plagiarism by extracting a visual embedding from the NFT image
   * using Hugging Face Serverless Inference API (CLIP model).
   * @param {String} imagePath - Absolute local path to uploaded image.
   * @returns {Array<Number>} - Dense vector array of image features.
   */
  async getImageEmbedding(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);

      // Using OpenAI's CLIP model via Hugging Face Inference API for image feature extraction
      const modelId = "openai/clip-vit-base-patch32";
      const url = `https://api-inference.huggingface.co/pipeline/feature-extraction/${modelId}`;

      const response = await axios.post(url, imageBuffer, {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/octet-stream",
        },
      });

      // API returns the dense vector mapping of the image.
      return response.data;
    } catch (error) {
      logger.error(`AI Vision Service Error: ${error.message}`);

      // Hugging Face cold-start handling:
      // Free tier models spin down when idle. 503 means "Model is loading"
      if (error.response && error.response.status === 503) {
        throw new Error(
          "AI Vision Safety Check is currently warming up. Please try again in 20 seconds.",
        );
      }
      throw new Error(
        "Failed to calculate image uniqueness for Plagiarism test via Hugging Face API",
      );
    }
  }
}

module.exports = new AIVisionService();
