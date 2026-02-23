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

// @desc    Login with MetaMask (Web3 Signature)
// @route   POST /api/v1/auth/metamask/login
// @access  Public
exports.metamaskLogin = async (req, res) => {
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
        email: user.email,
        avatar: user.avatar,
        role: user.role,
        authProvider: user.authProvider,
      },
    });
  } catch (error) {
    res.status(401).json({ success: false, error: error.message });
  }
};

// @desc    Initiate signup (Send OTP)
// @route   POST /api/v1/auth/signup/initiate
// @access  Public
exports.initiateSignup = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: "Please provide an email address",
      });
    }

    const result = await authService.initiateSignupOTP(email);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// @desc    Verify OTP and complete registration
// @route   POST /api/v1/auth/signup/verify
// @access  Public
exports.verifySignup = async (req, res) => {
  try {
    const { email, otp, username, password } = req.body;

    if (!email || !otp || !password) {
      return res.status(400).json({
        success: false,
        error: "Please provide email, otp, and password",
      });
    }

    const { token, user } = await authService.verifySignupOTP(
      email,
      otp,
      username,
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

// @desc    Register via MetaMask (capturing email)
// @route   POST /api/v1/auth/metamask/signup
// @access  Public
exports.metamaskSignup = async (req, res) => {
  try {
    const { address, signature, email, username } = req.body;

    if (!address || !signature || !email) {
      return res.status(400).json({
        success: false,
        error: "Please provide wallet address, signature, and email",
      });
    }

    const { token, user } = await authService.metamaskSignup(
      address,
      signature,
      email,
      username,
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
    const { address } = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: "Wallet address is required",
      });
    }

    // User is already authenticated via JWT — just link the wallet address
    const { token, user } = await authService.linkWallet(req.user._id, address);

    res.json({
      success: true,
      token,
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

// @desc    Get the logged-in user's nonce for wallet-linking signature
// @route   GET /api/v1/auth/my-nonce
// @access  Private
exports.getMyNonce = async (req, res) => {
  const user = req.user;
  res.json({
    success: true,
    data: {
      nonce: user.nonce,
      message: `Sign this message to link your wallet to NFT Marketplace.\n\nNonce: ${user.nonce}`,
    },
  });
};
