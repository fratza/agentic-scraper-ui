import React, { useState, useEffect, useRef } from 'react';
import './Preview.css';
import DataTable from './DataTable';

const Preview = ({ previewData, onScrape, scraping, progress, scrapedData, error }) => {
  const [copied, setCopied] = useState(false);
  const previewRef = useRef(null);

  useEffect(() => {
    // Scroll to preview when it appears
    if (previewData && previewRef.current) {
      setTimeout(() => {
        previewRef.current.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [previewData]);

  const handleCopyJson = () => {
    const jsonText = JSON.stringify(previewData, null, 2);
    navigator.clipboard.writeText(jsonText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="preview-container fade-in" ref={previewRef}>
      {!scraping && !scrapedData && (
        <>
          <div className="preview-header">
            <h2>Preview</h2>
            <button 
              className={`btn-icon ${copied ? 'success' : ''}`} 
              onClick={handleCopyJson} 
              title="Copy JSON"
            >
              {copied ? <i className="fas fa-check"></i> : <i className="fas fa-copy"></i>}
            </button>
          </div>
          <div className="preview-content">
            {Array.isArray(previewData) ? (
              <DataTable data={previewData} title="Preview Data" />
            ) : typeof previewData === 'object' && previewData !== null ? (
              <DataTable data={[previewData]} title="Preview Data" />
            ) : (
              <pre id="json-preview">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            )}
          </div>
          <div className="preview-actions">
            <button className="btn-scrape" onClick={onScrape}>
              <span>Scrape</span>
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
        <DataTable data={scrapedData} />
      )}
    </div>
  );
};

export default Preview;
