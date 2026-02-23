import React, { useRef } from "react";
import { FiArrowRight, FiMessageSquare, FiZap } from "react-icons/fi";
import styles from "./CallToAction.module.css";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "framer-motion";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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

const CallToAction = () => {
  const ctaRef = useRef(null);
  const cardRef = useRef(null);

  useGSAP(
    () => {
      // Floating background orbs for ambiance
      gsap.to("." + styles.orb1, {
        y: -50,
        x: 30,
        rotation: 10,
        duration: 4,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      gsap.to("." + styles.orb2, {
        y: 40,
        x: -40,
        rotation: -15,
        duration: 5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
      });

      // Majestic 3D Entry animation on scroll
      gsap.fromTo(
        cardRef.current,
        {
          y: 100,
          opacity: 0,
          scale: 0.9,
          rotationX: 10,
        },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          rotationX: 0,
          duration: 1.5,
          ease: "back.out(1.2)",
          scrollTrigger: {
            trigger: ctaRef.current,
            start: "top 80%",
          },
        },
      );
    },
    { scope: ctaRef },
  );

  return (
    <section className={styles.ctaSection} ref={ctaRef}>
      {/* Premium Background Elements */}
      <div className={styles.orb1}></div>
      <div className={styles.orb2}></div>
      <div className={styles.gridOverlay}></div>

      <div className={`container ${styles.layout}`}>
        <div className={styles.glassCard} ref={cardRef}>
          {/* Decorative glass shine sweeping across the card */}
          <div className={styles.shine}></div>

          <div className={styles.content}>
            <motion.div
              className={styles.badge}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <FiZap className={styles.badgeIcon} /> Unleash the Power of L2
            </motion.div>

            <h2 className={styles.title}>
              <TypeText
                text="Ready to Shape the Future of "
                delayOffset={0.6}
              />
              <br />
              <TypeText
                text="Digital Assets?"
                delayOffset={0.6 + 29 * 0.04}
                className="gradient-text"
              />
            </h2>

            <motion.p
              className={styles.subtitle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 2.2, ease: "easeOut" }}
            >
              Join thousands of creators, collectors, and investors building the
              next generation Web3 AI economy on CryptoMarket. Experience
              instant finality, zero gas, and bleeding-edge AI generation.
            </motion.p>

            <motion.div
              className={styles.buttonGroup}
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.8,
                delay: 2.5,
                type: "spring",
                stiffness: 100,
                damping: 12,
              }}
            >
              <Link to="/explore" className={styles.primaryBtn}>
                Launch App <FiArrowRight className={styles.icon} />
                <div className={styles.btnGlow}></div>
              </Link>
              <a
                href="https://discord.com"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.discordBtn}
              >
                Join Discord <FiMessageSquare className={styles.icon} />
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
