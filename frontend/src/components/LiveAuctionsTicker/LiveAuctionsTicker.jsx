import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { FiClock } from "react-icons/fi";
import styles from "./LiveAuctionsTicker.module.css";

const mockAuctions = [
  {
    id: 101,
    name: "Cyber Genesis #01",
    bid: "2.4 ETH",
    time: "02:14:30",
    image:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=200&h=200&fit=crop",
  },
  {
    id: 102,
    name: "Neon Samurai #88",
    bid: "1.8 ETH",
    time: "05:42:10",
    image:
      "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?w=200&h=200&fit=crop",
  },
  {
    id: 103,
    name: "Abstract Mind #12",
    bid: "0.5 ETH",
    time: "12:05:00",
    image:
      "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?w=200&h=200&fit=crop",
  },
  {
    id: 104,
    name: "Virtual Plot X",
    bid: "4.2 ETH",
    time: "01:10:45",
    image:
      "https://images.unsplash.com/photo-1614728263952-84ea256f9679?w=200&h=200&fit=crop",
  },
  {
    id: 105,
    name: "Cosmic Entity",
    bid: "11.0 ETH",
    time: "00:45:12",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop",
  },
];

const LiveAuctionsTicker = () => {
  return (
    <section className={styles.tickerSection}>
      <div className="container">
        <div className={styles.header}>
          <h2>
            <span className="gradient-text">Live</span> Auctions
          </h2>
          <div className={styles.pulseIndicator}>
            <div className={styles.pulseDot}></div> Live Now
          </div>
        </div>
      </div>

      <div className={styles.tickerWrapper}>
        <motion.div
          className={styles.tickerTrack}
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 25, repeat: Infinity }}
        >
          {/* Double the array for seamless infinite scrolling */}
          {[...mockAuctions, ...mockAuctions].map((auction, index) => (
            <Link
              to={`/nfts/${auction.id}`}
              key={`${auction.id}-${index}`}
              className={`glass-panel ${styles.auctionCard}`}
            >
              <img
                src={auction.image}
                alt={auction.name}
                className={styles.auctionImage}
              />
              <div className={styles.auctionInfo}>
                <h4>{auction.name}</h4>
                <div className={styles.bidRow}>
                  <span className={styles.bidValue}>{auction.bid}</span>
                  <span className={styles.timeTag}>
                    <FiClock /> {auction.time}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default LiveAuctionsTicker;
