const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    walletAddress: {
      type: String,
      unique: true,
      sparse: true, // Allows null/missing values since email users might not have a wallet yet
      lowercase: true,
      trim: true,
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
    password: {
      type: String,
      select: false, // Don't return password by default in queries
      minlength: 6,
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
    authProvider: {
      type: String,
      enum: ["email", "metamask"],
      default: "email",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  },
);

userSchema.index({ createdAt: -1 });

// Hash password before saving if it was modified
const bcrypt = require("bcryptjs");
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) {
    next();
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Method to verify password
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
