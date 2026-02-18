const User = require("../models/User");
const NFT = require("../models/NFT");

// @desc    Get user profile by wallet address
// @route   GET /api/v1/users/:address
// @access  Public
exports.getUser = async (req, res) => {
  try {
    const { address } = req.params;

    const user = await User.findOne({
      walletAddress: address.toLowerCase(),
    }).select("-nonce"); // Never expose nonce

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/v1/users/:address
// @access  Private (requires auth)
exports.updateUser = async (req, res) => {
  try {
    const { address } = req.params;

    // Only allow updating these fields (not walletAddress, nonce, role)
    const allowedFields = [
      "username",
      "email",
      "bio",
      "avatar",
      "coverImage",
      "socialLinks",
    ];
    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const user = await User.findOneAndUpdate(
      { walletAddress: address.toLowerCase() },
      updates,
      { new: true, runValidators: true }, // Return updated doc, run schema validation
    ).select("-nonce");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    // Handle duplicate username/email
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res
        .status(400)
        .json({ success: false, error: `${field} already taken` });
    }
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Get user's favorite NFTs
// @route   GET /api/v1/users/:address/favorites
// @access  Public
exports.getFavorites = async (req, res) => {
  try {
    const { address } = req.params;

    const user = await User.findOne({ walletAddress: address.toLowerCase() });

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Fetch the actual NFT data for each favorited tokenId
    const nfts = await NFT.find({ tokenId: { $in: user.favorites } });

    res.json({
      success: true,
      count: nfts.length,
      data: nfts,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Add NFT to favorites
// @route   POST /api/v1/users/:address/favorites/:tokenId
// @access  Private (requires auth)
exports.addFavorite = async (req, res) => {
  try {
    const { address } = req.params;
    const { tokenId } = req.body;

    const user = await User.findOneAndUpdate(
      { walletAddress: address.toLowerCase() },
      { $addToSet: { favorites: Number(tokenId) } }, // $addToSet prevents duplicates
      { new: true },
    ).select("-nonce");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: user.favorites });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Remove NFT from favorites
// @route   DELETE /api/v1/users/:address/favorites/:tokenId
// @access  Private (requires auth)
exports.removeFavorite = async (req, res) => {
  try {
    const { address, tokenId } = req.params;

    const user = await User.findOneAndUpdate(
      { walletAddress: address.toLowerCase() },
      { $pull: { favorites: Number(tokenId) } }, // $pull removes from array
      { new: true },
    ).select("-nonce");

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    res.json({ success: true, data: user.favorites });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
