import React, { useState } from 'react';
import { Button } from "primereact/button";
import DataTable from "./DataTable";
import { useMockData } from "../../../utils/environment";
import { mockTemplateData } from "../../../data/mockTableData";
import { fetchUrlList } from '../../../api/urls';
import { UrlListResponse } from '../../../services/api';

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
  const [urlList, setUrlList] = useState<UrlListResponse['data']>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if we should use mock data
  const shouldUseMockData = useMockData();

  // Use mock URL if in local environment and no real URL is available
  const displayUrl =
    originUrl || (shouldUseMockData ? "https://example.com/template" : null);

  // Define fixed headers for XML content
  const xmlHeaders = {
    title: "Title",
    date: "Date",
    image: "Image",
    description: "Description",
  };

  const handleOkClick = async () => {
    try {
      setIsLoading(true);
      const response = await fetchUrlList();
      if (response.status === 'success') {
        setUrlList(response.data);
        setShowUrlTable(true);
      }
    } catch (error) {
      console.error('Error fetching URL list:', error);
    } finally {
      setIsLoading(false);
    }
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
          <DataTable
            data={urlList}
            title={
              <div className="data-title-container">
                <div className="ed-label">
                  <span>Origin URLs:</span>
                </div>
              </div>
            }
            headers={{ origin_url: 'URL' }}
            cellClassName="table-text"
            headerClassName="table-header-text"
          />
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
