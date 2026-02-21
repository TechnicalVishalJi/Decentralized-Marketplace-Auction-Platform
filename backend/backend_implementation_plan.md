# 🚀 Production-Grade Backend Implementation Plan

## NFT Marketplace Backend - Complete Roadmap

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Phase 1: Foundation Setup](#phase-1-foundation-setup)
3. [Phase 2: Database Layer](#phase-2-database-layer)
4. [Phase 3: Blockchain Integration](#phase-3-blockchain-integration)
5. [Phase 4: API Development](#phase-4-api-development)
6. [Phase 5: Authentication & Security](#phase-5-authentication--security)
7. [Phase 6: Event Listeners & Sync](#phase-6-event-listeners--sync)
8. [Phase 7: Advanced Features](#phase-7-advanced-features)
9. [Phase 8: Testing & Deployment](#phase-8-testing--deployment)
10. [Production Checklist](#production-checklist)

---

## 🏗️ Architecture Overview

### **System Design**

```
┌──────────────────────────────────────────────────────────────┐
│                         FRONTEND                              │
│                    (React/Next.js)                            │
└────────────────────────┬─────────────────────────────────────┘
                         │ HTTP/REST API
                         ↓
┌──────────────────────────────────────────────────────────────┐
│                    BACKEND (Express.js)                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Routes   │→ │Controllers │→ │  Services  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
│         │              │                │                     │
│         ↓              ↓                ↓                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │Middleware  │  │   Models   │  │Blockchain  │            │
│  └────────────┘  └────────────┘  │  Service   │            │
│                                   └────────────┘            │
└────────┬────────────────────────────────┬───────────────────┘
         │                                 │
         ↓                                 ↓
┌─────────────────┐              ┌──────────────────┐
│    MongoDB      │              │   Blockchain     │
│   (Database)    │              │ (Base Sepolia)   │
└─────────────────┘              └──────────────────┘
         ↑                                 │
         │                                 │
         └─────────Event Listeners─────────┘
```

### **Tech Stack**

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Blockchain:** Ethers.js v6
- **Authentication:** JWT + Web3 Signature
- **Validation:** express-validator
- **Security:** Helmet, CORS, Rate Limiting
- **File Storage:** IPFS (Pinata)
- **Testing:** Jest + Supertest
- **Logging:** Winston
- **Process Manager:** PM2 (production)

---

## 📦 Phase 1: Foundation Setup

### **1.1 Project Structure**

Create this folder structure:

```
backend/
├── src/
│   ├── config/
│   │   ├── database.js
│   │   ├── blockchain.js
│   │   └── constants.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── NFT.js
│   │   ├── Listing.js
│   │   ├── Auction.js
│   │   └── Bid.js
│   │
│   ├── services/
│   │   ├── blockchainService.js
│   │   ├── ipfsService.js
│   │   ├── eventListenerService.js
│   │   └── authService.js
│   │
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── nftController.js
│   │   ├── listingController.js
│   │   ├── auctionController.js
│   │   └── userController.js
│   │
│   ├── routes/
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── nftRoutes.js
│   │   ├── listingRoutes.js
│   │   ├── auctionRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   │
│   ├── utils/
│   │   ├── logger.js
│   │   ├── helpers.js
│   │   └── errors.js
│   │
│   └── app.js
│
├── contracts/
│   ├── NFT.json
│   └── Marketplace.json
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── server.js
└── README.md
```

### **1.2 Environment Variables**

Create `.env.example`:

```env
# Server
NODE_ENV=development
PORT=5000
API_VERSION=v1

# Database
MONGODB_URI=mongodb://localhost:27017/nft-marketplace
MONGODB_TEST_URI=mongodb://localhost:27017/nft-marketplace-test

# Blockchain
BLOCKCHAIN_NETWORK=base-sepolia
RPC_URL=https://sepolia.base.org
PRIVATE_KEY=your_private_key_here
CHAIN_ID=84532

# Smart Contracts
NFT_CONTRACT_ADDRESS=0x...
MARKETPLACE_CONTRACT_ADDRESS=0x...

# IPFS
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_KEY=your_pinata_secret_key
PINATA_JWT=your_pinata_jwt

# Authentication
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
JWT_EXPIRE=7d
NONCE_EXPIRE=300000

# Security
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
LOG_FILE=logs/app.log

# External APIs (optional)
ETHERSCAN_API_KEY=your_etherscan_key
COINGECKO_API_KEY=your_coingecko_key
```

### **1.3 Core Dependencies**

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "ethers": "^6.9.0",
    "dotenv": "^16.3.1",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "express-rate-limit": "^7.1.5",
    "express-validator": "^7.0.1",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "axios": "^1.6.2",
    "winston": "^3.11.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "jest": "^29.7.0",
    "supertest": "^6.3.3",
    "eslint": "^8.55.0",
    "prettier": "^3.1.1"
  }
}
```

### **1.4 Basic Server Setup**

**File: `server.js`**

```javascript
require("dotenv").config();
const app = require("./src/app");
const connectDB = require("./src/config/database");
const logger = require("./src/utils/logger");

const PORT = process.env.PORT || 5000;

// Connect to database
connectDB();

// Start server
const server = app.listen(PORT, () => {
  logger.info(
    `🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`,
  );
});

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down gracefully");
  server.close(() => {
    logger.info("Process terminated");
  });
});
```

---

## 💾 Phase 2: Database Layer

### **2.1 Database Configuration**

**File: `src/config/database.js`**

```javascript
const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);

    // Handle connection events
    mongoose.connection.on("error", (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
    });
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
```

### **2.2 Database Models**

**File: `src/models/User.js`**

```javascript
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
      sparse: true,
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
    socialLinks: {
      twitter: String,
      instagram: String,
      website: String,
    },
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
    isVerified: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  {
    timestamps: true,
  },
);

// Indexes
userSchema.index({ username: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model("User", userSchema);
```

**File: `src/models/NFT.js`**

```javascript
const mongoose = require("mongoose");

const nftSchema = new mongoose.Schema(
  {
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
    attributes: [
      {
        trait_type: String,
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    tokenURI: {
      type: String,
      required: true,
    },
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
    royalty: {
      type: Number,
      min: 0,
      max: 10,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// Compound indexes
nftSchema.index({ owner: 1, createdAt: -1 });
nftSchema.index({ creator: 1, createdAt: -1 });
nftSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("NFT", nftSchema);
```

**File: `src/models/Listing.js`**

```javascript
const mongoose = require("mongoose");

const listingSchema = new mongoose.Schema(
  {
    listingId: {
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
      index: true,
    },
    price: {
      type: String,
      required: true,
    },
    active: {
      type: Boolean,
      default: true,
      index: true,
    },
    buyer: {
      type: String,
      lowercase: true,
    },
    soldAt: Date,
    cancelledAt: Date,
    transactionHash: String,
  },
  {
    timestamps: true,
  },
);

// Compound indexes
listingSchema.index({ active: 1, createdAt: -1 });
listingSchema.index({ seller: 1, active: 1 });
listingSchema.index({ tokenId: 1, active: 1 });

module.exports = mongoose.model("Listing", listingSchema);
```

**File: `src/models/Auction.js`**

```javascript
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
      index: true,
    },
    startPrice: {
      type: String,
      required: true,
    },
    highestBid: String,
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

// Compound indexes
auctionSchema.index({ active: 1, endTime: 1 });
auctionSchema.index({ seller: 1, active: 1 });

module.exports = mongoose.model("Auction", auctionSchema);
```

**File: `src/models/Bid.js`**

```javascript
const mongoose = require("mongoose");

const bidSchema = new mongoose.Schema(
  {
    auctionId: {
      type: Number,
      required: true,
      index: true,
    },
    bidder: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    amount: {
      type: String,
      required: true,
    },
    transactionHash: String,
  },
  {
    timestamps: true,
  },
);

// Compound indexes
bidSchema.index({ auctionId: 1, createdAt: -1 });
bidSchema.index({ bidder: 1, createdAt: -1 });

module.exports = mongoose.model("Bid", bidSchema);
```

---

## ⛓️ Phase 3: Blockchain Integration

### **3.1 Blockchain Configuration**

**File: `src/config/blockchain.js`**

```javascript
const { ethers } = require("ethers");
const logger = require("../utils/logger");

// Contract ABIs
const NFT_ABI = require("../../contracts/NFT.json").abi;
const MARKETPLACE_ABI = require("../../contracts/Marketplace.json").abi;

class BlockchainConfig {
  constructor() {
    this.provider = null;
    this.wallet = null;
    this.nftContract = null;
    this.marketplaceContract = null;
  }

  async initialize() {
    try {
      // Create provider
      this.provider = new ethers.JsonRpcProvider(process.env.RPC_URL);

      // Create wallet
      this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);

      // Initialize contracts
      this.nftContract = new ethers.Contract(
        process.env.NFT_CONTRACT_ADDRESS,
        NFT_ABI,
        this.wallet,
      );

      this.marketplaceContract = new ethers.Contract(
        process.env.MARKETPLACE_CONTRACT_ADDRESS,
        MARKETPLACE_ABI,
        this.wallet,
      );

      // Verify connection
      const network = await this.provider.getNetwork();
      logger.info(
        `✅ Connected to blockchain: ${network.name} (Chain ID: ${network.chainId})`,
      );

      return true;
    } catch (error) {
      logger.error(`❌ Blockchain initialization failed: ${error.message}`);
      throw error;
    }
  }

  getProvider() {
    return this.provider;
  }

  getWallet() {
    return this.wallet;
  }

  getNFTContract() {
    return this.nftContract;
  }

  getMarketplaceContract() {
    return this.marketplaceContract;
  }
}

module.exports = new BlockchainConfig();
```

### **3.2 Blockchain Service**

**File: `src/services/blockchainService.js`**

```javascript
const { ethers } = require("ethers");
const blockchainConfig = require("../config/blockchain");
const logger = require("../utils/logger");

class BlockchainService {
  // NFT Operations
  async getNFTOwner(tokenId) {
    try {
      const nftContract = blockchainConfig.getNFTContract();
      const owner = await nftContract.ownerOf(tokenId);
      return owner.toLowerCase();
    } catch (error) {
      logger.error(`Error getting NFT owner: ${error.message}`);
      throw error;
    }
  }

  async getNFTMetadata(tokenId) {
    try {
      const nftContract = blockchainConfig.getNFTContract();
      const tokenURI = await nftContract.tokenURI(tokenId);
      return tokenURI;
    } catch (error) {
      logger.error(`Error getting NFT metadata: ${error.message}`);
      throw error;
    }
  }

  async getTotalSupply() {
    try {
      const nftContract = blockchainConfig.getNFTContract();
      const supply = await nftContract.totalSupply();
      return Number(supply);
    } catch (error) {
      logger.error(`Error getting total supply: ${error.message}`);
      throw error;
    }
  }

  // Marketplace Operations
  async getListingDetails(listingId) {
    try {
      const marketplace = blockchainConfig.getMarketplaceContract();
      const listing = await marketplace.listings(listingId);
      return {
        seller: listing.seller.toLowerCase(),
        nftContract: listing.nftContract.toLowerCase(),
        tokenId: Number(listing.tokenId),
        price: listing.price.toString(),
        active: listing.active,
      };
    } catch (error) {
      logger.error(`Error getting listing details: ${error.message}`);
      throw error;
    }
  }

  async getAuctionDetails(auctionId) {
    try {
      const marketplace = blockchainConfig.getMarketplaceContract();
      const auction = await marketplace.auctions(auctionId);
      return {
        seller: auction.seller.toLowerCase(),
        nftContract: auction.nftContract.toLowerCase(),
        tokenId: Number(auction.tokenId),
        startPrice: auction.startPrice.toString(),
        highestBid: auction.highestBid.toString(),
        highestBidder: auction.highestBidder.toLowerCase(),
        endTime: Number(auction.endTime),
        active: auction.active,
        claimed: auction.claimed,
        cancelled: auction.cancelled,
      };
    } catch (error) {
      logger.error(`Error getting auction details: ${error.message}`);
      throw error;
    }
  }

  // Utility functions
  async getBlockTimestamp() {
    try {
      const provider = blockchainConfig.getProvider();
      const block = await provider.getBlock("latest");
      return block.timestamp;
    } catch (error) {
      logger.error(`Error getting block timestamp: ${error.message}`);
      throw error;
    }
  }

  async getTransactionReceipt(txHash) {
    try {
      const provider = blockchainConfig.getProvider();
      const receipt = await provider.getTransactionReceipt(txHash);
      return receipt;
    } catch (error) {
      logger.error(`Error getting transaction receipt: ${error.message}`);
      throw error;
    }
  }

  // Format helpers
  formatEther(wei) {
    return ethers.formatEther(wei);
  }

  parseEther(ether) {
    return ethers.parseEther(ether);
  }
}

module.exports = new BlockchainService();
```

---

## 🔐 Phase 4: Authentication & Security

### **4.1 Authentication Service**

**File: `src/services/authService.js`**

```javascript
const jwt = require("jsonwebtoken");
const { ethers } = require("ethers");
const User = require("../models/User");
const logger = require("../utils/logger");

class AuthService {
  // Generate nonce for wallet signature
  async generateNonce(walletAddress) {
    try {
      const address = walletAddress.toLowerCase();

      let user = await User.findOne({ walletAddress: address });

      if (!user) {
        user = await User.create({
          walletAddress: address,
          nonce: Math.floor(Math.random() * 1000000).toString(),
        });
      } else {
        user.nonce = Math.floor(Math.random() * 1000000).toString();
        await user.save();
      }

      return user.nonce;
    } catch (error) {
      logger.error(`Error generating nonce: ${error.message}`);
      throw error;
    }
  }

  // Verify signature and generate JWT
  async verifySignature(walletAddress, signature) {
    try {
      const address = walletAddress.toLowerCase();
      const user = await User.findOne({ walletAddress: address });

      if (!user) {
        throw new Error("User not found");
      }

      // Create message that was signed
      const message = `Sign this message to authenticate with NFT Marketplace.\n\nNonce: ${user.nonce}`;

      // Verify signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== address) {
        throw new Error("Invalid signature");
      }

      // Generate new nonce for next login
      user.nonce = Math.floor(Math.random() * 1000000).toString();
      await user.save();

      // Generate JWT token
      const token = this.generateToken(user._id, address);

      return { token, user };
    } catch (error) {
      logger.error(`Error verifying signature: ${error.message}`);
      throw error;
    }
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
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }
}

module.exports = new AuthService();
```

### **4.2 Authentication Middleware**

**File: `src/middleware/auth.js`**

```javascript
const authService = require("../services/authService");
const User = require("../models/User");
const { AppError } = require("../utils/errors");

exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Not authorized to access this route", 401));
    }

    // Verify token
    const decoded = authService.verifyToken(token);

    // Get user from token
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return next(new AppError("Not authorized to access this route", 401));
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("User role not authorized to access this route", 403),
      );
    }
    next();
  };
};
```

---

## 🎯 Phase 5: API Development

### **5.1 Route Structure**

**File: `src/routes/index.js`**

```javascript
const express = require("express");
const router = express.Router();

// Import route modules
const authRoutes = require("./authRoutes");
const nftRoutes = require("./nftRoutes");
const listingRoutes = require("./listingRoutes");
const auctionRoutes = require("./auctionRoutes");
const userRoutes = require("./userRoutes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/nfts", nftRoutes);
router.use("/listings", listingRoutes);
router.use("/auctions", auctionRoutes);
router.use("/users", userRoutes);

// Health check
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
```

### **5.2 Controllers**

**File: `src/controllers/nftController.js`**

```javascript
const NFT = require("../models/NFT");
const blockchainService = require("../services/blockchainService");
const { AppError } = require("../utils/errors");
const logger = require("../utils/logger");

// @desc    Get all NFTs
// @route   GET /api/v1/nfts
// @access  Public
exports.getAllNFTs = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category,
      owner,
      creator,
      sort = "-createdAt",
    } = req.query;

    // Build query
    const query = {};
    if (category) query.category = category;
    if (owner) query.owner = owner.toLowerCase();
    if (creator) query.creator = creator.toLowerCase();

    // Execute query with pagination
    const nfts = await NFT.find(query)
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await NFT.countDocuments(query);

    res.json({
      success: true,
      count: nfts.length,
      total: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      data: nfts,
    });
  } catch (error) {
    logger.error(`Error in getAllNFTs: ${error.message}`);
    next(error);
  }
};

