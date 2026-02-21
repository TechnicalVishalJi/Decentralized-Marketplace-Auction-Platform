const ipfsService = require("../services/ipfsService");

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
