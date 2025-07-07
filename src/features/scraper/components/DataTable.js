import React from 'react';
import './DataTable.css';

const DataTable = ({ data, title }) => {
  // If data is empty or null, return null
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return null;
  }

  // Format the data for display
  const formatValue = (value) => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "boolean") {
      return value ? "✓" : "✗";
    }

    if (typeof value === "object") {
      return <pre>{JSON.stringify(value, null, 2)}</pre>;
    }

    return String(value);
  };

  // Determine columns from the first item in the array
  const getHeaders = () => {
    const firstItem = Array.isArray(data) ? data[0] : data;
    return Object.keys(firstItem).map((key) => (
      <th key={key}>{key}</th>
    ));
  };

  // Prepare data for the table
  const tableData = Array.isArray(data) ? data : [data];

  return (
    <div className="data-table-container">
      {title && <h3>{title}</h3>}
      <div className="table-responsive">
        <table className="data-table">
          <thead>
            <tr>{getHeaders()}</tr>
          </thead>
          <tbody>
            {tableData.map((item, index) => (
              <tr key={index}>
                {Object.keys(item).map((key) => (
                  <td key={key}>{formatValue(item[key])}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
