import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart } from "react-icons/fi";
import styles from "./NFTCard.module.css";
import { ethers } from "ethers";

const NFTCard = ({ item }) => {
  // `item` could be a Listing or an Auction. It contains `.nft` with the metadata.
  const isAuction = item?.auctionId !== undefined;
  const isMock = Boolean(item?._mock);
  const idPath = isMock
    ? null
    : isAuction
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

  const actionLabel = isMock
    ? "Demo Only"
    : isAuction
      ? "Place Bid"
      : "Buy Now";

  // IPFS formatting for image
  const imageUrl = nft?.image
    ? nft.image.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
    : "https://via.placeholder.com/400x400?text=No+Image";

  // Wrapper component: real items get Link, mock items get a non-navigating div
  const Wrapper = ({ children, className }) =>
    idPath ? (
      <Link to={idPath} className={className}>
        {children}
      </Link>
    ) : (
      <div className={className} style={{ cursor: "default" }}>
        {children}
      </div>
    );

  return (
    <motion.div
      className={`glass-panel ${styles.nftCard}`}
      initial={{ opacity: 0, scale: 0.95 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: "0px 0px -50px 0px" }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -8 }}
    >
      <Wrapper className={styles.imageWrapper}>
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
      </Wrapper>

      <div className={styles.cardInfo}>
        <div className={styles.headerRow}>
          <Wrapper className={styles.nameLink}>
            <h4 className={styles.nftName}>
              {nft?.name || `Token #${item?.tokenId}`}
            </h4>
          </Wrapper>
        </div>

        <div className={styles.priceRow}>
          <div className={styles.priceColumn}>
            <span className={styles.priceLabel}>{priceLabel}</span>
            <span className={styles.priceValue}>{displayPrice} ETH</span>
          </div>
          {idPath ? (
            <Link to={idPath} className={`btn-primary ${styles.buyBtn}`}>
              {actionLabel}
            </Link>
          ) : (
            <span
              className={`btn-primary ${styles.buyBtn}`}
              style={{ opacity: 0.5, cursor: "default" }}
            >
              {actionLabel}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default NFTCard;
