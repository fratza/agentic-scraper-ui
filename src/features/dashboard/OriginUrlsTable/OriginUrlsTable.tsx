import React, { useEffect, useRef } from "react";
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
  data,
  onViewResult,
  title = "Origin URLs",
  originUrl,
}) => {
  const shouldUseMockData = useMockData();
  const displayUrl =
    originUrl || (shouldUseMockData ? "https://example.com" : null);

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
      <DataTable
        value={typedData}
        className="data-table compact-table"
        responsiveLayout="scroll"
        stripedRows
        scrollable
        scrollHeight="flex"
        style={{ fontSize: "0.8rem" }}
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
