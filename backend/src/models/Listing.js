const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    listingId: {
        type: Number,
        required: true,
        unique: true,
        index: true
    },
    seller: {
        type: String,
        required: true,
        lowercase: true,
        index: true
    },
    nftContract: {
        type: String,
        required: true,
        lowercase: true
    },
    tokenId: {
        type: Number,
        required: true,
        index: true
    },
    price: {
        type: String, // Store as string to avoid precision loss
        required: true
    },
    active: {
        type: Boolean,
        default: true,
        index: true
    },
    buyer: {
        type: String,
        lowercase: true
    },
    soldAt: Date,
    cancelledAt: Date,
    transactionHash: String
});

listingSchema.index({ active: 1, createdAt: -1 });
listingSchema.index({ seller: 1, active: 1 });

module.exports = mongoose.model('Listing', listingSchema);