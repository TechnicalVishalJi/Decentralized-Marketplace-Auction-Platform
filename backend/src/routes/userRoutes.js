const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// ── Public routes ──────────────────────────────────────────
// GET /api/v1/users/:address
router.get('/:address', userController.getUser);

// GET /api/v1/users/:address/favorites  ← Must be before /:address
router.get('/:address/favorites', userController.getFavorites);

// ── Protected routes (must be logged in + be the owner) ────
// PUT /api/v1/users/:address
router.put('/:address', protect, authorize, userController.updateUser);

// POST /api/v1/users/:address/favorites
router.post('/:address/favorites', protect, authorize, userController.addFavorite);

// DELETE /api/v1/users/:address/favorites/:tokenId
router.delete('/:address/favorites/:tokenId', protect, authorize, userController.removeFavorite);

module.exports = router;