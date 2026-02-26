import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  FiMail,
  FiMapPin,
  FiPhone,
  FiTwitter,
  FiGithub,
  FiLinkedin,
  FiSend,
} from "react-icons/fi";
import styles from "./Contact.module.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTimeout(() => {
      setSubmitted(true);
      setFormData({ name: "", email: "", message: "" });
    }, 800);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
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
    <div className={`page-transition-enter-active ${styles.contactPage}`}>
      <div className="container">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          {/* Header */}
          <motion.div variants={childVariants} style={{ textAlign: "center" }}>
            <h1 className={styles.title}>
              Get in <span className="gradient-text">Touch</span>
            </h1>
            <p className={styles.subtitle}>
              Have questions about the smart contracts, AI integrations, or just
              want to say hi? Send a message and we'll get back to you securely.
            </p>
          </motion.div>

          {/* Layout Grid */}
          <motion.div variants={childVariants} className={styles.contactLayout}>
            {/* Left Info Column */}
            <div className={styles.infoSection}>
              <div className={styles.infoBlock}>
                <div className={styles.iconWrapper}>
                  <FiMapPin size={24} />
                </div>
                <div className={styles.infoDetails}>
                  <h3>Global Output</h3>
                  <p>
                    Operating entirely on-chain across the decentralized Base
                    Sepolia network.
                  </p>
                </div>
              </div>

              <div className={styles.infoBlock}>
                <div className={styles.iconWrapper}>
                  <FiMail size={24} />
                </div>
                <div className={styles.infoDetails}>
                  <h3>Email</h3>
                  <p>support@cryptomarket.local</p>
                </div>
              </div>

              <div className={styles.infoBlock}>
                <div className={styles.iconWrapper}>
                  <FiPhone size={24} />
                </div>
                <div className={styles.infoDetails}>
                  <h3>Phone</h3>
                  <p>+1 (555) 000-0000</p>
                </div>
              </div>

              <div>
                <h3 style={{ marginBottom: "1rem" }}>Connect With Us</h3>
                <div className={styles.socials}>
                  <a href="#" className={styles.socialBtn}>
                    <FiTwitter size={20} />
                  </a>
                  <a href="#" className={styles.socialBtn}>
                    <FiGithub size={20} />
                  </a>
                  <a href="#" className={styles.socialBtn}>
                    <FiLinkedin size={20} />
                  </a>
                </div>
              </div>
            </div>

            {/* Right Form Column */}
            <div className={styles.formContainer}>
              <h2>Send a Message</h2>
              <form onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    required
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    required
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    required
                    placeholder="Tell us what you're thinking about..."
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>
                <button
                  type="submit"
                  className={`btn-primary ${styles.submitBtn}`}
                >
                  <FiSend /> Send Message
                </button>
                {submitted && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={styles.successMessage}
                  >
                    Your message has been securely sent!
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact;
