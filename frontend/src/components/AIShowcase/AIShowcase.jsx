import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiTerminal, FiArrowRight, FiCpu, FiCheck } from "react-icons/fi";
import { Link } from "react-router-dom";
import styles from "./AIShowcase.module.css";

const TypeText = ({ text, delayOffset = 0, className = "" }) => {
  const words = text.split(" ");
  let charCount = 0;
  return (
    <span className={className}>
      {words.map((word, wordIndex) => {
        const wordNode = (
          <span key={`word-${wordIndex}`} style={{ display: "inline-block" }}>
            {word.split("").map((char, charIndex) => {
              const currentDelay = delayOffset + charCount * 0.04;
              charCount++;
              return (
                <motion.span
                  key={charIndex}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.01, delay: currentDelay }}
                >
                  {char}
                </motion.span>
              );
            })}
          </span>
        );

        if (wordIndex < words.length - 1) {
          const spaceDelay = delayOffset + charCount * 0.04;
          charCount++;
          return (
            <React.Fragment key={`frag-${wordIndex}`}>
              {wordNode}
              <motion.span
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.01, delay: spaceDelay }}
              >
                {" "}
              </motion.span>
            </React.Fragment>
          );
        }

        return wordNode;
      })}
    </span>
  );
};

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
          <motion.div
            className={styles.textContent}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className={styles.badge}>
              <FiCpu /> Decentralized AI
            </div>
            <h2 className={styles.title}>
              <TypeText text="Generate " delayOffset={0.4} />
              <TypeText
                text="Masterpieces"
                delayOffset={0.4 + 9 * 0.04}
                className="gradient-text"
              />
              <br />
              <TypeText
                text=" at the Speed of Thought"
                delayOffset={0.4 + 21 * 0.04}
              />
            </h2>
            <p className={styles.subtitle}>
              CryptoMarket integrates state-of-the-art AI generation directly
              into your minting flow. Don't have any art? Describe your vision,
              and our decentralized network will instantly render it into
              existence.
            </p>

            <ul className={styles.featureList}>
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
          </motion.div>

          <div className={styles.visualContent}>
            <motion.div
              className={`glass-panel ${styles.interactiveDemo}`}
              initial={{ opacity: 0, x: 50, rotateY: 15 }}
              whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
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
                <motion.div
                  key={`skeleton-${promptIndex}`}
                  className={styles.skeletonFrame}
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ delay: 0, duration: 1.5 }}
                >
                  <div className={styles.gridLines}></div>
                </motion.div>
                <div className={styles.revealWrapper}>
                  <motion.div
                    key={`glow-${promptIndex}`}
                    className={styles.scannerGlow}
                    initial={{ top: "0%", opacity: 0 }}
                    animate={{ top: "100%", opacity: [0, 1, 1, 0] }}
                    transition={{
                      top: { duration: 1.5, ease: "easeInOut" },
                      opacity: {
                        duration: 1.5,
                        ease: "linear",
                        times: [0, 0.1, 0.9, 1],
                      },
                    }}
                  />
                  <motion.img
                    key={`img-${promptIndex}`}
                    src={images[promptIndex]}
                    alt="AI Generated Mockup"
                    initial={{ clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" }}
                    animate={{
                      clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
                    }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    className={styles.demoImage}
                  />
                </div>
              </div>
            </motion.div>

            <div className={styles.bgBlobRow}></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AIShowcase;
