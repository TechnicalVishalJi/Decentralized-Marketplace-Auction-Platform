const express = require("express");
const {
  chatWithConcierge,
  estimateValue,
  generateArt,
} = require("../controllers/aiController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// Public routes
router.post("/chat", chatWithConcierge);
router.post("/estimate", estimateValue);

// Protected routes (Only logged in users can generate art to prevent abuse)
router.post("/generate", protect, generateArt);

module.exports = router;
