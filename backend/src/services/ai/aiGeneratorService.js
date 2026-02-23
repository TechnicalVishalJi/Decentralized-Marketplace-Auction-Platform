const axios = require("axios");
const logger = require("../../utils/logger");
const fs = require("fs");
const path = require("path");

class AIGeneratorService {
  /**
   * Generates an image using Freepik AI and saves it locally.
   */
  async generateImage(prompt, outputFilename) {
    try {
      const apiKey = process.env.FREEPIK_API_KEY;
      if (!apiKey) {
        throw new Error(
          "FREEPIK_API_KEY is missing from environment variables",
        );
      }

      logger.info(`Generating image with Freepik: "${prompt}"`);

      // 1. Generate the image via Freepik API
      const response = await axios.post(
        "https://api.freepik.com/v1/ai/text-to-image",
        {
          prompt: prompt,
          negative_prompt: "blurry, low quality, cartoon, watermark",
          guidance_scale: 2,
          num_images: 1,
          image: {
            size: "square_1_1",
          },
          filter_nsfw: true,
        },
        {
          headers: {
            "Content-Type": "application/json",
            "x-freepik-api-key": apiKey,
          },
        },
      );

      // 2. Handle output
      // Freepik returns an array of data objects containing the base64 structure
      if (
        !response.data ||
        !response.data.data ||
        response.data.data.length === 0
      ) {
        throw new Error("No image data returned from Freepik API");
      }

      const base64Data = response.data.data[0].base64;
      const imageBuffer = Buffer.from(base64Data, "base64");

      // 3. Ensure uploads directory exists
      const uploadDir = path.join(__dirname, "../../../uploads");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filePath = path.join(uploadDir, outputFilename);

      // 4. Save Buffer to file
      fs.writeFileSync(filePath, imageBuffer);

      return filePath;
    } catch (error) {
      logger.error(
        `Freepik AI Service Error: ${error.response ? JSON.stringify(error.response.data) : error.message}`,
      );
      throw new Error("Failed to generate image via Freepik AI");
    }
  }
}

module.exports = new AIGeneratorService();
