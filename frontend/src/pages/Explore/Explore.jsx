import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";

const categories = [
  "All",
  "Art",
  "Collectibles",
  "Gaming",
  "Virtual Worlds",
  "Music",
];

// Realistic sample marketplace items to enrich the explore grid
const MOCK_ITEMS = [
  {
    _mock: true,
    auctionId: "m1",
    tokenId: "m1",
    startPrice: "500000000000000000",
    highestBid: "750000000000000000",
    endTime: new Date(Date.now() + 2 * 86400000).toISOString(),
    nft: {
      name: "Celestial Phoenix #12",
      category: "art",
      image:
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop",
      description: "A vibrant mythical phoenix rendered in neon glows.",
    },
  },
  {
    _mock: true,
    listingId: "m2",
    tokenId: "m2",
    price: "2300000000000000000",
    nft: {
      name: "Neon Samurai #88",
      category: "gaming",
      image:
        "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?q=80&w=800&auto=format&fit=crop",
      description: "A cyberpunk warrior forged in holographic light.",
    },
  },
  {
    _mock: true,
    auctionId: "m3",
    tokenId: "m3",
    startPrice: "1000000000000000000",
    highestBid: "0",
    endTime: new Date(Date.now() + 5 * 86400000).toISOString(),
    nft: {
      name: "Liquid Gold #07",
      category: "art",
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
      description: "Abstract digital gold in fluid motion.",
    },
  },
  {
    _mock: true,
    listingId: "m4",
    tokenId: "m4",
    price: "550000000000000000",
    nft: {
      name: "Cosmic Entity #01",
      category: "collectibles",
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=800&auto=format&fit=crop",
      description: "A rare celestial being from the outer cosmos.",
    },
  },
  {
    _mock: true,
    auctionId: "m5",
    tokenId: "m5",
    startPrice: "300000000000000000",
    highestBid: "450000000000000000",
    endTime: new Date(Date.now() + 18 * 3600000).toISOString(),
    nft: {
      name: "Virtual Land Parcel #45",
      category: "virtual-worlds",
      image:
        "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=800&auto=format&fit=crop",
      description: "Prime real estate in the expanding MetaVerse.",
    },
  },
  {
    _mock: true,
    listingId: "m6",
    tokenId: "m6",
    price: "400000000000000000",
    nft: {
      name: "Chromatic Symphony #09",
      category: "music",
      image:
        "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
      description: "Sound visualized as a living digital painting.",
    },
  },
  {
    _mock: true,
    listingId: "m7",
    tokenId: "m7",
    price: "8500000000000000000",
    nft: {
      name: "Bored Ape Yacht #101",
      category: "collectibles",
      image:
        "https://images.unsplash.com/photo-1621619856624-42fd193a0661?q=80&w=800&auto=format&fit=crop",
      description: "An exclusive ultra-rare collectible from the yacht club.",
    },
  },
  {
    _mock: true,
    auctionId: "m8",
    tokenId: "m8",
    startPrice: "2000000000000000000",
    highestBid: "2700000000000000000",
    endTime: new Date(Date.now() + 3 * 86400000).toISOString(),
    nft: {
      name: "Holographic Punk #04",
      category: "collectibles",
      image:
        "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?q=80&w=800&auto=format&fit=crop",
      description: "A legendary punk rendered in prismatic holograms.",
    },
  },
  {
    _mock: true,
    auctionId: "m9",
    tokenId: "m9",
    startPrice: "600000000000000000",
    highestBid: "0",
    endTime: new Date(Date.now() + 4 * 86400000).toISOString(),
    nft: {
      name: "Neural Dream #33",
      category: "art",
      image:
        "https://images.unsplash.com/photo-1551721434-8b94ddff0e6d?q=80&w=800&auto=format&fit=crop",
      description: "AI-generated art from the deepest layers of imagination.",
    },
  },
  {
    _mock: true,
    listingId: "m10",
    tokenId: "m10",
    price: "1200000000000000000",
    nft: {
      name: "Dragon Realm Sword #06",
      category: "gaming",
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=800&auto=format&fit=crop",
      description: "A legendary in-game weapon of ultimate power.",
    },
  },
];

