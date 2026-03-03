import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiGrid,
  FiPlusCircle,
  FiDollarSign,
  FiSettings,
  FiUser,
  FiActivity,
  FiZap,
  FiImage,
  FiCreditCard,
} from "react-icons/fi";
import axios from "axios";
import styles from "./Dashboard.module.css";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../utils/constants";
import DashboardCreate from "./DashboardCreate";
import DashboardSell from "./DashboardSell";
import PlatformWallet from "./PlatformWallet";
import WalletGuard from "../../components/WalletGuard/WalletGuard";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem("dashboardTab") || "overview",
  );

  useEffect(() => {
    sessionStorage.setItem("dashboardTab", activeTab);
  }, [activeTab]);
  const { user, loading, linkWallet } = useAuth();
  const navigate = useNavigate();
  const [myNFTs, setMyNFTs] = useState([]);
  const [loadingNFTs, setLoadingNFTs] = useState(false);
  const [walletLinking, setWalletLinking] = useState(false);
  const [walletLinkError, setWalletLinkError] = useState("");

  // Redirect to Auth if not logged in
  React.useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Fetch user's minted NFTs for Activity section
  useEffect(() => {
    if (!user?.walletAddress) return;
    const fetchMyNFTs = async () => {
      try {
        setLoadingNFTs(true);
        const res = await axios.get(
          `${API_BASE_URL}/nfts/creator/${user.walletAddress}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        setMyNFTs(res.data.data || []);
      } catch (err) {
        console.error("Failed to load user NFTs:", err.message);
      } finally {
        setLoadingNFTs(false);
      }
    };
    fetchMyNFTs();
  }, [user]);

  if (loading || !user) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h3 className="gradient-text">Loading secure dashboard...</h3>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className={styles.tabContent}>
            <h3>Dashboard Overview</h3>
            <p className={styles.tabDescription}>
              Welcome back to your decentralized control center.
            </p>

            <div className={styles.overviewGrid}>
              <div
                className="glass-panel"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  minWidth: 0,
                }}
              >
                <FiActivity
                  size={24}
                  style={{ color: "var(--color-accent)" }}
                />
                <h4 style={{ margin: 0 }}>Active Wallet</h4>
                <p
                  style={{
                    margin: 0,
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                    wordBreak: "break-all",
                  }}
                >
                  {user.walletAddress || "Email User (No Wallet Linked)"}
                </p>
              </div>
              <div
                className="glass-panel"
                style={{
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  minWidth: 0,
                }}
              >
                <FiUser size={24} style={{ color: "var(--color-success)" }} />
                <h4 style={{ margin: 0 }}>Authentication Status</h4>
                <p
                  style={{
                    margin: 0,
                    color: "var(--color-text-secondary)",
                    fontSize: "0.9rem",
                    wordBreak: "break-word",
                    overflowWrap: "break-word",
                  }}
                >
                  Logged in as {user.username || user.email}
                </p>
              </div>
            </div>

            {/* Activity Section */}
            {loadingNFTs ? (
              <div className={styles.emptyState}>
                <p style={{ color: "var(--color-text-secondary)" }}>
                  Loading your activity...
                </p>
              </div>
            ) : myNFTs.length > 0 ? (
              <div>
                <h4
                  style={{
                    marginBottom: "16px",
                    color: "var(--color-text-primary)",
                  }}
                >
                  Your Recent NFTs ({myNFTs.length})
                </h4>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {myNFTs.slice(0, 10).map((nft) => (
                    <div
                      key={nft.tokenId}
                      className="glass-panel"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "16px",
                        padding: "16px",
                      }}
                    >
                      {/* Thumbnail */}
                      <div
                        style={{
                          width: "56px",
                          height: "56px",
                          borderRadius: "10px",
                          overflow: "hidden",
                          flexShrink: 0,
                          background: "var(--color-bg-secondary)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {nft.image ? (
                          <img
                            src={nft.image.replace(
                              "ipfs://",
                              "https://gateway.pinata.cloud/ipfs/",
                            )}
                            alt={nft.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <FiImage
                            size={24}
                            style={{ color: "var(--color-text-secondary)" }}
                          />
                        )}
                      </div>

                      {/* Info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p
                          style={{
                            margin: 0,
                            fontWeight: 600,
                            color: "var(--color-text-primary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {nft.name}
                        </p>
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.8rem",
                            color: "var(--color-text-secondary)",
                            marginTop: "4px",
                          }}
                        >
                          Token #{nft.tokenId} · {nft.category}
                        </p>
                      </div>

                      <span className={styles.mintBadge}>
                        <FiZap size={12} /> Minted
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={styles.emptyState}>
                <div className={styles.emptyStateIcon}>
                  <FiGrid size={48} />
                </div>
                <h4>No Activity Yet</h4>
                <p>
                  Start expanding your collection or minting new digital assets.
                </p>
                <div className={styles.emptyStateActions}>
                  <Link
                    to="/explore"
                    className="btn-secondary"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    Explore Market
                  </Link>
                  <button
                    onClick={() => setActiveTab("create")}
                    className="btn-primary"
                  >
                    Create
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      case "create":
        return (
          <WalletGuard action="create and mint NFTs">
            <DashboardCreate />
          </WalletGuard>
        );
      case "sell":
        return (
          <WalletGuard action="list and sell NFTs">
            <DashboardSell />
          </WalletGuard>
        );
      case "wallet":
        return (
          <WalletGuard action="manage your platform wallet">
            <PlatformWallet />
          </WalletGuard>
        );
      case "settings":
        return (
          <div className={styles.tabContent}>
            <h3>Account Settings</h3>
            <p className={styles.tabDescription}>
              Manage your profile and linked wallets.
            </p>
            <div
              className="glass-panel"
              style={{
                padding: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <strong
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Email
                </strong>
                <span>{user.email || "Not set"}</span>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <strong
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Wallet Address
                </strong>
                {user.walletAddress ? (
                  <span
                    style={{
                      fontFamily: "monospace",
                      color: "var(--color-success)",
                      wordBreak: "break-all",
                    }}
                  >
                    ✅ {user.walletAddress}
                  </span>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        color: "var(--color-text-secondary)",
                        fontSize: "0.9rem",
                      }}
                    >
                      No wallet linked yet. Connect MetaMask to mint, buy and
                      sell NFTs.
                    </span>
                    {walletLinkError && (
                      <p
                        style={{
                          color: "#ef4444",
                          margin: 0,
                          fontSize: "0.88rem",
                        }}
                      >
                        {walletLinkError}
                      </p>
                    )}
                    <button
                      className="btn-primary"
                      style={{ width: "fit-content" }}
                      disabled={walletLinking}
                      onClick={async () => {
                        try {
                          setWalletLinkError("");
                          setWalletLinking(true);
                          await linkWallet();
                        } catch (err) {
                          setWalletLinkError(
                            err.response?.data?.error ||
                              err.message ||
                              "Failed to connect wallet",
                          );
                        } finally {
                          setWalletLinking(false);
                        }
                      }}
                    >
                      {walletLinking
                        ? "Opening MetaMask..."
                        : "🦊 Connect MetaMask Wallet"}
                    </button>
                  </div>
                )}
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "6px" }}
              >
                <strong
                  style={{
                    color: "var(--color-text-secondary)",
                    fontSize: "0.85rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  Auth Method
                </strong>
                <span style={{ textTransform: "capitalize" }}>
                  {user.authProvider || "Email"}
                </span>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`page-transition-enter-active ${styles.dashboardPage}`}>
      <div className={`container ${styles.dashboardMain}`}>
        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarProfile}>
            <div className={styles.avatarWrapper}>
              {user.avatar ? (
                <img src={user.avatar} alt="Avatar" className={styles.avatar} />
              ) : (
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user._id || user.email}`}
                  alt="Avatar"
                  className={styles.avatar}
                />
              )}
            </div>
            <div className={styles.userInfo}>
              <h1 className={styles.username}>
                {user.username || "Anonymous"}
              </h1>
              <div className={styles.badges}>
                <span className={styles.badge}>
                  {user.walletAddress
                    ? `${user.walletAddress.substring(0, 6)}...${user.walletAddress.substring(38)}`
                    : "Email User"}
                </span>
              </div>
            </div>
          </div>

          <nav className={styles.sideNav}>
            <button
              className={`${styles.navItem} ${activeTab === "overview" ? styles.active : ""}`}
              onClick={() => setActiveTab("overview")}
            >
              <FiGrid className={styles.navIcon} /> Overview
            </button>
            <button
              className={`${styles.navItem} ${activeTab === "create" ? styles.active : ""}`}
              onClick={() => setActiveTab("create")}
            >
              <FiPlusCircle className={styles.navIcon} /> Create
            </button>
            <button
              className={`${styles.navItem} ${activeTab === "sell" ? styles.active : ""}`}
              onClick={() => setActiveTab("sell")}
            >
              <FiDollarSign className={styles.navIcon} /> Sell Items
            </button>
            <button
              className={`${styles.navItem} ${activeTab === "wallet" ? styles.active : ""}`}
              onClick={() => setActiveTab("wallet")}
            >
              <FiCreditCard className={styles.navIcon} /> Platform Wallet
            </button>
            <button
              className={`${styles.navItem} ${activeTab === "settings" ? styles.active : ""}`}
              onClick={() => setActiveTab("settings")}
            >
              <FiSettings className={styles.navIcon} /> Settings
            </button>
          </nav>
        </aside>

        {/* CONTENT AREA */}
        <main className={styles.contentArea}>{renderContent()}</main>
      </div>
    </div>
  );
};

export default Dashboard;
