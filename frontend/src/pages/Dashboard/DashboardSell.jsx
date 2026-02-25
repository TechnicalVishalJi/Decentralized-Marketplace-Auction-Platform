import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiDollarSign,
  FiTag,
  FiClock,
  FiCheck,
  FiAlertTriangle,
  FiImage,
  FiZap,
  FiRefreshCw,
  FiExternalLink,
  FiX,
} from "react-icons/fi";
import { ethers } from "ethers";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  API_BASE_URL,
  NFT_CONTRACT_ADDRESS,
  MARKETPLACE_CONTRACT_ADDRESS,
} from "../../utils/constants";
import NFT_ABI from "../../contracts/NFT.json";
import MARKETPLACE_ABI from "../../contracts/Marketplace.json";
import styles from "./Dashboard.module.css";

/* ─────────────── helpers ─────────────── */
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

/* live countdown hook */
const useCountdown = (endTime) => {
  const calc = () => {
    const diff = new Date(endTime) - Date.now();
    if (diff <= 0) return { expired: true, label: "Ended" };
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    return {
      expired: false,
      label: h > 0 ? `${h}h ${m}m ${s}s` : `${m}m ${s}s`,
    };
  };
  const [tick, setTick] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTick(calc()), 1000);
    return () => clearInterval(id);
  }, [endTime]);
  return tick;
};

/* ─────────────── sub-components ─────────────── */
const AuctionCard = ({ auction, nftMap, onClick }) => {
  const nft = nftMap[auction.tokenId];
  const { label, expired } = useCountdown(auction.endTime);
  return (
    <div
      onClick={() => onClick(auction)}
      className="glass-panel"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.2s",
        borderLeft: `4px solid ${expired ? "#6b7280" : "var(--color-accent)"}`,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 8,
          overflow: "hidden",
          flexShrink: 0,
          background: "var(--color-bg-secondary)",
        }}
      >
        {nft?.image ? (
          <img
            src={ipfsToHttp(nft.image)}
            alt={nft.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <FiImage
            size={20}
            style={{
              margin: "auto",
              display: "block",
              marginTop: 16,
              color: "var(--color-text-secondary)",
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {nft?.name || `NFT #${auction.tokenId}`}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            marginTop: 2,
          }}
        >
          Floor: {formatEth(auction.startPrice)} ETH &nbsp;|&nbsp; Top bid:{" "}
          {auction.highestBid !== "0"
            ? `${formatEth(auction.highestBid)} ETH`
            : "—"}
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span
          style={{
            display: "inline-block",
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: "0.75rem",
            fontWeight: 600,
            background: auction.cancelled
              ? "rgba(239,68,68,0.12)"
              : expired
                ? "rgba(107,114,128,0.15)"
                : "rgba(99,102,241,0.12)",
            color: auction.cancelled
              ? "#ef4444"
              : expired
                ? "#9ca3af"
                : "var(--color-accent)",
          }}
        >
          {auction.cancelled
            ? "❌ Cancelled"
            : expired
              ? "⏰ Ended"
              : `⏳ ${label}`}
        </span>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            display: "flex",
            alignItems: "center",
            gap: 4,
            justifyContent: "flex-end",
          }}
        >
          <FiExternalLink size={11} /> View
        </p>
      </div>
    </div>
  );
};

