import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import styles from "./NFTCard.module.css";

const NFTCard = ({ nft }) => {
  return (
    <motion.div
      className={`glass-panel ${styles.nftCard}`}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
    >
      <Link to={`/nfts/${nft.id}`} className={styles.imageWrapper}>
        <img src={nft.image} alt={nft.name} loading="lazy" />
        <button
          className={styles.likeBtn}
          onClick={(e) => {
            e.preventDefault();
            console.log("Like", nft.id);
          }}
        >
          <FiHeart />
        </button>
      </Link>

      <div className={styles.cardInfo}>
        <div className={styles.headerRow}>
          <Link to={`/nfts/${nft.id}`} className={styles.nameLink}>
            <h4 className={styles.nftName}>{nft.name}</h4>
          </Link>
          <div className={styles.creatorBadge}>
            by <span className="gradient-text">{nft.creator}</span>
          </div>
        </div>

        <div className={styles.priceRow}>
          <div className={styles.priceColumn}>
            <span className={styles.priceLabel}>Price / Bid</span>
            <span className={styles.priceValue}>{nft.price} ETH</span>
          </div>
          <Link
            to={`/nfts/${nft.id}`}
            className={`btn-primary ${styles.buyBtn}`}
          >
            Buy Now
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default NFTCard;
