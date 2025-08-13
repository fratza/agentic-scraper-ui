import React from "react";
import Link from "./common/Link";
import "./Footer.css";

const Footer: React.FC = () => {
  return (
    <footer>
      <div className="footer-content">
        <div className="footer-section about">
          <h3>NeuroScrape</h3>
          <p>
            Intelligent web scraping solution powered by AI to extract, monitor, and
            analyze data from any website with ease.
          </p>
          <div className="social-links">
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <i className="pi pi-twitter"></i>
            </a>
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
              <i className="pi pi-github"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <i className="pi pi-linkedin"></i>
            </a>
          </div>
        </div>

        <div className="footer-section links">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/templates">Templates</Link></li>
            <li><Link to="/monitoring">Monitoring</Link></li>
            <li><Link to="/docs">Documentation</Link></li>
          </ul>
        </div>

        <div className="footer-section resources">
          <h3>Resources</h3>
          <ul>
            <li><Link to="/api-docs">API Documentation</Link></li>
            <li><Link to="/tutorials">Tutorials</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
            <li><Link to="/pricing">Pricing</Link></li>
          </ul>
        </div>

        <div className="footer-section contact">
          <h3>Contact Us</h3>
          <p><i className="pi pi-envelope"></i> support@neuroscrape.com</p>
          <p><i className="pi pi-phone"></i> +1 (555) 123-4567</p>
          <p><i className="pi pi-map-marker"></i> San Francisco, CA</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Ncompass-Tv. All rights reserved.</p>
        <div className="footer-legal">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms of Service</Link>
          <Link to="/cookies">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
