import React, { useEffect, useRef, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { usePagination } from "../../../hooks/usePagination";
import { OriginUrlsTableProps, UrlRow } from "./types";
import { useMockData } from "../../../utils/environment";
import "../../../styles/SharedTable.css";
import axios from "axios";

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
  const [data, setData] = useState<UrlRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch data from API
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await axios.get('/api/supabase/url-list');
        
        if (response.data.status === "success" && Array.isArray(response.data.data)) {
          // Transform the API response to match our UrlRow structure
          const transformedData: UrlRow[] = response.data.data.map((url: string, index: number) => ({
            id: `url-${index}`,
            origin_url: url,
            lastExtract: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days for demo
            status: ['Active', 'Pending', 'Completed', 'Error'][Math.floor(Math.random() * 4)] // Random status for demo
          }));
          
          setData(transformedData);
        } else {
          setError('Invalid data format received from API');
          // Fallback to initial data if provided
          if (initialData && initialData.length > 0) {
            setData(initialData as UrlRow[]);
          }
        }
      } catch (err) {
        console.error('Error fetching URL list:', err);
        setError('Failed to fetch URL list');
        // Fallback to initial data if provided
        if (initialData && initialData.length > 0) {
          setData(initialData as UrlRow[]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [initialData]);

  // Ensure data is typed as UrlRow[]
  const typedData = data as UrlRow[];

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
