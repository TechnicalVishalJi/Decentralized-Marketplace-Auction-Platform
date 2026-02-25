import React, { useState, useEffect, useCallback } from "react";
import {
  FiArrowDownCircle,
  FiArrowUpCircle,
  FiRefreshCw,
  FiAlertTriangle,
  FiCheck,
  FiInfo,
  FiZap,
} from "react-icons/fi";
import { ethers } from "ethers";
import { useAuth } from "../../context/AuthContext";
import { MARKETPLACE_CONTRACT_ADDRESS } from "../../utils/constants";
import MARKETPLACE_ABI from "../../contracts/Marketplace.json";
import styles from "./Dashboard.module.css";

/* ── helpers ── */
const formatEth = (wei) => {
  try {
    return parseFloat(ethers.formatEther(wei)).toFixed(6);
  } catch {
    return "0.000000";
  }
};

const getContract = async (readOnly = false) => {
  if (!window.ethereum) throw new Error("MetaMask is required.");
  const provider = new ethers.BrowserProvider(window.ethereum);
  if (readOnly)
    return new ethers.Contract(
      MARKETPLACE_CONTRACT_ADDRESS,
      MARKETPLACE_ABI.abi,
      provider,
    );
  const signer = await provider.getSigner();
  return new ethers.Contract(
    MARKETPLACE_CONTRACT_ADDRESS,
    MARKETPLACE_ABI.abi,
    signer,
  );
};

/* ════════════════════════════════════════════
   PlatformWallet — full dashboard tab
   ════════════════════════════════════════════ */
