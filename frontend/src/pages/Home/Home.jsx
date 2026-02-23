import React from "react";
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

// Mock Data for UI Designing Phase
const mockNFTs = [
  {
    id: 1,
    name: "Ethereal Dreams #04",
    creator: "AuraStudios",
    price: "2.5",
    image:
      "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2674&auto=format&fit=crop",
  },
  {
    id: 2,
    name: "Neon Samurai #88",
    creator: "CyberPunkLabs",
    price: "0.8",
    image:
      "https://images.unsplash.com/photo-1634986666676-ec8fd927c23d?q=80&w=2674&auto=format&fit=crop",
  },
  {
    id: 3,
    name: "Liquid Gold #12",
    creator: "Alchemist",
    price: "5.2",
    image:
      "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?q=80&w=2670&auto=format&fit=crop",
  },
  {
    id: 4,
    name: "Cosmic Entity #01",
    creator: "StarGazers",
    price: "1.1",
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
  },
];

const extendedMockNFTs = [
  ...mockNFTs,
  ...mockNFTs.map((nft) => ({ ...nft, id: nft.id + 4 })),
];

const Home = () => {
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

          <Swiper
            modules={[Autoplay]}
            spaceBetween={32}
            slidesPerView={1}
            breakpoints={{
              768: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            centeredSlides={true}
            loop={true}
            speed={800}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}
            className={styles.carouselSwiper}
          >
            {extendedMockNFTs.map((nft) => (
              <SwiperSlide key={nft.id} className={styles.carouselSlide}>
                <NFTCard nft={nft} />
              </SwiperSlide>
            ))}
          </Swiper>
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
