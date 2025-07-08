import React, { useState, useEffect, useRef } from "react";
import "./Preview.css";
import DataTable from "./DataTable";
import apiService from "../../../services/api";

const Preview = ({
  previewData,
  onScrape,
  scraping,
  progress,
  scrapedData,
  error,
  onClose,
  resetScraper,
}) => {
  const [copied, setCopied] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [sessionError, setSessionError] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);
  const previewRef = useRef(null);

  // No need to scroll to preview when in modal
  // Modal will be centered on screen

  // Filter out initiated_at field from preview data
  const filterInitiatedAt = (data) => {
    if (!data) return data;
    
    if (Array.isArray(data)) {
      return data.map(item => {
        if (item && typeof item === 'object') {
          const { initiated_at, ...rest } = item;
          return rest;
        }
        return item;
      });
    } else if (data && typeof data === 'object') {
      const { initiated_at, ...rest } = data;
      return rest;
    }
    
    return data;
  };
  
  // Get filtered preview data
  const getFilteredPreviewData = () => {
    if (previewData && previewData.sample) {
      return {
        ...previewData,
        sample: filterInitiatedAt(previewData.sample)
      };
    }
    return filterInitiatedAt(previewData);
  };
  
  const handleCopyJson = () => {
    const dataToCopy =
      previewData && previewData.sample ? filterInitiatedAt(previewData.sample) : filterInitiatedAt(previewData);
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
            <h2>Preview Scrape Data</h2>
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
          {previewData && previewData.sample ? (
            Array.isArray(previewData.sample) ? (
              <DataTable data={filterInitiatedAt(previewData.sample)} />
            ) : typeof previewData.sample === "object" &&
              previewData.sample !== null ? (
              <DataTable data={[filterInitiatedAt(previewData.sample)]} />
            ) : (
              <pre id="json-preview">
                {JSON.stringify(filterInitiatedAt(previewData.sample), null, 2)}
              </pre>
            )
          ) : (
            <pre id="json-preview">
              {JSON.stringify(filterInitiatedAt(previewData), null, 2)}
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
                  await apiService.handleScrapeAction("cancel");

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
                  await apiService.handleScrapeAction("approve");

                  // Start the scraping process in the UI without passing resume_link
                  onScrape();
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
          <button className="btn-retry" onClick={onScrape}>
            <i className="fas fa-redo"></i> Retry
          </button>
        </div>
      )}

      {scrapedData && (
        <>
          <div className="preview-header">
            <h2>Scraped Data Results</h2>
            <button
              className="btn-icon"
              onClick={() => {
                // Download CSV functionality
                const keys = Object.keys(scrapedData[0] || {}).filter(key => 
                  key.toLowerCase() !== 'uuid' && key !== 'id');
                
                // Create CSV header row
                const header = keys.map(key => {
                  return key
                    .replace(/([A-Z])/g, " $1")
                    .replace(/_/g, " ")
                    .split(" ")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(" ");
                }).join(',');
                
                // Create CSV rows from data
                const rows = scrapedData.map(item => {
                  return keys.map(key => {
                    const value = item[key];
                    if (value === null || value === undefined) {
                      return '';
                    } else if (typeof value === 'object') {
                      return `"${JSON.stringify(value).replace(/"/g, '""')}"`;  
                    } else if (typeof value === 'string') {
                      return `"${value.replace(/"/g, '""')}"`;  
                    } else {
                      return value;
                    }
                  }).join(',');
                }).join('\n');
                
                // Combine header and rows
                const csv = `${header}\n${rows}`;
                
                // Create download link
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.setAttribute('href', url);
                link.setAttribute('download', 'scraped_data.csv');
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              title="Download CSV"
            >
              <i className="fas fa-download"></i>
            </button>
          </div>
          <DataTable data={scrapedData} />
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