// @desc    Get single NFT
// @route   GET /api/v1/nfts/:tokenId
// @access  Public
exports.getNFT = async (req, res, next) => {
  try {
    const { tokenId } = req.params;

    const nft = await NFT.findOne({ tokenId });

    if (!nft) {
      return next(new AppError("NFT not found", 404));
    }

    // Increment views
    nft.views += 1;
    await nft.save();

    res.json({
      success: true,
      data: nft,
    });
  } catch (error) {
    logger.error(`Error in getNFT: ${error.message}`);
    next(error);
  }
};

// @desc    Get NFTs owned by address
// @route   GET /api/v1/nfts/owner/:address
// @access  Public
exports.getNFTsByOwner = async (req, res, next) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const nfts = await NFT.find({ owner: address.toLowerCase() })
      .sort("-createdAt")
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .lean();

    const count = await NFT.countDocuments({ owner: address.toLowerCase() });

    res.json({
      success: true,
      count: nfts.length,
      total: count,
      data: nfts,
    });
  } catch (error) {
    logger.error(`Error in getNFTsByOwner: ${error.message}`);
    next(error);
  }
};
```

---

## 🎧 Phase 6: Event Listeners & Sync

### **6.1 Event Listener Service**

**File: `src/services/eventListenerService.js`**

```javascript
const blockchainConfig = require("../config/blockchain");
const NFT = require("../models/NFT");
const Listing = require("../models/Listing");
const Auction = require("../models/Auction");
const Bid = require("../models/Bid");
const logger = require("../utils/logger");
const axios = require("axios");

