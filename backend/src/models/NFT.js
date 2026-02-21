const mongoose = require("mongoose");

const nftSchema = new mongoose.Schema({
  tokenId: {
    type: Number,
    required: true,
    unique: true,
    index: true,
  },
  contractAddress: {
    type: String,
    required: true,
    lowercase: true,
  },
  owner: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  creator: {
    type: String,
    required: true,
    lowercase: true,
    index: true,
  },
  name: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String,
    required: true,
  },
  tokenURI: {
    type: String,
    required: true,
  },
  attributes: [
    {
      trait_type: String,
      value: mongoose.Schema.Types.Mixed,
    },
  ],
  category: {
    type: String,
    enum: [
      "art",
      "collectibles",
      "music",
      "photography",
      "sports",
      "utility",
      "other",
    ],
    default: "other",
  },
  views: {
    type: Number,
    default: 0,
  },
  likes: {
    type: Number,
    default: 0,
  },
  embedding: {
    type: [Number],
    select: false, // Exclude from normal queries to save bandwidth
  },
});

nftSchema.index({ owner: 1, createdAt: -1 });
nftSchema.index({ creator: 1, createdAt: -1 });
nftSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("NFT", nftSchema);
