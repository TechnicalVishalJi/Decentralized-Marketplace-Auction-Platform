import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  FiArrowLeft,
  FiClock,
  FiUser,
  FiDollarSign,
  FiZap,
  FiImage,
  FiAlertTriangle,
  FiCheck,
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

const useCountdown = (endTime) => {
  const calc = () => {
    const diff = new Date(endTime) - Date.now();
    if (diff <= 0) return { expired: true, h: 0, m: 0, s: 0, label: "Ended" };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return { expired: false, h, m, s, label: `${h}h ${m}m ${s}s` };
  };
  const [tick, setTick] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTick(calc()), 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return tick;
};

const AuctionDetail = () => {
  const { auctionId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState("");
  const [txStatus, setTxStatus] = useState("idle");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const timer = useCountdown(auction?.endTime);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [aRes, bRes] = await Promise.all([
          axios.get(`${API_BASE_URL}/auctions/${auctionId}`),
          axios.get(`${API_BASE_URL}/auctions/${auctionId}/bids`),
        ]);
        setAuction(aRes.data.data);
        setBids(bRes.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [auctionId]);

  const handleBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      setError("Enter a valid bid amount.");
      return;
    }
    try {
      setError("");
      setSuccessMsg("");
      setTxStatus("confirm");
      if (!window.ethereum) throw new Error("MetaMask is required.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        MARKETPLACE_CONTRACT_ADDRESS,
        MARKETPLACE_ABI.abi,
        signer,
      );
      const bidWei = ethers.parseEther(bidAmount);
      const tx = await contract.placeBid(auction.auctionId, { value: bidWei });
      await tx.wait();
      setSuccessMsg(`✅ Bid of ${bidAmount} ETH placed! Refreshing in 5s…`);
      setTxStatus("idle");
      setBidAmount("");
      setTimeout(() => window.location.reload(), 5000);
    } catch (err) {
      setError(err.reason || err.message || "Bid failed.");
      setTxStatus("idle");
    }
  };

  const handleFinalize = async () => {
    try {
      setError("");
      setTxStatus("finalize");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(
        MARKETPLACE_CONTRACT_ADDRESS,
        MARKETPLACE_ABI.abi,
        signer,
      );
      const tx = await contract.finalizeAuction(auction.auctionId);
      await tx.wait();
      setSuccessMsg("✅ Auction finalized! Reloading…");
      setTxStatus("idle");
      setTimeout(() => window.location.reload(), 4000);
    } catch (err) {
      setError(err.reason || err.message || "Finalize failed.");
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
        <p style={{ color: "var(--color-text-secondary)" }}>Loading auction…</p>
      </div>
    );

  if (!auction)
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
          <p>Auction #{auctionId} not found.</p>
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

  const nft = auction.nft;
  const isSeller = user?.walletAddress?.toLowerCase() === auction.seller;
  const canFinalize =
    isSeller && timer.expired && auction.active && !auction.claimed;
  const minBid =
    auction.highestBid !== "0"
      ? formatEth(((BigInt(auction.highestBid) * 101n) / 100n).toString())
      : formatEth(auction.startPrice);

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
            gridTemplateColumns: "1fr 380px",
            gap: 32,
            alignItems: "start",
          }}
        >
          {/* Left: NFT Image + Info */}
          <div>
            <div
              className="glass-panel"
              style={{
                overflow: "hidden",
                borderRadius: "var(--radius-lg)",
                aspectRatio: "1/1",
                marginBottom: 24,
              }}
            >
              {nft?.image ? (
                <img
                  src={ipfsToHttp(nft.image)}
                  alt={nft.name}
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

            {/* Bid History */}
            <div className="glass-panel" style={{ padding: 20 }}>
              <h4
                style={{
                  margin: "0 0 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <FiZap color="var(--color-accent)" /> Bid History ({bids.length}
                )
              </h4>
              {bids.length === 0 ? (
                <p
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                  }}
                >
                  No bids yet. Be the first!
                </p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                    maxHeight: 280,
                    overflowY: "auto",
                  }}
                >
                  {bids.map((bid, i) => (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 10px",
                        background: "var(--color-bg-secondary)",
                        borderRadius: 8,
                      }}
                    >
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontSize: "0.8rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {bid.bidder.substring(0, 8)}…{bid.bidder.substring(36)}
                      </span>
                      <span
                        style={{
                          fontWeight: 700,
                          color: "var(--color-accent)",
                        }}
                      >
                        {formatEth(bid.amount)} ETH
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--color-text-secondary)",
                        }}
                      >
                        {new Date(bid.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Details + Bid */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Status badge */}
            <div>
              {auction.cancelled && (
                <span
                  style={{
                    background: "rgba(239,68,68,0.12)",
                    color: "#ef4444",
                    padding: "4px 14px",
                    borderRadius: 20,
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  ❌ Cancelled
                </span>
              )}
              {!auction.active && !auction.cancelled && (
                <span
                  style={{
                    background: "rgba(107,114,128,0.12)",
                    color: "#9ca3af",
                    padding: "4px 14px",
                    borderRadius: 20,
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  🏁 Ended
                </span>
              )}
              {auction.active && !timer.expired && (
                <span
                  style={{
                    background: "rgba(99,102,241,0.12)",
                    color: "var(--color-accent)",
                    padding: "4px 14px",
                    borderRadius: 20,
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  🔴 Live
                </span>
              )}
              {auction.active && timer.expired && (
                <span
                  style={{
                    background: "rgba(255,165,0,0.12)",
                    color: "#f59e0b",
                    padding: "4px 14px",
                    borderRadius: 20,
                    fontSize: "0.82rem",
                    fontWeight: 600,
                  }}
                >
                  ⏰ Awaiting Finalization
                </span>
              )}
            </div>

            <h2 style={{ margin: 0, fontSize: "1.8rem" }}>
              {nft?.name || `NFT #${auction.tokenId}`}
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

            {/* Countdown */}
            {auction.active && (
              <div
                className="glass-panel"
                style={{ padding: 20, textAlign: "center" }}
              >
                <p
                  style={{
                    margin: "0 0 8px",
                    fontSize: "0.85rem",
                    color: "var(--color-text-secondary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <FiClock />{" "}
                  {timer.expired ? "Auction has ended" : "Time Remaining"}
                </p>
                {!timer.expired && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      gap: 12,
                    }}
                  >
                    {[
                      { v: timer.h, l: "hr" },
                      { v: timer.m, l: "min" },
                      { v: timer.s, l: "sec" },
                    ].map(({ v, l }) => (
                      <div key={l} style={{ textAlign: "center" }}>
                        <div
                          style={{
                            fontSize: "2rem",
                            fontWeight: 800,
                            color: "var(--color-accent)",
                            lineHeight: 1,
                          }}
                        >
                          {String(v).padStart(2, "0")}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "var(--color-text-secondary)",
                          }}
                        >
                          {l}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Price panel */}
            <div
              className="glass-panel"
              style={{
                padding: 20,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Starting Price
                </span>
                <strong>{formatEth(auction.startPrice)} ETH</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>
                  Highest Bid
                </span>
                <strong style={{ color: "var(--color-accent)" }}>
                  {auction.highestBid !== "0"
                    ? `${formatEth(auction.highestBid)} ETH`
                    : "No bids yet"}
                </strong>
              </div>
              {auction.highestBidder && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.85rem",
                  }}
                >
                  <span style={{ color: "var(--color-text-secondary)" }}>
                    Leading Bidder
                  </span>
                  <span style={{ fontFamily: "monospace" }}>
                    {auction.highestBidder.substring(0, 8)}…
                  </span>
                </div>
              )}
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
                  {auction.seller.substring(0, 8)}…
                  {auction.seller.substring(36)}
                </span>
              </div>
            </div>

            {/* Error / Success */}
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
                <FiAlertTriangle
                  size={16}
                  style={{ flexShrink: 0, marginTop: 1 }}
                />
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
                <FiCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span style={{ fontSize: 13 }}>{successMsg}</span>
              </div>
            )}

            {/* Bid box — only if auction is live */}
            {auction.active && !timer.expired && !isSeller && (
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ position: "relative", flex: 1 }}>
                  <FiDollarSign
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "var(--color-text-secondary)",
                    }}
                  />
                  <input
                    type="number"
                    step="0.001"
                    placeholder={`Min ${minBid} ETH`}
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "11px 10px 11px 32px",
                      borderRadius: "var(--radius-md)",
                      border: "1px solid var(--glass-border-solid)",
                      background: "var(--color-bg-primary)",
                      color: "var(--color-text-primary)",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
                <button
                  className="btn-primary"
                  onClick={handleBid}
                  disabled={txStatus !== "idle"}
                  style={{ padding: "0 20px", whiteSpace: "nowrap" }}
                >
                  {txStatus === "confirm" ? "Confirming…" : "Place Bid"}
                </button>
              </div>
            )}

            {/* Finalize button for seller */}
            {canFinalize && (
              <button
                className="btn-primary"
                onClick={handleFinalize}
                disabled={txStatus !== "idle"}
                style={{ width: "100%", padding: 12 }}
              >
                {txStatus === "finalize"
                  ? "Finalizing…"
                  : "🏆 Finalize Auction"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionDetail;
