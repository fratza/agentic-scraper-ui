import React, { useState } from "react";
import { Button } from "primereact/button";
import DataTable from "../../scraper/components/DataTable";

import { DataResultsTableProps, XmlHeaders } from "./types";
import TaskNameModal from "../TaskNameModal/TaskNameModal";
import apiService from "../../../services/api";
import InlineLoader from "../../../components/common/InlineLoader";
import "./DataResultsTable.css";

const DataResultsTable: React.FC<DataResultsTableProps> = ({
  data,
  originUrl,
  onBackToMain,
  onDownloadCSV,
  isXmlContent,
  id,
}) => {
  // State for task name modal
  const [isTaskNameModalOpen, setIsTaskNameModalOpen] = useState(false);
  const [isSubmittingTaskName, setIsSubmittingTaskName] = useState(false);

  const displayUrl = originUrl || null;

  // Handle opening the task name modal
  const handleApproveData = () => {
    if (!id) {
      console.error("Cannot approve data without an ID");
      return;
    }
    setIsTaskNameModalOpen(true);
  };

  // Handle submitting the task name
  const handleSubmitTaskName = async (taskName: string, dataId: string) => {
    if (isSubmittingTaskName) return;

    setIsSubmittingTaskName(true);
    try {
      const response = await apiService.submitTaskName({
        taskName: taskName,
        id: dataId,
      });

      console.log("Task name submitted successfully:", response);
      // You could show a success toast notification here
      setIsTaskNameModalOpen(false);
    } catch (error) {
      console.error("Error submitting task name:", error);
      // You could show an error toast notification here
    } finally {
      setIsSubmittingTaskName(false);
    }
  };

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
        <>
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
          <div className="data-actions-container">
            <Button
              label="Okay, looks good"
              icon="pi pi-check"
              className="btn btn-approve"
              onClick={handleApproveData}
              disabled={!id}
              aria-label="Approve data and add task name"
            />
          </div>
        </>
      ) : null}

      {/* Task Name Modal */}
      <TaskNameModal
        isOpen={isTaskNameModalOpen}
        onClose={() => setIsTaskNameModalOpen(false)}
        onSubmit={handleSubmitTaskName}
        id={id || ""}
        isSubmitting={isSubmittingTaskName}
      />
    </div>
  );
};

export default DataResultsTable;
