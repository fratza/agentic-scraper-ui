import React from 'react';
import { Button } from "primereact/button";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { usePagination } from "../../../hooks/usePagination";
import { OriginUrlsTableProps, UrlRow } from "./types";

const OriginUrlsTable: React.FC<OriginUrlsTableProps> = ({
  data,
  onViewResult,
  title = "Origin URLs"
}) => {
  const { page, onPageChange, totalPages } = usePagination({
    totalItems: data.length,
    itemsPerPage: 10
  });

  // Column for displaying the URL
  const urlBodyTemplate = (rowData: UrlRow) => (
    <a
      href={rowData.origin_url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-500 hover:text-blue-700"
      title={rowData.origin_url}
    >
      {new URL(rowData.origin_url).hostname}
    </a>
  );

  // Column for the View Result button
  const actionBodyTemplate = (rowData: UrlRow) => (
    <div className="flex justify-content-center">
      <Button
        icon="pi pi-search"
        className="p-button-text p-button-plain"
        onClick={() => onViewResult(rowData.origin_url)}
        aria-label={`View results for ${rowData.origin_url}`}
      />
    </div>
  );

  return (
    <div className="origin-urls-container p-4">
      <h3 className="mb-4">{title}</h3>
      <DataTable
        value={data}
        paginator={true}
        rows={10}
        totalRecords={data.length}
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
        className="shadow-lg"
      >
        <Column
          field="origin_url"
          header="URL"
          body={urlBodyTemplate}
          className="url-column"
        />
        <Column
          header="Actions"
          body={actionBodyTemplate}
          className="actions-column"
        />
      </DataTable>
    </div>
  );
};

export default OriginUrlsTable;
