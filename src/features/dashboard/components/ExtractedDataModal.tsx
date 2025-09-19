import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import Modal from "../../../components/Modal";
import apiService from "../../../services/api";
import "./ExtractedDataModal.css";

interface ExtractedDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  urlId: string;
  urlName?: string;
}

const ExtractedDataModal: React.FC<ExtractedDataModalProps> = ({
  isOpen,
  onClose,
  urlId,
  urlName,
}) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch extracted data when modal opens
  useEffect(() => {
    if (isOpen && urlId) {
      fetchExtractedData();
    }
  }, [isOpen, urlId]); // fetchExtractedData is defined inside the component, so it's safe to omit

  const fetchExtractedData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await apiService.getExtractedData(urlId);
      if (response.status === "success") {
        setData(response.data);
      } else {
        setError("Failed to fetch extracted data");
      }
    } catch (err) {
      console.error("Error fetching extracted data:", err);
      setError("Failed to fetch extracted data");
    } finally {
      setLoading(false);
    }
  };

  // Generate columns dynamically based on data
  const getColumns = () => {
    if (!data || data.length === 0) return [];

    const allKeys = new Set<string>();
    data.forEach((item) => {
      if (typeof item === "object" && item !== null) {
        Object.keys(item).forEach((key) => allKeys.add(key));
      }
    });

    return Array.from(allKeys).map((key) => (
      <Column
        key={key}
        field={key}
        header={key.charAt(0).toUpperCase() + key.slice(1)}
        headerStyle={{
          textAlign: "center",
          verticalAlign: "middle",
          backgroundColor: "#f8f9fa",
          border: "1px solid #dee2e6",
          padding: "12px 8px",
          fontWeight: "600",
          fontSize: "0.9rem",
          color: "#495057",
        }}
        body={(rowData) => {
          const value = rowData[key];
          let displayValue;

          if (value === null || value === undefined) {
            displayValue = (
              <span style={{ color: "#999", fontStyle: "italic" }}>N/A</span>
            );
          } else if (typeof value === "object") {
            displayValue = (
              <span style={{ color: "#666", fontSize: "0.85rem" }}>
                {JSON.stringify(value)}
              </span>
            );
          } else if (typeof value === "string" && value.length > 100) {
            displayValue = (
              <span title={value} style={{ color: "#333" }}>
                {value.substring(0, 100)}...
              </span>
            );
          } else {
            displayValue = (
              <span style={{ color: "#333" }}>{String(value)}</span>
            );
          }

          return displayValue;
        }}
        style={{
          border: "1px solid #dee2e6",
          padding: "10px 8px",
          textAlign: "left",
          verticalAlign: "middle",
          maxWidth: "250px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
        bodyStyle={{
          border: "1px solid #dee2e6",
          padding: "10px 8px",
          textAlign: "left",
          verticalAlign: "middle",
        }}
      />
    ));
  };

  // Download data as CSV
  const downloadCSV = () => {
    if (!data || data.length === 0) return;

    const headers = Object.keys(data[0]).join(",");
    const rows = data
      .map((item) =>
        Object.values(item)
          .map((value) => {
            if (value === null || value === undefined) return "";
            if (typeof value === "object")
              return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
            if (typeof value === "string")
              return `"${value.replace(/"/g, '""')}"`;
            return value;
          })
          .join(","),
      )
      .join("\n");

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `extracted_data_${urlId}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const modalTitle = `Extracted Data${urlName ? ` - ${urlName}` : ""}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={modalTitle}>
      <div
        className="extracted-data-content"
        style={{ maxHeight: "70vh", overflow: "auto" }}
      >
        {loading && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <i className="pi pi-spin pi-spinner" style={{ fontSize: "2rem" }} />
            <p style={{ marginTop: "1rem" }}>Loading extracted data...</p>
          </div>
        )}

        {error && (
          <div
            className="p-message p-message-error"
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              backgroundColor: "#ffebee",
              border: "1px solid #f44336",
              borderRadius: "4px",
            }}
          >
            <span style={{ color: "#d32f2f" }}>{error}</span>
          </div>
        )}

        {!loading && !error && data && data.length > 0 && (
          <div>
            <div
              style={{
                marginBottom: "1rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="data-stats">
                📊 Found {data.length} extracted record
                {data.length !== 1 ? "s" : ""} •{" "}
                {Object.keys(data[0] || {}).length} field
                {Object.keys(data[0] || {}).length !== 1 ? "s" : ""}
              </div>
              <Button
                label="Download CSV"
                icon="pi pi-download"
                className="p-button-sm p-button-outlined"
                onClick={downloadCSV}
                tooltip="Export data as CSV file"
                tooltipOptions={{ position: "left" }}
              />
            </div>
            <div
              style={{
                border: "1px solid #dee2e6",
                borderRadius: "8px",
                overflow: "hidden",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              <DataTable
                value={data}
                scrollable
                scrollHeight="400px"
                className="p-datatable-sm enhanced-data-table"
                responsiveLayout="scroll"
                emptyMessage="No data available"
                rows={10}
                paginator={data.length > 10}
                paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                rowsPerPageOptions={[5, 10, 25, 50]}
                stripedRows
                style={{
                  fontSize: "0.85rem",
                  border: "none",
                }}
                tableStyle={{
                  border: "none",
                  borderCollapse: "separate",
                  borderSpacing: "0",
                }}
              >
                {getColumns()}
              </DataTable>
            </div>
          </div>
        )}

        {!loading && !error && (!data || data.length === 0) && (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <i
              className="pi pi-info-circle"
              style={{ fontSize: "3rem", color: "#999" }}
            />
            <p style={{ marginTop: "1rem", color: "#666" }}>
              No extracted data found for this URL.
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ExtractedDataModal;
