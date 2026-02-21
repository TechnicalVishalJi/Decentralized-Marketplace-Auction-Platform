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

// @desc    Register with email and password
// @route   POST /api/v1/auth/register
// @access  Public
exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide username, email and password",
      });
    }

    const { token, user } = await authService.registerWithEmail(
      username,
      email,
      password,
    );

    res.status(201).json({
      success: true,
      token,
      data: user,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Login with email and password
// @route   POST /api/v1/auth/login-email
// @access  Public
exports.loginEmail = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email and password",
      });
    }

    const { token, user } = await authService.loginWithEmail(email, password);

    res.json({
      success: true,
      token,
      data: user,
    });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};

// @desc    Link wallet to existing account
// @route   POST /api/v1/auth/link-wallet
// @access  Private
exports.linkWallet = async (req, res) => {
  try {
    const { address, signature } = req.body;

    if (!address || !signature) {
      return res.status(400).json({
        success: false,
        error: "Wallet address and signature are required",
      });
    }

    // req.user comes from protect middleware
    const { token, user } = await authService.linkWallet(
      req.user._id,
      address,
      signature,
    );

    res.json({
      success: true,
      token, // Return fresh token with walletAddress included
      data: user,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Get current logged-in user
// @route   GET /api/v1/auth/me
// @access  Private (requires JWT token in Authorization header)
exports.getMe = async (req, res) => {
  // req.user is already set by protect middleware
  res.json({ success: true, data: req.user });
};
