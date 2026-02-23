import React from "react";
import { motion } from "framer-motion";
import { FiLink, FiCpu, FiTag, FiDollarSign } from "react-icons/fi";
import styles from "./HowItWorksTimeline.module.css";

const timelineSteps = [
  {
    icon: <FiLink />,
    title: "Connect Web3 Wallet",
    desc: "Link your MetaMask or WalletConnect. Your identity remains entirely decentralized.",
    color: "#3B82F6", // Blue
  },
  {
    icon: <FiCpu />,
    title: "Upload or Generate",
    desc: "Upload standard files, or use our Neural Engine to freely generate art from pure text.",
    color: "#10B981", // Green
  },
  {
    icon: <FiTag />,
    title: "Deploy to Base Sepolia",
    desc: "Set Royalties and deploy. Media is permanently pinned to the interplanetary file system (IPFS).",
    color: "#8B5CF6", // Purple
  },
  {
    icon: <FiDollarSign />,
    title: "List for Sale",
    desc: "Launch a timed Auction to drive up hype, or set a Fixed Price using AI Value Estimation.",
    color: "#F59E0B", // Orange
  },
];

const HowItWorksTimeline = () => {
  return (
    <section className={styles.timelineSection}>
      <div className="container">
        <div className={styles.sectionHeader}>
          <h2>
            Minting <span className="gradient-text">Made Simple</span>
          </h2>
          <p>
            We've abstracted away all the complex blockchain friction. Here is
            how easy it is to start earning.
          </p>
        </div>

        <div className={styles.timelineContainer}>
          {/* Central Line */}
          <div className={styles.line}></div>

          <div className={styles.timelineGrid}>
            {timelineSteps.map((step, index) => {
              // Scatter cards like flies: left/right alternating, random Y, random rotation
              const isEven = index % 2 === 0;
              const dir = isEven ? -1 : 1;
              const scatterX = dir * (200 + Math.random() * 100);
              const scatterY = (Math.random() - 0.5) * 300;
              const scatterRotate = (Math.random() - 0.5) * 90;

              // Waypoints to simulate fast buzzing flies before settling
              const p1X = scatterX + dir * 50;
              const p1Y = scatterY + (Math.random() - 0.5) * 200;
              const r1 = scatterRotate + (Math.random() - 0.5) * 120;

              const p2X = scatterX * 0.3 + (Math.random() - 0.5) * 150;
              const p2Y = scatterY * 0.3 + (Math.random() - 0.5) * 150;
              const r2 = scatterRotate * 0.5 + (Math.random() - 0.5) * 60;

              const p3X = (Math.random() - 0.5) * 50;
              const p3Y = (Math.random() - 0.5) * 50;
              const r3 = (Math.random() - 0.5) * 20;

              return (
                <motion.div
                  key={index}
                  className={styles.stepCardWrap}
                  initial={{
                    opacity: 0,
                    x: scatterX,
                    y: scatterY,
                    rotate: scatterRotate,
                    scale: 0.2,
                  }}
                  whileInView={{
                    opacity: [0, 1, 1, 1, 1],
                    x: [scatterX, p1X, p2X, p3X, 0],
                    y: [scatterY, p1Y, p2Y, p3Y, 0],
                    rotate: [scatterRotate, r1, r2, r3, 0],
                    scale: [0.2, 0.5, 0.8, 1.1, 1],
                  }}
                  viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                  transition={{
                    duration: 1.5,
                    delay: index * 0.15,
                    ease: "easeInOut",
                    times: [0, 0.2, 0.5, 0.8, 1],
                  }}
                >
                  <div className={`glass-panel ${styles.stepCard}`}>
                    <div
                      className={styles.iconBox}
                      style={{
                        color: step.color,
                        background: `${step.color}15`,
                      }}
                    >
                      {step.icon}
                    </div>
                    <h3>{step.title}</h3>
                    <p>{step.desc}</p>

                    {/* Step Number Badge */}
                    <div className={styles.stepNumber}>0{index + 1}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksTimeline;
