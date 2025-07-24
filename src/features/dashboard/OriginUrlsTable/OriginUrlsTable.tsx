import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { usePagination } from "../../../hooks/usePagination";
import { OriginUrlsTableProps, UrlRow } from "./types";
import { useMockData } from "../../../utils/environment";
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

  // Column for displaying the index (row number)
  const indexBodyTemplate = (_: any, options: any) => {
    return options.rowIndex + 1;
  };

  // Column for displaying the URL
  const urlBodyTemplate = (rowData: UrlRow) => (
    <a
      href={rowData.origin_url}
      target="_blank"
      rel="noopener noreferrer"
      className="url-link"
      title={rowData.origin_url}
    >
      {rowData.origin_url}
    </a>
  );

  // Column for displaying the last extract date
  const lastExtractBodyTemplate = (rowData: UrlRow) => (
    <span>
      {rowData.lastExtract
        ? new Date(rowData.lastExtract).toLocaleDateString()
        : "N/A"}
    </span>
  );

  // Column for displaying the status
  const statusBodyTemplate = (rowData: UrlRow) => (
    <span
      className={`status-badge status-${
        rowData.status?.toLowerCase() || "unknown"
      }`}
    >
      {rowData.status || "Unknown"}
    </span>
  );

  // Column for actions
  const actionBodyTemplate = (rowData: UrlRow) => (
    <Button
      label="View Result"
      className="p-button-sm p-button-text"
      onClick={() => onViewResult(rowData.origin_url)}
      disabled={!rowData.origin_url}
    />
  );

  // Handle CSV export
  const handleExport = () => {
    const csvContent = [
      "Index,URL,Last Extract,Status", // Header row
      ...typedData.map(
        (item: UrlRow, index) =>
          `${index + 1},"${item.origin_url}","${
            item.lastExtract
              ? new Date(item.lastExtract).toLocaleDateString()
              : "N/A"
          }","${item.status || "Unknown"}"`
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "origin_urls.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
    </div>
  );
};

export default OriginUrlsTable;
