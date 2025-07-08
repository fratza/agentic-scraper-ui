import React from "react";
import "./Hero.css";
import '../styles/global.css';

const Hero = () => {
  return (
    <section className="hero-section flex-center text-center" id="home">
      <div className="container">
        <h1>From Idea to Data</h1>
        <p>Speak your intent, get structured results.</p>
      </div>
    </section>
  );
};

export default Hero;
