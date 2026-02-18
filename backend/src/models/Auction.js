const mongoose = require("mongoose");

const auctionSchema = new mongoose.Schema(
  {
    auctionId: {
      type: Number,
      required: true,
      unique: true,
      index: true,
    },
    seller: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    nftContract: {
      type: String,
      required: true,
      lowercase: true,
    },
    tokenId: {
      type: Number,
      required: true,
    },
    startPrice: {
      type: String, // Store as string to avoid precision loss
      required: true,
    },
    highestBid: {
      type: String,
      default: "0",
    },
    highestBidder: {
      type: String,
      lowercase: true,
    },
    endTime: {
      type: Date,
      required: true,
      index: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    winner: {
      type: String,
      lowercase: true,
    },
    claimed: {
      type: Boolean,
      default: false,
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    transactionHash: String,
  },
  {
    timestamps: true,
  },
);

auctionSchema.index({ active: 1, endTime: 1 });
auctionSchema.index({ seller: 1, active: 1 });

module.exports = mongoose.model("Auction", auctionSchema);
