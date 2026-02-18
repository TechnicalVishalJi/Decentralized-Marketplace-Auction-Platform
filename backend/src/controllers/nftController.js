const NFT = require("../models/NFT");

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