const PlatformWallet = () => {
  const { user } = useAuth();

  const [balance, setBalance] = useState(null);
  const [loadingBalance, setLoadingBalance] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [txStatus, setTxStatus] = useState("idle"); // idle | depositing | withdrawing
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /* ── fetch balance ── */
  const fetchBalance = useCallback(async () => {
    if (!user?.walletAddress || !window.ethereum) return;
    try {
      setLoadingBalance(true);
      const contract = await getContract(true);
      const bal = await contract.getBalanceOfUser(user.walletAddress);
      setBalance(bal);
    } catch (e) {
      console.error("Balance fetch error:", e);
    } finally {
      setLoadingBalance(false);
    }
  }, [user]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  /* ── deposit ── */
  const handleDeposit = async () => {
    if (!depositAmount || parseFloat(depositAmount) <= 0) {
      setError("Enter a valid ETH amount to deposit.");
      return;
    }
    clearMessages();
    try {
      setTxStatus("depositing");
      const contract = await getContract();
      const tx = await contract.deposit({
        value: ethers.parseEther(depositAmount),
      });
      await tx.wait();
      setSuccess(`✅ Deposited ${depositAmount} ETH to your platform balance!`);
      setDepositAmount("");
      await fetchBalance();
    } catch (err) {
      setError(err.reason || err.message || "Deposit failed.");
    } finally {
      setTxStatus("idle");
    }
  };

  /* ── withdraw ── */
  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      setError("Enter a valid ETH amount to withdraw.");
      return;
    }
    clearMessages();
    try {
      setTxStatus("withdrawing");
      const amountWei = ethers.parseEther(withdrawAmount);
      if (balance !== null && amountWei > balance) {
        throw new Error(
          `Insufficient platform balance. Available: ${formatEth(balance)} ETH`,
        );
      }
      const contract = await getContract();
      const tx = await contract.withdraw(amountWei);
      await tx.wait();
      setSuccess(`✅ Withdrew ${withdrawAmount} ETH to your MetaMask wallet!`);
      setWithdrawAmount("");
      await fetchBalance();
    } catch (err) {
      setError(err.reason || err.message || "Withdrawal failed.");
    } finally {
      setTxStatus("idle");
    }
  };

  const balanceEth = balance !== null ? formatEth(balance) : null;
  const balanceNum = balanceEth ? parseFloat(balanceEth) : 0;

  return (
    <div className={styles.tabContent}>
      <h3>Platform Wallet</h3>
      <p className={styles.tabDescription}>
        Manage your on-platform balance. Money from NFT sales lands here —
        withdraw to your real wallet any time, or use it to pay fees on
        listings, auctions, and bids without extra MetaMask popups.
      </p>

      {/* ── balance card ── */}
      <div
        className="glass-panel"
        style={{
          padding: "28px 32px",
          marginBottom: 28,
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%)",
          border: "1px solid rgba(99,102,241,0.25)",
          borderRadius: "var(--radius-lg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 20,
        }}
      >
        <div>
          <p
            style={{
              margin: "0 0 6px",
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <FiZap size={13} color="var(--color-accent)" /> Platform Balance
          </p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span
              style={{
                fontSize: "2.4rem",
                fontWeight: 800,
                color: "var(--color-accent)",
                lineHeight: 1,
              }}
            >
              {balanceEth === null ? "—" : balanceNum.toFixed(4)}
            </span>
            <span
              style={{
                fontSize: "1rem",
                color: "var(--color-text-secondary)",
                fontWeight: 600,
              }}
            >
              ETH
            </span>
          </div>
          {balanceEth !== null && (
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "0.78rem",
                color: "var(--color-text-secondary)",
              }}
            >
              ≈ ${(balanceNum * 2000).toFixed(2)} USD{" "}
              <span style={{ opacity: 0.6 }}>(est.)</span>
            </p>
          )}
        </div>
        <button
          onClick={fetchBalance}
          className="btn-secondary"
          disabled={loadingBalance}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "10px 18px",
          }}
        >
          <FiRefreshCw
            size={14}
            style={{
              animation: loadingBalance ? "spin 1s linear infinite" : "none",
            }}
          />
          {loadingBalance ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* ── info note ── */}
      <div
        style={{
          padding: "12px 16px",
          background: "rgba(59,130,246,0.07)",
          borderLeft: "4px solid #3b82f6",
          borderRadius: 8,
          color: "#60a5fa",
          display: "flex",
          gap: 10,
          marginBottom: 28,
          fontSize: "0.85rem",
          lineHeight: 1.5,
        }}
      >
        <FiInfo size={16} style={{ flexShrink: 0, marginTop: 1 }} />
        <span>
          When you sell an NFT or win a refunded bid, the funds are stored here
          (not sent directly to your wallet). Use <strong>Withdraw</strong> to
          move them to MetaMask. Use{" "}
          <strong>"Pay from Platform Balance"</strong> in listing/auction/bid
          forms to reuse these funds without paying from MetaMask.
        </span>
      </div>

      {/* ── messages ── */}
      {error && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(239,68,68,0.1)",
            borderLeft: "4px solid #ef4444",
            borderRadius: 8,
            color: "#ff6b6b",
            display: "flex",
            gap: 10,
            marginBottom: 20,
            alignItems: "flex-start",
          }}
        >
          <FiAlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 14 }}>{error}</span>
        </div>
      )}
      {success && (
        <div
          style={{
            padding: "12px 16px",
            background: "rgba(34,197,94,0.1)",
            borderLeft: "4px solid #22c55e",
            borderRadius: 8,
            color: "#22c55e",
            display: "flex",
            gap: 10,
            marginBottom: 20,
            alignItems: "flex-start",
          }}
        >
          <FiCheck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <span style={{ fontSize: 14 }}>{success}</span>
        </div>
      )}

      {/* ── actions ── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        {/* Deposit */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h4
            style={{
              margin: "0 0 6px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FiArrowDownCircle size={18} color="#22c55e" /> Deposit ETH
          </h4>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)",
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            Add ETH from your MetaMask wallet to your platform balance for
            frictionless trading.
          </p>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <input
              type="number"
              step="0.001"
              min="0"
              placeholder="0.05"
              value={depositAmount}
              onChange={(e) => {
                setDepositAmount(e.target.value);
                clearMessages();
              }}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--glass-border-solid)",
                background: "var(--color-bg-primary)",
                color: "var(--color-text-primary)",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-secondary)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              ETH
            </span>
          </div>
          <button
            className="btn-primary"
            onClick={handleDeposit}
            disabled={txStatus !== "idle" || !depositAmount}
            style={{
              width: "100%",
              padding: "11px 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FiArrowDownCircle size={16} />
            {txStatus === "depositing"
              ? "Confirming Deposit…"
              : "Deposit to Platform"}
          </button>
        </div>

        {/* Withdraw */}
        <div className="glass-panel" style={{ padding: 24 }}>
          <h4
            style={{
              margin: "0 0 6px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <FiArrowUpCircle size={18} color="var(--color-accent)" /> Withdraw
            ETH
          </h4>
          <p
            style={{
              fontSize: "0.82rem",
              color: "var(--color-text-secondary)",
              marginBottom: 16,
              lineHeight: 1.5,
            }}
          >
            Move your platform balance back to your MetaMask wallet any time.
            Available:{" "}
            <strong style={{ color: "var(--color-accent)" }}>
              {balanceEth ?? "—"} ETH
            </strong>
          </p>
          <div style={{ position: "relative", marginBottom: 14 }}>
            <input
              type="number"
              step="0.001"
              min="0"
              placeholder="0.05"
              value={withdrawAmount}
              onChange={(e) => {
                setWithdrawAmount(e.target.value);
                clearMessages();
              }}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "var(--radius-md)",
                border: "1px solid var(--glass-border-solid)",
                background: "var(--color-bg-primary)",
                color: "var(--color-text-primary)",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            />
            <span
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--color-text-secondary)",
                fontSize: "0.85rem",
                fontWeight: 600,
              }}
            >
              ETH
            </span>
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <button
              className="btn-secondary"
              onClick={() => setWithdrawAmount(balanceNum.toFixed(6))}
              style={{ flex: 1, padding: "7px 0", fontSize: "0.82rem" }}
              disabled={!balanceNum}
            >
              Max
            </button>
          </div>
          <button
            className="btn-primary"
            onClick={handleWithdraw}
            disabled={txStatus !== "idle" || !withdrawAmount || !balanceNum}
            style={{
              width: "100%",
              padding: "11px 0",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: 8,
              background: "var(--color-accent)",
            }}
          >
            <FiArrowUpCircle size={16} />
            {txStatus === "withdrawing"
              ? "Confirming Withdrawal…"
              : "Withdraw to MetaMask"}
          </button>
        </div>
      </div>

      {/* ── how it works ── */}
      <div className="glass-panel" style={{ padding: 20, marginTop: 28 }}>
        <h4 style={{ margin: "0 0 14px", fontSize: "0.95rem" }}>
          💡 How Platform Balance Works
        </h4>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 14,
          }}
        >
          {[
            {
              icon: "💸",
              title: "NFT Sales",
              desc: "When someone buys your listed NFT, proceeds land here automatically.",
            },
            {
              icon: "🔄",
              title: "Bid Refunds",
              desc: "Outbid in an auction? Your bid amount is returned to your platform balance.",
            },
            {
              icon: "⚡",
              title: "Use in Actions",
              desc: "Pay listing fees, auction fees, and bids using this balance — no MetaMask popup for fees.",
            },
          ].map(({ icon, title, desc }) => (
            <div
              key={title}
              style={{
                padding: "14px 16px",
                background: "var(--color-bg-secondary)",
                borderRadius: 8,
              }}
            >
              <div style={{ fontSize: "1.5rem", marginBottom: 6 }}>{icon}</div>
              <p
                style={{
                  margin: "0 0 4px",
                  fontWeight: 600,
                  fontSize: "0.88rem",
                }}
              >
                {title}
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "0.8rem",
                  color: "var(--color-text-secondary)",
                  lineHeight: 1.5,
                }}
              >
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlatformWallet;
