import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import ExtractedDataTable from "../features/scraper/components/ExtractedDataTable";
import { useScraperContext } from "../context/ScraperContext";
import "../styles/TemplatePage.css";

// Import mock data for development/testing
import { mockTableData } from "../features/scraper/data/mockTableData";

const TemplatePage: React.FC = () => {
  const { extractedData, loading, resetScraper } = useScraperContext();
  const [templateData, setTemplateData] = useState<any>(null);

  // Process and use mock data when no real data is available
  useEffect(() => {
    if (!extractedData || (Array.isArray(extractedData) && extractedData.length === 0)) {
      console.log('Using mock data for template page');
      setTemplateData(mockTableData);
    } else {
      // Process the extracted data to ensure it's in the right format
      console.log('Processing extracted data:', extractedData);
      
      // Handle different possible data structures
      let processedData;
      
      if (typeof extractedData === 'string') {
        // If data is a JSON string, parse it
        try {
          processedData = JSON.parse(extractedData);
        } catch (error) {
          console.error('Error parsing JSON data:', error);
          processedData = extractedData;
        }
      } else {
        processedData = extractedData;
      }
      
      // Handle nested data structures (data property commonly used in API responses)
      if (processedData && processedData.data) {
        processedData = processedData.data;
      }
      
      // Ensure data is an array for the table
      if (!Array.isArray(processedData)) {
        if (typeof processedData === 'object' && processedData !== null) {
          // If it's a single object, wrap it in an array
          processedData = [processedData];
        } else {
          // If it's not an object or array, use mock data
          console.warn('Extracted data is not in a usable format, using mock data');
          processedData = mockTableData;
        }
      }
      
      // Add unique IDs if they don't exist
      processedData = processedData.map((item: any, index: number) => {
        return { ...item, id: item.id || item.uuid || `row-${index}` };
      });
      
      setTemplateData(processedData);
    }
  }, [extractedData]);

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
              Data Results
            </h2>
            {loading && !templateData ? (
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
            ) : templateData &&
              (Array.isArray(templateData) ||
                typeof templateData === "object") ? (
              <motion.div
                className="data-table-wrapper"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <ExtractedDataTable
                  extractedData={templateData}
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
