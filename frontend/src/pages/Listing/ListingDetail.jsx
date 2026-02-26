import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  FiArrowLeft,
  FiUser,
  FiDollarSign,
  FiAlertTriangle,
  FiCheck,
  FiImage,
} from "react-icons/fi";
import { ethers } from "ethers";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  API_BASE_URL,
  NFT_CONTRACT_ADDRESS,
  MARKETPLACE_CONTRACT_ADDRESS,
} from "../../utils/constants";
import MARKETPLACE_ABI from "../../contracts/Marketplace.json";

const ipfsToHttp = (uri) =>
  uri?.startsWith("ipfs://")
    ? uri.replace("ipfs://", "https://gateway.pinata.cloud/ipfs/")
    : uri || "";
const formatEth = (wei) => {
  try {
    return parseFloat(ethers.formatEther(wei)).toFixed(4);
  } catch {
    return "0";
  }
};

const ListingDetail = () => {
  const { listingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [txStatus, setTxStatus] = useState("idle");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE_URL}/listings/${listingId}`);
        setListing(res.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [listingId]);

  const handleBuy = async () => {
    try {
      setError("");
      setSuccessMsg("");
      setTxStatus("buying");
      if (!window.ethereum) throw new Error("MetaMask is required.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        MARKETPLACE_CONTRACT_ADDRESS,
        MARKETPLACE_ABI.abi,
        signer,
      );
      const tx = await contract.buyNFT(listing.listingId, false, {
        value: listing.price,
      });
      await tx.wait();
      setSuccessMsg("🎉 Purchase successful! NFT is now yours.");
      setTxStatus("idle");
      setTimeout(() => window.location.reload(), 4000);
    } catch (err) {
      setError(err.reason || err.message || "Purchase failed.");
      setTxStatus("idle");
    }
  };

  const handleCancel = async () => {
    try {
      setError("");
      setTxStatus("cancelling");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        MARKETPLACE_CONTRACT_ADDRESS,
        MARKETPLACE_ABI.abi,
        signer,
      );
      const tx = await contract.cancelListing(listing.listingId);
      await tx.wait();
      setSuccessMsg("✅ Listing cancelled. NFT returned to your wallet.");
      setTxStatus("idle");
      setTimeout(() => navigate("/dashboard"), 3000);
    } catch (err) {
      setError(err.reason || err.message || "Cancel failed.");
      setTxStatus("idle");
    }
  };

  if (loading)
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <p style={{ color: "var(--color-text-secondary)" }}>Loading listing…</p>
      </div>
    );

  if (!listing)
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <p>Listing #{listingId} not found.</p>
          <button
            className="btn-secondary"
            onClick={() => navigate(-1)}
            style={{ marginTop: 12 }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );

  const nft = listing.nft;
  const isSeller = user?.walletAddress?.toLowerCase() === listing.seller;
  const isBuyer = !isSeller && listing.active;

  return (
    <div
      style={{
        paddingTop: 100,
        paddingBottom: 60,
        minHeight: "100vh",
        background: "var(--color-bg-primary)",
      }}
    >
      <div className="container" style={{ maxWidth: 1100 }}>
        <button
          className="btn-secondary"
          onClick={() => navigate(-1)}
          style={{
            marginBottom: 24,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <FiArrowLeft /> Back
        </button>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 360px",
            gap: 32,
            alignItems: "start",
          }}
        >
          {/* Image */}
          <div
            className="glass-panel"
            style={{
              overflow: "hidden",
              borderRadius: "var(--radius-lg)",
              aspectRatio: "1/1",
            }}
          >
            {nft?.image ? (
              <img
                src={ipfsToHttp(nft.image)}
                alt={nft?.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiImage size={64} color="var(--color-text-secondary)" />
              </div>
            )}
          </div>

          {/* Details */}
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 14px",
                  borderRadius: 20,
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  background: listing.active
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(107,114,128,0.12)",
                  color: listing.active ? "var(--color-success)" : "#9ca3af",
                }}
              >
                {listing.active
                  ? "🟢 Active"
                  : listing.buyer
                    ? "✅ Sold"
                    : "❌ Cancelled"}
              </span>
            </div>

            <h2 style={{ margin: 0, fontSize: "1.8rem" }}>
              {nft?.name || `NFT #${listing.tokenId}`}
            </h2>
            {nft?.description && (
              <p
                style={{
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.6,
                }}
              >
                {nft.description}
              </p>
            )}

            {/* Price & info panel */}
            <div
              className="glass-panel"
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <FiDollarSign size={14} /> Price
                </span>
                <strong
                  style={{ fontSize: "1.4rem", color: "var(--color-accent)" }}
                >
                  {formatEth(listing.price)} ETH
                </strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.85rem",
                }}
              >
                <span
                  style={{
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <FiUser size={13} /> Seller
                </span>
                <span style={{ fontFamily: "monospace" }}>
                  {listing.seller.substring(0, 8)}…
                  {listing.seller.substring(36)}
                </span>
              </div>
              {listing.buyer && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                  }}
                >
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    Buyer
                  </span>
                  <span style={{ fontFamily: "monospace" }}>
                    {listing.buyer.substring(0, 8)}…
                    {listing.buyer.substring(36)}
                  </span>
                </div>
              )}
            </div>

            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(239,68,68,0.1)",
                  borderLeft: "4px solid #ef4444",
                  borderRadius: 8,
                  color: "#ff6b6b",
                  display: "flex",
                  gap: 8,
                }}
              >
                <FiAlertTriangle size={16} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>{error}</span>
              </div>
            )}
            {successMsg && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(34,197,94,0.1)",
                  borderLeft: "4px solid #22c55e",
                  borderRadius: 8,
                  color: "#22c55e",
                  display: "flex",
                  gap: 8,
                }}
              >
                <FiCheck size={16} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13 }}>{successMsg}</span>
              </div>
            )}

            {/* Actions */}
            {isBuyer && (
              <button
                className="btn-primary"
                onClick={handleBuy}
                disabled={txStatus !== "idle"}
                style={{ width: "100%", padding: 13 }}
              >
                {txStatus === "buying"
                  ? "Confirming Purchase…"
                  : `🛒 Buy for ${formatEth(listing.price)} ETH`}
              </button>
            )}
            {isSeller && listing.active && (
              <button
                className="btn-secondary"
                onClick={handleCancel}
                disabled={txStatus !== "idle"}
                style={{
                  width: "100%",
                  padding: 13,
                  color: "#ef4444",
                  borderColor: "#ef4444",
                }}
              >
                {txStatus === "cancelling"
                  ? "Cancelling…"
                  : "❌ Cancel Listing"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;
