import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { ethers } from "ethers";
import { API_BASE_URL } from "../utils/constants";

const AuthContext = createContext();
const API_URL = `${API_BASE_URL}/auth`;

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  // --- Axios Config ---
  const api = axios.create({ baseURL: API_URL });

  api.interceptors.request.use((config) => {
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Load User on Init
  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get("/me");
          setUser(res.data.data);
        } catch (error) {
          console.error("Token invalid or expired", error);
          logout();
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, [token]);

  const handleAuthSuccess = (newToken, userData) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // --- EMAIL / OTP FLOWS ---

  const loginEmail = async (email, password) => {
    const res = await api.post("/login-email", { email, password });
    handleAuthSuccess(res.data.token, res.data.data);
  };

  const signupInitiate = async (email) => {
    await api.post("/signup/initiate", { email });
  };

  const signupVerify = async (email, otp, username, password) => {
    const res = await api.post("/signup/verify", {
      email,
      otp,
      username,
      password,
    });
    handleAuthSuccess(res.data.token, res.data.data);
  };

  // --- WEB3 (METAMASK) FLOWS ---

  // Helper: Request signature via window.ethereum
  const requestWeb3Signature = async () => {
    if (!window.ethereum)
      throw new Error(
        "MetaMask is not installed. Please install it to continue.",
      );
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // Get nonce from backend
    const nonceRes = await api.get(`/nonce/${address}`);
    const message = nonceRes.data.data.message;

    // Sign message
    const signature = await signer.signMessage(message);
    return { address, signature };
  };

  const metamaskLogin = async () => {
    const { address, signature } = await requestWeb3Signature();
    const res = await api.post("/metamask/login", { address, signature });
    handleAuthSuccess(res.data.token, res.data.data);
  };

  const metamaskSignup = async (email, username) => {
    const { address, signature } = await requestWeb3Signature();
    const res = await api.post("/metamask/signup", {
      address,
      signature,
      email,
      username,
    });
    handleAuthSuccess(res.data.token, res.data.data);
  };

  // Link a MetaMask wallet to an existing email account
  const linkWallet = async () => {
    if (!window.ethereum)
      throw new Error(
        "MetaMask is not installed. Please install it to continue.",
      );

    // Just get the wallet address — no signature needed, JWT already proves identity
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const address = await signer.getAddress();

    // Send address to backend to link to the current account
    const res = await api.post("/link-wallet", { address });

    // Update both the JWT token and user object so activity section re-fetches
    handleAuthSuccess(res.data.token, res.data.data);
    return res.data.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        loginEmail,
        signupInitiate,
        signupVerify,
        metamaskLogin,
        metamaskSignup,
        linkWallet,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
