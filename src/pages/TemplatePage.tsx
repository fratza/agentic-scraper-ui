import React from "react";
import { motion } from "framer-motion";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useScraperContext } from "../context/ScraperContext";
import "../styles/TemplatePage.css";

const TemplatePage: React.FC = () => {
  const { resetScraper } = useScraperContext();

  // Handle navigation back to main page
  const handleBackToMain = (): void => {
    resetScraper();
    window.location.href = "/";
  };

  return (
    <>
      {/* Skip link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <motion.div
        className="template-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          <h1 className="page-title" id="main-content" tabIndex={-1}>
            Data Results Table
          </h1>

          <section className="content-section" aria-labelledby="intro-heading">
            <Card className="intro-card">
              <h2 id="intro-heading">Welcome to the Data Results Page</h2>
              <p>This page displays the data results from the scraper.</p>
              <div className="card-actions">
                <Button
                  icon="pi pi-refresh"
                  label="Refresh Data"
                  className="btn btn-primary"
                  onClick={resetScraper}
                  aria-label="Refresh data"
                />
              </div>
            </Card>
          </section>

          <section
            className="content-section"
            aria-labelledby="data-heading"
            aria-live="polite"
          >
            <h2 id="data-heading" className="sr-only">
              Template Content
            </h2>
            <Card className="info-card">
              <h3>Template Page</h3>
              <p>This is a template page. The data table has been removed as requested.</p>
              <p>You can use this page as a starting point for new features or components.</p>
              <div className="card-actions">
                <Button
                  icon="pi pi-search"
                  label="Start New Scrape"
                  className="btn btn-primary"
                  onClick={() => (window.location.href = "/")}
                  aria-label="Start new scrape"
                />
              </div>
            </Card>
          </section>

          <div className="page-actions">
            <Button
              icon="pi pi-arrow-left"
              label="Back to Home"
              className="btn btn-secondary"
              onClick={handleBackToMain}
              aria-label="Navigate back to home page"
            />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default TemplatePage;
