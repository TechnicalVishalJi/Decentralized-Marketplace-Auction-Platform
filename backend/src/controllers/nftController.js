const NFT = require("../models/NFT");
const aiEmbeddingService = require("../services/ai/aiEmbeddingService");

// @desc    Get all NFTs with filters and pagination
// @route   GET /api/v1/nfts
// @access  Public
exports.getAllNFTs = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      owner,
      creator,
      sort = "-createdAt",
    } = req.query;

    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (owner) filter.owner = owner.toLowerCase();
    if (creator) filter.creator = creator.toLowerCase();

    const nfts = await NFT.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await NFT.countDocuments(filter);

    res.json({
      success: true,
      count: nfts.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: nfts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single NFT by tokenId
// @route   GET /api/v1/nfts/:tokenId
// @access  Public
exports.getNFT = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const nft = await NFT.findOne({ tokenId: Number(tokenId) });

    if (!nft) {
      return res.status(404).json({ success: false, error: "NFT not found" });
    }

    // Increment views
    nft.views += 1;
    await nft.save();

    res.json({ success: true, data: nft });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get NFTs owned by a wallet address
// @route   GET /api/v1/nfts/owner/:address
// @access  Public
exports.getNFTsByOwner = async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const nfts = await NFT.find({ owner: address.toLowerCase() })
      .sort("-createdAt")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await NFT.countDocuments({ owner: address.toLowerCase() });

    res.json({
      success: true,
      count: nfts.length,
      total,
      data: nfts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get NFTs created by a wallet address
// @route   GET /api/v1/nfts/creator/:address
// @access  Public
exports.getNFTsByCreator = async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const nfts = await NFT.find({ creator: address.toLowerCase() })
      .sort("-createdAt")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await NFT.countDocuments({ creator: address.toLowerCase() });

    res.json({
      success: true,
      count: nfts.length,
      total,
      data: nfts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get marketplace stats
// @route   GET /api/v1/nfts/stats
// @access  Public
exports.getStats = async (req, res) => {
  try {
    const totalNFTs = await NFT.countDocuments();
    const totalOwners = await NFT.distinct("owner");
    const categories = await NFT.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalNFTs,
        totalOwners: totalOwners.length,
        categories,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// @desc    Semantic Search for NFTs using AI Embeddings
// @route   GET /api/v1/nfts/search
// @access  Public
exports.searchNFTs = async (req, res) => {
  try {
    const { q, limit = 20 } = req.query;

    if (!q) {
      return res
        .status(400)
        .json({ success: false, error: "Search query 'q' is required" });
    }

    // 1. Convert text query to vector embedding
    const queryVector = await aiEmbeddingService.generateTextEmbedding(q);

    // 2. Perform MongoDB Vector Search
    // Note: This requires an Atlas Vector Search index named "default" (or your custom name) on the `embedding` field.
    const nfts = await NFT.aggregate([
      {
        $vectorSearch: {
          index: "vector_index", // Using the same index created for aiVisionService
          path: "embedding",
          queryVector: queryVector,
          numCandidates: 100,
          limit: Number(limit),
        },
      },
      {
        $project: {
          embedding: 0, // Exclude the heavy embedding array from response
          score: { $meta: "vectorSearchScore" },
        },
      },
    ]);

    res.json({
      success: true,
      count: nfts.length,
      data: nfts,
    });
  } catch (error) {
    if (error.message.includes("generate vector embedding")) {
      return res.status(502).json({
        success: false,
        error: "AI embedding generation failed. Check API Keys.",
      });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};