const ListingCard = ({ listing, nftMap, onClick }) => {
  const nft = nftMap[listing.tokenId];
  return (
    <div
      onClick={() => onClick(listing)}
      className="glass-panel"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "14px 16px",
        cursor: "pointer",
        transition: "all 0.2s",
        borderLeft: `4px solid ${listing.active ? "var(--color-success)" : "#6b7280"}`,
      }}
    >
      <div
        style={{
          width: 52,
          height: 52,
          borderRadius: 8,
          overflow: "hidden",
          flexShrink: 0,
          background: "var(--color-bg-secondary)",
        }}
      >
        {nft?.image ? (
          <img
            src={ipfsToHttp(nft.image)}
            alt={nft.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <FiImage
            size={20}
            style={{
              margin: "auto",
              display: "block",
              marginTop: 16,
              color: "var(--color-text-secondary)",
            }}
          />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontWeight: 600,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {nft?.name || `NFT #${listing.tokenId}`}
        </p>
        <p
          style={{
            margin: 0,
            fontSize: "0.8rem",
            color: "var(--color-text-secondary)",
            marginTop: 2,
          }}
        >
          Price: {formatEth(listing.price)} ETH
        </p>
      </div>
      <div style={{ textAlign: "right", flexShrink: 0 }}>
        <span
          style={{
            display: "inline-block",
            padding: "3px 10px",
            borderRadius: 20,
            fontSize: "0.75rem",
            fontWeight: 600,
            background: listing.active
              ? "rgba(34,197,94,0.12)"
              : "rgba(107,114,128,0.15)",
            color: listing.active ? "var(--color-success)" : "#9ca3af",
          }}
        >
          {listing.active
            ? "🟢 Active"
            : listing.buyer
              ? "✅ Sold"
              : "❌ Cancelled"}
        </span>
        <p
          style={{
            margin: "4px 0 0",
            fontSize: "0.75rem",
            color: "var(--color-text-secondary)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: 4,
          }}
        >
          <FiExternalLink size={11} /> View
        </p>
      </div>
    </div>
  );
};

/* ─────────────── main component ─────────────── */
const DashboardSell = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  /* NFTs the user owns */
  const [ownedNFTs, setOwnedNFTs] = useState([]);
  const [nftLoading, setNftLoading] = useState(true);

  /* listings & auctions */
  const [myListings, setMyListings] = useState([]);
  const [myAuctions, setMyAuctions] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);

  /* nft data for listings/auctions (tokenId → nft) */
  const [nftMap, setNftMap] = useState({});

  /* form state */
  const [selectedNFT, setSelectedNFT] = useState(null);
  const [sellMode, setSellMode] = useState("fixed");
  const [formData, setFormData] = useState({
    price: "",
    durationDays: "0",
    durationHours: "1",
  });
  const [useBalance, setUseBalance] = useState(false); // pay fee from platform balance?
  const [platformBalance, setPlatformBalance] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  /* ── fetch platform balance ── */
  useEffect(() => {
    if (!user?.walletAddress || !window.ethereum) return;
    const fetchPlatBal = async () => {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          MARKETPLACE_CONTRACT_ADDRESS,
          MARKETPLACE_ABI.abi,
          provider,
        );
        const bal = await contract.getBalanceOfUser(user.walletAddress);
        setPlatformBalance(bal);
      } catch (e) {
        console.error(e);
      }
    };
    fetchPlatBal();
  }, [user]);

  /* ── fetch owned NFTs ── */
  useEffect(() => {
    if (!user?.walletAddress) {
      setNftLoading(false);
      return;
    }
    const load = async () => {
      try {
        setNftLoading(true);
        const res = await axios.get(
          `${API_BASE_URL}/nfts/owner/${user.walletAddress}`,
        );
        setOwnedNFTs(res.data.data || []);
      } catch (e) {
        console.error(e);
      } finally {
        setNftLoading(false);
      }
    };
    load();
  }, [user]);

  /* ── fetch user's listings & auctions ── */
  const fetchActivity = useCallback(async () => {
    if (!user?.walletAddress) {
      setActivityLoading(false);
      return;
    }
    try {
      setActivityLoading(true);
      const [listRes, aucRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/listings/seller/${user.walletAddress}`),
        axios.get(`${API_BASE_URL}/auctions/seller/${user.walletAddress}`),
      ]);
      const listings = listRes.data.data || [];
      const auctions = aucRes.data.data || [];
      setMyListings(
        listings.sort((a, b) => {
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          return timeB - timeA || b.listingId - a.listingId;
        }),
      );
      setMyAuctions(
        auctions.sort((a, b) => {
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          return timeB - timeA || b.auctionId - a.auctionId;
        }),
      );

      /* build tokenId → nft lookup from owned NFTs + fetch missing ones */
      const map = {};
      ownedNFTs.forEach((n) => {
        map[n.tokenId] = n;
      });
      const allTokenIds = [
        ...listings.map((l) => l.tokenId),
        ...auctions.map((a) => a.tokenId),
      ].filter((id) => !map[id]);
      const unique = [...new Set(allTokenIds)];
      await Promise.all(
        unique.map(async (id) => {
          try {
            const r = await axios.get(`${API_BASE_URL}/nfts/${id}`);
            map[id] = r.data.data;
          } catch {
            /* ignore */
          }
        }),
      );
      setNftMap(map);
    } catch (e) {
      console.error(e);
    } finally {
      setActivityLoading(false);
    }
  }, [user, ownedNFTs]);

  useEffect(() => {
    fetchActivity();
  }, [user, ownedNFTs]);

  /* ── list / auction ── */
  const handleList = async (e) => {
    e.preventDefault();
    if (!selectedNFT) {
      setError("Please select an NFT.");
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError("Enter a valid price.");
      return;
    }
    const totalHours =
      parseInt(formData.durationDays || 0) * 24 +
      parseInt(formData.durationHours || 0);
    if (sellMode === "auction" && totalHours < 1) {
      setError("Auction duration must be at least 1 hour.");
      return;
    }

    try {
      setError("");
      setSuccessMsg("");
      setStatus("approving");
      if (!window.ethereum) throw new Error("MetaMask is required.");
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const nftContract = new ethers.Contract(
        NFT_CONTRACT_ADDRESS,
        NFT_ABI.abi,
        signer,
      );
      const marketplaceContract = new ethers.Contract(
        MARKETPLACE_CONTRACT_ADDRESS,
        MARKETPLACE_ABI.abi,
        signer,
      );

      /* approve marketplace if not already */
      const approved = await nftContract.getApproved(selectedNFT.tokenId);
      if (
        approved.toLowerCase() !== MARKETPLACE_CONTRACT_ADDRESS.toLowerCase()
      ) {
        const tx = await nftContract.approve(
          MARKETPLACE_CONTRACT_ADDRESS,
          selectedNFT.tokenId,
        );
        await tx.wait();
      }

      setStatus("listing");
      const priceWei = ethers.parseEther(formData.price.toString());

      if (sellMode === "fixed") {
        // If useBalance=true, fee comes from platform balance (no msg.value needed)
        const listingFee = useBalance
          ? 0n
          : await marketplaceContract.listingFee();
        const tx = await marketplaceContract.listNFT(
          NFT_CONTRACT_ADDRESS,
          selectedNFT.tokenId,
          priceWei,
          useBalance, // true = deduct fee from platform balance, false = pay from wallet
          { value: listingFee },
        );
        await tx.wait();
        setSuccessMsg(
          `✅ NFT listed for ${formData.price} ETH. The listing will appear below in a few seconds.`,
        );
      } else {
        const durationSeconds = totalHours * 3600;
        const auctionFee = useBalance
          ? 0n
          : await marketplaceContract.auctionFee();
        const tx = await marketplaceContract.createAuction(
          NFT_CONTRACT_ADDRESS,
          selectedNFT.tokenId,
          priceWei,
          durationSeconds,
          useBalance, // true = deduct fee from platform balance, false = pay from wallet
          { value: auctionFee },
        );
        await tx.wait();
        setSuccessMsg(
          `✅ Auction started for ${totalHours}h at floor price ${formData.price} ETH. It will appear below shortly.`,
        );
      }

      setStatus("idle");
      setSelectedNFT(null);
      setFormData({ price: "", durationDays: "0", durationHours: "1" });
      /* refresh activity after a short delay to let event listener catch up */
      setTimeout(fetchActivity, 4000);
    } catch (err) {
      setError(err.reason || err.message || "Transaction failed.");
      setStatus("idle");
    }
  };

  /* ── render ── */
  const now = Date.now();
  const activeListedTokens = new Set([
    ...myListings.filter((l) => l.active).map((l) => l.tokenId),
    ...myAuctions
      .filter((a) => {
        if (!a.active) return false;
        const endTime = new Date(a.endTime).getTime();
        const isExpired = now >= endTime;
        const hasBids = a.highestBid && String(a.highestBid) !== "0";

        if (!isExpired) return true; // Still running
        if (isExpired && hasBids && !a.claimed) return true; // Pending claim from winner

        return false; // Expired with no bids
      })
      .map((a) => a.tokenId),
  ]);
  const availableNFTs = ownedNFTs.filter(
    (nft) => !activeListedTokens.has(nft.tokenId),
  );

  return (
    <div className={styles.tabContent}>
      <h3>Sell Items</h3>
      <p className={styles.tabDescription}>
        Fixed-price listings & auctions — powered by your on-chain wallet.
      </p>

      {/* ── error / success banners ── */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239,68,68,0.1)",
            borderLeft: "4px solid #ef4444",
            borderRadius: 8,
            color: "#ff6b6b",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <FiAlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 14 }}>{error}</span>
          <FiX
            size={16}
            style={{ marginLeft: "auto", cursor: "pointer", flexShrink: 0 }}
            onClick={() => setError("")}
          />
        </div>
      )}
      {successMsg && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(34,197,94,0.1)",
            borderLeft: "4px solid #22c55e",
            borderRadius: 8,
            color: "#22c55e",
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <FiCheck size={18} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 14 }}>{successMsg}</span>
          <FiX
            size={16}
            style={{ marginLeft: "auto", cursor: "pointer", flexShrink: 0 }}
            onClick={() => setSuccessMsg("")}
          />
        </div>
      )}

      {/* ━━━━━━ CREATE LISTING PANEL ━━━━━━ */}
      <div className="glass-panel" style={{ padding: 24, marginBottom: 32 }}>
        <h4
          style={{
            margin: "0 0 20px",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <FiZap color="var(--color-accent)" /> Create New Listing
        </h4>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 300px",
            gap: 24,
            alignItems: "start",
          }}
        >
          {/* NFT picker */}
          <div>
            <p
              style={{ marginBottom: 12, fontWeight: 600, fontSize: "0.9rem" }}
            >
              Select NFT *
            </p>
            {nftLoading ? (
              <p style={{ color: "var(--color-text-secondary)" }}>
                Loading your NFTs…
              </p>
            ) : availableNFTs.length === 0 ? (
              <p style={{ color: "var(--color-text-secondary)" }}>
                You don't own any available NFTs.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))",
                  gap: 10,
                }}
              >
                {availableNFTs.map((nft) => (
                  <div
                    key={nft.tokenId}
                    onClick={() => setSelectedNFT(nft)}
                    style={{
                      border:
                        selectedNFT?.tokenId === nft.tokenId
                          ? "2px solid var(--color-accent)"
                          : "1px solid var(--glass-border-solid)",
                      borderRadius: "var(--radius-md)",
                      padding: 6,
                      cursor: "pointer",
                      background:
                        selectedNFT?.tokenId === nft.tokenId
                          ? "rgba(99,102,241,0.1)"
                          : "var(--color-bg-primary)",
                      transition: "all 0.2s",
                    }}
                  >
                    <div
                      style={{
                        width: "100%",
                        aspectRatio: "1/1",
                        borderRadius: 6,
                        overflow: "hidden",
                        background: "var(--color-bg-secondary)",
                      }}
                    >
                      <img
                        src={ipfsToHttp(nft.image)}
                        alt={nft.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    </div>
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {nft.name}
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "0.72rem",
                        color: "var(--color-text-secondary)",
                      }}
                    >
                      #{nft.tokenId}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sell options */}
          <div>
            {/* Mode toggle */}
            <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
              {["fixed", "auction"].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSellMode(m)}
                  className="btn-secondary"
                  style={{
                    flex: 1,
                    padding: "8px 4px",
                    borderColor: sellMode === m ? "var(--color-accent)" : "",
                    background:
                      sellMode === m ? "rgba(99,102,241,0.08)" : "transparent",
                  }}
                >
                  {m === "fixed" ? (
                    <>
                      <FiTag style={{ marginRight: 4 }} />
                      Fixed
                    </>
                  ) : (
                    <>
                      <FiClock style={{ marginRight: 4 }} />
                      Auction
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Price */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  marginBottom: 6,
                }}
              >
                {sellMode === "fixed"
                  ? "Sale Price (ETH) *"
                  : "Starting Price (ETH) *"}
              </label>
              <div style={{ position: "relative" }}>
                <FiDollarSign
                  style={{
                    position: "absolute",
                    left: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "var(--color-text-secondary)",
                  }}
                />
                <input
                  type="number"
                  step="0.001"
                  min="0"
                  placeholder="0.1"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "10px 10px 10px 34px",
                    borderRadius: "var(--radius-md)",
                    border: "1px solid var(--glass-border-solid)",
                    background: "var(--color-bg-primary)",
                    color: "var(--color-text-primary)",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Auction duration */}
            {sellMode === "auction" && (
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Duration *
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 8,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--color-text-secondary)",
                        marginBottom: 4,
                        display: "block",
                      }}
                    >
                      Days
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="30"
                      placeholder="0"
                      value={formData.durationDays}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          durationDays: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "9px 10px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--glass-border-solid)",
                        background: "var(--color-bg-primary)",
                        color: "var(--color-text-primary)",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "0.78rem",
                        color: "var(--color-text-secondary)",
                        marginBottom: 4,
                        display: "block",
                      }}
                    >
                      Hours
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="23"
                      placeholder="1"
                      value={formData.durationHours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          durationHours: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "9px 10px",
                        borderRadius: "var(--radius-md)",
                        border: "1px solid var(--glass-border-solid)",
                        background: "var(--color-bg-primary)",
                        color: "var(--color-text-primary)",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
                <p
                  style={{
                    margin: "6px 0 0",
                    fontSize: "0.77rem",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  Total:{" "}
                  {parseInt(formData.durationDays || 0) * 24 +
                    parseInt(formData.durationHours || 0)}{" "}
                  hours
                </p>
              </div>
            )}

            {/* Selected preview */}
            {selectedNFT && (
              <div
                style={{
                  padding: "10px 12px",
                  background: "rgba(99,102,241,0.07)",
                  borderRadius: 8,
                  marginBottom: 14,
                  fontSize: "0.84rem",
                }}
              >
                Selected: <strong>{selectedNFT.name}</strong> (#
                {selectedNFT.tokenId})
              </div>
            )}

            {/* ── Payment Method ── */}
            <div style={{ marginBottom: 14 }}>
              <label
                style={{
                  display: "block",
                  fontSize: "0.88rem",
                  fontWeight: 600,
                  marginBottom: 8,
                }}
              >
                Fee Payment Method
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setUseBalance(false)}
                  style={{
                    flex: 1,
                    padding: "8px 6px",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${!useBalance ? "var(--color-accent)" : "var(--glass-border-solid)"}`,
                    background: !useBalance
                      ? "rgba(99,102,241,0.1)"
                      : "transparent",
                    cursor: "pointer",
                    color: !useBalance
                      ? "var(--color-accent)"
                      : "var(--color-text-secondary)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                >
                  🦊 MetaMask Wallet
                </button>
                <button
                  type="button"
                  onClick={() => setUseBalance(true)}
                  style={{
                    flex: 1,
                    padding: "8px 6px",
                    borderRadius: "var(--radius-md)",
                    border: `2px solid ${useBalance ? "var(--color-success)" : "var(--glass-border-solid)"}`,
                    background: useBalance
                      ? "rgba(34,197,94,0.08)"
                      : "transparent",
                    cursor: "pointer",
                    color: useBalance
                      ? "var(--color-success)"
                      : "var(--color-text-secondary)",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    transition: "all 0.2s",
                  }}
                >
                  ⚡ Platform Balance
                </button>
              </div>
              {useBalance && (
                <div style={{ marginTop: 8 }}>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "0.78rem",
                      color:
                        platformBalance && BigInt(platformBalance) > 0n
                          ? "var(--color-success)"
                          : "#f59e0b",
                    }}
                  >
                    {platformBalance !== null
                      ? `Available: ${parseFloat(ethers.formatEther(platformBalance)).toFixed(6)} ETH`
                      : "Checking balance…"}
                    {platformBalance !== null &&
                      BigInt(platformBalance) === 0n &&
                      " — deposit ETH first in Platform Wallet tab."}
                  </p>
                  <p
                    style={{
                      margin: "4px 0 0",
                      fontSize: "0.7rem",
                      color: "var(--color-text-secondary)",
                    }}
                  >
                    <i>
                      Note: MetaMask will still open to pay the network Gas fee
                      (which is required by the blockchain), but the
                      listing/auction fee itself will be 0 ETH in the
                      transaction.
                    </i>
                  </p>
                </div>
              )}
            </div>

            {/* Submit button */}
            <button
              onClick={handleList}
              disabled={!selectedNFT || status !== "idle"}
              className="btn-primary"
              style={{
                width: "100%",
                padding: 12,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 8,
              }}
            >
              {status === "idle" &&
                (sellMode === "fixed"
                  ? "📋 List for Sale"
                  : "🔨 Start Auction")}
              {status === "approving" && "✅ Approving NFT Transfer…"}
              {status === "listing" && "⏳ Confirming on Blockchain…"}
            </button>
          </div>
        </div>
      </div>

      {/* ━━━━━━ YOUR AUCTIONS ━━━━━━ */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h4
            style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}
          >
            <FiClock color="var(--color-accent)" /> Your Auctions
            {myAuctions.length > 0 && (
              <span
                style={{
                  background: "rgba(99,102,241,0.12)",
                  color: "var(--color-accent)",
                  borderRadius: 20,
                  padding: "1px 10px",
                  fontSize: "0.8rem",
                }}
              >
                {myAuctions.length}
              </span>
            )}
          </h4>
          <button
            onClick={fetchActivity}
            className="btn-secondary"
            style={{
              padding: "6px 12px",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FiRefreshCw size={13} /> Refresh
          </button>
        </div>

        {activityLoading ? (
          <p style={{ color: "var(--color-text-secondary)" }}>
            Loading auctions…
          </p>
        ) : myAuctions.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: "32px 24px",
              textAlign: "center",
              color: "var(--color-text-secondary)",
            }}
          >
            You haven't started any auctions yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myAuctions.map((a) => (
              <AuctionCard
                key={a.auctionId}
                auction={a}
                nftMap={nftMap}
                onClick={(auction) => navigate(`/auction/${auction.auctionId}`)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ━━━━━━ YOUR LISTINGS ━━━━━━ */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 14,
          }}
        >
          <h4
            style={{ margin: 0, display: "flex", alignItems: "center", gap: 8 }}
          >
            <FiTag color="var(--color-success)" /> Your Listings
            {myListings.length > 0 && (
              <span
                style={{
                  background: "rgba(34,197,94,0.12)",
                  color: "var(--color-success)",
                  borderRadius: 20,
                  padding: "1px 10px",
                  fontSize: "0.8rem",
                }}
              >
                {myListings.length}
              </span>
            )}
          </h4>
        </div>

        {activityLoading ? (
          <p style={{ color: "var(--color-text-secondary)" }}>
            Loading listings…
          </p>
        ) : myListings.length === 0 ? (
          <div
            className="glass-panel"
            style={{
              padding: "32px 24px",
              textAlign: "center",
              color: "var(--color-text-secondary)",
            }}
          >
            You haven't listed any NFTs for sale yet.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {myListings.map((l) => (
              <ListingCard
                key={l.listingId}
                listing={l}
                nftMap={nftMap}
                onClick={(listing) => navigate(`/listing/${listing.listingId}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardSell;
