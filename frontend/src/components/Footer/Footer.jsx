import React from "react";
import { Link } from "react-router-dom";
import { FiTwitter, FiInstagram, FiGithub, FiMail } from "react-icons/fi";
import styles from "./Footer.module.css";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerContent}`}>
        <div className={styles.brandSection}>
          <Link to="/" className={styles.logo}>
            <span className="gradient-text">Crypto</span>Market
          </Link>
          <p className={styles.tagline}>
            The premium decentralized marketplace for discovering, collecting,
            and trading extraordinary NFTs.
          </p>
          <div className={styles.socialLinks}>
            <a href="#" className={styles.socialIcon} aria-label="Twitter">
              <FiTwitter />
            </a>
            <a href="#" className={styles.socialIcon} aria-label="Instagram">
              <FiInstagram />
            </a>
            <a href="#" className={styles.socialIcon} aria-label="GitHub">
              <FiGithub />
            </a>
          </div>
        </div>

        <div className={styles.linksSection}>
          <div className={styles.linkGroup}>
            <h4>Marketplace</h4>
            <ul>
              <li>
                <Link to="/explore">Explore</Link>
              </li>
              <li>
                <Link to="/auctions">Live Auctions</Link>
              </li>
              <li>
                <Link to="/create">Mint NFT</Link>
              </li>
              <li>
                <Link to="/rankings">Top Creators</Link>
              </li>
            </ul>
          </div>

          <div className={styles.linkGroup}>
            <h4>Platform</h4>
            <ul>
              <li>
                <Link to="/about">About Us</Link>
              </li>
              <li>
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <a href="#">Terms of Service</a>
              </li>
              <li>
                <a href="#">Privacy Policy</a>
              </li>
            </ul>
          </div>

          <div className={styles.newsletterSection}>
            <h4>Stay in the loop</h4>
            <p>Get the latest updates on drops and platform features.</p>
            <form
              className={styles.newsletterForm}
              onSubmit={(e) => e.preventDefault()}
            >
              <input type="email" placeholder="Your email address" required />
              <button type="submit" className="btn-primary">
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className={styles.copyright}>
        <div className="container">
          <p>&copy; {currentYear} CryptoMarket. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
