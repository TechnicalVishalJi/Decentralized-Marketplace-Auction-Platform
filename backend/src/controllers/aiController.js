const AIChatService = require("../services/ai/aiChatService");
const AIPricingService = require("../services/ai/aiPricingService");
const AIGeneratorService = require("../services/ai/aiGeneratorService");
const logger = require("../utils/logger");

// POST /api/v1/ai/chat
exports.chatWithConcierge = async (req, res, next) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res
        .status(400)
        .json({ success: false, error: "Messages array is required" });
    }
    await AIChatService.streamChatCompletion(messages, res);
  } catch (error) {
    logger.error(`AI Chat Controller Error: ${error.message}`);
    if (!res.headersSent) {
      next(error);
    }
  }
};

// POST /api/v1/ai/estimate
exports.estimateValue = async (req, res, next) => {
  try {
    const { nftMetadata } = req.body;
    if (!nftMetadata) {
      return res
        .status(400)
        .json({ success: false, error: "NFT Metadata is required" });
    }
    const estimation = await AIPricingService.estimateNFTValue(nftMetadata);
    res.status(200).json({ success: true, data: estimation });
  } catch (error) {
    next(error);
  }
};

// POST /api/v1/ai/generate
exports.generateArt = async (req, res, next) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res
        .status(400)
        .json({ success: false, error: "Prompt is required" });
    }

    const timestamp = Date.now();
    const outputFilename = `ai_generated_${timestamp}.png`;

    await AIGeneratorService.generateImage(prompt, outputFilename);

    res.status(200).json({
      success: true,
      data: {
        message: "Image generated successfully",
        filename: outputFilename,
        // The frontend logic can then upload this local file to Pinata via the IPFS upload route
        downloadUrl: `/uploads/${outputFilename}`,
      },
    });
  } catch (error) {
    next(error);
  }
};
