import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiDatabase,
  FiLock,
  FiCpu,
  FiEye,
  FiMessageSquare,
  FiTrendingUp,
} from "react-icons/fi";
import styles from "./FeatureShowcase3D.module.css";

const features = [
  {
    id: 1,
    icon: <FiLock />,
    title: "Base Sepolia Network",
    desc: "Live robust smart contracts deployed on Base Sepolia ensuring mathematically secure, immutable, and hyper-fast transactions.",
  },
  {
    id: 2,
    icon: <FiDatabase />,
    title: "Pinata IPFS Storage",
    desc: "Zero central servers. All NFT media and JSON metadata are permanently and redundantly pinned to the interplanetary file system.",
  },
  {
    id: 3,
    icon: <FiCpu />,
    title: "Neural Engine Generator",
    desc: "Bleeding-edge decentralized AI integration. Instantly generate stunning 4K masterpieces directly from your imagination.",
  },
  {
    id: 4,
    icon: <FiEye />,
    title: "AI Plagiarism Detection",
    desc: "State-of-the-art HuggingFace CLIP vision models automatically scan the blockchain to reject stolen or duplicate artwork.",
  },
  {
    id: 5,
    icon: <FiMessageSquare />,
    title: "Smart Concierge Chatbot",
    desc: "An intelligent, context-aware AI assistant powered by Groq to guide you through the intricacies of Web3 minting.",
  },
  {
    id: 6,
    icon: <FiTrendingUp />,
    title: "Algorithmic Pricing",
    desc: "Advanced predictive machine learning models that analyze live market trends to estimate the optimal listing price for your assets.",
  },
];

const FeatureShowcase3D = () => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-rotate the showcase naturally
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % features.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className={styles.showcaseSection}>
      <div className={`container ${styles.layout}`}>
        <div className={styles.textContent}>
          <div className={styles.badge}>Portfolio Architecture</div>
          <h2 className={styles.title}>
            Powered by next-gen <br />
            <span className="gradient-text">Web3 & AI Tech</span>
          </h2>
          <p className={styles.subtitle}>
            This isn't just a UI wrapper. CryptoMarket is a fully functional
            decentralized application combining the security of the blockchain
            with the intelligence of modern AI microservices.
          </p>

          <div className={styles.paginationList}>
            {features.map((feat, idx) => (
              <div
                key={feat.id}
                className={`${styles.pageItem} ${idx === activeIndex ? styles.activePage : ""}`}
                onClick={() => setActiveIndex(idx)}
              >
                <div className={styles.pageIcon}>{feat.icon}</div>
                <span>{feat.title}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.scene3d}>
          <div className={styles.carouselContainer}>
            <AnimatePresence mode="popLayout">
              {features.map((feature, i) => {
                if (i !== activeIndex) return null;

                return (
                  <motion.div
                    key={feature.id}
                    className={`glass-panel ${styles.card3d}`}
                    initial={{ opacity: 0, rotateY: 90, scale: 0.8, z: -300 }}
                    animate={{ opacity: 1, rotateY: 0, scale: 1, z: 0 }}
                    exit={{ opacity: 0, rotateY: -90, scale: 0.8, z: -300 }}
                    transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
                  >
                    <div className={styles.cardGlow}></div>
                    <div className={styles.cardIconBox}>{feature.icon}</div>
                    <h3>{feature.title}</h3>
                    <p>{feature.desc}</p>

                    <div className={styles.techNodes}>
                      <div className={styles.node}></div>
                      <div className={styles.line}></div>
                      <div className={styles.node}></div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Decorative floating elements for the 3D scene */}
          <motion.div
            className={styles.floatingOrb1}
            animate={{
              y: [0, -20, 0],
              rotate: [0, 360],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
          <motion.div
            className={styles.floatingOrb2}
            animate={{
              y: [0, 30, 0],
              scale: [1, 1.2, 1],
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase3D;
