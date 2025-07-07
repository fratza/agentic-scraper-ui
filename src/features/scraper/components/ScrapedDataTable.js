import React, { useState, useEffect } from "react";
import "./ScrapedDataTable.css";
import { motion } from "framer-motion";

// PrimeReact imports
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";

// Import PrimeReact styles
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const ScrapedDataTable = ({ scrapedData, onBackToMain }) => {
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Initialize filters and process data when component mounts or scrapedData changes
  useEffect(() => {
    // Return early if no data is available
    if (!scrapedData || !scrapedData.data) {
      setLoading(false);
      return;
    }

    // Extract the data field from the scrapedData
    const dataToDisplay = scrapedData.data;

    // Check if data is an array
    const isDataArray = Array.isArray(dataToDisplay);

    // If data is not an array, wrap it in an array for consistent rendering
    const dataArray = isDataArray ? dataToDisplay : [dataToDisplay];

    // Return if the array is empty
    if (dataArray.length === 0) {
      setLoading(false);
      return;
    }
    
    // Process data for the table
    const processedData = dataArray.map((item, index) => {
      return { ...item, id: item.uuid || `row-${index}` };
    });
    
    setTableData(processedData);
    
    // Initialize filters
    initFilters();
    setLoading(false);
  }, [scrapedData]);
  
  // Get keys from the first data item, excluding UUID
  const keys = tableData.length > 0 ? 
    Object.keys(tableData[0]).filter(key => key.toLowerCase() !== 'uuid' && key !== 'id') : 
    [];

  // Format column header from camelCase or snake_case
  const formatColumnHeader = (key) => {
    return key
      .replace(/([A-Z])/g, " $1") // Insert space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter
      .join(" ");
  };
  
  // Initialize filters for all columns
  const initFilters = () => {
    const initFilters = {};
    
    if (tableData.length > 0) {
      Object.keys(tableData[0]).forEach(key => {
        initFilters[key] = { value: null, matchMode: FilterMatchMode.CONTAINS };
      });
    }
    
    setFilters(initFilters);
  };
  
  // Handle global filter change
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    
    // Apply global filter to all columns
    keys.forEach(key => {
      _filters[key] = { value, matchMode: FilterMatchMode.CONTAINS };
    });
    
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  // Function to download data as CSV
  const downloadCSV = () => {
    // Get keys from the first data item, excluding UUID and ID
    const csvKeys = keys;
    
    // Create CSV header row
    const header = csvKeys.map(key => formatColumnHeader(key)).join(',');
    
    // Create CSV rows from data
    const rows = tableData.map(item => {
      return csvKeys.map(key => {
        const value = item[key];
        // Format the value for CSV (handle strings with commas, quotes, etc.)
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'object') {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        } else if (typeof value === 'string') {
          return `"${value.replace(/"/g, '""')}"`;
        } else {
          return value;
        }
      }).join(',');
    }).join('\n');
    
    // Combine header and rows
    const csv = `${header}\n${rows}`;
    
    // Create a blob and download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'scraped_data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Format cell value based on type for PrimeReact DataTable
  const formatCellValue = (rowData, column) => {
    const key = column.field;
    const value = rowData[key];
    
    if (typeof value === "boolean") {
      return (
        <i
          className={value ? "pi pi-check" : "pi pi-times"}
          style={{ color: value ? "#10b981" : "#ef4444", fontSize: '1.2rem' }}
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
          <Button 
            label={expanded ? 'Show less' : 'Show more'}
            size="small"
            text
            onClick={() => setExpanded(!expanded)}
          />
        )}
      </div>
    );
  };
  
  // Header template for the DataTable with search functionality
  const renderHeader = () => {
    return (
      <div className="flex justify-content-between align-items-center">
        <h3 className="m-0">Scraped Data Results</h3>
        <div className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText 
            value={globalFilterValue} 
            onChange={onGlobalFilterChange} 
            placeholder="Search..." 
          />
        </div>
      </div>
    );
  };
  
  const header = renderHeader();

  // If no data is available, return null
  if (!tableData.length) {
    return null;
  }
  
  return (
    <motion.div 
      className="scraped-data-table-container fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="prime-datatable-wrapper">
        <DataTable 
          value={tableData} 
          paginator 
          rows={10} 
          rowsPerPageOptions={[10, 25, 50]} 
          dataKey="id"
          filters={filters}
          filterDisplay="menu"
          loading={loading}
          responsiveLayout="scroll"
          emptyMessage="No data found."
          header={header}
          scrollable 
          scrollHeight="60vh"
          stripedRows
          resizableColumns 
          columnResizeMode="fit"
          className="p-datatable-gridlines"
        >
          {keys.map((key) => (
            <Column 
              key={key} 
              field={key} 
              header={formatColumnHeader(key)} 
              sortable 
              filter 
              filterPlaceholder={`Search ${formatColumnHeader(key)}`}
              body={(rowData) => formatCellValue(rowData, { field: key })}
              style={{ minWidth: '12rem' }}
              className={key.toLowerCase().includes('description') ? 'description-column' : ''}
            />
          ))}
        </DataTable>
      </div>
      
      <div className="action-buttons">
        <Button 
          label="Back to Main Page" 
          icon="pi pi-arrow-left" 
          className="p-button-danger" 
          onClick={onBackToMain} 
        />
        <Button 
          label="Download CSV" 
          icon="pi pi-download" 
          className="p-button-success" 
          onClick={downloadCSV} 
        />
      </div>
    </motion.div>
  );
};

export default ScrapedDataTable;
