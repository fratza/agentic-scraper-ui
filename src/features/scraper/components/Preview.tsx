import React, { useState, useEffect, useRef } from "react";
import "./Preview.css";
import DataTable from "./DataTable";
import apiService from "../../../services/api";
import { useMockData } from "../../../utils/environment";
import { mockProductData } from "../../../data/mockTableData";
import { PreviewProps } from "../../../model";

const Preview: React.FC<PreviewProps> = ({
  previewData,
  onScrape,
  scraping,
  progress,
  scrapedData,
  error,
  onClose,
  resetScraper,
}) => {
  // Check if we should use mock data
  const shouldUseMockData = useMockData();
  
  // Use mock data if in local environment and no real data is available
  const displayData = shouldUseMockData && !scrapedData ? mockProductData : scrapedData;
  
  const [copied, setCopied] = useState<boolean>(false);
  const [isScraping, setIsScraping] = useState<boolean>(false);
  const [sessionError, setSessionError] = useState<boolean>(false);
  const [actionInProgress, setActionInProgress] = useState<boolean>(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const filterUnwantedFields = (data: any): any => {
    if (!data) return data;

    if (Array.isArray(data)) {
      return data.map((item) => {
        if (item && typeof item === "object") {
          const { initiatedAt, uuid, ...rest } = item;
          return rest;
        }
        return item;
      });
    } else if (data && typeof data === "object") {
      const { initiatedAt, uuid, ...rest } = data;
      return rest;
    }

    return data;
  };

  // Get filtered preview data
  const getFilteredPreviewData = () => {
    if (previewData && previewData.sample) {
      return {
        ...previewData,
        sample: filterUnwantedFields(previewData.sample),
      };
    }
    return filterUnwantedFields(previewData);
  };

  const handleCopyJson = (): void => {
    const dataToCopy =
      previewData && previewData.sample
        ? filterUnwantedFields(previewData.sample)
        : filterUnwantedFields(previewData);
    const jsonText = JSON.stringify(dataToCopy, null, 2);
    navigator.clipboard
      .writeText(jsonText)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(() => {
        // Silently handle clipboard errors
      });
  };

  return (
    <div className="preview-container" ref={previewRef}>
      {!scraping && !scrapedData && (
        <>
          <div className="preview-header">
            <h2>Data to be extracted</h2>
            <button
              className={`btn-icon ${copied ? "success" : ""}`}
              onClick={handleCopyJson}
              title="Copy JSON"
            >
              {copied ? (
                <i className="fas fa-check"></i>
              ) : (
                <i className="fas fa-copy"></i>
              )}
            </button>
          </div>
          {previewData && previewData.url && (
            <div className="preview-url-container">
              <span className="url-label">URL: </span>
              <a
                href={previewData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="preview-url-link"
              >
                {previewData.url}
              </a>
            </div>
          )}
          {previewData && (previewData.sample || shouldUseMockData) ? (
            Array.isArray(previewData.sample) ? (
              <DataTable data={filterUnwantedFields(previewData.sample)} title="Preview Sample Data" />
            ) : typeof previewData.sample === "object" &&
              previewData.sample !== null ? (
              <DataTable data={[filterUnwantedFields(previewData.sample)]} title="Preview Sample Data" />
            ) : shouldUseMockData ? (
              // Use mock data when in local environment and no sample data is available
              <DataTable data={mockProductData.slice(0, 5)} title="Preview Sample Data (Mock)" />
            ) : (
              <pre id="json-preview">
                {JSON.stringify(
                  filterUnwantedFields(previewData.sample),
                  null,
                  2
                )}
              </pre>
            )
          ) : (
            <pre id="json-preview">
              {JSON.stringify(filterUnwantedFields(previewData || (shouldUseMockData ? mockProductData[0] : {})), null, 2)}
            </pre>
          )}
          <div className="preview-actions">
            <button
              className="btn-cancel"
              disabled={actionInProgress}
              onClick={async () => {
                try {
                  setActionInProgress(true);

                  // Send cancel action to backend - only passing the action
                  await apiService.submitPreviewData("cancel");

                  // Reset scraper state and close SSE connections
                  if (resetScraper) {
                    resetScraper();
                  }

                  // Close the modal after cancellation
                  if (onClose) {
                    onClose();
                  }
                } catch (error) {
                  // Handle cancel error silently
                  setSessionError(true);
                } finally {
                  setActionInProgress(false);
                }
              }}
            >
              <span>Cancel</span>
            </button>
            <button
              className="btn-scrape"
              disabled={actionInProgress}
              onClick={async () => {
                try {
                  setActionInProgress(true);
                  setIsScraping(true);
                  setSessionError(false);

                  // Send approve action to backend - only passing the action
                  await apiService.submitPreviewData("approve");

                  // Start the scraping process in the UI
                  // This will open the loading modal and set up SSE connection
                  // Get the resume link from the previewData if available
                  const resumeLink = previewData?.run_id ? 
                    `${process.env.REACT_APP_API_URL?.replace('/api', '')}/webhook/${previewData.run_id}` : 
                    '';
                  onScrape(resumeLink);
                } catch (error) {
                  // Handle approval error silently
                  setSessionError(true);
                  setIsScraping(false);
                  setActionInProgress(false);
                }
              }}
            >
              <span>
                {actionInProgress
                  ? "Processing..."
                  : isScraping
                  ? "Scraping..."
                  : "Scrape"}
              </span>
            </button>
          </div>
        </>
      )}

      {scraping && (
        <div className="progress-container">
          <div className="progress-label">
            <span>Scraping in progress</span>
            <span id="progress-percentage">{progress}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-container">
          <div className="error-message">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
          <button className="btn-retry" onClick={() => {
            // Get the resume link from the previewData if available
            const resumeLink = previewData?.run_id ? 
              `${process.env.REACT_APP_API_URL?.replace('/api', '')}/webhook/${previewData.run_id}` : 
              '';
            onScrape(resumeLink);
          }}>
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      )}

      {displayData && (
        <>
          <div className="preview-header">
            <h2>Scraped Data Results</h2>
            <button
              className="btn-icon"
              onClick={() => {
                // Download CSV functionality
                const keys = Object.keys(displayData[0] || {}).filter(
                  (key) => key.toLowerCase() !== "uuid" && key !== "id"
                );

                // Create CSV header row
                const header = keys
                  .map((key) => {
                    return key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/_/g, " ")
                      .split(" ")
                      .map(
                        (word) =>
                          word.charAt(0).toUpperCase() +
                          word.slice(1).toLowerCase()
                      )
                      .join(" ");
                  })
                  .join(",");

                // Create CSV rows from data
                const rows = displayData
                  .map((item) => {
                    return keys
                      .map((key) => {
                        const value = item[key];
                        if (value === null || value === undefined) {
                          return "";
                        } else if (typeof value === "object") {
                          return `"${JSON.stringify(value).replace(
                            /"/g,
                            '""'
                          )}"`;
                        } else if (typeof value === "string") {
                          return `"${value.replace(/"/g, '""')}"`;
                        } else {
                          return value;
                        }
                      })
                      .join(",");
                  })
                  .join("\n");

                // Combine header and rows
                const csv = `${header}\n${rows}`;

                // Create download link
                const blob = new Blob([csv], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);
                link.setAttribute("download", "scraped_data.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              title="Download CSV"
            >
              <i className="fas fa-download"></i>
            </button>
          </div>
          <DataTable data={displayData as any[]} title="Scraped Data Results" />
          <div className="preview-actions">
            <button
              className="btn-cancel"
              onClick={() => {
                if (resetScraper) {
                  resetScraper();
                }
                if (onClose) {
                  onClose();
                }
              }}
            >
              <span>Back to Main Page</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Preview;
