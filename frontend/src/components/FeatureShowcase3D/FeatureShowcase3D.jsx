import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import {
  FiDatabase,
  FiLock,
  FiCpu,
  FiEye,
  FiMessageSquare,
  FiTrendingUp,
} from "react-icons/fi";
import styles from "./FeatureShowcase3D.module.css";

gsap.registerPlugin(useGSAP);

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
  const containerRef = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray("." + styles.card3d);

      const masterTl = gsap.timeline({ repeat: -1 });

      cards.forEach((card, i) => {
        const tl = gsap.timeline();

        // 1. Enter: Fast zoom-in from right while spinning exactly 5 full times (0 to 1800 deg).
        // Using fromTo guarantees precise starting states. Starting at rotateY: 0 (front-facing) to 1800 (also front-facing).
        tl.fromTo(
          card,
          { x: "100%", z: -500, opacity: 0, rotateY: 0, scale: 0.5 },
          {
            x: "0%",
            z: "0",
            opacity: 1,
            rotateY: 1110, // Exactly 5 full spins
            scale: 0.95, // scale slightly down
            duration: 2.5,
            ease: "power4.out", // smooth deceleration curve
          },
        );

        // 2. Showcase Mode: Continuous float slightly left and explicit rotation drift.
        // Easing changed to sine.inOut to smoothly accelerate out of the complete stop, and decelerate into the exit phase.
        tl.to(card, {
          rotateY: 1050,
          x: "0",
          scale: 1,
          duration: 2.5,
          ease: "power4.inOut",
        });

        // 3. Exit: Spin out very fast and shoot backward into the left (behind the text)
        tl.to(card, {
          rotateY: 1980, // Half turn on exit
          x: "-150%", // Shoot far left
          z: -300,
          opacity: 0,
          scale: 0.6,
          duration: 1.2,
          ease: "power3.in",
        });

        // Overlap the entrance of the NEXT card with the exit of the CURRENT card by 0.6 seconds for seamless flow
        masterTl.add(tl, i === 0 ? 0 : "-=0.0");
      });
    },
    { scope: containerRef },
  );

  return (
    <section className={styles.showcaseSection} ref={containerRef}>
      {/* Absolute Glass Sidebar masking the exit path of the cards seamlessly */}
      <div className={styles.glassBackdrop}></div>

      <div className={`container ${styles.layout}`}>
        {/* Left Side: Text Content overlays the glass safe zone */}
        <div className={styles.textContent}>
          <div className={styles.badge}>Live Ecosystem</div>
          <h2 className={styles.title}>
            Powered by Next-Gen <br />
            <span className="gradient-text">Web3 Technology</span>
          </h2>
          <p className={styles.subtitle}>
            This isn't just a UI wrapper. CryptoMarket is a fully functional
            decentralized application built to showcase the integration of
            hyper-fast L2 blockchain transactions with intelligent AI
            microservices.
          </p>
        </div>

        {/* Right Side: 3D Scene */}
        <div className={styles.scene3d}>
          <div className={styles.orb1}></div>
          <div className={styles.orb2}></div>

          {/* 3D Carousel Perspective constraints */}
          <div className={styles.carouselContainer}>
            {features.map((feature) => (
              <div key={feature.id} className={styles.card3d}>
                {/* PREVENT MIRRORED TEXT: Independent Front Face */}
                <div className={styles.cardFront}>
                  <div className={styles.cardIconBox}>{feature.icon}</div>
                  <h3>{feature.title}</h3>
                  <p>{feature.desc}</p>
                </div>

                {/* Clean Glass Back Face */}
                <div className={styles.cardBack}>
                  <div className={styles.backplateLogo}>CM</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeatureShowcase3D;
