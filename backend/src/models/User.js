const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple null values
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    avatar: String,
    coverImage: String,
    favorites: [
      {
        type: Number,
        ref: "NFT",
      },
    ],
    nonce: {
      type: String,
      default: () => Math.floor(Math.random() * 1000000).toString(),
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
