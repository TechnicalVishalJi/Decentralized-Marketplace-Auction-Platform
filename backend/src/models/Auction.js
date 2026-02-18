const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    auctionId: Number (unique, indexed),
    seller: String,
    nftContract: String,
    tokenId: Number,
    startPrice: String,
    highestBid: String,
    highestBidder: String,
    endTime: Date (indexed),
    active: Boolean,
    winner: String,
    claimed: Boolean,
    cancelled: Boolean,
    transactionHash: String
});

auctionSchema.index({ active: 1, endTime: 1 });

module.exports = mongoose.model('Auction', auctionSchema);