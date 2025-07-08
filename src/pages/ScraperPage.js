import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import useScraper from '../features/scraper/hooks/useScraper';
import Hero from '../components/Hero';
import ScraperForm from '../features/scraper/components/ScraperForm';
import Preview from '../features/scraper/components/Preview';
import ExtractedDataTable from '../features/scraper/components/ExtractedDataTable';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import '../styles/App.css';
import '../styles/preview-loading.css';
import '../styles/loading-results.css';

const ScraperPage = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showLoadingResults, setShowLoadingResults] = useState(false);
  const {
    loading,
    previewData,
    scrapedData,
    scraping,
    progress,
    error,
    handleFormSubmit,
    startScraping,
    resetScraper,
  } = useScraper();

  useEffect(() => {
    // Hide loader after page load
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Handle scraping start - close modal and show loading results
  const handleStartScraping = (resumeLink) => {
    setIsModalOpen(false); // Close the modal
    setShowLoadingResults(true); // Show loading results message
    startScraping(resumeLink); // Start the scraping process
  };

  // Handle modal close - reset form stack and close SSE connection
  const handleModalClose = () => {
    setIsModalOpen(false);

    // Always reset when modal is closed during preview loading
    // Only avoid resetting if we're actively scraping or have scraped data
    if (loading || (!scraping && !scrapedData)) {
      resetScraper(); // This will close SSE connections
    }
  };

  // Reset loading results when scraping is complete or there's an error
  // Navigate to data results page when scraping is complete
  useEffect(() => {
    if (scrapedData) {
      setShowLoadingResults(false);
      // Navigate to the data results page
      window.location.href = '/extracted-data';
    } else if (error) {
      setShowLoadingResults(false);
    }
  }, [scrapedData, error]);

  return (
    <div className={`app ${!pageLoading ? "fade-in" : ""}`}>
      <section className="scraper-section">
        <div className="container">
          <Hero />

          {/* Only show the form if we're not showing results or loading */}
          {!scrapedData && !showLoadingResults && !scraping && (
            <ScraperForm
              onSubmit={(data) => {
                handleFormSubmit(data);
                setIsModalOpen(true);
              }}
            />
          )}

          {/* Show loading results message */}
          {(showLoadingResults || scraping) && !scrapedData && (
            <div className="loading-results-container">
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <div className="loading-spinner-inner"></div>
              </div>
              <h3>Processing Your Request</h3>
              <p className="loading-message">
                Scraping data from the source and analyzing results...
              </p>

              <div className="loading-progress">
                <div
                  className="loading-progress-bar"
                  style={{ width: `${progress || 10}%` }}
                ></div>
              </div>

              <div className="loading-status">
                {progress < 30 && "Initializing scraper..."}
                {progress >= 30 && progress < 60 && "Extracting data..."}
                {progress >= 60 && progress < 90 && "Processing results..."}
                {progress >= 90 && "Finalizing..."}
              </div>
            </div>
          )}

          {/* Show error message if there is one */}
          {error && (
            <div className="error-container">
              <div className="error-message">
                <i className="fas fa-exclamation-circle"></i>
                <span>{error}</span>
              </div>
              <button className="btn-retry" onClick={() => resetScraper()}>
                <i className="fas fa-redo"></i> Try Again
              </button>
            </div>
          )}

          {/* Data will be shown on the dedicated page */}

          {/* Modal for preview */}
          <Modal
            isOpen={isModalOpen}
            onClose={handleModalClose}
            title="Preview Results"
          >
            {loading ? (
              <div className="preview-loading-container">
                <div className="preview-loading-spinner">
                  <i className="fas fa-spinner fa-spin"></i>
                </div>
                <p>Loading preview data from source...</p>
              </div>
            ) : previewData ? (
              <Preview
                previewData={previewData}
                onScrape={handleStartScraping}
                scraping={scraping}
                progress={progress}
                scrapedData={scrapedData}
                error={error}
                onClose={handleModalClose}
                resetScraper={resetScraper}
              />
            ) : error ? (
              <div className="preview-error-container">
                <div className="preview-error-icon">
                  <i className="fas fa-exclamation-circle"></i>
                </div>
                <p>{error}</p>
              </div>
            ) : null}
          </Modal>
        </div>
      </section>
    </div>
  );
};

export default ScraperPage;
