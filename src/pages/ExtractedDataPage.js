import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import ExtractedDataTable from '../features/scraper/components/ExtractedDataTable';
import { Button } from 'primereact/button';
import useScraper from '../features/scraper/hooks/useScraper';
import '../styles/ExtractedDataPage.css';

const ExtractedDataPage = () => {
  const { scrapedData: extractedData, resetScraper } = useScraper();
  
  // Redirect to home if no data is available
  useEffect(() => {
    if (!extractedData) {
      window.location.href = '/';
    }
  }, [extractedData]);

  const handleBackToMain = () => {
    resetScraper();
    window.location.href = '/';
  };

  if (!extractedData) {
    return null; // Don't render anything while redirecting
  }

  return (
    <motion.div
      className="extracted-data-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <div className="data-results-header">
          <Button 
            icon="pi pi-arrow-left" 
            label="Back to Main" 
            className="p-button-text" 
            onClick={handleBackToMain} 
          />
        </div>
        <ExtractedDataTable 
          extractedData={extractedData} 
          onBackToMain={handleBackToMain} 
        />
      </div>
    </motion.div>
  );
};

export default ExtractedDataPage;
