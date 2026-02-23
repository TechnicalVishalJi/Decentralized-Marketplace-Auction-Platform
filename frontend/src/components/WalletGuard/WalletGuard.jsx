import React, { useState } from "react";
import { FiLink, FiAlertTriangle, FiCheckCircle } from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

/**
 * WalletGuard wraps any NFT-related UI and enforces that the user
 * has a connected MetaMask wallet before they can proceed.
 */
const WalletGuard = ({ children, action = "perform this action" }) => {
  const { user, linkWallet, loading } = useAuth();
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState("");
  const [justLinked, setJustLinked] = useState(false);

  if (loading) return null;

  // If wallet is already linked, render children normally
  if (user?.walletAddress) return children;

  const handleConnect = async () => {
    try {
      setError("");
      setConnecting(true);
      await linkWallet();
      setJustLinked(true);
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Failed to connect wallet",
      );
    } finally {
      setConnecting(false);
    }
  };

  if (justLinked) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "80px 24px",
          textAlign: "center",
          gap: "16px",
        }}
      >
        <FiCheckCircle size={56} style={{ color: "var(--color-success)" }} />
        <h3 style={{ margin: 0 }}>Wallet Connected!</h3>
        <p style={{ color: "var(--color-text-secondary)" }}>
          Your wallet is now linked. Refresh this tab to continue.
        </p>
        <button
          className="btn-primary"
          onClick={() => window.location.reload()}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 24px",
        textAlign: "center",
        gap: "20px",
      }}
    >
      <div
        style={{
          width: "88px",
          height: "88px",
          borderRadius: "50%",
          background: "rgba(99, 102, 241, 0.1)",
          border: "2px solid rgba(99, 102, 241, 0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-accent)",
        }}
      >
        <FiLink size={40} />
      </div>

      <h3 style={{ margin: 0 }}>Wallet Required</h3>
      <p style={{ color: "var(--color-text-secondary)", maxWidth: "360px" }}>
        You need to connect a MetaMask wallet to {action}. Your wallet is your
        identity on the blockchain.
      </p>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239, 68, 68, 0.1)",
            borderLeft: "4px solid #ef4444",
            borderRadius: "8px",
            color: "#ff6b6b",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            fontSize: "14px",
            maxWidth: "420px",
            width: "100%",
            textAlign: "left",
          }}
        >
          <FiAlertTriangle size={18} style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </div>
      )}

      <button
        className="btn-primary"
        onClick={handleConnect}
        disabled={connecting}
        style={{ minWidth: "220px", fontSize: "1rem", padding: "14px 28px" }}
      >
        {connecting ? "Opening MetaMask..." : "🦊 Connect MetaMask Wallet"}
      </button>

      <p style={{ fontSize: "0.8rem", color: "var(--color-text-secondary)" }}>
        Don&apos;t have MetaMask?{" "}
        <a
          href="https://metamask.io/download/"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "var(--color-accent)" }}
        >
          Install MetaMask here
        </a>
      </p>
    </div>
  );
};

export default WalletGuard;
