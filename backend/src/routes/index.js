const express = require('express');
const router = express.Router();

// Import route modules
const nftRoutes = require('./nftRoutes');
const listingRoutes = require('./listingRoutes');
const auctionRoutes = require('./auctionRoutes');
const userRoutes = require('./userRoutes');
const authRoutes = require('./authRoutes');

// Mount routes
router.use('/nfts', nftRoutes);
router.use('/listings', listingRoutes);
router.use('/auctions', auctionRoutes);
router.use('/users', userRoutes);
router.use('/auth', authRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

module.exports = router;