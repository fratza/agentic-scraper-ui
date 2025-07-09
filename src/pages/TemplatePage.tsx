import React from "react";
import { motion } from "framer-motion";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import ExtractedDataTable from "../features/scraper/components/ExtractedDataTable";
import useScraper from "../features/scraper/hooks/useScraper";
import "../styles/TemplatePage.css";

const TemplatePage: React.FC = () => {
  const { extractedData, loading, resetScraper } = useScraper();
  
  // Debug log to check extractedData
  console.log("TemplatePage - extractedData:", extractedData);

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
            {/* Debug info */}
            <div style={{ display: 'none' }}>
              Has data: {extractedData ? 'Yes' : 'No'}, 
              Type: {extractedData ? typeof extractedData : 'N/A'}, 
              Is Array: {extractedData && Array.isArray(extractedData) ? 'Yes' : 'No'}, 
              Length: {extractedData && Array.isArray(extractedData) ? extractedData.length : 'N/A'}
            </div>
            <h2 id="data-heading" className="sr-only">
              Data Results
            </h2>
            {loading ? (
              <Card className="info-card">
                <div
                  className="loading-indicator"
                  role="status"
                  aria-live="assertive"
                >
                  <i className="pi pi-spin pi-spinner"></i>
                  <p>Loading data...</p>
                </div>
              </Card>
            ) : extractedData && (Array.isArray(extractedData) || typeof extractedData === 'object') ? (
              <motion.div
                className="data-table-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ExtractedDataTable
                  extractedData={extractedData}
                  onBackToMain={handleBackToMain}
                />
              </motion.div>
            ) : (
              <Card className="info-card">
                <p>No data available. Please run a scraper to get data.</p>
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
            )}
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
