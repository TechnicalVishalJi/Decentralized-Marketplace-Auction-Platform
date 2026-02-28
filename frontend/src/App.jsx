import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Explore from "./pages/Explore/Explore";
import Dashboard from "./pages/Dashboard/Dashboard";
import Auth from "./pages/Auth/Auth";
import About from "./pages/About/About";
import Contact from "./pages/Contact/Contact";
import AuctionDetail from "./pages/Auction/AuctionDetail";
import ListingDetail from "./pages/Listing/ListingDetail";
import ScrollToTop from "./components/ScrollToTop";
import AIChatbot from "./components/AIChatbot/AIChatbot";

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div
        className="app-container"
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Navbar />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auction/:auctionId" element={<AuctionDetail />} />
            <Route path="/listing/:listingId" element={<ListingDetail />} />
          </Routes>
        </main>

        <AIChatbot />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
