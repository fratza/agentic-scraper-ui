import React, { useState } from 'react';
import { Button } from "primereact/button";
import DataTable from "./DataTable";
import { mockTemplateData } from "../../../data/mockTableData";
import "./DataResultsTable.css";

// Define the URL list item type
type UrlListItem = {
  id: string;
  origin_url: string;
};

interface DataResultsTableProps {
  data: any[];
  originUrl: string | null;
  onBackToMain: () => void;
  onDownloadCSV: (data: any[]) => void;
  isXmlContent: boolean;
}

const DataResultsTable: React.FC<DataResultsTableProps> = ({
  data,
  originUrl,
  onBackToMain,
  onDownloadCSV,
  isXmlContent
}) => {
  const [showUrlTable, setShowUrlTable] = useState(false);
  const [urlList, setUrlList] = useState<UrlListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use mock URL if no real URL is available
  const displayUrl = originUrl || "https://example.com/template";

  // Define fixed headers for XML content
  const xmlHeaders = {
    title: "Title",
    date: "Date",
    image: "Image",
    description: "Description",
  };

  const handleOkClick = () => {
    setIsLoading(true);
    
    // Use mock data with a small delay to simulate API call
    setTimeout(() => {
      setUrlList([
        { id: '1', origin_url: 'https://example.com/products/1' },
        { id: '2', origin_url: 'https://example.com/products/2' },
        { id: '3', origin_url: 'https://example.com/products/3' },
        { id: '4', origin_url: 'https://example.com/products/4' },
        { id: '5', origin_url: 'https://example.com/products/5' },
        { id: '6', origin_url: 'https://example.com/blog/1' },
        { id: '7', origin_url: 'https://example.com/blog/2' }
      ]);
      setShowUrlTable(true);
      setIsLoading(false);
    }, 500);
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
        <div className="action-buttons" style={{ display: 'flex', gap: '1rem' }}>
          {!showUrlTable && (
            <Button
              icon="pi pi-check"
              label="Okay looks good"
              className="btn btn-primary"
              onClick={handleOkClick}
              loading={isLoading}
              disabled={isLoading}
              aria-label="Confirm and show URL list"
            />
          )}
          <Button
            icon="pi pi-download"
            label="Export"
            className="btn btn-export"
            onClick={() => data && onDownloadCSV(data)}
            aria-label="Extract data as CSV"
          />
        </div>
      </div>
      {showUrlTable ? (
        <div className="url-table-container">
          <div className="data-title-container">
            <div className="ed-label">
              <span>Origin URLs:</span>
            </div>
          </div>
          <div style={{ width: '100%', overflowX: 'auto' }}>
            {urlList.length > 0 ? (
              <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr className="table-header">
                    <th className="table-header-cell">ID</th>
                    <th className="table-header-cell">URL</th>
                  </tr>
                </thead>
                <tbody>
                  {urlList.map((item) => (
                    <tr key={item.id} className="table-row">
                      <td className="table-cell">{item.id}</td>
                      <td className="table-cell">
                        <a href={item.origin_url} target="_blank" rel="noopener noreferrer">
                          {item.origin_url}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="no-data-message">
                <p>No URLs found</p>
              </div>
            )}
          </div>
        </div>
      ) : data ? (
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
