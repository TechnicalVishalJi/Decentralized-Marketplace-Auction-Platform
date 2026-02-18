const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const NFT = require("../models/NFT");

// @desc    Get all active auctions with filters and pagination
// @route   GET /api/v1/auctions
// @access  Public
exports.getAllAuctions = async (req, res) => {
  try {
    const { page = 1, limit = 20, sort = "-createdAt", ended } = req.query;

    const filter = { active: true, cancelled: false };

    // Filter by ended auctions (endTime in the past but not claimed)
    if (ended === "true") {
      filter.endTime = { $lt: new Date() };
    } else if (ended === "false") {
      filter.endTime = { $gt: new Date() }; // Still running
    }

    const auctions = await Auction.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Auction.countDocuments(filter);

    res.json({
      success: true,
      count: auctions.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: auctions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single auction by auctionId
// @route   GET /api/v1/auctions/:auctionId
// @access  Public
exports.getAuction = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const auction = await Auction.findOne({ auctionId: Number(auctionId) });

    if (!auction) {
      return res
        .status(404)
        .json({ success: false, error: "Auction not found" });
    }

    // Also fetch the NFT data for this auction
    const nft = await NFT.findOne({ tokenId: auction.tokenId });

    res.json({
      success: true,
      data: { ...auction.toObject(), nft },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get bid history for an auction
// @route   GET /api/v1/auctions/:auctionId/bids
// @access  Public
exports.getAuctionBids = async (req, res) => {
  try {
    const { auctionId } = req.params;

    const bids = await Bid.find({ auctionId: Number(auctionId) }).sort(
      "-createdAt",
    ); // Latest bids first

    res.json({
      success: true,
      count: bids.length,
      data: bids,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all auctions by a seller address
// @route   GET /api/v1/auctions/seller/:address
// @access  Public
exports.getAuctionsBySeller = async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20, active } = req.query;

    const filter = { seller: address.toLowerCase() };
    if (active !== undefined) filter.active = active === "true";

    const auctions = await Auction.find(filter)
      .sort("-createdAt")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Auction.countDocuments(filter);

    res.json({
      success: true,
      count: auctions.length,
      total,
      data: auctions,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all bids placed by a specific bidder
// @route   GET /api/v1/auctions/bidder/:address
// @access  Public
exports.getBidsByBidder = async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const bids = await Bid.find({ bidder: address.toLowerCase() })
      .sort("-createdAt")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Bid.countDocuments({ bidder: address.toLowerCase() });

    res.json({
      success: true,
      count: bids.length,
      total,
      data: bids,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
