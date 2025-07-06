import React, { useEffect, useState } from "react";
import Hero from "../components/Hero";
import ScraperForm from "../features/scraper/components/ScraperForm";
import Preview from "../features/scraper/components/Preview";
import ScrapedDataTable from "../features/scraper/components/ScrapedDataTable";
import useScraper from "../features/scraper/hooks/useScraper";
import Modal from "../components/Modal";
import Loader from "../components/Loader";
import "../styles/preview-loading.css";

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

  // Reset loading results when scraping is complete or there's an error
  useEffect(() => {
    if (scrapedData || error) {
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
              <div className="loading-spinner"></div>
              <h3>Loading results...</h3>
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

          {/* Show scraped data table */}
          {scrapedData && <ScrapedDataTable scrapedData={scrapedData} />}

          {/* Modal for preview */}
          <Modal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
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
                onClose={() => setIsModalOpen(false)}
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
