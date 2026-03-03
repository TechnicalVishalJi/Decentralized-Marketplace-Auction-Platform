import React, { useState, useEffect } from "react";
import {
  FiUploadCloud,
  FiCpu,
  FiImage,
  FiSettings,
  FiCheckCircle,
  FiAlertTriangle,
} from "react-icons/fi";
import { ethers } from "ethers";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { API_BASE_URL, NFT_CONTRACT_ADDRESS } from "../../utils/constants";
import NFT_ABI from "../../contracts/NFT.json";
// Using the styles from the beautiful standalone Create page
import styles from "../Create/Create.module.css";
// For dashboard-wide tab consistency
import dashboardStyles from "./Dashboard.module.css";

const DashboardCreate = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' or 'generate'

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "art",
  });

  const [aiPrompt, setAiPrompt] = useState("");
  const [generating, setGenerating] = useState(false);

  const [imageFile, setImageFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [status, setStatus] = useState("idle"); // idle, uploading-img, uploading-meta, minting, success
  const [error, setError] = useState("");
  const [mintedTokenId, setMintedTokenId] = useState(null);
  const [mintingFee, setMintingFee] = useState(null);

  useEffect(() => {
    const fetchFee = async () => {
      try {
        if (!window.ethereum) return;
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          NFT_CONTRACT_ADDRESS,
          NFT_ABI.abi,
          provider,
        );
        const fee = await contract.mintingFee();
        setMintingFee(ethers.formatEther(fee));
      } catch (err) {
        console.error("Error fetching minting fee:", err);
      }
    };
    fetchFee();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const handleGenerateAI = async (e) => {
    e.preventDefault();
    if (!aiPrompt) return;

    try {
      setGenerating(true);
      setError("");

      const config = {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      };

      // 1. Request AI generation from backend
      const res = await axios.post(
        `${API_BASE_URL}/ai/generate`,
        { prompt: aiPrompt },
        config,
      );

      const { filename, downloadUrl } = res.data.data;

      // Ensure API_BASE_URL removes '/api/v1' or dynamically resolve backend host
      const backendHost = API_BASE_URL.replace("/api/v1", "");
      const fullImageUrl = `${backendHost}${downloadUrl}`;

      // 2. Fetch the actual image blob
      const imageRes = await axios.get(fullImageUrl, { responseType: "blob" });
      const blob = imageRes.data;

      // 3. Convert Blob to File object for IPFS uploading inside `handleMint`
      const aiFile = new File([blob], filename, { type: blob.type });

      setImageFile(aiFile);
      setPreviewImage(URL.createObjectURL(aiFile));
    } catch (err) {
      console.error("AI Generation Error:", err);
      setError(
        err.response?.data?.error || err.message || "AI Generation failed",
      );
    } finally {
      setGenerating(false);
    }
  };

  const handleMint = async (e) => {
    e.preventDefault();
    if (!previewImage || !formData.name || !formData.description) {
      setError("Please provide an image, name, and description for your NFT.");
      return;
    }

    try {
      setError("");

      // Step 1: Upload Image to IPFS (If manual upload. If AI, we'd need to fetch blob)
      setStatus("uploading-img");
      let imageUrl = previewImage;

      if (imageFile) {
        const imgData = new FormData();
        imgData.append("image", imageFile);

        const imgConfig = {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        };
        const imgRes = await axios.post(
          `${API_BASE_URL}/nfts/upload/image`,
          imgData,
          imgConfig,
        );
        imageUrl = imgRes.data.data.hash;
      }

      // Step 2: Upload Metadata to IPFS
      setStatus("uploading-meta");
      const metaData = {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        attributes: [{ trait_type: "Category", value: formData.category }],
      };
      const jsonConfig = {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      };
      const metaRes = await axios.post(
        `${API_BASE_URL}/nfts/upload/metadata`,
        metaData,
        jsonConfig,
      );
      const tokenURI = metaRes.data.data.metadataURI;

      // Step 3: Mint to Blockchain
      setStatus("minting");
      if (!window.ethereum) throw new Error("MetaMask is required to mint.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();

      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_ABI.abi,
        signer,
      );

      // Fetch dynamic minting fee directly from contract state
      const fee = await nftContract.mintingFee();

      // Call the 'mint' function with the URI and the required payable value
      const tx = await nftContract.mint(tokenURI, { value: fee });
      const receipt = await tx.wait();

      // Look for Transfer event to get Token ID
      const event = receipt.logs.find((log) => {
        try {
          const parsed = nftContract.interface.parseLog(log);
          return parsed.name === "Transfer";
        } catch {
          return false;
        }
      });

      if (event) {
        const parsedEvent = nftContract.interface.parseLog(event);
        setMintedTokenId(parsedEvent.args[2].toString());
      }

      setStatus("success");
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.reason ||
          err.message ||
          "Failed to mint NFT",
      );
      setStatus("idle");
    }
  };

  if (status === "success") {
    return (
      <div
        className={dashboardStyles.tabContent}
        style={{ textAlign: "center", padding: "40px" }}
      >
        <FiCheckCircle
          size={64}
          style={{ color: "var(--color-success)", marginBottom: "20px" }}
        />
        <h3>Minting Successful!</h3>
        <p className={dashboardStyles.tabDescription}>
          Your new NFT has been successfully minted to your wallet.
          {mintedTokenId && <strong> Token ID: {mintedTokenId}</strong>}
        </p>
        <button
          className="btn-primary"
          onClick={() => {
            setStatus("idle");
            setImageFile(null);
            setPreviewImage(null);
            setFormData({ ...formData, name: "", description: "" });
          }}
        >
          Create Another
        </button>
      </div>
    );
  }

  return (
    <div className={dashboardStyles.tabContent} style={{ padding: 0 }}>
      {/* Re-using the beautiful UI logic from Create.jsx, stripping the hard outer page padding so it fits natively into the Dashboard */}
      <div className={styles.createLayout} style={{ marginTop: "10px" }}>
        {/* LEFT: Image Upload / Generate Area */}
        <div
          className={styles.mediaArea}
          style={{ top: 0, position: "relative" }}
        >
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
                    onClick={() => {
                      setPreviewImage(null);
                      setImageFile(null);
                    }}
                  >
                    Change Image
                  </button>
                </div>
              ) : (
                <label
                  className={styles.uploadState}
                  style={{ cursor: "pointer" }}
                >
                  <input
                    type="file"
                    style={{ display: "none" }}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                  <FiImage size={48} className={styles.placeholderIcon} />
                  <h3>Drag and drop media</h3>
                  <p>Supports JPG, PNG, GIF, WEBP. Max 10MB.</p>
                  <div className="btn-primary" style={{ marginTop: "20px" }}>
                    Browse Files
                  </div>
                </label>
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
                    <p>Describe the art you want to create in vivid detail.</p>

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
                      {generating ? "Generating Art..." : "Generate Art (Free)"}
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: Metadata Form */}
        <div className={styles.formArea}>
          {error && (
            <div
              className={dashboardStyles.errorMessage}
              style={{
                marginBottom: "20px",
                padding: "15px",
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                borderLeft: "4px solid #ef4444",
                borderRadius: "8px",
                color: "#ff6b6b",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "14px",
                fontWeight: "500",
              }}
            >
              <FiAlertTriangle size={20} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleMint} className={styles.mintForm}>
            <div className={styles.formGroup}>
              <label>NFT Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. 'Cyber Genesis #01'"
                value={formData.name}
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
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <div
              className={styles.rowGroup}
              style={{ gridTemplateColumns: "1fr" }}
            >
              <div className={styles.formGroup}>
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                >
                  <option value="art">Art</option>
                  <option value="collectibles">Collectibles</option>
                  <option value="music">Music</option>
                  <option value="photography">Photography</option>
                  <option value="sports">Sports</option>
                  <option value="utility">Utility</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className={styles.actionRow}>
              <button
                type="submit"
                className={`btn-primary ${styles.submitBtn}`}
                disabled={status !== "idle"}
              >
                <FiCheckCircle />
                {status === "idle" && mintingFee
                  ? `Create NFT (${mintingFee} ETH)`
                  : status === "idle"
                    ? "Create NFT"
                    : ""}
                {status === "uploading-img" && "Uploading to IPFS..."}
                {status === "uploading-meta" && "Finalizing Metadata..."}
                {status === "minting" && "Confirm Transaction in Wallet..."}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DashboardCreate;
