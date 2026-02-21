import React, { useState } from "react";
import NFTCard from "../../components/NFTCard/NFTCard";
import styles from "./Explore.module.css";
import {
  FiFilter,
  FiTrendingUp,
  FiActivity,
  FiClock,
  FiGrid,
  FiList,
} from "react-icons/fi";

// Extended Mock Data for Explore Grid
const mockExploreNFTs = [
  {
    id: 1,
    name: "Ethereal Dreams #04",
    creator: "AuraStudios",
    price: "2.5",
    image:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2674&auto=format&fit=crop",
    category: "art",
  },
  {
    id: 2,
    name: "Neon Samurai #88",
    creator: "CyberPunkLabs",
    price: "0.8",
    image:
      "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?q=80&w=2674&auto=format&fit=crop",
    category: "gaming",
  },
  {
    id: 3,
    name: "Liquid Gold #12",
    creator: "Alchemist",
    price: "5.2",
    image:
      "https://images.unsplash.com/photo-1614812513172-567d2fe9cd91?q=80&w=2670&auto=format&fit=crop",
    category: "art",
  },
  {
    id: 4,
    name: "Cosmic Entity #01",
    creator: "StarGazers",
    price: "1.1",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
    category: "collectibles",
  },
  {
    id: 5,
    name: "Virtual Land Parcel #45",
    creator: "MetaWorlds",
    price: "12.0",
    image:
      "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=2669&auto=format&fit=crop",
    category: "virtual-worlds",
  },
  {
    id: 6,
    name: "Chromatic Symphony #09",
    creator: "SoundBeats",
    price: "0.4",
    image:
      "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2670&auto=format&fit=crop",
    category: "music",
  },
  {
    id: 7,
    name: "Bored Ape Yacht #101",
    creator: "YugaLabs",
    price: "85.5",
    image:
      "https://images.unsplash.com/photo-1621619856624-42fd193a0661?q=80&w=2658&auto=format&fit=crop",
    category: "collectibles",
  },
  {
    id: 8,
    name: "Holographic Punk #04",
    creator: "CryptoPunks",
    price: "45.0",
    image:
      "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?q=80&w=2697&auto=format&fit=crop",
    category: "collectibles",
  },
];

const categories = [
  "All",
  "Art",
  "Collectibles",
  "Gaming",
  "Virtual Worlds",
  "Music",
];

const Explore = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid");

  // Filter Logic
  const filteredNFTs =
    activeCategory === "All"
      ? mockExploreNFTs
      : mockExploreNFTs.filter(
          (nft) =>
            nft.category.toLowerCase().replace(" ", "-") ===
            activeCategory.toLowerCase().replace(" ", "-"),
        );

  return (
    <div className={`page-transition-enter-active ${styles.explorePage}`}>
      {/* HEADER SECTION */}
      <section className={styles.exploreHeader}>
        <div className="container">
          <h1 className={styles.title}>
            Explore <span className="gradient-text">Collections</span>
          </h1>
          <p className={styles.subtitle}>
            Discover the most outstanding and unique NFTs across all categories,
            minted on the Base network.
          </p>

          <div className={styles.searchBarWrapper}>
            <input
              type="text"
              placeholder="Search by name, collection, or creator via Semantic AI"
              className={styles.largeSearch}
            />
            <button className="btn-primary">Search</button>
          </div>
        </div>
      </section>

      {/* FILTER & GRID SECTION */}
      <section className={styles.exploreContent}>
        <div className="container">
          <div className={styles.filterControls}>
            {/* Category Pills */}
            <div className={styles.categories}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`${styles.categoryPill} ${activeCategory === cat ? styles.activeCategory : ""}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Quick Sorting */}
            <div className={styles.sortingArea}>
              <button className={styles.sortBtn}>
                <FiTrendingUp /> Trending
              </button>
              <button className={styles.sortBtn}>
                <FiClock /> Recently Added
              </button>
              <button className={styles.sortBtn}>
                <FiActivity /> Live Auctions
              </button>

              <div className={styles.viewToggles}>
                <button
                  className={`${styles.iconBtn} ${viewMode === "list" ? styles.activeIcon : ""}`}
                  onClick={() => setViewMode("list")}
                >
                  <FiList />
                </button>
                <button
                  className={`${styles.iconBtn} ${viewMode === "grid" ? styles.activeIcon : ""}`}
                  onClick={() => setViewMode("grid")}
                >
                  <FiGrid />
                </button>
              </div>
            </div>
          </div>

          {/* Main Grid Render */}
          <div
            className={viewMode === "grid" ? styles.nftGrid : styles.nftList}
          >
            {filteredNFTs.map((nft) => (
              <NFTCard key={nft.id} nft={nft} />
            ))}
          </div>

          {filteredNFTs.length === 0 && (
            <div className={styles.emptyState}>
              <h3>No NFTs found in this category.</h3>
              <p>Check back later or try a different filter.</p>
            </div>
          )}

          <div className={styles.loadMoreContainer}>
            <button
              className="glass-panel"
              style={{ padding: "12px 32px", fontWeight: "bold" }}
            >
              Load More
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Explore;