class EventListenerService {
  constructor() {
    this.nftContract = null;
    this.marketplaceContract = null;
  }

  async initialize() {
    this.nftContract = blockchainConfig.getNFTContract();
    this.marketplaceContract = blockchainConfig.getMarketplaceContract();

    this.setupNFTListeners();
    this.setupMarketplaceListeners();

    logger.info("✅ Event listeners initialized");
  }

  setupNFTListeners() {
    // Listen to NFT minting
    this.nftContract.on("TokenCreated", async (tokenId, owner, uri, event) => {
      try {
        logger.info(`🎨 NFT Minted: Token ID ${tokenId}`);

        // Fetch metadata from IPFS
        const metadata = await this.fetchMetadata(uri);

        // Save to database
        await NFT.create({
          tokenId: Number(tokenId),
          contractAddress: process.env.NFT_CONTRACT_ADDRESS.toLowerCase(),
          owner: owner.toLowerCase(),
          creator: owner.toLowerCase(),
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          attributes: metadata.attributes || [],
          tokenURI: uri,
          category: metadata.category || "other",
        });

        logger.info(`✅ NFT ${tokenId} saved to database`);
      } catch (error) {
        logger.error(`Error handling TokenCreated event: ${error.message}`);
      }
    });

    // Listen to NFT transfers
    this.nftContract.on("Transfer", async (from, to, tokenId, event) => {
      try {
        // Skip minting events (from = 0x0)
        if (from === ethers.ZeroAddress) return;

        logger.info(`🔄 NFT Transfer: Token ${tokenId} from ${from} to ${to}`);

        // Update owner in database
        await NFT.findOneAndUpdate(
          { tokenId: Number(tokenId) },
          { owner: to.toLowerCase() },
        );

        logger.info(`✅ NFT ${tokenId} owner updated`);
      } catch (error) {
        logger.error(`Error handling Transfer event: ${error.message}`);
      }
    });
  }

