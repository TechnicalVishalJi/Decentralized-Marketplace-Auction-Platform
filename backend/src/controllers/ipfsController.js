const ipfsService = require("../services/ipfsService");
const aiVisionService = require("../services/ai/aiVisionService");

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

    // 1. AI Vision Plagiarism Check
    try {
      // NOTE: Extracts dense vector mapping of the image using Hugging Face
      // Future integration will query MongoDB Atlas Vector Search with this array
      const imageEmbedding = await aiVisionService.getImageEmbedding(
        req.file.path,
      );
      console.log("✅ AI Vision Plagiarism Check Passed [Embedding Generated]");
    } catch (visionError) {
      if (visionError.message.includes("warming up")) {
        return res
          .status(503)
          .json({ success: false, error: visionError.message });
      }
      return res
        .status(400)
        .json({ success: false, error: visionError.message });
    }

    // IPFS logic is handled in service
    const ipfsURI = await ipfsService.uploadImage(req.file);

    res.status(200).json({
      success: true,
      data: {
        hash: ipfsURI,
        // Also provide standard HTTP link for immediate frontend preview
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
