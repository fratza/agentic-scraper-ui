import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { exportToCSV } from "../../../utils/exportUtils";
import { OriginUrlsTableProps, UrlRow } from "../../../model/dashboard";
import ExtractedDataModal from "../components/ExtractedDataModal";
import "../../../styles/SharedTable.css";

// Add custom CSS for table headers
const tableHeaderStyle = `
  .p-datatable-thead > tr > th {
    text-align: left !important;
    justify-content: flex-start !important;
  }

  .p-column-header-content {
    justify-content: flex-start !important;
    width: 100%;
  }
`;

const OriginUrlsTable: React.FC<OriginUrlsTableProps> = ({
  data: initialData,
  onViewResult,
  title = "Origin URLs",
  originUrl,
  loading: externalLoading,
}) => {
  const displayUrl = originUrl || null;

  // Use the external loading state if provided, otherwise manage internally
  const [internalLoading, setInternalLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Determine which loading state to use
  const loading =
    externalLoading !== undefined ? externalLoading : internalLoading;

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUrlId, setSelectedUrlId] = useState<string>("");
  const [selectedUrlName, setSelectedUrlName] = useState<string>("");

  // Use initialData directly without API call
  useEffect(() => {
    // Only manage loading state internally if no external loading prop is provided
    if (externalLoading === undefined) {
      setInternalLoading(true);

      // Short timeout to show loading indicator for better UX
      setTimeout(() => {
        if (initialData && initialData.length > 0) {
          setInternalLoading(false);
        } else {
          setError("No URL data available");
          setInternalLoading(false);
        }
      }, 300);
    } else if (!externalLoading && (!initialData || initialData.length === 0)) {
      // If external loading is false but we have no data, set error
      setError("No URL data available");
    } else if (!externalLoading) {
      // Clear error if we have data and loading is complete
      setError(null);
    }
  }, [initialData, externalLoading]);

  // Ensure data is typed as UrlRow[]
  const typedData = initialData as UrlRow[];

  // Column for displaying the index (row number) - memoized for better performance
  const indexBodyTemplate = useCallback((_: any, options: any) => {
    return options.rowIndex + 1;
  }, []);

  // Column for displaying the URL - memoized for better performance
  const urlBodyTemplate = useCallback(
    (rowData: UrlRow) => (
      <a
        href={rowData.origin_url}
        target="_blank"
        rel="noopener noreferrer"
        className="url-link"
        title={rowData.origin_url}
      >
        View Link
      </a>
    ),
    [],
  );

  // Column for displaying the name - memoized for better performance
  const nameBodyTemplate = useCallback(
    (rowData: UrlRow) => rowData.name || "N/A",
    [],
  );

  // Last Extract column has been removed

  // Column for displaying the status - memoized for better performance
  const statusBodyTemplate = useCallback(
    (rowData: UrlRow) => (
      <span
        className={`status-badge status-${
          rowData.status?.toLowerCase() || "unknown"
        }`}
        aria-label={`Status: ${rowData.status || "Unknown"}`}
      >
        {rowData.status || "Unknown"}
      </span>
    ),
    [],
  );

  // Handle view result click
  const handleViewResult = useCallback((rowData: UrlRow) => {
    setSelectedUrlId(rowData.id);
    setSelectedUrlName(rowData.name || "");
    setModalOpen(true);
  }, []);

  // Column for actions - memoized for better performance
  const actionBodyTemplate = useCallback(
    (rowData: UrlRow) => (
      <Button
        label="View Result"
        className="p-button-sm p-button-text"
        onClick={() => handleViewResult(rowData)}
        disabled={!rowData.id}
        aria-label={`View results for ${rowData.name || rowData.origin_url}`}
      />
    ),
    [handleViewResult],
  );

  // Add custom styles for table headers
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = tableHeaderStyle;
    document.head.appendChild(styleElement);

    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="data-preview-container">
      {error && (
        <div
          className="p-message p-message-error"
          style={{ marginBottom: "1rem", padding: "0.5rem" }}
        >
          <span className="p-message-text">{error}</span>
        </div>
      )}

      {/* Extracted Data Modal */}
      <ExtractedDataModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        urlId={selectedUrlId}
        urlName={selectedUrlName}
      />

      {/* Memoize the DataTable for better performance */}
      {useMemo(
        () => (
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
            rows={10}
            aria-label="Origin URLs Table"
          >
            <Column
              header="#"
              body={indexBodyTemplate}
              headerStyle={{
                textAlign: "left",
                verticalAlign: "middle",
                fontSize: "0.8rem",
                backgroundColor: "var(--surface-50)",
              }}
              style={{
                width: "5%",
                minWidth: "30px",
                textAlign: "left",
                fontSize: "0.8rem",
                paddingLeft: "0.5rem",
              }}
            />
            <Column
              header="Name"
              body={nameBodyTemplate}
              headerStyle={{
                textAlign: "left",
                verticalAlign: "middle",
                padding: "0.3rem",
                fontSize: "0.8rem",
                backgroundColor: "var(--surface-50)",
              }}
              style={{
                width: "25%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                padding: "0.3rem",
                fontSize: "0.8rem",
                textAlign: "left",
              }}
            />
            <Column
              field="origin_url"
              header="URL"
              body={urlBodyTemplate}
              headerStyle={{
                textAlign: "left",
                verticalAlign: "middle",
                padding: "0.3rem",
                fontSize: "0.8rem",
                backgroundColor: "var(--surface-50)",
              }}
              style={{
                width: "20%",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                padding: "0.3rem",
                fontSize: "0.8rem",
                textAlign: "left",
              }}
            />
            {/* Last Extract column has been removed */}
            <Column
              field="status"
              header="Status"
              body={statusBodyTemplate}
              headerStyle={{
                textAlign: "left",
                verticalAlign: "middle",
                padding: "0.3rem",
                fontSize: "0.8rem",
                backgroundColor: "var(--surface-50)",
              }}
              style={{
                width: "20%",
                textAlign: "left",
                padding: "0.3rem",
                fontSize: "0.8rem",
              }}
            />
            <Column
              header="Actions"
              body={actionBodyTemplate}
              headerStyle={{
                textAlign: "left",
                verticalAlign: "middle",
                padding: "0.3rem",
                fontSize: "0.8rem",
                backgroundColor: "var(--surface-50)",
              }}
              style={{
                width: "15%",
                minWidth: "80px",
                textAlign: "left",
                padding: "0.3rem",
                fontSize: "0.8rem",
              }}
            />
          </DataTable>
        ),
        [
          typedData,
          loading,
          indexBodyTemplate,
          urlBodyTemplate,
          nameBodyTemplate,
          // lastExtractBodyTemplate removed
          statusBodyTemplate,
          actionBodyTemplate,
        ],
      )}
    </div>
  );
};

export default OriginUrlsTable;
