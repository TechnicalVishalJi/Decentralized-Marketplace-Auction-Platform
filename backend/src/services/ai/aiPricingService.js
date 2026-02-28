const axios = require("axios");
const logger = require("../../utils/logger");

class AIPricingService {
  /**
   * Estimates the market value of an NFT using LLaMA-3 via Groq API.
   * @param {Object} nftMetadata - The NFT's name, description, category, and traits.
   * @returns {Object} JSON object containing estimatedValue and rationale
   */
  async estimateNFTValue(nftMetadata) {
    try {
      const prompt = `Act as an expert Web3 NFT appraiser. Estimate the current market value (in ETH) of this NFT based on its metadata. 
Metadata: ${JSON.stringify(nftMetadata)}
Output strictly in JSON format without any markdown wrappers or additional text: {"estimatedValue": "0.5 ETH", "rationale": "One sentence explanation"}`;

      const response = await axios.post(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          model: "llama-3.3-70b-versatile", // Using Llama 3 70B for JSON mapping
          messages: [{ role: "user", content: prompt }],
          temperature: 0.1, // Low temperature for consistent JSON
          response_format: { type: "json_object" },
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const content = response.data.choices[0].message.content;
      return JSON.parse(content);
    } catch (error) {
      logger.error(`AI Pricing Service Error: ${error.message}`);
      throw new Error("Failed to estimate NFT value with AI");
    }
  }
}

module.exports = new AIPricingService();
