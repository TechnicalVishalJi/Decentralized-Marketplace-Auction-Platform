const axios = require("axios");
const logger = require("../../utils/logger");
const fs = require("fs");
const path = require("path");

class AIGeneratorService {
  /**
   * Generates an image based on a text prompt using Pollinations AI
   * and saves it to the local uploads directory.
   * @param {String} prompt - The text prompt for generation.
   * @param {String} outputFilename - Expected file name.
   * @returns {Promise<String>} - Absolute path to the generated image file.
   */
  async generateImage(prompt, outputFilename) {
    try {
      // Pollinations.ai generates images via standard HTTP GET without API keys
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

      const response = await axios({
        method: "GET",
        url: imageUrl,
        responseType: "stream",
      });

      // Ensure uploads directory exists
      const uploadDir = path.join(__dirname, "../../../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, outputFilename);
      const writer = fs.createWriteStream(filePath);

      response.data.pipe(writer);

      return new Promise((resolve, reject) => {
        writer.on("finish", () => resolve(filePath));
        writer.on("error", reject);
      });
    } catch (error) {
      logger.error(`AI Generator Service Error: ${error.message}`);
      throw new Error("Failed to generate NFT image via AI");
    }
  }
}

module.exports = new AIGeneratorService();
