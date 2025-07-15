import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "primereact/button";
import { Card } from "primereact/card";

import { useScraperContext } from "../context/ScraperContext";
import DataTable from "../features/scraper/components/DataTable";
import { useMockData } from "../utils/environment";
import { mockTemplateData } from "../data/mockTableData";
import "../styles/TemplatePage.css";

// Helper function to convert data to CSV
const convertToCSV = (data: any[]): string => {
  if (!data || data.length === 0) return "";

  // Get all unique keys from all objects
  const keys = Array.from(
    new Set(
      data.flatMap((item) =>
        typeof item === "object" && item !== null ? Object.keys(item) : []
      )
    )
  );

  // Create header row
  const header = keys.join(",");

  // Create data rows
  const rows = data
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return "";
      }

      return keys
        .map((key) => {
          const value = item[key];
          if (value === null || value === undefined) {
            return "";
          }
          if (typeof value === "object") {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          if (typeof value === "string") {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",");
    })
    .join("\n");

  return `${header}\n${rows}`;
};

// Helper function to download CSV
const downloadCSV = (
  data: any[],
  filename: string = "extracted_data.csv"
): void => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const TemplatePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("data");

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };
  const {
    resetScraper,
    extractedData: rawExtractedData,
    originUrl,
  } = useScraperContext();

  // Type the extracted data to include _contentType
  const extractedData = rawExtractedData as
    | (any & { _contentType?: string })
    | null;
  // Check if we should use mock data
  const shouldUseMockData = useMockData();

  // Log extracted data for debugging
  useEffect(() => {
    console.log("Extracted data in TemplatePage:", extractedData);
  }, [extractedData]);

  // Process extracted data for table display and remove UUIDs
  const getTableData = () => {
    // Helper function to remove UUID from a single item
    const removeUuid = (item: any): any => {
      if (item === null || typeof item !== "object") {
        return item;
      }

      // Create a new object without the uuid field
      const { uuid, ...rest } = item;

      // Recursively process nested objects and arrays
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(rest)) {
        if (Array.isArray(value)) {
          result[key] = value.map((item) => removeUuid(item));
        } else if (value !== null && typeof value === "object") {
          result[key] = removeUuid(value);
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    // If we have real extracted data, process it
    if (extractedData) {
      // If it's already an array, process each item
      if (Array.isArray(extractedData)) {
        return extractedData.length > 0 ? extractedData.map(removeUuid) : null;
      }

      // If it's an object with data property that's an array
      if (typeof extractedData === "object" && extractedData !== null) {
        // Check for data property
        const dataObj = extractedData as Record<string, any>;

        if (dataObj.data && Array.isArray(dataObj.data)) {
          return dataObj.data.length > 0 ? dataObj.data.map(removeUuid) : null;
        }

        // Check for extractedData property
        if (dataObj.extractedData && Array.isArray(dataObj.extractedData)) {
          return dataObj.extractedData.length > 0
            ? dataObj.extractedData.map(removeUuid)
            : null;
        }
      }

      // If it's a plain object, wrap it in an array and remove UUID
      return [removeUuid(extractedData)];
    }

    // If we're in a local environment and have no real data, use mock data
    if (shouldUseMockData) {
      console.log("Using mock template data");
      return mockTemplateData;
    }

    return null;
  };

  const tableData = getTableData();
  // Use mock URL if in local environment and no real URL is available
  const displayUrl =
    originUrl || (shouldUseMockData ? "https://example.com/template" : null);

  // Check if the content type is XML
  const isXmlContent =
    extractedData?._contentType === "xml" ||
    extractedData?._contentType === "rss";

  // Define fixed headers for XML content
  const xmlHeaders = {
    title: "Title",
    date: "Date",
    image: "Image",
    description: "Description",
  };

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
            Scraped Data Results
          </h1>

          <section className="content-section" aria-labelledby="intro-heading">
            <Card className="intro-card">
              <h2 id="intro-heading">Scraped Data Results</h2>
              <p>
                View and manage the data extracted from your web scraping
                session.
              </p>
              <div className="card-actions">
                <Button
                  icon="pi pi-refresh"
                  label="Refresh Results"
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
            <Card className="info-card">
              <div className="card-tabs">
                <div className="tab-header">
                  <button
                    className={`tab-button ${
                      activeTab === "data" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("data")}
                  >
                    Data Results
                  </button>
                  <button
                    className={`tab-button ${
                      activeTab === "monitoring" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("monitoring")}
                  >
                    Monitoring
                  </button>
                </div>
                <div className="tab-content">
                  <div
                    className={`tab-pane ${
                      activeTab === "data" ? "active" : ""
                    }`}
                  >
                    {tableData ? (
                      <div className="data-preview-container">
                        <div className="data-table-header">
                          <div className="origin-url-container">
                            {displayUrl && (
                              <div className="origin-url">
                                <span>URL: </span>
                                <a
                                  href={displayUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title={displayUrl}
                                >
                                  {displayUrl}
                                </a>
                              </div>
                            )}
                          </div>
                          <div className="export-btn-container">
                            <Button
                              icon="pi pi-download"
                              label="Export"
                              className="btn btn-export"
                              onClick={() => downloadCSV(tableData)}
                              aria-label="Extract data as CSV"
                            />
                          </div>
                        </div>

                        <DataTable
                          data={tableData}
                          title={
                            <div className="data-title-container">
                              <div className="ed-label">
                                <span>Extracted Data Results:</span>
                              </div>
                            </div>
                          }
                          headers={isXmlContent ? xmlHeaders : undefined}
                          cellClassName="table-text"
                          headerClassName="table-header-text"
                        />
                      </div>
                    ) : (
                      <p>
                        No data found. Please run a new scrape to extract data.
                      </p>
                    )}
                  </div>

                  <div
                    className={`tab-pane ${
                      activeTab === "monitoring" ? "active" : ""
                    }`}
                  >
                    <div className="monitoring-placeholder">
                      <i
                        className="pi pi-chart-line"
                        style={{
                          fontSize: "2.5rem",
                          color: "var(--primary-color)",
                        }}
                      ></i>
                      <h3>Monitoring Dashboard</h3>
                      <p>
                        Monitoring features and analytics will be displayed
                        here.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card-actions mt-4">
                <div className="spacer"></div>
                <Button
                  icon="pi pi-search"
                  label="New Scrape"
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
              label="Back to Scraper"
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
