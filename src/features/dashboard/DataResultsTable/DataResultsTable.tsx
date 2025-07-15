import React from 'react';
import { Button } from "primereact/button";
import DataTable from "../../scraper/components/DataTable";
import { useMockData } from "../../../utils/environment";
import { mockTemplateData } from "../../../data/mockTableData";
import { DataResultsTableProps, XmlHeaders } from "./types";

const DataResultsTable: React.FC<DataResultsTableProps> = ({
  data,
  originUrl,
  onBackToMain,
  onDownloadCSV,
  isXmlContent
}) => {
  // Check if we should use mock data
  const shouldUseMockData = useMockData();

  // Use mock URL if in local environment and no real URL is available
  const displayUrl =
    originUrl || (shouldUseMockData ? "https://example.com/template" : null);

  // Define fixed headers for XML content
  const xmlHeaders: XmlHeaders = {
    title: "Title",
    date: "Date",
    image: "Image",
    description: "Description",
  };

  return (
    <div className="data-preview-container">
      <div className="data-table-header">
        <div className="origin-url-container">
          {displayUrl && (
            <div className="origin-url">
              <span>URL: </span>
              <a
                href={displayUrl}
                target="_blank"
                rel="noopener noreferrer"
                title={displayUrl}
              >
                {displayUrl}
              </a>
            </div>
          )}
        </div>
        <div className="export-btn-container">
          <Button
            icon="pi pi-download"
            label="Export"
            className="btn btn-export"
            onClick={() => data && onDownloadCSV(data)}
            aria-label="Extract data as CSV"
          />
        </div>
      </div>
      {data ? (
        <DataTable
          data={Array.isArray(data) ? data : [data]}
          title={
            <div className="data-title-container">
              <div className="ed-label">
                <span>Extracted Data Results:</span>
              </div>
            </div>
          }
          headers={isXmlContent ? xmlHeaders : undefined}
          cellClassName="table-text"
          headerClassName="table-header-text"
        />
      ) : null}
    </div>
  );
};

export default DataResultsTable;
