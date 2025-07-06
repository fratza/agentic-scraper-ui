import React from "react";
import "./ScrapedDataTable.css";

const ScrapedDataTable = ({ scrapedData }) => {
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

  // Get keys from the first data item
  const keys = Object.keys(dataArray[0]);

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
  const formatCellValue = (value) => {
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
    } else {
      return value;
    }
  };

  return (
    <div className="scraped-data-table-container fade-in">
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
                  <td key={`${index}-${key}`}>{formatCellValue(item[key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScrapedDataTable;
