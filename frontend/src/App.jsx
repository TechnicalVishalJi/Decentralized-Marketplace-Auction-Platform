import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Footer from "./components/Footer/Footer";
import Home from "./pages/Home/Home";
import Explore from "./pages/Explore/Explore";
import Create from "./pages/Create/Create";
import Auth from "./pages/Auth/Auth";
import About from "./pages/About/About";

function App() {
  return (
    <Router>
      <div
        className="app-container"
        style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Navbar />

        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/create" element={<Create />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
