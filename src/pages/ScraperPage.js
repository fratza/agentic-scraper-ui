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
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const handleStartScraping = (resumeLink) => {
    setIsModalOpen(false);
    setShowLoadingResults(true);
    startScraping(resumeLink);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    
    if (loading || (!scraping && !scrapedData)) {
      resetScraper();
    }
  };

  useEffect(() => {
    if (scrapedData) {
      setShowLoadingResults(false);
      // Use history API for client-side navigation instead of full page reload
      window.history.pushState({}, '', '/template');
      // Dispatch a custom event to notify the router of the navigation
      window.dispatchEvent(new CustomEvent('locationchange', { detail: '/template' }));
    } else if (error) {
      setShowLoadingResults(false);
    }
  }, [scrapedData, error]);

  return (
    <div className={`app ${!pageLoading ? "fade-in" : ""}`}>
      <section className="scraper-section">
        <div className="container">
          <Hero />

          {!scrapedData && !showLoadingResults && !scraping && (
            <ScraperForm
              onSubmit={(data) => {
                handleFormSubmit(data);
                setIsModalOpen(true);
              }}
            />
          )}

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
