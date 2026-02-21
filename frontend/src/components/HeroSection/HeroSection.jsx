import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import styles from "./HeroSection.module.css";

const HeroSection = () => {
  return (
    <section className={styles.heroSection}>
      {/* VIDEO BACKGROUND */}
      <div className={styles.videoWrapper}>
        <div className={styles.videoOverlay}></div>
        <video autoPlay loop muted playsInline className={styles.bgVideo}>
          <source
            src="https://res.cloudinary.com/derp0chbp/video/upload/v1771650708/Decentralised%20Auction%20and%20Marketplace%20Platform/headervideo.mp4"
            type="video/mp4"
          />
        </video>
      </div>

      <div className={`container ${styles.heroContent}`}>
        <motion.div
          className={styles.textContent}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.h1
            className={styles.title}
            initial={{ opacity: 0, y: 50, rotateX: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
            style={{ perspective: 1000 }}
          >
            Discover, Collect &<br />
            Sell Extraordinary{" "}
            <span className="gradient-text" style={{ textShadow: "none" }}>
              NFTs
            </span>
          </motion.h1>

          <motion.p
            className={styles.subtitle}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
          >
            The world's first and largest digital marketplace for crypto
            collectibles and non-fungible tokens powered by Base Sepolia.
          </motion.p>

          <motion.div
            className={styles.ctaButtons}
            initial={{ opacity: 0, scale: 0.8, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 1.5,
              type: "spring",
              stiffness: 120,
              damping: 12,
            }}
          >
            <Link to="/explore" className={styles.mainBtn}>
              Explore Marketplace
            </Link>
            <Link to="/create" className={`glass-panel ${styles.secondaryBtn}`}>
              Create & Mint
            </Link>
          </motion.div>

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <h3>1M+</h3>
              <p>Collections</p>
            </div>
            <div className={styles.statBox}>
              <h3>5M+</h3>
              <p>NFTs Minted</p>
            </div>
            <div className={styles.statBox}>
              <h3>$2B+</h3>
              <p>Traded Vol.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
