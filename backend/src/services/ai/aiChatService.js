const axios = require("axios");
const logger = require("../../utils/logger");

class AIChatService {
  /**
   * Stream a chat completion from Groq API directly to the Express Response object using Server-Sent Events (SSE)
   * @param {Array} messages - Array of chat messages [{role: 'user', content: 'hello'}]
   * @param {Object} res - Express Response object to stream data into
   */
  async streamChatCompletion(messages, res) {
    try {
      // Set headers for Server-Sent Events (SSE)
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      // Inject the system prompt to guide the AI
      const systemPrompt = {
        role: "system",
        content: `You are the ultimate AI Concierge for CryptoMarket, a Decentralized AI-Enhanced NFT Marketplace.
Your job is to assist users in navigating the platform, explaining how to mint NFTs, connect their MetaMask wallet, and understand Web3 concepts.
Keep your answers brief, engaging, and highly professional. Format with Markdown.

Here is deep knowledge about the CryptoMarket project that you MUST employ when helping users:
1. Blockchain Network: Base Sepolia Testnet.
2. Tech Stack: React SPA Frontend (Vite), Node.js/Express Backend, MongoDB Atlas (Vector Search), and Hardhat (Solidity).
3. Core Features:
   - Dual-Payment Smart Contracts: Users can purchase or bid using direct ETH or an internal gas-less balance.
   - Advanced Auctions: Fully decentralized English auctions with automatic snipe-prevention time extensions.
   - Semantic Vector Search: We use Google Gemini to generate embeddings stored in MongoDB, allowing users to search NFTs by *meaning*.
   - AI Plagiarism Detection: We use Groq constraints to stop users from minting visually plagiarized >95% copycat NFTs.
   - AI Price Estimator: Live machine learning models predict NFT valuations based on historical traits.
Use this context to be exceptionally accurate when specific questions arise.`,
      };

      const payloadMessages = [systemPrompt, ...messages];

      // Make the HTTP request to Groq using axios with responseType: 'stream'
      const response = await axios({
        method: "post",
        url: "https://api.groq.com/openai/v1/chat/completions",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        data: {
          model: "llama-3.3-70b-versatile",
          messages: payloadMessages,
          stream: true,
          temperature: 1,
          max_completion_tokens: 1024,
          top_p: 1,
          stop: null,
        },
        responseType: "stream",
      });

      // Pipe the Groq stream directly to the client
      response.data.on("data", (chunk) => {
        // The chunk is a Buffer containing SSE data from Groq.
        // We just forward the raw SSE stream to our frontend!
        res.write(chunk);
      });

      response.data.on("end", () => {
        res.end();
      });

      response.data.on("error", (err) => {
        logger.error(`Stream error: ${err.message}`);
        res.write(`data: {"error": "Stream interrupted"}\n\n`);
        res.end();
      });
    } catch (error) {
      logger.error(`AI Chat Service Error: ${error.message}`);
      // If headers are not sent, we can send a standard JSON error
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: "Failed to communicate with AI Chatbot",
        });
      } else {
        res.write(`data: {"error": "Connection to AI failed"}\n\n`);
        res.end();
      }
    }
  }
}

module.exports = new AIChatService();
