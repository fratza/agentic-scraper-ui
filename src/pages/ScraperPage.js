import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import ScraperForm from '../features/scraper/components/ScraperForm';
import Preview from '../features/scraper/components/Preview';
import useScraper from '../features/scraper/hooks/useScraper';
import Modal from '../components/Modal';
import Loader from '../components/Loader';
import '../styles/preview-loading.css';

const ScraperPage = () => {
  const [pageLoading, setPageLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    loading,
    previewData,
    scrapedData,
    scraping,
    progress,
    error,
    handleFormSubmit,
    startScraping
  } = useScraper();

  useEffect(() => {
    // Hide loader after page load
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`app ${!pageLoading ? 'fade-in' : ''}`}>
      <section className="scraper-section">
        <div className="container">
          <Hero />
          <ScraperForm onSubmit={(data) => {
            handleFormSubmit(data);
            setIsModalOpen(true);
          }} />
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
                onScrape={startScraping}
                scraping={scraping}
                progress={progress}
                scrapedData={scrapedData}
                error={error}
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
