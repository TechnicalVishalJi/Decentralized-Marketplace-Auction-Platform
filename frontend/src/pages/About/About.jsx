import React from "react";

const About = () => {
  return (
    <div
      className="page-transition-enter-active"
      style={{ paddingTop: "120px", minHeight: "80vh" }}
    >
      <div className="container">
        <h1 style={{ fontSize: "3rem", marginBottom: "24px" }}>
          About <span className="gradient-text">CryptoMarket</span>
        </h1>
        <div
          className="glass-panel"
          style={{
            padding: "40px",
            maxWidth: "800px",
            lineHeight: "1.8",
            color: "var(--color-text-secondary)",
          }}
        >
          <p style={{ marginBottom: "20px" }}>
            CryptoMarket is a decentralized NFT ecosystem designed specifically
            for creators and power-collectors. We merge the security and
            transparency of the Base Sepolia blockchain with the seamless
            user-experience of modern Web2 platforms.
          </p>
          <p>
            Whether you're generating native art with our integrated AI, running
            English Auctions for your 1/1 masterpieces, or casually collecting
            trending digital assets—CryptoMarket ensures your transactions are
            fast, gas-efficient, and secure.
          </p>
        </div>
      </div>
    </div>
  );
};

export default About;
