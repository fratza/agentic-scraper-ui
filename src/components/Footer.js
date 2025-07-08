import React from 'react';
import './Footer.css';
import '../styles/global.css';

const Footer = () => {
  return (
    <footer className="footer text-center">
      <div className="container">
        <p>&copy; {new Date().getFullYear()} Ncompass-Tv. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