  setupMarketplaceListeners() {
    // NFT Listed
    this.marketplaceContract.on(
      "NFTListed",
      async (listingId, seller, nftContract, tokenId, price, event) => {
        try {
          logger.info(`📝 NFT Listed: Listing ID ${listingId}`);

          await Listing.create({
            listingId: Number(listingId),
            seller: seller.toLowerCase(),
            nftContract: nftContract.toLowerCase(),
            tokenId: Number(tokenId),
            price: price.toString(),
            active: true,
            transactionHash: event.log.transactionHash,
          });

          logger.info(`✅ Listing ${listingId} saved to database`);
        } catch (error) {
          logger.error(`Error handling NFTListed event: ${error.message}`);
        }
      },
    );

    // NFT Sold
    this.marketplaceContract.on(
      "NFTSold",
      async (listingId, buyer, seller, price, event) => {
        try {
          logger.info(`💰 NFT Sold: Listing ID ${listingId}`);

          await Listing.findOneAndUpdate(
            { listingId: Number(listingId) },
            {
              active: false,
              buyer: buyer.toLowerCase(),
              soldAt: new Date(),
              transactionHash: event.log.transactionHash,
            },
          );

          logger.info(`✅ Listing ${listingId} marked as sold`);
        } catch (error) {
          logger.error(`Error handling NFTSold event: ${error.message}`);
        }
      },
    );

    // Listing Cancelled
    this.marketplaceContract.on(
      "ListingCancelled",
      async (listingId, event) => {
        try {
          logger.info(`❌ Listing Cancelled: ${listingId}`);

          await Listing.findOneAndUpdate(
            { listingId: Number(listingId) },
            {
              active: false,
              cancelledAt: new Date(),
              transactionHash: event.log.transactionHash,
            },
          );

          logger.info(`✅ Listing ${listingId} marked as cancelled`);
        } catch (error) {
          logger.error(
            `Error handling ListingCancelled event: ${error.message}`,
          );
        }
      },
    );

    // Auction Created
    this.marketplaceContract.on(
      "AuctionCreated",
      async (
        auctionId,
        seller,
        nftContract,
        tokenId,
        startPrice,
        endTime,
        event,
      ) => {
        try {
          logger.info(`🎯 Auction Created: ${auctionId}`);

          await Auction.create({
            auctionId: Number(auctionId),
            seller: seller.toLowerCase(),
            nftContract: nftContract.toLowerCase(),
            tokenId: Number(tokenId),
            startPrice: startPrice.toString(),
            endTime: new Date(Number(endTime) * 1000),
            active: true,
            transactionHash: event.log.transactionHash,
          });

          logger.info(`✅ Auction ${auctionId} saved to database`);
        } catch (error) {
          logger.error(`Error handling AuctionCreated event: ${error.message}`);
        }
      },
    );

    // Bid Placed
    this.marketplaceContract.on(
      "BidPlaced",
      async (auctionId, bidder, amount, event) => {
        try {
          logger.info(`💵 Bid Placed: Auction ${auctionId} - ${amount}`);

          // Save bid
          await Bid.create({
            auctionId: Number(auctionId),
            bidder: bidder.toLowerCase(),
            amount: amount.toString(),
            transactionHash: event.log.transactionHash,
          });

          // Update auction
          await Auction.findOneAndUpdate(
            { auctionId: Number(auctionId) },
            {
              highestBid: amount.toString(),
              highestBidder: bidder.toLowerCase(),
            },
          );

          logger.info(`✅ Bid saved and auction updated`);
        } catch (error) {
          logger.error(`Error handling BidPlaced event: ${error.message}`);
        }
      },
    );

    // NFT Claimed
    this.marketplaceContract.on(
      "NFTClaimed",
      async (auctionId, winner, event) => {
        try {
          logger.info(`🏆 NFT Claimed: Auction ${auctionId}`);

          await Auction.findOneAndUpdate(
            { auctionId: Number(auctionId) },
            {
              active: false,
              winner: winner.toLowerCase(),
              claimed: true,
              transactionHash: event.log.transactionHash,
            },
          );

          logger.info(`✅ Auction ${auctionId} marked as claimed`);
        } catch (error) {
          logger.error(`Error handling NFTClaimed event: ${error.message}`);
        }
      },
    );
  }

