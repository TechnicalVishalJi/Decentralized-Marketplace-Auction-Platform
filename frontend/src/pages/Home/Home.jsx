import React, { useState, useEffect } from "react";
import HeroSection from "../../components/HeroSection/HeroSection";
import NFTCard from "../../components/NFTCard/NFTCard";
import LiveAuctionsTicker from "../../components/LiveAuctionsTicker/LiveAuctionsTicker";
import AIShowcase from "../../components/AIShowcase/AIShowcase";
import FeatureShowcase3D from "../../components/FeatureShowcase3D/FeatureShowcase3D";
import HowItWorksTimeline from "../../components/HowItWorksTimeline/HowItWorksTimeline";
import CallToAction from "../../components/CallToAction/CallToAction";
import styles from "./Home.module.css";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import axios from "axios";
import { API_BASE_URL } from "../../utils/constants";

// 6 sample auctions always shown to keep the carousel lively
const MOCK_TRENDING_AUCTIONS = [
  {
    _mock: true,
    auctionId: "h1",
    tokenId: "h1",
    startPrice: "800000000000000000",
    highestBid: "1200000000000000000",
    endTime: new Date(Date.now() + 1 * 86400000).toISOString(),
    nft: {
      name: "Celestial Phoenix #12",
      category: "art",
      image:
        "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    _mock: true,
    auctionId: "h2",
    tokenId: "h2",
    startPrice: "500000000000000000",
    highestBid: "0",
    endTime: new Date(Date.now() + 3 * 86400000).toISOString(),
    nft: {
      name: "Neon Samurai #88",
      category: "gaming",
      image:
        "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    _mock: true,
    auctionId: "h3",
    tokenId: "h3",
    startPrice: "2000000000000000000",
    highestBid: "2500000000000000000",
    endTime: new Date(Date.now() + 2 * 86400000).toISOString(),
    nft: {
      name: "Holographic Punk #04",
      category: "collectibles",
      image:
        "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    _mock: true,
    auctionId: "h4",
    tokenId: "h4",
    startPrice: "300000000000000000",
    highestBid: "470000000000000000",
    endTime: new Date(Date.now() + 18 * 3600000).toISOString(),
    nft: {
      name: "Virtual Land Parcel #45",
      category: "virtual-worlds",
      image:
        "https://images.unsplash.com/photo-1614728263952-84ea256f9679?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    _mock: true,
    auctionId: "h5",
    tokenId: "h5",
    startPrice: "600000000000000000",
    highestBid: "890000000000000000",
    endTime: new Date(Date.now() + 4 * 86400000).toISOString(),
    nft: {
      name: "Neural Dream #33",
      category: "art",
      image:
        "https://images.unsplash.com/photo-1551721434-8b94ddff0e6d?q=80&w=800&auto=format&fit=crop",
    },
  },
  {
    _mock: true,
    auctionId: "h6",
    tokenId: "h6",
    startPrice: "1000000000000000000",
    highestBid: "0",
    endTime: new Date(Date.now() + 5 * 86400000).toISOString(),
    nft: {
      name: "Liquid Gold #07",
      category: "art",
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=800&auto=format&fit=crop",
    },
  },
];

const Home = () => {
  const [trendingAuctions, setTrendingAuctions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        // Fetch up to 6 running auctions
        const aucRes = await axios.get(
          `${API_BASE_URL}/auctions?ended=false&limit=6`,
        );
        const rawAuctions = aucRes.data.data || [];

        // Batch fetch their NFT details
        const tokenIds = [...new Set(rawAuctions.map((a) => a.tokenId))];
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

        // Attach NFT info to each auction
        const hydratedAuctions = rawAuctions
          .map((auc) => ({
            ...auc,
            nft: map[auc.tokenId],
          }))
          .filter((auc) => auc.nft);

        // Pad with mock auctions so the carousel is always lively
        const needed = Math.max(0, 6 - hydratedAuctions.length);
        setTrendingAuctions([
          ...hydratedAuctions,
          ...MOCK_TRENDING_AUCTIONS.slice(0, needed),
        ]);
      } catch (error) {
        console.error("Failed to load trending auctions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
  }, []);

  return (
    <div className="page-transition-enter-active">
      <HeroSection />

      <LiveAuctionsTicker />

      <section className={styles.trendingSection}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>
              Trending <span className="gradient-text">Auctions</span>
            </h2>
            <button
              className="btn-primary"
              style={{
                background: "var(--color-bg-secondary)",
                color: "var(--color-text-primary)",
              }}
            >
              View All
            </button>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p className="gradient-text">Loading Trending Auctions...</p>
            </div>
          ) : trendingAuctions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p style={{ color: "var(--color-text-secondary)" }}>
                No active auctions to show right now.
              </p>
            </div>
          ) : (
            <Swiper
              modules={[Autoplay]}
              spaceBetween={32}
              slidesPerView={1}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              centeredSlides={true}
              loop={trendingAuctions.length > 3}
              speed={800}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              className={styles.carouselSwiper}
            >
              {trendingAuctions.map((auction) => (
                <SwiperSlide
                  key={`auc-${auction.auctionId}`}
                  className={styles.carouselSlide}
                >
                  <NFTCard item={auction} />
                </SwiperSlide>
              ))}
            </Swiper>
          )}
        </div>
      </section>

      <AIShowcase />

      <FeatureShowcase3D />

      <HowItWorksTimeline />

      <CallToAction />
    </div>
  );
};

export default Home;
