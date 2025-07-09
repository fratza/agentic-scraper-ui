import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { ProgressSpinner } from "primereact/progressspinner";
import "./TableDisplay.css";

interface TableDisplayProps {
  tableData: any[];
  loading: boolean;
  formatColumnHeader: (key: string) => string;
  formatCellValue: (rowData: any, column: { field: string }) => React.ReactNode;
  keys: string[];
}

const TableDisplay: React.FC<TableDisplayProps> = ({
  tableData,
  loading,
  formatColumnHeader,
  formatCellValue,
  keys,
}) => {

  // Empty message for when there's no data
  const emptyMessage = (
    <div className="empty-message" role="status" aria-live="polite">
      <i className="pi pi-info-circle" aria-hidden="true" />
      <p>No data available</p>
    </div>
  );

  // Loading indicator
  const loadingTemplate = (
    <div className="loading-container" role="status" aria-live="polite">
      <ProgressSpinner aria-label="Loading data" />
      <span>Loading data...</span>
    </div>
  );

  return (
    <div className="table-container">

      {loading ? (
        loadingTemplate
      ) : (
        <>
          <DataTable
            value={tableData}
            tableStyle={{ minWidth: "50rem" }}
            emptyMessage={emptyMessage}
            responsiveLayout="stack"
            breakpoint="768px"
            dataKey="id"
            className="data-table"
          >
            {/* Row number column */}
            <Column
              header="#"
              body={(data, options) => options.rowIndex + 1}
              style={{ width: "4rem" }}
              bodyClassName="row-number"
              headerClassName="row-number-header"
              frozen
              alignHeader="center"
            />

            {keys.map((key) => (
              <Column
                key={key}
                field={key}
                header={formatColumnHeader(key)}
                body={(rowData) => formatCellValue(rowData, { field: key })}
                style={{ minWidth: "12rem" }}
              />
            ))}
          </DataTable>
        </>
      )}
    </div>
  );
};

export default TableDisplay;
