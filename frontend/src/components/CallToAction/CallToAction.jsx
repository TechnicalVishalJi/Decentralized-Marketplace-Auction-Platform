import React, { useRef } from "react";
import { FiArrowRight, FiMessageSquare, FiZap } from "react-icons/fi";
import styles from "./CallToAction.module.css";
import { Link } from "react-router-dom";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger, useGSAP);

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
            <div className={styles.badge}>
              <FiZap className={styles.badgeIcon} /> Unleash the Power of L2
            </div>
            <h2 className={styles.title}>
              Ready to Shape the Future of <br />
              <span className="gradient-text">Digital Assets?</span>
            </h2>
            <p className={styles.subtitle}>
              Join thousands of creators, collectors, and investors building the
              next generation Web3 AI economy on CryptoMarket. Experience
              instant finality, zero gas, and bleeding-edge AI generation.
            </p>
            <div className={styles.buttonGroup}>
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
