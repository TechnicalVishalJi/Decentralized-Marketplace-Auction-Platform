const authService = require("../services/authService");
const User = require("../models/User");

// @desc    Get nonce for wallet to sign
// @route   GET /api/v1/auth/nonce/:address
// @access  Public
exports.getNonce = async (req, res) => {
  try {
    const { address } = req.params;

    if (!address) {
      return res
        .status(400)
        .json({ success: false, error: "Wallet address is required" });
    }

    const nonce = await authService.generateNonce(address);

    // Return the message that frontend needs to sign
    res.json({
      success: true,
      data: {
        nonce,
        message: `Sign this message to login to NFT Marketplace.\n\nNonce: ${nonce}`,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Login with wallet signature
// @route   POST /api/v1/auth/login
// @access  Public
exports.login = async (req, res) => {
  try {
    const { address, signature } = req.body;

    if (!address || !signature) {
      return res.status(400).json({
        success: false,
        error: "Wallet address and signature are required",
      });
    }

    const { token, user } = await authService.verifySignature(
      address,
      signature,
    );

    res.json({
      success: true,
      token,
      data: {
        walletAddress: user.walletAddress,
        username: user.username,
        avatar: user.avatar,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private (requires JWT token in Authorization header)
exports.getMe = async (req, res) => {
  // req.user is already set by protect middleware
  res.json({ success: true, data: req.user });
};
