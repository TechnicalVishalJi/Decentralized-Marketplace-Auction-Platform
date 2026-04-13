<div align="center">
  <h1>Decentralized AI Marketplace & Auction Platform</h1>
  <img alt="CryptoMarket Logo" src="https://res.cloudinary.com/derp0chbp/image/upload/v1772255047/Decentralised%20Auction%20and%20Marketplace%20Platform/Screenshot_2026-02-28_103039_ekmzi9.png">
  <p>
    <strong>A next-generation Web3 marketplace integrating advanced dual-payment smart contracts with cutting-edge AI microservices.</strong>
  </p>

  <!-- Badges -->
  <p>
    <a href="https://github.com/yourusername/blockchain-practice-project"><img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg"></a>
    <a href="https://reactjs.org/"><img alt="React" src="https://img.shields.io/badge/Frontend-React.js-61DAFB?logo=react&logoColor=white"></a>
    <a href="https://docs.base.org/"><img alt="Base Sepolia" src="https://img.shields.io/badge/Network-Base_Sepolia-0052FF?logo=ethereum&logoColor=white"></a>
    <a href="https://nodejs.org/"><img alt="Node.js" src="https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs&logoColor=white"></a>
    <a href="https://mongodb.com/"><img alt="MongoDB Vector" src="https://img.shields.io/badge/Database-MongoDB_Vector-47A248?logo=mongodb&logoColor=white"></a>
  </p>
</div>

---

LIVE Preview : [https://cryptomarketvishal.vercel.app](https://cryptomarketvishal.vercel.app)

---

## Demo Video

<div align="center">
  <a href="https://youtu.be/OFeDN0hJ-yM" target="_blank">
    <img src="https://img.youtube.com/vi/niMEMDzLGrU/maxresdefault.jpg" alt="CryptoMarket Demo Video" width="80%" style="border-radius: 12px;" />
  </a>
  <br /><br />
  <a href="https://youtu.be/OFeDN0hJ-yM">
    <img src="https://img.shields.io/badge/▶ Watch Full Demo-YouTube-red?style=for-the-badge&logo=youtube&logoColor=white" alt="Watch Demo" />
  </a>
</div>

---

## Overview

The **Decentralized AI Marketplace** is a robust, production-grade practice project designed to explore the intersection of **Web3 Smart Contracts**, **Modern Frontend Engineering**, and **Artificial Intelligence Microservices**.

Operating entirely on the **Base Sepolia Testnet**, the platform enables users to securely mint, list, buy, and auction ERC-721 non-fungible tokens. It utilizes a highly optimized glassmorphic React frontend driven by a scalable Express.js backend that synchronizes blockchain state in real-time.

Crucially, the platform embeds intelligent AI workflows—including semantic vector search, visual plagiarism detection, and automated price estimations—to elevate the decentralized trading experience.

---

## Key Features

### Smart Contract Infrastructure

- **Dual-Payment Engine:** Seamlessly supports purchasing and bidding via direct `ETH` transfers or through an internal user balance system.
- **Advanced Auctions:** Fully decentralized English auctions with automatic time extensions for snipe-prevention.
- **Robust Security:** Built with OpenZeppelin implementations, strict `ReentrancyGuards`, and comprehensive state-validation checks.

### AI Microservices Ecosystem

- **Semantic Vector Search:** Powered by **Google Gemini** embeddings and MongoDB Atlas `$vectorSearch`, allowing users to search the marketplace by _meaning_ rather than exact keywords.
- **Plagiarism Detection:** Leverages **Groq AI** and Gemini vision capabilities during minting to block copycat NFTs with >95% visual similarity to existing assets.
- **Price Estimator:** Real-time AI valuation modeling derived from trait analysis and historical marketplace synced data.
- **Smart Concierge LLM:** A built-in intelligent assistant that guides new users through setting up MetaMask, minting basics, and bridging testnet funds.

### Premium Frontend Experience

- **Fluid UI Architecture:** Crafted with React, Vite, and strict CSS Modules implementing a deep, highly-animated Light Glassmorphism aesthetic.
- **Instant SPA Routing:** Zero-reload architecture utilizing `react-router-dom` with Framer Motion route transition animations.
- **Resilient Web3 Flow:** Secure, seamless MetaMask wallet linking authenticated via backend-driven cryptographic nonce signatures.

### Scalable Backend Services

- **Real-Time Blockchain Indexing:** Constant Ethers.js `WebSocketProvider` polling to instantaneously sync `Transfer`, `NFTListed`, and `BidPlaced` events into the MongoDB cluster.
- **Cryptographic Security:** Hybrid JWT-based session management married with Web3 cryptographic proofs ensuring unauthorized state mutations are impossible.
- **Modular Design Pattern:** Strict Controller-Service separation ensuring API flexibility.

---

## System Architecture

```text
┌──────────────────────────┐         ┌─────────────────────────┐
│     Client Frontend      │         │     AI Microservices    │
│  (React, Vite, Framer)   │<───────>│ (Gemini, Groq, Freepick)│
└────────────┬─────────────┘         └────────────┬────────────┘
             │                                    │
             v                                    v
┌──────────────────────────┐         ┌─────────────────────────┐
│     Node.js Backend      │<───────>│      MongoDB Atlas      │
│ (Express, Auth, Syncing) │         │ (Data & Vector Search)  │
└────────────┬─────────────┘         └─────────────────────────┘
             │ WebSocket
             v
┌──────────────────────────┐
│       Base Sepolia       │
│  (ERC-721, Marketplace)  │
└──────────────────────────┘
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Git](https://git-scm.com/)
- MetaMask Wallet with Base Sepolia testnet ETH
- MongoDB Atlas cluster (with Vector Search configured)

### 1. Repository Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/blockchain-practice-project.git
cd blockchain-practice-project
```

### 2. Smart Contracts (Hardhat)

```bash
cd blockchain
npm install

# Setup environment variables
cp .env.example .env

# Compile and deploy to Base Sepolia
npx hardhat compile
npx hardhat ignition deploy ignition/modules/marketplace.js --network sepolia
```

### 3. Backend Setup

```bash
cd backend
npm install

# Start the development server
npm run dev
```

> **Note:** Ensure your `.env` contains valid RPC WebSocket URIs and your newly deployed contract addresses from Step 2.

### 4. Frontend Setup

```bash
cd frontend
npm install

# Start the Vite HMR server
npm run dev
```

The application will be running live at `http://localhost:5173`.

---

## Tech Stack Matrix

| Category       | Technologies Used                                                              |
| -------------- | ------------------------------------------------------------------------------ |
| **Frontend**   | React, Vite, Framer Motion, Axios, React Icons, CSS Modules                    |
| **Backend**    | Node.js, Express, Mongoose, JsonWebToken, Ethers.js (v6)                       |
| **Database**   | MongoDB Atlas, Atlas Vector Search                                             |
| **Blockchain** | Solidity, Hardhat, Base Sepolia, OpenZeppelin                                  |
| **AI/ML**      | Google Gemini (Embeddings), Groq Llama (Vision), Freepik AI (Image Generation) |
| **Storage**    | Pinata (IPFS), Cloudinary (CDN)                                                |

---

## Contributing

Contributions are heavily encouraged for this practice environment! If you have suggestions for optimizing the smart contracts, reducing React re-renders, or implementing new zero-knowledge proofs:

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## License

Distributed under the MIT License. See `LICENSE` for more information.

---

_Developed as an advanced engineering practice project to demonstrate end-to-end fullstack decentralized system design._
