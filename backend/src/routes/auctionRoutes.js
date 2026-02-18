const express = require("express");
const router = express.Router();
const auctionController = require("../controllers/auctionController");

// GET /api/v1/auctions/seller/:address  ← Must be before /:auctionId
router.get("/seller/:address", auctionController.getAuctionsBySeller);

// GET /api/v1/auctions/bidder/:address  ← Must be before /:auctionId
router.get("/bidder/:address", auctionController.getBidsByBidder);

// GET /api/v1/auctions
router.get("/", auctionController.getAllAuctions);

// GET /api/v1/auctions/:auctionId  ← Must be before /:auctionId/bids
router.get("/:auctionId", auctionController.getAuction);

// GET /api/v1/auctions/:auctionId/bids
router.get("/:auctionId/bids", auctionController.getAuctionBids);

module.exports = router;
