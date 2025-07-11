import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useScraperContext } from "../context/ScraperContext";
import DataTable from "../features/scraper/components/DataTable";
import "../styles/TemplatePage.css";

const TemplatePage: React.FC = () => {
  const { resetScraper, extractedData } = useScraperContext();
  const [templateData, setTemplateData] = useState<any[] | null>(null);

  // Use extracted data when available
  useEffect(() => {
    console.log("Extracted data in TemplatePage:", extractedData);
    if (extractedData) {
      // Handle both array and object formats
      if (Array.isArray(extractedData)) {
        setTemplateData(extractedData);
      } else if (typeof extractedData === 'object') {
        // If it's an object with data property that's an array
        const extractedDataObj = extractedData as Record<string, any>;
        if (extractedDataObj.data && Array.isArray(extractedDataObj.data)) {
          setTemplateData(extractedDataObj.data);
        } else {
          // If it's a single object, wrap it in an array
          setTemplateData([extractedData]);
        }
      }
    } else {
      // No data available
      setTemplateData(null);
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
              Template Content
            </h2>
            <Card className="info-card">
              <h3>Template Page</h3>
              <p>
                This page displays a preview of the data table with sample data.
              </p>

              {templateData && templateData.length > 0 ? (
                <div className="data-preview-container">
                  <DataTable 
                    data={templateData as any[]} 
                    title="Data Preview" 
                    cellClassName="table-text"
                    headerClassName="table-header-text"
                  />
                </div>
              ) : (
                <p>No data available. Please run a scraper to extract data.</p>
              )}

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
