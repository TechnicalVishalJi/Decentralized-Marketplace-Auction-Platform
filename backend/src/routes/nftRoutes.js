const express = require('express');
const router = express.Router();
const nftController = require('../controllers/nftController');
const { optionalAuth } = require('../middleware/auth');

// GET /api/v1/nfts/stats  ← Must be before /:tokenId
router.get('/stats', nftController.getStats);

// GET /api/v1/nfts/owner/:address  ← Must be before /:tokenId
router.get('/owner/:address', nftController.getNFTsByOwner);

// GET /api/v1/nfts/creator/:address  ← Must be before /:tokenId
router.get('/creator/:address', nftController.getNFTsByCreator);

// GET /api/v1/nfts  (optionalAuth: logged-in users could see liked status in future)
router.get('/', optionalAuth, nftController.getAllNFTs);

// GET /api/v1/nfts/:tokenId  ← Must be LAST
router.get('/:tokenId', optionalAuth, nftController.getNFT);

module.exports = router;