import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import styles from "./NFTCard.module.css";
import { ethers } from "ethers";

const NFTCard = ({ item }) => {
  // `item` could be a Listing or an Auction. It contains `.nft` with the metadata.
  const isAuction = item?.auctionId !== undefined;
  const idPath = isAuction
    ? `/auction/${item.auctionId}`
    : `/listing/${item.listingId}`;
  const nft = item?.nft || item;

  // Formatting price/bid
  const displayPrice = isAuction
    ? item.highestBid !== "0"
      ? ethers.formatEther(item.highestBid)
      : ethers.formatEther(item.startPrice)
    : item?.price
      ? ethers.formatEther(item.price)
      : "0";

  const priceLabel = isAuction
    ? item.highestBid !== "0"
      ? "Top Bid"
      : "Starting Bid"
    : "Price";

  const actionLabel = isAuction ? "Place Bid" : "Buy Now";

  // IPFS formatting for image
  const imageUrl = nft?.image
    ? nft.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
    : "https://via.placeholder.com/400x400?text=No+Image";

  return (
    <motion.div
      className={`glass-panel ${styles.nftCard}`}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
    >
      <Link to={idPath} className={styles.imageWrapper}>
        <img src={imageUrl} alt={nft?.name || "NFT"} loading="lazy" />
        <button
          className={styles.likeBtn}
          onClick={(e) => {
            e.preventDefault();
            console.log("Like", nft?.tokenId);
          }}
        >
          <FiHeart />
        </button>
      </Link>

      <div className={styles.cardInfo}>
        <div className={styles.headerRow}>
          <Link to={idPath} className={styles.nameLink}>
            <h4 className={styles.nftName}>
              {nft?.name || `Token #${item?.tokenId}`}
            </h4>
          </Link>
        </div>

        <div className={styles.priceRow}>
          <div className={styles.priceColumn}>
            <span className={styles.priceLabel}>{priceLabel}</span>
            <span className={styles.priceValue}>{displayPrice} ETH</span>
          </div>
          <Link to={idPath} className={`btn-primary ${styles.buyBtn}`}>
            {actionLabel}
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default NFTCard;
