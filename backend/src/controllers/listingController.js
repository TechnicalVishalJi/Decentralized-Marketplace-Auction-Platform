const Listing = require("../models/Listing");
const NFT = require("../models/NFT");

// @desc    Get all active listings with filters and pagination
// @route   GET /api/v1/listings
// @access  Public
exports.getAllListings = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      minPrice,
      maxPrice,
      sort = "-createdAt",
    } = req.query;

    const filter = { active: true }; // Only active listings

    // Price range filtering (prices stored as strings in wei)
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = minPrice;
      if (maxPrice) filter.price.$lte = maxPrice;
    }

    const listings = await Listing.find(filter)
      .sort(sort)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Listing.countDocuments(filter);

    res.json({
      success: true,
      count: listings.length,
      total,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get single listing by listingId
// @route   GET /api/v1/listings/:listingId
// @access  Public
exports.getListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    const listing = await Listing.findOne({ listingId: Number(listingId) });

    if (!listing) {
      return res
        .status(404)
        .json({ success: false, error: "Listing not found" });
    }

    // Also fetch the NFT data for this listing
    const nft = await NFT.findOne({ tokenId: listing.tokenId });

    res.json({
      success: true,
      data: { ...listing.toObject(), nft },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get all listings by a seller address
// @route   GET /api/v1/listings/seller/:address
// @access  Public
exports.getListingsBySeller = async (req, res) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20, active } = req.query;

    const filter = { seller: address.toLowerCase() };
    // Optional: filter by active status
    if (active !== undefined) filter.active = active === "true";

    const listings = await Listing.find(filter)
      .sort("-createdAt")
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit));

    const total = await Listing.countDocuments(filter);

    res.json({
      success: true,
      count: listings.length,
      total,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get listing history for a specific NFT
// @route   GET /api/v1/listings/nft/:tokenId
// @access  Public
exports.getListingsByNFT = async (req, res) => {
  try {
    const { tokenId } = req.params;

    const listings = await Listing.find({ tokenId: Number(tokenId) }).sort(
      "-createdAt",
    );

    res.json({
      success: true,
      count: listings.length,
      data: listings,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
