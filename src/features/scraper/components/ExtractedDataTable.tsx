import React, { useState, useEffect, useRef } from "react";
import "./ExtractedDataTable.css";
import { motion } from "framer-motion";

// PrimeReact imports
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Tooltip } from "primereact/tooltip";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

// Import PrimeReact styles
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

import TableDisplay from "./TableDisplay";

// Define interfaces for props and state
interface ExtractedDataTableProps {
  extractedData?: any;
  scrapedData?: any;
  onBackToMain?: () => void;
}

interface ImageWithToggleProps {
  url: string;
}

interface FilterDisplayOptions {
  [key: string]: {
    value: any;
    matchMode: FilterMatchMode;
  };
}

const ExtractedDataTable: React.FC<ExtractedDataTableProps> = ({
  extractedData,
  scrapedData,
  onBackToMain,
}) => {
  // For backward compatibility, use extractedData if provided, otherwise fall back to scrapedData
  const data = extractedData || scrapedData;
  const [tableData, setTableData] = useState<Record<string, any>[]>([]);
  const [keys, setKeys] = useState<string[]>([]);
  const [filters, setFilters] = useState<
    Record<string, { value: any; matchMode: FilterMatchMode }>
  >({});
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [exportLoading, setExportLoading] = useState<boolean>(false);

  // Toast reference for notifications
  const toast = useRef<Toast>(null);

  // Initialize filters and process data when component mounts or data changes
  useEffect(() => {
    // Return early if no data is available
    if (!data) {
      setLoading(false);
      return;
    }

    // Determine the data to display - handle both direct data and nested data structures
    const dataToDisplay = data.data ? data.data : data;

    console.log("dataToDisplay", dataToDisplay);

    // Check if data is an array
    const isDataArray = Array.isArray(dataToDisplay);

    // If data is not an array, wrap it in an array for consistent rendering
    const dataArray = isDataArray ? dataToDisplay : [dataToDisplay];

    // Return if the array is empty
    if (dataArray.length === 0) {
      setLoading(false);
      return;
    }

    // Process the data to ensure it's in the right format
    const processedData = dataArray.map((item, index) => {
      return { ...item, id: item.uuid || `row-${index}` };
    });

    setTableData(processedData);

    // Initialize filters
    initFilters();
    setLoading(false);
  }, [data]);

  // Get keys from the first data item, excluding UUID
  const getKeys = () => {
    if (tableData.length > 0) {
      const keys = Object.keys(tableData[0]).filter(
        (key) => key.toLowerCase() !== "uuid" && key !== "id"
      );
      setKeys(keys);
    }
  };

  useEffect(() => {
    getKeys();
  }, [tableData]);

  // Format column header from camelCase or snake_case
  const formatColumnHeader = (key: string): string => {
    return key
      .replace(/([A-Z])/g, " $1") // Insert space before capital letters
      .replace(/_/g, " ") // Replace underscores with spaces
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter
      .join(" ");
  };

  // Initialize filters for all columns
  const initFilters = (): void => {
    const initFilters: Record<
      string,
      { value: any; matchMode: FilterMatchMode }
    > = {};

    if (tableData.length > 0) {
      Object.keys(tableData[0]).forEach((key) => {
        initFilters[key] = { value: null, matchMode: FilterMatchMode.CONTAINS };
      });
    }

    setFilters(initFilters);
  };

  // Handle global filter change
  const onGlobalFilterChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const value = e.target.value;
    let _filters = { ...filters };

    // Apply global filter to all columns
    keys.forEach((key) => {
      _filters[key] = { value, matchMode: FilterMatchMode.CONTAINS };
    });

    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  // Function to copy cell value to clipboard
  const copyToClipboard = (value: any) => {
    if (value === null || value === undefined) return;

    let textToCopy = "";

    if (typeof value === "object") {
      textToCopy = JSON.stringify(value);
    } else {
      textToCopy = String(value);
    }

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        toast.current?.show({
          severity: "success",
          summary: "Copied",
          detail: "Value copied to clipboard",
          life: 3000,
        });
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
        toast.current?.show({
          severity: "error",
          summary: "Error",
          detail: "Failed to copy to clipboard",
          life: 3000,
        });
      });
  };

  // Function to download data as CSV
  const downloadCSV = (): void => {
    setExportLoading(true);

    try {
      // Get all keys (columns)
      const csvKeys = keys;

      // Create CSV header row
      const header = csvKeys.map((key) => formatColumnHeader(key)).join(",");

      // Create CSV rows from data
      const rows = tableData
        .map((item) => {
          return csvKeys
            .map((key) => {
              const value = item[key];
              // Format the value for CSV (handle strings with commas, quotes, etc.)
              if (value === null || value === undefined) {
                return "";
              } else if (typeof value === "object") {
                return `"${JSON.stringify(value).replace(/"/g, '""')}"`;  
              } else if (typeof value === "string") {
                return `"${value.replace(/"/g, '""')}"`;  
              } else {
                return String(value);
              }
            })
            .join(",");
        })
        .join("\n");

      // Combine header and rows
      const csv = `${header}\n${rows}`;

      // Get current date for filename
      const date = new Date();
      const formattedDate = date.toISOString().split('T')[0];
      const filename = `extracted_data_${formattedDate}.csv`;
      
      // Create a blob and download link
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Show success message
      toast.current?.show({
        severity: 'success',
        summary: 'Success',
        detail: `CSV file "${filename}" downloaded successfully`,
        life: 3000
      });
      
      // Clean up the URL object
      setTimeout(() => {
        URL.revokeObjectURL(url);
        setExportLoading(false);
      }, 100);
    } catch (error) {
      console.error('Error generating CSV:', error);
      toast.current?.show({
        severity: 'error',
        summary: 'Error',
        detail: 'Failed to generate CSV file',
        life: 3000
      });
      setExportLoading(false);
    }
  };

  // Format cell value based on type for PrimeReact DataTable
  const formatCellValue = (
    rowData: any,
    column: { field: string }
  ): React.ReactNode => {
    const key = column.field;
    const value = rowData[key];
    
    // Wrapper to make cells clickable for copy functionality
    const CopyableCell = ({ children, value }: { children: React.ReactNode, value: any }) => {
      return (
        <div 
          className="copyable-cell" 
          onClick={() => copyToClipboard(value)}
          title="Click to copy"
          tabIndex={0}
          role="button"
          aria-label="Copy to clipboard"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              copyToClipboard(value);
              e.preventDefault();
            }
          }}
        >
          {children}
          <span className="copy-icon" aria-hidden="true">
            <i className="pi pi-copy" />
          </span>
        </div>
      );
    };

    if (typeof value === "boolean") {
      return (
        <CopyableCell value={value}>
          <i
            className={value ? "pi pi-check boolean-icon-true" : "pi pi-times boolean-icon-false"}
            aria-label={value ? "Yes" : "No"}
            role="img"
          />
        </CopyableCell>
      );
    } else if (value === null || value === undefined) {
      return <span className="text-muted">-</span>;
    } else if (typeof value === "object") {
      const jsonString = JSON.stringify(value);
      return (
        <CopyableCell value={value}>
          <div className="json-value" title={jsonString}>
            {jsonString.length > 100 ? `${jsonString.substring(0, 100)}...` : jsonString}
          </div>
        </CopyableCell>
      );
    } else if (
      typeof value === "string" &&
      (key.toLowerCase().includes("image") ||
        key.toLowerCase().includes("img") ||
        key.toLowerCase().includes("photo") ||
        value.match(/\.(jpeg|jpg|gif|png|webp)$/) ||
        (value.startsWith("http") && value.includes("/image")))
    ) {
      return <ImageWithToggle url={value} />;
    } else if (typeof value === "string" && value.length > 100) {
      return (
        <CopyableCell value={value}>
          <>
            <Tooltip target=".truncated-text" position="top">
              <div style={{ maxWidth: "400px", whiteSpace: "normal" }}>{value}</div>
            </Tooltip>
            <div className="truncated-text" data-pr-tooltip={value}>
              {value.substring(0, 100)}...
            </div>
          </>
        </CopyableCell>
      );
    } else {
      return (
        <CopyableCell value={value}>
          {value}
        </CopyableCell>
      );
    }
  };

  // Component to handle image URLs with show more/less toggle
  const ImageWithToggle: React.FC<ImageWithToggleProps> = ({ url }) => {
    const [expanded, setExpanded] = useState<boolean>(false);
    const [showImage, setShowImage] = useState<boolean>(false);

    if (!url) return <span className="text-muted">-</span>;

    const displayUrl = expanded
      ? url
      : url.substring(0, 50) + (url.length > 50 ? "..." : "");

    return (
      <div className="image-url-container">
        <span className="image-url">{displayUrl}</span>
        <div className="image-actions">
          {url.length > 50 && (
            <Button
              icon={expanded ? "pi pi-compress" : "pi pi-expand"}
              label={expanded ? "Show less" : "Show more"}
              className="btn btn-text btn-sm"
              onClick={() => setExpanded(!expanded)}
              aria-label={expanded ? "Show less of URL" : "Show more of URL"}
            />
          )}
          <Button
            icon={showImage ? "pi pi-eye-slash" : "pi pi-eye"}
            label={showImage ? "Hide image" : "View image"}
            className="btn btn-text btn-sm"
            onClick={() => setShowImage(!showImage)}
            aria-label={showImage ? "Hide image preview" : "View image preview"}
          />
        </div>
        {showImage && (
          <div className="image-preview-container">
            <img 
              src={url} 
              alt="Preview" 
              className="image-preview" 
              loading="lazy" 
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="%23999" d="M21.9 21.9l-8.49-8.49-9.82-9.82L2.1 2.1 0.69 3.51 3 5.83V19c0 1.1 0.9 2 2 2h13.17l2.31 2.31 1.42-1.41zM5 19V7.83l7.17 7.17H5zm11.17-8L13 7.83l-1.59-1.59 1.41-1.41 1.17 1.17 3.42-3.42 1.41 1.42-3.65 3.66z"/></svg>';
              }}
            />
          </div>
        )}
      </div>
    );
  };

  // If no data is available, return null
  if (!tableData.length) {
    return null;
  }

  // Function to handle download CSV action
  const handleDownloadCSV = (): void => {
    try {
      downloadCSV();
    } catch (error) {
      console.error('Error downloading CSV:', error);
      // Could add toast notification here
    }
  };

  // Function to handle back to main action
  const handleBackToMain = (): void => {
    if (onBackToMain) {
      onBackToMain();
    }
  };

  return (
    <motion.div
      className="extracted-data-table-container fade-in"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      role="region"
      aria-label="Data results table"
    >
      {/* Toast for notifications */}
      <Toast ref={toast} position="top-right" />
      
      <div className="outer-container">
        <div className="table-header-container">
          <h3 id="data-results-title">Data Results</h3>
          <div className="table-info">
            <span className="table-count">{tableData.length} items</span>
            <span className="table-tip">Tip: Click on any cell to copy its value</span>
          </div>
        </div>

        <TableDisplay
          tableData={tableData}
          filters={filters}
          loading={loading}
          formatColumnHeader={formatColumnHeader}
          formatCellValue={formatCellValue}
          keys={keys}
        />
        
        <div className="action-buttons">
          <Button
            icon="pi pi-download"
            label="Download CSV"
            className="btn btn-primary"
            onClick={handleDownloadCSV}
            aria-label="Download data as CSV file"
            disabled={!tableData.length || exportLoading}
            loading={exportLoading}
          />
          <Button
            icon="pi pi-arrow-left"
            label="Back to Main"
            className="btn btn-secondary"
            onClick={handleBackToMain}
            aria-label="Navigate back to main page"
          />
        </div>
      </div>
    </motion.div>
  );
};

export default ExtractedDataTable;
