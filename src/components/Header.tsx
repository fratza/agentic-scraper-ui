import React, { useState, useEffect } from "react";
import "./Header.css";

const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const handleScroll = (): void => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <header className={scrolled ? "scrolled" : ""}>
      <div className="container">
        <div className="logo" onClick={() => window.location.href = "/"} style={{ cursor: 'pointer' }}>
          <span>Neuro</span>Scrape
        </div>
        <nav>
          <ul>
            <li>
              <a href="/dashboard">Dashboard</a>
            </li>
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
