const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const User = require("../models/User");
const OTP = require("../models/OTP");
const emailService = require("./emailService");

class AuthService {
  // Step 1: Generate a nonce for the wallet to sign
  async generateNonce(walletAddress, forLinking = false) {
    const address = walletAddress.toLowerCase();

    // Find existing user with this wallet address
    let user = await User.findOne({ walletAddress: address });

    if (!user) {
      if (forLinking) {
        // When linking: the wallet isn't registered yet, so we DON'T create a new user.
        // Just return a random nonce — the linkWallet flow will use the CURRENT user's nonce.
        return Math.floor(Math.random() * 1000000).toString();
      }
      // Fresh MetaMask signup: create a minimal placeholder user record to store the nonce
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

  // --- NEW EMAIL/PASSWORD OTP METHODS ---

  // Step 1: Initiate signup by sending OTP
  async initiateSignupOTP(email) {
    const emailLower = email.toLowerCase();

    // Check if user already exists
    const userExists = await User.findOne({ email: emailLower });
    if (userExists) {
      throw new Error("User with that email already exists");
    }

    // Generate 6 digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Save to database (will be hashed by pre-save hook and expires in 5 mins)
    await OTP.create({ email: emailLower, otp: otpCode });

    // Send email via Brevo
    await emailService.sendOTP(emailLower, otpCode);

    return { message: "OTP sent successfully" };
  }

  // Step 2: Verify OTP and create user
  async verifySignupOTP(email, otp, username, password) {
    const emailLower = email.toLowerCase();

    // Find the most recent OTP for this email
    const otpRecord = await OTP.findOne({ email: emailLower }).sort({
      createdAt: -1,
    });

    if (!otpRecord) {
      throw new Error("OTP expired or not found");
    }

    // Verify OTP
    const isMatch = await otpRecord.matchOTP(otp);
    if (!isMatch) {
      throw new Error("Invalid OTP");
    }

    // Check username availability
    if (username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) throw new Error("Username already taken");
    }

    // Create user (password hashing is handled by User.js pre-save hook)
    const user = await User.create({
      username,
      email: emailLower,
      password,
      authProvider: "email",
    });

    // Delete the used OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

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

  // MetaMask Signup (Requires email)
  async metamaskSignup(walletAddress, signature, email, username) {
    const address = walletAddress.toLowerCase();
    const emailLower = email.toLowerCase();

    // Check if user already exists with this wallet
    const walletExists = await User.findOne({ walletAddress: address });
    if (walletExists) throw new Error("Wallet is already registered");

    // Check if email already exists
    const emailExists = await User.findOne({ email: emailLower });
    if (emailExists)
      throw new Error(
        "Email is already registered. Please login with email and link your wallet.",
      );

    // We must verify the signature using a dummy user nonce (handled differently for first time)
    // Actually, for signup, the frontend fetches a nonce for a new unknown address, creating a barebones user.
    const user = await User.findOne({ walletAddress: address });
    if (!user) throw new Error("Please request a nonce first");

    const message = `Sign this message to login to NFT Marketplace.\n\nNonce: ${user.nonce}`;
    const recoveredAddress = ethers.verifyMessage(message, signature);

    if (recoveredAddress.toLowerCase() !== address) {
      throw new Error("Invalid signature. Authentication failed.");
    }

    // Complete the user profile
    user.email = emailLower;
    if (username) user.username = username;
    user.authProvider = "metamask";
    user.nonce = Math.floor(Math.random() * 1000000).toString(); // invalidate
    await user.save();

    const token = this.generateToken(user._id, address);

    return { token, user };
  }

  // Link a wallet to an existing email account
  // Signature verification is skipped: the user is already authenticated via JWT.
  async linkWallet(userId, walletAddress) {
    const address = walletAddress.toLowerCase();

    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");

    if (user.walletAddress) {
      throw new Error("Account already has a linked wallet");
    }

    // Check if this wallet is already linked to another real account
    const walletExists = await User.findOne({ walletAddress: address });
    if (walletExists && walletExists._id.toString() !== userId.toString()) {
      // Auto-delete orphan ghost users (wallet-only record, no email or password)
      const isGhost = !walletExists.email && !walletExists.password;
      if (isGhost) {
        await User.deleteOne({ _id: walletExists._id });
      } else {
        throw new Error("Wallet is already linked to another account");
      }
    }

    // Link the wallet and refresh nonce
    user.walletAddress = address;
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
