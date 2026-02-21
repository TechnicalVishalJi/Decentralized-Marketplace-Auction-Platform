import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { FiSearch, FiMenu, FiX, FiUser } from "react-icons/fi";
import styles from "./Navbar.module.css";

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const location = useLocation();

  // Handle transparent to glassmorphic transition on scroll
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // In future phase: redirect to /explore?search="..." or trigger API
      console.log("Searching for:", searchQuery);
    }
  };

  const navLinks = [
    { label: "Home", path: "/" },
    { label: "Explore", path: "/explore" },
    { label: "Create", path: "/create" },
    { label: "About", path: "/about" },
  ];

  return (
    <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}>
      {scrolled && (
        <>
          <div className={styles.sweepingLine}></div>
          <div className={styles.glassBackground}></div>
        </>
      )}

      <div className={`container ${styles.navContainer}`}>
        {/* LOGO */}
        <Link to="/" className={styles.logo}>
          <span className="gradient-text">Crypto</span>Market
        </Link>

        {/* DESKTOP SEARCH BAR */}
        <form onSubmit={handleSearchSubmit} className={styles.searchForm}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search NFTs, collections, or users..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* DESKTOP NAV LINKS */}
        <div className={styles.navLinks}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.navLink} ${location.pathname === link.path ? styles.active : ""}`}
            >
              {link.label}
            </Link>
          ))}

          <div className={styles.divider}></div>

          {/* LOGIN / AVATAR BUTTON */}
          {/* Will make dynamic with AuthContext later */}
          <Link
            to="/auth"
            className="btn-primary"
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <FiUser /> Login
          </Link>
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button
          className={styles.mobileMenuBtn}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
        </button>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      <div
        className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.mobileMenuOpen : ""}`}
      >
        <form onSubmit={handleSearchSubmit} className={styles.mobileSearchForm}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search..."
            className={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`${styles.mobileNavLink} ${location.pathname === link.path ? styles.active : ""}`}
            onClick={() => setMobileMenuOpen(false)}
          >
            {link.label}
          </Link>
        ))}

        <Link
          to="/auth"
          className={`btn-primary ${styles.mobileLoginBtn}`}
          onClick={() => setMobileMenuOpen(false)}
        >
          <FiUser /> Login
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
