import React from "react";
import { FiActivity, FiShoppingCart, FiEdit3, FiHeart } from "react-icons/fi";
import styles from "./ActivityFeed.module.css";

const mockActivities = [
  {
    id: 1,
    type: "purchase",
    user: "0x71C...9A23",
    action: "bought",
    item: "Abstract Genesis #01",
    value: "4.5 ETH",
    time: "2 mins ago",
    icon: <FiShoppingCart />,
  },
  {
    id: 2,
    type: "mint",
    user: "AuraStudios",
    action: "minted",
    item: "Cyber Samurai #88",
    value: "-",
    time: "15 mins ago",
    icon: <FiEdit3 />,
  },
  {
    id: 3,
    type: "bid",
    user: "CryptoKing",
    action: "bid",
    item: "Ethereal Dreams #04",
    value: "2.6 ETH",
    time: "1 hour ago",
    icon: <FiActivity />,
  },
  {
    id: 4,
    type: "like",
    user: "0x44B...1F89",
    action: "favorited",
    item: "Virtual Land Plot",
    value: "-",
    time: "2 hours ago",
    icon: <FiHeart />,
  },
];

const ActivityFeed = () => {
  return (
    <div className={`glass-panel ${styles.feedContainer}`}>
      <div className={styles.feedHeader}>
        <h3>
          <FiActivity className={styles.headerIcon} /> Recent Activity
        </h3>
        <span className={styles.livePulse}>Live</span>
      </div>

      <div className={styles.feedList}>
        {mockActivities.map((activity) => (
          <div key={activity.id} className={styles.feedItem}>
            <div className={`${styles.iconWrapper} ${styles[activity.type]}`}>
              {activity.icon}
            </div>

            <div className={styles.feedContent}>
              <p className={styles.feedText}>
                <span className={styles.user}>{activity.user}</span>{" "}
                {activity.action}{" "}
                <span className={styles.item}>{activity.item}</span>
              </p>
              <div className={styles.feedMeta}>
                <span className={styles.time}>{activity.time}</span>
                {activity.value !== "-" && (
                  <span className={styles.value}>{activity.value}</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <button
        className={`btn-primary ${styles.viewAllBtn}`}
        style={{
          background: "transparent",
          color: "var(--color-text-secondary)",
          boxShadow: "none",
        }}
      >
        View All Activity
      </button>
    </div>
  );
};

export default ActivityFeed;
