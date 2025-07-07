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
      .catch((err) => {
        console.error("Failed to copy: ", err);
      });
  };

  return (
    <div className="preview-container" ref={previewRef}>
      {!scraping && !scrapedData && (
        <>
          <div className="preview-header">
            <h2>Preview</h2>
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
          <div className="preview-content">
            {previewData && previewData.sample ? (
              Array.isArray(previewData.sample) ? (
                <DataTable data={filterInitiatedAt(previewData.sample)} title="Preview Data" />
              ) : typeof previewData.sample === "object" &&
                previewData.sample !== null ? (
                <DataTable data={[filterInitiatedAt(previewData.sample)]} title="Preview Data" />
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
          </div>
          <div className="preview-actions">
            <button
              className="btn-cancel"
              disabled={actionInProgress}
              onClick={async () => {
                try {
                  // Extract resume_link from previewData if it exists
                  const resume_link =
                    previewData && previewData.resume_link
                      ? previewData.resume_link
                      : null;

                  if (!resume_link) {
                    console.error("No resume_link available for cancel action");
                    return;
                  }

                  setActionInProgress(true);

                  // Send cancel action to backend
                  await apiService.handleScrapeAction(resume_link, "cancel");

                  // Reset scraper state and close SSE connections
                  if (resetScraper) {
                    resetScraper();
                  }
                  
                  // Close the modal after cancellation
                  if (onClose) {
                    onClose();
                  }
                } catch (error) {
                  console.error("Error cancelling scrape:", error);
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
                  // Extract resume_link from previewData if it exists
                  const resume_link =
                    previewData && previewData.resume_link
                      ? previewData.resume_link
                      : null;

                  if (!resume_link) {
                    console.error(
                      "No resume_link available for approve action"
                    );
                    return;
                  }

                  setActionInProgress(true);
                  setIsScraping(true);
                  setSessionError(false);

                  // Send approve action to backend
                  await apiService.handleScrapeAction(resume_link, "approve");

                  // Start the scraping process in the UI
                  onScrape(resume_link);
                } catch (error) {
                  console.error("Error approving scrape:", error);
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

      {scrapedData && <DataTable data={scrapedData} />}
    </div>
  );
};

export default Preview;