  async fetchMetadata(uri) {
    try {
      // Handle IPFS URIs
      let url = uri;
      if (uri.startsWith("ipfs://")) {
        url = uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/");
      }

      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      logger.error(`Error fetching metadata: ${error.message}`);
      return {
        name: "Unknown",
        description: "",
        image: "",
        attributes: [],
      };
    }
  }
}

module.exports = new EventListenerService();
```

---

## 🚀 Phase 7: Production Deployment

### **7.1 Error Handling**

**File: `src/middleware/errorHandler.js`**

```javascript
const logger = require("../utils/logger");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = "Duplicate field value entered";
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors).map((val) => val.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || "Server Error",
  });
};

module.exports = errorHandler;
```

### **7.2 Main App File**

**File: `src/app.js`**

```javascript
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const routes = require("./routes");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./utils/logger");
const blockchainConfig = require("./config/blockchain");
const eventListenerService = require("./services/eventListenerService");

const app = express();

// Security middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX),
});
app.use("/api/", limiter);

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Initialize blockchain
blockchainConfig
  .initialize()
  .then(() => {
    // Start event listeners
    return eventListenerService.initialize();
  })
  .catch((err) => {
    logger.error(`Failed to initialize blockchain: ${err.message}`);
  });

// Mount routes
app.use(`/api/${process.env.API_VERSION}`, routes);

