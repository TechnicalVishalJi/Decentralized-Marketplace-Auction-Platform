const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// GET /api/v1/auth/nonce/:address  ← Public: anyone can request a nonce
router.get("/nonce/:address", authController.getNonce);

// POST /api/v1/auth/login  ← Public: verify signature and get JWT
router.post("/login", authController.login);

// GET /api/v1/auth/me  ← Protected: must have valid JWT
router.get("/me", protect, authController.getMe);

// POST /api/v1/auth/register  ← Public: register with email/password
router.post("/register", authController.register);

// POST /api/v1/auth/login-email  ← Public: login with email/password
router.post("/login-email", authController.loginEmail);

// POST /api/v1/auth/link-wallet  ← Protected: link wallet to existing account
router.post("/link-wallet", protect, authController.linkWallet);

module.exports = router;
