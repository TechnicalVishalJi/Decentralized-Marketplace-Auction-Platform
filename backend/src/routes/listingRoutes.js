const express = require('express');
const router = express.Router();
const listingController = require('../controllers/listingController');

// GET /api/v1/listings/seller/:address  ← Must be before /:listingId
router.get('/seller/:address', listingController.getListingsBySeller);

// GET /api/v1/listings/nft/:tokenId  ← Must be before /:listingId
router.get('/nft/:tokenId', listingController.getListingsByNFT);

// GET /api/v1/listings
router.get('/', listingController.getAllListings);

// GET /api/v1/listings/:listingId  ← Must be LAST
router.get('/:listingId', listingController.getListing);

module.exports = router;