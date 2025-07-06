import React, { useState } from "react";
import "./ScrapedDataTable.css";
import { motion } from "framer-motion";

const ScrapedDataTable = ({ scrapedData, onBackToMain }) => {
  // Return null if no data is available
  if (!scrapedData || !scrapedData.data) {
    return null;
  }

  // Extract the data field from the scrapedData
  const dataToDisplay = scrapedData.data;

  // Check if data is an array
  const isDataArray = Array.isArray(dataToDisplay);

  // If data is not an array, wrap it in an array for consistent rendering
  const dataArray = isDataArray ? dataToDisplay : [dataToDisplay];

  // Return null if the array is empty
  if (dataArray.length === 0) {
    return null;
  }

  // Get keys from the first data item, excluding UUID
  const keys = Object.keys(dataArray[0]).filter(key => key.toLowerCase() !== 'uuid');

  // Format column header from camelCase or snake_case
  const formatColumnHeader = (key) => {
    return key
      .replace(/([A-Z])/g, " $1") // Insert space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter
      .join(" ");
  };

  // Format cell value based on type
  const formatCellValue = (key, value) => {
    if (typeof value === "boolean") {
      return (
        <i
          className={value ? "fas fa-check" : "fas fa-times"}
          style={{ color: value ? "#10b981" : "#ef4444" }}
        />
      );
    } else if (value === null || value === undefined) {
      return "-";
    } else if (typeof value === "object") {
      return JSON.stringify(value);
    } else if (typeof value === "string" && 
              (key.toLowerCase().includes('image') || 
               key.toLowerCase().includes('img') || 
               key.toLowerCase().includes('photo') || 
               value.match(/\.(jpeg|jpg|gif|png|webp)$/) || 
               value.startsWith('http') && value.includes('/image'))) {
      return <ImageWithToggle url={value} />;
    } else {
      return value;
    }
  };
  
  // Component to handle image URLs with show more/less toggle
  const ImageWithToggle = ({ url }) => {
    const [expanded, setExpanded] = useState(false);
    
    if (!url) return "-";
    
    const displayUrl = expanded ? url : url.substring(0, 50) + (url.length > 50 ? '...' : '');
    
    return (
      <div className="image-url-container">
        <span className="image-url">{displayUrl}</span>
        {url.length > 50 && (
          <button 
            className="toggle-btn" 
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show less' : 'Show more'}
          </button>
        )}
      </div>
    );
  };

  return (
    <motion.div 
      className="scraped-data-table-container fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>Scraped Data Results</h3>
      <div className="table-responsive">
        <table className="scraped-data-table">
          <thead>
            <tr>
              {keys.map((key) => (
                <th key={key}>{formatColumnHeader(key)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataArray.map((item, index) => (
              <tr key={index}>
                {keys.map((key) => (
                  <td key={`${index}-${key}`} className={key.toLowerCase().includes('description') ? 'description-cell' : ''}>
                    {formatCellValue(key, item[key])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="back-button-container">
        <button className="back-to-main-btn" onClick={onBackToMain}>
          <i className="fas fa-arrow-left"></i> Back to Main Page
        </button>
      </div>
    </motion.div>
  );
};

export default ScrapedDataTable;