const Explore = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchParam = searchParams.get("search") || "";

  const [activeCategory, setActiveCategory] = useState("All");
  const [viewMode, setViewMode] = useState("grid");
  const [allItems, setAllItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [semanticTokenIds, setSemanticTokenIds] = useState(null);
  const [semanticSearching, setSemanticSearching] = useState(false);

  const [localSearch, setLocalSearch] = useState(searchParam);

  useEffect(() => {
    setLocalSearch(searchParam);
    const fetchSemanticSearch = async () => {
      if (!searchParam) {
        setSemanticTokenIds(null);
        return;
      }
      try {
        setSemanticSearching(true);
        const res = await axios.get(
          `${API_BASE_URL}/nfts/search?q=${encodeURIComponent(searchParam)}`,
        );
        const tokenIds = res.data.data.map((nft) => String(nft.tokenId));
        setSemanticTokenIds(tokenIds);
      } catch (err) {
        console.error("Semantic search failed:", err);
        // Fallback to local search if API fails
        setSemanticTokenIds("fallback");
      } finally {
        setSemanticSearching(false);
      }
    };
    fetchSemanticSearch();
  }, [searchParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (localSearch.trim() !== "") {
      searchParams.set("search", localSearch.trim());
    } else {
      searchParams.delete("search");
    }
    setSearchParams(searchParams);
  };

  useEffect(() => {
    const fetchMarketplace = async () => {
      try {
        setLoading(true);
        // Fetch all active listings and running auctions
        const [listRes, aucRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/listings`),
          axios.get(`${API_BASE_URL}/auctions?ended=false`),
        ]);

        const rawListings = listRes.data.data || [];
        const rawAuctions = aucRes.data.data || [];

        // Combine and fetch full NFT data for everything
        const combined = [...rawListings, ...rawAuctions];
        const tokenIds = [...new Set(combined.map((item) => item.tokenId))];

        // Batch fetch NFT details
        const map = {};
        await Promise.all(
          tokenIds.map(async (id) => {
            try {
              const r = await axios.get(`${API_BASE_URL}/nfts/${id}`);
              map[id] = r.data.data;
            } catch {
              // Ignore failure for a single NFT
            }
          }),
        );

        // Attach NFT info to each marketplace item
        const hydratedItems = combined
          .map((item) => ({
            ...item,
            nft: map[item.tokenId],
          }))
          .filter((item) => item.nft) // Only keep items where we successfully fetched the NFT
          .sort((a, b) => {
            // Sort combined list newest first
            const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            return timeB - timeA;
          });

        // Merge real items first, padded with mock items
        setAllItems([...hydratedItems, ...MOCK_ITEMS]);
      } catch (error) {
        console.error("Failed to load marketplace:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMarketplace();
  }, []);

  // Filter Logic
  const filteredItems = useMemo(() => {
    let filtered = allItems;

    if (activeCategory !== "All") {
      filtered = filtered.filter((item) => {
        const cat = item.nft?.category || "other";
        return (
          cat.toLowerCase().replace(" ", "-") ===
          activeCategory.toLowerCase().replace(" ", "-")
        );
      });
    }

    if (searchParam) {
      if (Array.isArray(semanticTokenIds)) {
        // Semantic Search Filter + Sorting by Relevance
        const q = searchParam.toLowerCase();
        filtered = filtered
          .filter((item) => {
            if (item._mock) {
              const nftName = (item.nft?.name || "").toLowerCase();
              const nftDesc = (item.nft?.description || "").toLowerCase();
              return nftName.includes(q) || nftDesc.includes(q);
            }
            return semanticTokenIds.includes(String(item.tokenId));
          })
          .sort((a, b) => {
            // Sort real items by semantic index (lower index = higher relevance)
            const idxA = a._mock
              ? 999
              : semanticTokenIds.indexOf(String(a.tokenId));
            const idxB = b._mock
              ? 999
              : semanticTokenIds.indexOf(String(b.tokenId));
            return idxA - idxB;
          });
      } else if (semanticTokenIds === "fallback" || semanticTokenIds === null) {
        // Local Filter Fallback
        const q = searchParam.toLowerCase();
        filtered = filtered.filter((item) => {
          const nftName = (item.nft?.name || "").toLowerCase();
          const nftDesc = (item.nft?.description || "").toLowerCase();
          const seller = (item.seller || "").toLowerCase();

          return (
            nftName.includes(q) || nftDesc.includes(q) || seller.includes(q)
          );
        });
      }
    }

    return filtered;
  }, [allItems, activeCategory, searchParam, semanticTokenIds]);

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

          <form
            className={styles.searchBarWrapper}
            onSubmit={handleSearchSubmit}
          >
            <input
              type="text"
              placeholder="Search by name, collection, or creator..."
              className={styles.largeSearch}
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
            />
            <button type="submit" className="btn-primary">
              Search
            </button>
          </form>
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
          {loading || semanticSearching ? (
            <div className={styles.emptyState}>
              <h3 className="gradient-text">
                {semanticSearching
                  ? "Searching with AI Semantic Engine..."
                  : "Loading Marketplace..."}
              </h3>
              <p>
                {semanticSearching
                  ? "Our Gemini-powered vector search is analyzing your request..."
                  : "Fetching the latest listings and active auctions securely."}
              </p>
            </div>
          ) : (
            <>
              <div
                className={
                  viewMode === "grid" ? styles.nftGrid : styles.nftList
                }
              >
                {filteredItems.map((item) => {
                  // Generate an absolutely unique key since listingId and auctionId can overlap
                  const uniqKey =
                    item.auctionId !== undefined
                      ? `auc-${item.auctionId}`
                      : `list-${item.listingId}`;
                  return <NFTCard key={uniqKey} item={item} />;
                })}
              </div>

              {filteredItems.length === 0 && (
                <div className={styles.emptyState}>
                  <h3>No items found.</h3>
                  <p>Check back later or try a different filter.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Explore;