// Error handler
app.use(errorHandler);

module.exports = app;
```

---

## ✅ Production Checklist

### **Security**

- [ ] Environment variables properly configured
- [ ] Rate limiting enabled
- [ ] CORS configured correctly
- [ ] Helmet security headers enabled
- [ ] Input validation on all endpoints
- [ ] JWT secret is strong and secure
- [ ] Private keys never exposed

### **Database**

- [ ] Indexes created for frequently queried fields
- [ ] Connection pooling configured
- [ ] Backup strategy in place
- [ ] Database credentials secured

### **Blockchain**

- [ ] Contracts verified on block explorer
- [ ] Event listeners running
- [ ] RPC provider has sufficient rate limits
- [ ] Fallback RPC providers configured

### **Monitoring**

- [ ] Logging configured (Winston)
- [ ] Error tracking (Sentry optional)
- [ ] Performance monitoring
- [ ] Uptime monitoring

### **Testing**

- [ ] Unit tests written
- [ ] Integration tests written
- [ ] API endpoints tested
- [ ] Event listeners tested

### **Deployment**

- [ ] PM2 or similar process manager
- [ ] Nginx reverse proxy
- [ ] SSL certificate installed
- [ ] Domain configured
- [ ] Firewall rules set

---

## 🎯 Implementation Order

1. **Week 1:** Foundation (Phase 1-2)
   - Set up project structure
   - Configure database
   - Create models

2. **Week 2:** Blockchain Integration (Phase 3)
   - Set up blockchain connection
   - Create blockchain service
   - Test contract interactions

3. **Week 3:** API Development (Phase 4-5)
   - Build authentication
   - Create controllers
   - Implement routes

4. **Week 4:** Event Listeners (Phase 6)
   - Set up event listeners
   - Test sync with blockchain
   - Handle edge cases

5. **Week 5:** Modular AI Integration & Testing (Phases 7-8)
   - Implement AI Micro-services (Generative, Search, Pricing, Chat)
   - Write tests
   - Deploy to production
   - Monitor and optimize

---

## 🤖 Phase 9: Modular AI Architecture (Render-Optimized)

To elevate the platform and integrate cutting-edge AI without exhausting the limited CPU and RAM of free-tier servers (e.g., Render), the AI features will be fundamentally **modular**.

We will offload heavy computations to free third-party APIs rather than running local models like `Transformers.js`, which would cause OOM (Out of Memory) crashes on small instances.

### **Design Pattern: Adapter / Micro-Services**

Every AI feature will live in its own isolated service file (`src/services/ai/`). If an API deprecates or fails, the core marketplace logic will gracefully fallback or disabled that specific AI feature without crashing the server.

### **1. Semantic Search Backend**

- **Strategy:** Instead of exact keyword matches, we will use **MongoDB Atlas Vector Search**.
- **Execution:** When an NFT is minted, `aiEmbeddingService.js` sends the NFT description to the **Google Gemini API** (`text-embedding-004`) to get a vector array. This vector is saved to the NFT document.
- **Search Flow:** When a user searches, the text is vectorized via the same API, and MongoDB returns the mathematically closest matches.

### **2. Copyright and Plagiarism Detection**

- **Strategy:** Prevent duplicate/stolen art mints using Computer Vision.
- **Execution:** When a user uploads an image to `/api/v1/nfts/upload/image`, `aiVisionService.js` routes a compressed version of the image to the **Hugging Face Inference API** (using a free CLIP model).
- **Validation:** The API returns an image embedding vector. The backend queries MongoDB Atlas; if a vector match > 95% similarity exists, it throws a 400 Error ("Plagiarism Detected") and deletes the temp upload.

### **3. Native AI NFT Generator**

- **Strategy:** Serverless image generation directly into IPFS.
- **Execution:** We will use **DeepAI** or **Pollinations.ai**. The `aiGeneratorService.js` will take a user's text prompt, request the image from the external API, buffer the response, and immediately pass it to `ipfsService.js` for Pinata upload.

### **4. AI Price Estimation Tool**

- **Strategy:** Provide users with an intelligent estimate of an NFT's current value based on category and traits.
- **Execution:** `aiPricingService.js` will utilize the **Groq API** (running Llama-3, extremely fast and free). When the frontend calls `/api/v1/nfts/:id/estimate`, the backend bundles the NFT metadata into a prompt ("Act as an art appraiser...") and returns the JSON LLM response to the frontend.

### **5. Smart AI Chatbot**

- **Strategy:** Provide a platform concierge.
- **Execution:** The frontend interacts directly with a websocket or standard REST route handled by `aiChatService.js`. The service maintains conversation history in server memory or a lightweight DB collection, and forwards prompts to the **Groq API** equipped with a strict System Prompt detailing how to use this specific marketplace.

---

**This plan provides a complete roadmap for building a production-grade, AI-enhanced backend. Follow it step-by-step, and you'll have a robust, scalable NFT marketplace!** 🚀
