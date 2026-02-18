const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const User = require("../models/User");

class AuthService {
  // Step 1: Generate a nonce for the wallet to sign
  async generateNonce(walletAddress) {
    const address = walletAddress.toLowerCase();

    // Find existing user or create new one
    let user = await User.findOne({ walletAddress: address });

    if (!user) {
      // First time login - create user
      user = await User.create({
        walletAddress: address,
        nonce: Math.floor(Math.random() * 1000000).toString(),
      });
    } else {
      // Refresh nonce every time (security: old nonce can't be reused)
      user.nonce = Math.floor(Math.random() * 1000000).toString();
      await user.save();
    }

    return user.nonce;
  }

  // Step 2: Verify the signature and return JWT
  async verifySignature(walletAddress, signature) {
    const address = walletAddress.toLowerCase();

    const user = await User.findOne({ walletAddress: address });
    if (!user) throw new Error("User not found. Request a nonce first.");

    // Recreate the exact message that was signed on frontend
    const message = `Sign this message to login to NFT Marketplace.\n\nNonce: ${user.nonce}`;

    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);

    // Check if recovered address matches claimed address
    if (recoveredAddress.toLowerCase() !== address) {
      throw new Error("Invalid signature. Authentication failed.");
    }

    // Invalidate nonce after successful login (prevent replay attacks)
    user.nonce = Math.floor(Math.random() * 1000000).toString();
    await user.save();

    // Generate JWT token
    const token = this.generateToken(user._id, address);

    return { token, user };
  }

  // Generate JWT token
  generateToken(userId, walletAddress) {
    return jwt.sign(
      {
        id: userId,
        walletAddress: walletAddress.toLowerCase(),
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "7d" },
    );
  }

  // Verify JWT token
  verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
  }
}

module.exports = new AuthService();
