import React from "react";
import { motion } from "framer-motion";
import {
  FiDatabase,
  FiCpu,
  FiLayout,
  FiShield,
  FiTrendingUp,
  FiLayers,
  FiImage,
  FiMessageSquare,
} from "react-icons/fi";
import { Link } from "react-router-dom";
import styles from "./About.module.css";

const About = () => {
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  };

  return (
    <div className={`page-transition-enter-active ${styles.aboutPage}`}>
      <div className="container">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className={styles.contentWrapper}
        >
          {/* Header */}
          <motion.div variants={childVariants} style={{ textAlign: "center" }}>
            <h1 className={styles.title}>
              About The <span className="gradient-text">Project</span>
            </h1>
            <p className={styles.subtitle}>
              This platform is a comprehensive practice project exploring the
              cutting-edge intersection of blockchain technology, smart
              contracts, artificial intelligence microservices, and modern
              frontend architecture.
            </p>
          </motion.div>

          {/* Core Blockchain Infrastructure */}
          <motion.div variants={childVariants} className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.iconWrapper}>
                <FiDatabase size={24} />
              </div>
              <h2 className="gradient-text">
                1. Core Smart Contracts (Base Sepolia)
              </h2>
            </div>
            <div className={styles.grid}>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>
                  <FiShield className={styles.featureIcon} /> Marketplace
                  Contract
                </div>
                <div className={styles.featureText}>
                  A robust decentralized marketplace contract supporting both
                  fixed-price listings and competitive live auctions. Built with
                  a dual-payment system allowing trades via ETH or internal
                  contract balances, Reentrancy safeguards, and a dynamic fee
                  collection mechanism.
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>
                  <FiLayers className={styles.featureIcon} /> NFT Foundation
                </div>
                <div className={styles.featureText}>
                  Standard ERC721 implementation handling secure, authenticated
                  token minting. Integrates with IPFS for decentralized metadata
                  storage, royalty management, and tracks token ownership and
                  transfer states directly on the Base Sepolia network.
                </div>
              </div>
            </div>
          </motion.div>

          {/* AI Microservices */}
          <motion.div variants={childVariants} className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.iconWrapper}>
                <FiCpu size={24} />
              </div>
              <h2 className="gradient-text">2. AI Microservices Ecosystem</h2>
            </div>
            <div className={styles.grid}>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>
                  <FiDatabase className={styles.featureIcon} /> Semantic Vector
                  Search
                </div>
                <div className={styles.featureText}>
                  The marketplace search isn't limited to keywords. Uses Gemini
                  to convert text inputs into dense mathematical vectors,
                  querying MongoDB Atlas Vector Search to find NFTs visually and
                  contextually based on meaning.
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>
                  <FiImage className={styles.featureIcon} /> AI Plagiarism
                  Detection
                </div>
                <div className={styles.featureText}>
                  During minting, uploaded images are sent to Groq AI to
                  generate a highly detailed visual description. This
                  description is vectorized and cross-referenced with the
                  database to block &gt;95% similar copycat NFTs.
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>
                  <FiTrendingUp className={styles.featureIcon} /> AI Price
                  Estimation
                </div>
                <div className={styles.featureText}>
                  Leverages market data and AI algorithms to predict the
                  estimated value of NFTs based on their category, traits, and
                  the live transaction history indexed by backend event
                  listeners.
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>
                  <FiMessageSquare className={styles.featureIcon} /> Concierge
                  Agent
                </div>
                <div className={styles.featureText}>
                  An embedded smart LLM companion capable of guiding users on
                  creating MetaMask wallets, understanding NFTs, minting, and
                  navigating the nuances of Base Sepolia testnet operations.
                </div>
              </div>
            </div>
          </motion.div>

          {/* Frontend Ecosystem */}
          <motion.div variants={childVariants} className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.iconWrapper}>
                <FiLayout size={24} />
              </div>
              <h2 className="gradient-text">3. Premium Interface Design</h2>
            </div>
            <div className={styles.grid}>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>Visual Architecture</div>
                <div className={styles.featureText}>
                  Constructed using React and Vite, utilizing a complex "Light
                  Glassmorphism" aesthetic built strictly with Vanilla CSS
                  modules to prevent generic framework limitations.
                </div>
              </div>
              <div className={styles.featureCard}>
                <div className={styles.featureTitle}>
                  Advanced Micro-interactions
                </div>
                <div className={styles.featureText}>
                  Powered by Framer Motion and GSAP. Features true Single Page
                  Application (SPA) routing, robust 3D tilt effects, parallax
                  scrolling, and real-time backend synchronization.
                </div>
              </div>
            </div>
          </motion.div>

          {/* CTA Box */}
          <motion.div variants={childVariants} className={styles.ctaBox}>
            <div className={styles.ctaContent}>
              <h2 className={styles.ctaTitle}>Experience the Platform</h2>
              <p className={styles.ctaText}>
                Dive into the marketplace, test the live bidding mechanism,
                interact with the AI suite, or try minting your own token via
                our dashboard.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                }}
              >
                <Link to="/explore" className="btn-primary">
                  Explore Marketplace
                </Link>
                <Link
                  to="/auth"
                  className={`glass-panel btn-secondary`}
                  style={{
                    padding: "0 1.5rem",
                    borderRadius: "8px",
                    fontWeight: "600",
                    border: "1px solid var(--color-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Create Account
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default About;
