import React, { useState } from "react";
import { FiMail, FiLock, FiUser, FiArrowRight } from "react-icons/fi";
import styles from "./Auth.module.css";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(isLogin ? "Logging in:" : "Registering:", formData);
    // Integration with backend /api/v1/auth happens here
  };

  return (
    <div className={`page-transition-enter-active ${styles.authPage}`}>
      <div className={styles.authContainer}>
        {/* Left Side: Dynamic Graphic / Branding */}
        <div className={styles.brandSide}>
          <div className={styles.brandContent}>
            <h2 className={styles.brandTitle}>
              Join the <span className="gradient-text">Crypto</span> ecosystem
            </h2>
            <p className={styles.brandText}>
              Connect your decentralized identity or create a standard account
              to start collecting extraordinary digital assets.
            </p>
          </div>

          <div className={styles.web3Connect}>
            <span className={styles.dividerText}>OR CONNECT WALLET</span>
            <button className={styles.metamaskBtn}>
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                alt="MetaMask"
                width="24"
                height="24"
              />
              Continue with MetaMask
            </button>
            <button className={styles.walletConnectBtn}>
              Continue with WalletConnect
            </button>
          </div>
        </div>

        {/* Right Side: Traditional Auth Form */}
        <div className={`glass-panel ${styles.formSide}`}>
          <div className={styles.formHeader}>
            <h3>{isLogin ? "Welcome Back" : "Create Account"}</h3>
            <p>
              {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
              <span
                className={styles.toggleLink}
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Sign up" : "Log in"}
              </span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className={styles.authForm}>
            {!isLogin && (
              <div className={styles.inputGroup}>
                <label>Username</label>
                <div className={styles.inputWrapper}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    type="text"
                    name="username"
                    placeholder="e.g. SatoshiNakamoto"
                    value={formData.username}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className={styles.inputGroup}>
              <label>Email Address</label>
              <div className={styles.inputWrapper}>
                <FiMail className={styles.inputIcon} />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label>Password</label>
              <div className={styles.inputWrapper}>
                <FiLock className={styles.inputIcon} />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className={`btn-primary ${styles.submitBtn}`}>
              {isLogin ? "Sign In" : "Create Account"} <FiArrowRight />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Auth;
