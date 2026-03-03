import React, { useState } from "react";
import {
  FiUploadCloud,
  FiCpu,
  FiImage,
  FiSettings,
  FiCheckCircle,
} from "react-icons/fi";
import styles from "./Create.module.css";

const Create = () => {
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' or 'generate'
  const [nftData, setNftData] = useState({
    name: "",
    description: "",
    price: "",
    category: "art",
    royalty: "5",
    listingType: "fixed", // 'fixed' or 'auction'
  });
  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNftData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateAI = (e) => {
    e.preventDefault();
    if (!aiPrompt) return;
    setGenerating(true);
    // Mock Generation Delay
    setTimeout(() => {
      setPreviewImage(
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop",
      );
      setGenerating(false);
    }, 2000);
  };

  const handleMint = (e) => {
    e.preventDefault();
    console.log("Minting NFT:", nftData, "Image:", previewImage);
    // Backend Integration happens here later
  };

  return (
    <div className={`page-transition-enter-active ${styles.createPage}`}>
      <div className="container">
        <div className={styles.header}>
          <h1 className={styles.title}>
            Create New <span className="gradient-text">NFT</span>
          </h1>
          <p className={styles.subtitle}>
            Mint your digital assets on Base Sepolia. Choose between uploading
            your own artwork or letting our decentralized AI generate it for
            you.
          </p>
        </div>

        <div className={styles.createLayout}>
          {/* LEFT: Image Upload / Generate Area */}
          <div className={styles.mediaArea}>
            <div className={styles.tabs}>
              <button
                className={`${styles.tabBtn} ${activeTab === "upload" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("upload")}
              >
                <FiUploadCloud /> Manual Upload
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === "generate" ? styles.activeTab : ""}`}
                onClick={() => setActiveTab("generate")}
              >
                <FiCpu /> AI Generator
              </button>
            </div>

            <div className={`glass-panel ${styles.mediaBox}`}>
              {activeTab === "upload" ? (
                previewImage ? (
                  <div className={styles.imagePreview}>
                    <img src={previewImage} alt="NFT Preview" />
                    <button
                      className={`btn-primary ${styles.clearImgBtn}`}
                      onClick={() => setPreviewImage(null)}
                    >
                      Change Image
                    </button>
                  </div>
                ) : (
                  <div className={styles.uploadState}>
                    <FiImage size={48} className={styles.placeholderIcon} />
                    <h3>Drag and drop media</h3>
                    <p>Supports JPG, PNG, GIF, WEBP. Max 10MB.</p>
                    <button
                      className="btn-primary"
                      style={{ marginTop: "20px" }}
                    >
                      Browse Files
                    </button>
                  </div>
                )
              ) : (
                <div className={styles.generatorState}>
                  {previewImage ? (
                    <div className={styles.imagePreview}>
                      <img src={previewImage} alt="AI Generated NFT" />
                      <div className={styles.generatorControls}>
                        <button
                          className={`btn-primary ${styles.clearImgBtn}`}
                          onClick={() => setPreviewImage(null)}
                        >
                          Discard
                        </button>
                        <button
                          className={`btn-primary ${styles.clearImgBtn}`}
                          style={{ background: "#10B981" }}
                        >
                          Keep Image
                        </button>
                      </div>
                    </div>
                  ) : (
                    <form onSubmit={handleGenerateAI} className={styles.aiForm}>
                      <FiCpu size={48} className={styles.placeholderIcon} />
                      <h3>AI Canvas Generator</h3>
                      <p>
                        Describe the art you want to create in vivid detail.
                      </p>

                      <textarea
                        className={styles.promptInput}
                        placeholder="E.g., A cyberpunk samurai standing in neon rain, 4k ultra realistic, cinematic lighting..."
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        rows="4"
                      />

                      <button
                        type="submit"
                        className={`btn-primary ${styles.generateBtn}`}
                        disabled={generating || !aiPrompt}
                      >
                        {generating
                          ? "Generating Art..."
                          : "Generate Art (Free)"}
                      </button>
                    </form>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Metadata Form */}
          <div className={styles.formArea}>
            <form onSubmit={handleMint} className={styles.mintForm}>
              <div className={styles.formGroup}>
                <label>NFT Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. 'Cyber Genesis #01'"
                  value={nftData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description *</label>
                <textarea
                  name="description"
                  placeholder="Provide a detailed description of your item..."
                  rows="4"
                  value={nftData.description}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className={styles.rowGroup}>
                <div className={styles.formGroup}>
                  <label>Category</label>
                  <select
                    name="category"
                    value={nftData.category}
                    onChange={handleInputChange}
                  >
                    <option value="art">Art</option>
                    <option value="collectibles">Collectibles</option>
                    <option value="gaming">Gaming</option>
                    <option value="music">Music</option>
                    <option value="virtual-worlds">Virtual Worlds</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>Royalties (%)</label>
                  <input
                    type="number"
                    name="royalty"
                    placeholder="e.g. 5"
                    min="0"
                    max="15"
                    value={nftData.royalty}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className={styles.listingSection}>
                <h3 className={styles.sectionTitle}>
                  <FiSettings /> Listing Details
                </h3>

                <div className={styles.radioGroup}>
                  <label
                    className={`${styles.radioCard} ${nftData.listingType === "fixed" ? styles.radioActive : ""}`}
                  >
                    <input
                      type="radio"
                      name="listingType"
                      value="fixed"
                      checked={nftData.listingType === "fixed"}
                      onChange={handleInputChange}
                    />
                    <div>
                      <strong>Fixed Price</strong>
                      <p>Sell at a specific set price.</p>
                    </div>
                  </label>

                  <label
                    className={`${styles.radioCard} ${nftData.listingType === "auction" ? styles.radioActive : ""}`}
                  >
                    <input
                      type="radio"
                      name="listingType"
                      value="auction"
                      checked={nftData.listingType === "auction"}
                      onChange={handleInputChange}
                    />
                    <div>
                      <strong>Timed Auction</strong>
                      <p>Sell to the highest bidder.</p>
                    </div>
                  </label>
                </div>

                <div className={styles.formGroup} style={{ marginTop: "20px" }}>
                  <label>
                    {nftData.listingType === "fixed"
                      ? "Price (ETH) *"
                      : "Starting Bid (ETH) *"}
                  </label>
                  <input
                    type="number"
                    name="price"
                    placeholder="e.g. 0.05"
                    step="0.001"
                    value={nftData.price}
                    onChange={handleInputChange}
                    required
                  />
                  {/* AI Price Estimator will inject here later! */}
                  <div className={styles.aiEstimationHint}>
                    <span className="gradient-text">
                      <FiCpu /> Let AI Estimate Value
                    </span>{" "}
                    (Available after image upload)
                  </div>
                </div>
              </div>

              <div className={styles.actionRow}>
                <button
                  type="submit"
                  className={`btn-primary ${styles.submitBtn}`}
                >
                  <FiCheckCircle /> Create NFT
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Create;
