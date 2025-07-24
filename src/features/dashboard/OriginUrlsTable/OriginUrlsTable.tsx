import React, { useEffect, useRef, useState, useMemo, useCallback } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { usePagination } from "../../../hooks/usePagination";
import { useMockData } from "../../../utils/environment";
import { exportToCSV, formatDate } from "../../../utils/exportUtils";
import { OriginUrlsTableProps, UrlRow } from "../../../model/dashboard";
import "../../../styles/SharedTable.css";


// Add custom CSS for table headers
const tableHeaderStyle = `
  .p-datatable-thead > tr > th {
    text-align: center !important;
    justify-content: center !important;
  }
  
  .p-column-header-content {
    justify-content: center !important;
    width: 100%;
  }
`;

const OriginUrlsTable: React.FC<OriginUrlsTableProps> = ({
  data: initialData,
  onViewResult,
  title = "Origin URLs",
  originUrl,
}) => {
  const shouldUseMockData = useMockData();
  const displayUrl =
    originUrl || (shouldUseMockData ? "https://example.com" : null);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Use initialData directly without API call
  useEffect(() => {
    // Set loading state when initialData changes
    setLoading(true);
    
    // Short timeout to show loading indicator for better UX
    setTimeout(() => {
      if (initialData && initialData.length > 0) {
        setLoading(false);
      } else {
        setError('No URL data available');
        setLoading(false);
      }
    }, 300);
  }, [initialData]);

  // Ensure data is typed as UrlRow[]
  const typedData = initialData as UrlRow[];

  // Column for displaying the index (row number) - memoized for better performance
  const indexBodyTemplate = useCallback((_: any, options: any) => {
    return options.rowIndex + 1;
  }, []);

  // Column for displaying the URL - memoized for better performance
  const urlBodyTemplate = useCallback((rowData: UrlRow) => (
    <a
      href={rowData.origin_url}
      target="_blank"
      rel="noopener noreferrer"
      className="url-link"
      title={rowData.origin_url}
    >
      {rowData.origin_url}
    </a>
  ), []);

  // Column for displaying the last extract date - memoized for better performance
  const lastExtractBodyTemplate = useCallback((rowData: UrlRow) => (
    <span>
      {formatDate(rowData.lastExtract)}
    </span>
  ), []);

  // Column for displaying the status - memoized for better performance
  const statusBodyTemplate = useCallback((rowData: UrlRow) => (
    <span
      className={`status-badge status-${
        rowData.status?.toLowerCase() || "unknown"
      }`}
      aria-label={`Status: ${rowData.status || "Unknown"}`}
    >
      {rowData.status || "Unknown"}
    </span>
  ), []);

  // Column for actions - memoized for better performance
  const actionBodyTemplate = useCallback((rowData: UrlRow) => (
    <Button
      label="View Result"
      className="p-button-sm p-button-text"
      onClick={() => onViewResult(rowData.origin_url)}
      disabled={!rowData.origin_url}
      aria-label={`View results for ${rowData.origin_url}`}
    />
  ), [onViewResult]);

  // Handle CSV export using the utility function - memoized for better performance
  const handleExport = useCallback(() => {
    exportToCSV(
      typedData,
      {
        id: "ID",
        origin_url: "URL",
        lastExtract: "Last Extract",
        status: "Status"
      },
      "origin_urls.csv"
    );
  }, [typedData]);

  // Add custom styles for table headers
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.textContent = tableHeaderStyle;
    document.head.appendChild(styleElement);
    
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="data-preview-container">
      {error && (
        <div className="p-message p-message-error" style={{ marginBottom: '1rem', padding: '0.5rem' }}>
          <span className="p-message-text">{error}</span>
        </div>
      )}
      
      <div className="table-header" style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: '1rem' }}>{title}</h3>
        <Button 
          icon="pi pi-download" 
          label="Export" 
          className="p-button-sm p-button-outlined" 
          onClick={handleExport} 
        />
      </div>
      
      {/* Memoize the DataTable for better performance */}
      {useMemo(() => (
        <DataTable
          value={typedData}
          className="data-table compact-table"
          responsiveLayout="scroll"
          stripedRows
          scrollable
          scrollHeight="flex"
          style={{ fontSize: "0.8rem" }}
          loading={loading}
          emptyMessage="No URLs found"
          rows={5}
          paginator
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          rowsPerPageOptions={[5, 10, 25]}
          aria-label="Origin URLs Table"
        >
        <Column
          header="#"
          body={indexBodyTemplate}
          headerStyle={{
            textAlign: "center",
            verticalAlign: "middle",
            padding: "0.3rem",
            fontSize: "0.8rem",
            backgroundColor: "var(--surface-50)"
          }}
          style={{
            width: "5%",
            minWidth: "30px",
            textAlign: "center",
            padding: "0.3rem",
            fontSize: "0.8rem",
          }}
        />
        <Column
          field="origin_url"
          header="URL"
          body={urlBodyTemplate}
          headerStyle={{
            textAlign: "center",
            verticalAlign: "middle",
            padding: "0.3rem",
            fontSize: "0.8rem",
            backgroundColor: "var(--surface-50)"
          }}
          style={{
            width: "45%",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            padding: "0.3rem",
            fontSize: "0.8rem",
            textAlign: "center"
          }}
        />
        <Column
          field="lastExtract"
          header="Last Extract"
          body={lastExtractBodyTemplate}
          headerStyle={{
            textAlign: "center",
            verticalAlign: "middle",
            padding: "0.3rem",
            fontSize: "0.8rem",
            backgroundColor: "var(--surface-50)"
          }}
          style={{
            width: "15%",
            textAlign: "center",
            padding: "0.3rem",
            fontSize: "0.8rem",
          }}
        />
        <Column
          field="status"
          header="Status"
          body={statusBodyTemplate}
          headerStyle={{
            textAlign: "center",
            verticalAlign: "middle",
            padding: "0.3rem",
            fontSize: "0.8rem",
            backgroundColor: "var(--surface-50)"
          }}
          style={{
            width: "15%",
            textAlign: "center",
            padding: "0.3rem",
            fontSize: "0.8rem",
          }}
        />
        <Column
          header="Actions"
          body={actionBodyTemplate}
          headerStyle={{
            textAlign: "center",
            verticalAlign: "middle",
            padding: "0.3rem",
            fontSize: "0.8rem",
            backgroundColor: "var(--surface-50)"
          }}
          style={{
            width: "20%",
            minWidth: "80px",
            textAlign: "center",
            padding: "0.3rem",
            fontSize: "0.8rem",
          }}
        />
      </DataTable>
      ), [typedData, loading, indexBodyTemplate, urlBodyTemplate, lastExtractBodyTemplate, statusBodyTemplate, actionBodyTemplate])}
    </div>
  );
};

export default OriginUrlsTable;
