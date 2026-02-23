import React, { useState } from "react";
import { FiMail, FiLock, FiUser, FiArrowRight, FiShield } from "react-icons/fi";
import styles from "./Auth.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Auth = () => {
  // "login" | "signup" | "otp" | "web3Email"
  const [authState, setAuthState] = useState("login");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    otp: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {
    loginEmail,
    signupInitiate,
    signupVerify,
    metamaskLogin,
    metamaskSignup,
  } = useAuth();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // clear error when typing
  };

  const submitLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginEmail(formData.email, formData.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const submitSignupInitiate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signupInitiate(formData.email);
      setAuthState("otp");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const submitOTPVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signupVerify(
        formData.email,
        formData.otp,
        formData.username,
        formData.password,
      );
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Invalid OTP code");
    } finally {
      setLoading(false);
    }
  };

  const handleWeb3Action = async (isSignupAttempt) => {
    setLoading(true);
    setError("");
    try {
      if (isSignupAttempt) {
        setAuthState("web3Email");
      } else {
        await metamaskLogin();
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
    } finally {
      setLoading(false);
    }
  };

  const submitWeb3Signup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await metamaskSignup(formData.email, formData.username);
      navigate("/dashboard");
    } catch (err) {
      setError(
        err.response?.data?.error || err.message || "Registration failed",
      );
    } finally {
      setLoading(false);
    }
  };

  // Switch between basic views safely
  const toggleMode = () => {
    setAuthState(authState === "login" ? "signup" : "login");
    setFormData({ username: "", email: "", password: "", otp: "" });
    setError("");
  };

  return (
    <div className={`page-transition-enter-active ${styles.authPage}`}>
      <div className={styles.authContainer}>
        {/* Left Side: Dynamic Graphic / Branding */}
        <div className={styles.brandSide}>
          <div className={styles.brandContent}>
            <h2 className={styles.brandTitle}>
              Enter the <span className="gradient-text">Crypto</span> ecosystem
            </h2>
            <p className={styles.brandText}>
              Connect your decentralized identity or create a standard secure
              account to start collecting extraordinary digital assets.
            </p>
          </div>

          <div className={styles.web3Connect}>
            <span className={styles.dividerText}>OR SECURE WALLET SIGN-IN</span>
            <button
              className={styles.metamaskBtn}
              onClick={() => handleWeb3Action(authState === "signup")}
              disabled={loading}
            >
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                alt="MetaMask"
                width="24"
                height="24"
              />
              {authState === "login"
                ? "Login with MetaMask"
                : "Signup with MetaMask"}
            </button>
          </div>
        </div>

        {/* Right Side: Dynamic Form State Machine */}
        <div className={`glass-panel ${styles.formSide}`}>
          <div className={styles.formHeader}>
            {authState === "login" && (
              <>
                <h3>Welcome Back</h3>
                <p>
                  Don't have an account?{" "}
                  <span className={styles.toggleLink} onClick={toggleMode}>
                    Create one
                  </span>
                </p>
              </>
            )}
            {authState === "signup" && (
              <>
                <h3>Create Account</h3>
                <p>
                  Already have an account?{" "}
                  <span className={styles.toggleLink} onClick={toggleMode}>
                    Log in
                  </span>
                </p>
              </>
            )}
            {authState === "otp" && (
              <>
                <h3>Verify Email</h3>
                <p>
                  We sent a 6-digit secure code to{" "}
                  <strong>{formData.email}</strong>. Entering this code will
                  verify your email and create your account.
                </p>
              </>
            )}
            {authState === "web3Email" && (
              <>
                <h3>Link Secure Identity</h3>
                <p>
                  Wallet connected! Please link an email address to finalize
                  your decentralized profile.
                </p>
              </>
            )}
          </div>

          {error && <div className={styles.errorMessage}>{error}</div>}

          {/* ------------- LOGIN FORM ------------- */}
          {authState === "login" && (
            <form onSubmit={submitLogin} className={styles.authForm}>
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
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary ${styles.submitBtn}`}
              >
                {loading ? "Authenticating..." : "Sign In"} <FiArrowRight />
              </button>
            </form>
          )}

          {/* ------------- SIGNUP EMAIL FORM ------------- */}
          {authState === "signup" && (
            <form onSubmit={submitSignupInitiate} className={styles.authForm}>
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
                    required
                  />
                </div>
              </div>
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
                    minLength={6}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary ${styles.submitBtn}`}
              >
                {loading ? "Sending OTP..." : "Continue"} <FiArrowRight />
              </button>
            </form>
          )}

          {/* ------------- OTP VERIFY FORM ------------- */}
          {authState === "otp" && (
            <form onSubmit={submitOTPVerify} className={styles.authForm}>
              <div className={styles.inputGroup}>
                <label>Secure 6-Digit Code</label>
                <div className={styles.inputWrapper}>
                  <FiShield className={styles.inputIcon} />
                  <input
                    type="text"
                    name="otp"
                    placeholder="123456"
                    value={formData.otp}
                    onChange={handleChange}
                    maxLength={6}
                    style={{
                      letterSpacing: "8px",
                      fontSize: "1.2rem",
                      textAlign: "center",
                      paddingLeft: "16px",
                    }}
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary ${styles.submitBtn}`}
              >
                {loading ? "Verifying..." : "Verify & Create Account"}{" "}
                <FiArrowRight />
              </button>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => setAuthState("signup")}
                disabled={loading}
              >
                Cancel & Go Back
              </button>
            </form>
          )}

          {/* ------------- WEB3 EMAIL LINK FORM ------------- */}
          {authState === "web3Email" && (
            <form onSubmit={submitWeb3Signup} className={styles.authForm}>
              <div className={styles.inputGroup}>
                <label>Link Email Address</label>
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
                <label>Username (Optional)</label>
                <div className={styles.inputWrapper}>
                  <FiUser className={styles.inputIcon} />
                  <input
                    type="text"
                    name="username"
                    placeholder="e.g. SatoshiNakamoto"
                    value={formData.username}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                className={`btn-primary ${styles.submitBtn}`}
              >
                {loading ? "Registering..." : "Finalize Profile"}{" "}
                <FiArrowRight />
              </button>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => setAuthState("signup")}
                disabled={loading}
              >
                Disconnect Wallet
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
