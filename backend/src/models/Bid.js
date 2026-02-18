const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    auctionId: {
        type: Number,
        required: true,
        index: true
    },
    bidder: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    amount: {
        type: String,
        required: true
    },
    transactionHash: String
});

bidSchema.index({ auctionId: 1, createdAt: -1 });
bidSchema.index({ bidder: 1, createdAt: -1 });

module.exports = mongoose.model('Bid', bidSchema);