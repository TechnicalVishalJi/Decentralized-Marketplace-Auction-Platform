const ipfsService = require("../services/ipfsService");
const aiVisionService = require("../services/ai/aiVisionService");
const logger = require("../utils/logger");

// @desc    Upload NFT image to IPFS
// @route   POST /api/v1/nfts/upload/image
// @access  Private
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "No image file provided. Please upload an image.",
      });
    }

    // 1. AI Vision Plagiarism Check (runs BEFORE IPFS upload)
    try {
      const imageEmbedding = await aiVisionService.getImageEmbedding(
        req.file.path,
      );
      logger.info(
        `✅ AI Plagiarism Check Passed. Embedding dimension: ${imageEmbedding.length}`,
      );
    } catch (visionError) {
      logger.error(`AI Vision Check Error: ${visionError.message}`);

      // ONLY block the upload if we actually detected plagiarism.
      // All other errors (API failures, rate limits, etc.) are non-fatal — log and continue.
      if (visionError.message.includes("Plagiarism Detected")) {
        return res
          .status(400)
          .json({ success: false, error: visionError.message });
      }

      // For non-plagiarism errors (API down, rate limit, etc.), warn but allow upload
      logger.warn(
        "Vision service unavailable, skipping plagiarism block and proceeding with upload.",
      );
    }

    // 2. Upload Image to IPFS
    const ipfsURI = await ipfsService.uploadImage(req.file);

    res.status(200).json({
      success: true,
      data: {
        hash: ipfsURI,
        previewUrl: ipfsURI.replace(
          "ipfs://",
          "https://gateway.pinata.cloud/ipfs/",
        ),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Upload full NFT Metadata to IPFS
// @route   POST /api/v1/nfts/upload/metadata
// @access  Private
exports.uploadMetadata = async (req, res) => {
  try {
    const { name, description, image, attributes } = req.body;

    if (!name || !description || !image) {
      return res.status(400).json({
        success: false,
        error: "Please provide name, description, and image IPFS hash.",
      });
    }

    // The metadata JSON structure standard for all NFTs
    const metadataObj = {
      name,
      description,
      image, // This should be the ipfs:// URI returned from uploadImage
      attributes: attributes || [],
    };

    const metadataURI = await ipfsService.uploadMetadata(metadataObj);

    res.status(200).json({
      success: true,
      data: {
        metadataURI: metadataURI,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
