import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiTerminal, FiArrowRight, FiCpu, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import styles from "./AIShowcase.module.css";

const AIShowcase = () => {
  const [promptIndex, setPromptIndex] = useState(0);
  const prompts = [
    "A cyberpunk samurai standing in neon rain, 4k ultra realistic",
    "Ethereal floating islands with glowing waterfalls, digital art",
    "Futuristic sports car racing on Mars, synthwave style",
  ];

  const images = [
    "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?q=80&w=2674&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2674&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPromptIndex((prev) => (prev + 1) % prompts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className={styles.aiSection}>
      <div className="container">
        <div className={styles.aiLayout}>
          <div className={styles.textContent}>
            <div className={styles.badge}>
              <FiCpu /> Decentralized AI
            </div>
            <h2 className={styles.title}>
              Generate <span className="gradient-text">Masterpieces</span>
              <br /> at the Speed of Thought
            </h2>
            <p className={styles.subtitle}>
              CryptoMarket integrates state-of-the-art AI generation directly
              into your minting flow. Don't have any art? Describe your vision,
              and our decentralized network will instantly render it into
              existence for free.
            </p>

            <ul className={styles.featureList}>
              <li>
                <FiCheck className={styles.checkIcon} /> Free 4K image
                generation for all users
              </li>
              <li>
                <FiCheck className={styles.checkIcon} /> Direct pipeline to IPFS
                & Base Sepolia
              </li>
              <li>
                <FiCheck className={styles.checkIcon} /> Full commercial rights
                upon minting
              </li>
            </ul>

            <Link to="/create" className={`btn-primary ${styles.ctaBtn}`}>
              Try the AI Generator <FiArrowRight />
            </Link>
          </div>

          <div className={styles.visualContent}>
            <div className={`glass-panel ${styles.interactiveDemo}`}>
              <div className={styles.demoHeader}>
                <FiTerminal /> <span>Prompt Editor</span>
              </div>
              <div className={styles.promptBox}>
                <p className={styles.typingText}>
                  "<span>{prompts[promptIndex]}</span>"
                  <span className={styles.cursor}>|</span>
                </p>
              </div>

              <div className={styles.imageRevealArea}>
                <div className={styles.scanningLine}></div>
                <motion.img
                  key={promptIndex}
                  src={images[promptIndex]}
                  alt="AI Generated Mockup"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 1 }}
                  className={styles.demoImage}
                />
              </div>
            </div>

            <div className={styles.bgBlobRow}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIShowcase;
