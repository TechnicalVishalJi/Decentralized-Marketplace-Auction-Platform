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
    desc: "Upload standard files, or use our Neural Engine to freely generate 4k art from pure text.",
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
    desc: "Launch a timed English Auction to drive up hype, or set a Fixed Price using AI Value Estimation.",
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
            {timelineSteps.map((step, index) => (
              <motion.div
                key={index}
                className={styles.stepCardWrap}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px 0px -100px 0px" }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
              >
                <div className={`glass-panel ${styles.stepCard}`}>
                  <div
                    className={styles.iconBox}
                    style={{ color: step.color, background: `${step.color}15` }}
                  >
                    {step.icon}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>

                  {/* Step Number Badge */}
                  <div className={styles.stepNumber}>0{index + 1}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksTimeline;
