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

  // --- NEW EMAIL/PASSWORD METHODS ---

  // Register with email and password
  async registerWithEmail(username, email, password) {
    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (userExists) {
      throw new Error("User with that email or username already exists");
    }

    // Create user (password hashing is handled by User.js pre-save hook)
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password,
    });

    const token = this.generateToken(user._id, user.walletAddress);

    return { token, user };
  }

  // Login with email and password
  async loginWithEmail(email, password) {
    // Check for user and explicitly select password field
    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password",
    );

    if (!user) {
      throw new Error("Invalid credentials");
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const token = this.generateToken(user._id, user.walletAddress);

    // Remove password before returning
    user.password = undefined;

    return { token, user };
  }

  // Link a wallet to an existing account
  async linkWallet(userId, walletAddress, signature) {
    const address = walletAddress.toLowerCase();

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (user.walletAddress) {
      throw new Error("Account already has a linked wallet");
    }

    // Check if wallet is already linked to another account
    const walletExists = await User.findOne({ walletAddress: address });
    if (walletExists) {
      throw new Error("Wallet is already linked to another account");
    }

    // Recreate the exact message that was signed on frontend
    const message = `Sign this message to link your wallet to NFT Marketplace.\n\nNonce: ${user.nonce}`;

    // Recover the address from the signature
    const recoveredAddress = ethers.verifyMessage(message, signature);

    // Check if recovered address matches claimed address
    if (recoveredAddress.toLowerCase() !== address) {
      throw new Error("Invalid signature. Link failed.");
    }

    // Update user with wallet address
    user.walletAddress = address;
    // Invalidate nonce
    user.nonce = Math.floor(Math.random() * 1000000).toString();

    await user.save();

    // Generate fresh token that includes the new wallet address
    const token = this.generateToken(user._id, address);

    return { token, user };
  }

  // Generate JWT token
  generateToken(userId, walletAddress) {
    return jwt.sign(
      {
        id: userId,
        id: userId,
        // Include walletAddress only if it exists
        ...(walletAddress && { walletAddress: walletAddress.toLowerCase() }),
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
