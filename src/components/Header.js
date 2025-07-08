import React, { useState, useEffect } from "react";
import "./Header.css";
import '../styles/global.css';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <header className={`header flex-center ${scrolled ? "scrolled" : ""}`}>
      <div className="container">
        <div className="logo">
          <span>Neuro</span>Scrape
        </div>
        <nav className="mobile-nav">
          <button className="hamburger-menu" onClick={toggleMenu}>
            <span className="bar"></span>
            <span className="bar"></span>
            <span className="bar"></span>
          </button>
          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li><a href="#login">Login</a></li>
            <li><a href="#signup">Signup</a></li>
          </ul>
        </nav>
        <nav>
          <ul>
            <li>
              <a href="#login">Login</a>
            </li>
            <li>
              <a href="#signup">Signup</a>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
