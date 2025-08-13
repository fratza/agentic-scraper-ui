import React, { useState, useEffect, useRef } from "react";
import Link from "./common/Link";
import "./Header.css";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [currentPath, setCurrentPath] = useState<string>(
    typeof window !== "undefined" ? window.location.pathname : "/",
  );
  const menuRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);

  // Listen for route changes
  useEffect(() => {
    const handleLocationChange = (): void => {
      setCurrentPath(window.location.pathname);
    };

    // Set initial path
    setCurrentPath(window.location.pathname);

    // Listen for location changes
    window.addEventListener("locationchange", handleLocationChange);
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("locationchange", handleLocationChange);
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPath]);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={isMenuOpen ? "menu-open" : ""}>
      <div className="container">
        <Link
          to="/"
          className="logo"
          onClick={(e) => {
            console.log("Logo clicked, navigating to home page");
            setIsMenuOpen(false);
            // Explicitly navigate to ensure routing works
            window.history.pushState({}, "", "/");
            window.dispatchEvent(
              new CustomEvent("locationchange", { detail: "/" }),
            );
          }}
        >
          <span>Neuro</span>Scrape
        </Link>

        <button
          ref={menuButtonRef}
          className={`menu-toggle ${isMenuOpen ? "active" : ""}`}
          onClick={toggleMenu}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-controls="main-navigation"
        >
          <span className="menu-icon"></span>
        </button>

        <nav
          id="main-navigation"
          ref={menuRef}
          className={isMenuOpen ? "open" : ""}
          aria-label="Main navigation"
        >
          <ul>
            <li>
              <a
                href="/dashboard"
                className={currentPath === "/dashboard" ? "active" : ""}
                onClick={(e) => {
                  e.preventDefault();
                  setIsMenuOpen(false);
                  window.history.pushState({}, "", "/dashboard");
                  window.dispatchEvent(
                    new CustomEvent("locationchange", { detail: "/dashboard" }),
                  );
                }}
              >
                Dashboard
              </a>
            </li>
            <li>
              <Link
                to="/templates"
                activeClassName="active"
                onClick={() => setIsMenuOpen(false)}
              >
                Templates
              </Link>
            </li>
            <li>
              <Link
                to="/monitoring"
                activeClassName="active"
                onClick={() => setIsMenuOpen(false)}
              >
                Monitoring
              </Link>
            </li>
            <li className="nav-divider"></li>
            <li>
              <Link
                to="/login"
                className="login-button"
                onClick={() => setIsMenuOpen(false)}
              >
                Login
              </Link>
            </li>
            <li>
              <Link
                to="/signup"
                className="signup-button"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign Up
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;
