const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// GET /api/v1/auth/nonce/:address  ← Public: anyone can request a nonce
router.get("/nonce/:address", authController.getNonce);

// POST /api/v1/auth/metamask/signup  ← Public: register with metamask and email
router.post("/metamask/signup", authController.metamaskSignup);

// POST /api/v1/auth/metamask/login  ← Public: verify signature and get JWT
router.post("/metamask/login", authController.metamaskLogin);

// POST /api/v1/auth/signup/initiate  ← Public: send 6-digit OTP email
router.post("/signup/initiate", authController.initiateSignup);

// POST /api/v1/auth/signup/verify  ← Public: verify OTP and create account
router.post("/signup/verify", authController.verifySignup);

// POST /api/v1/auth/login-email  ← Public: login with email/password
router.post("/login-email", authController.loginEmail);

// GET /api/v1/auth/me  ← Protected: must have valid JWT
router.get("/me", protect, authController.getMe);

// GET /api/v1/auth/my-nonce  ← Protected: get logged-in user's nonce for wallet link signing
router.get("/my-nonce", protect, authController.getMyNonce);

// POST /api/v1/auth/link-wallet  ← Protected: link wallet to existing account
router.post("/link-wallet", protect, authController.linkWallet);

module.exports = router;
