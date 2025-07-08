import React from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";

const TableDisplay = ({
  tableData,
  filters,
  loading,
  formatColumnHeader,
  formatCellValue,
  keys,
}) => {
  // Row number template
  const rowNumberTemplate = (rowData, options) => {
    return <span>{options.rowIndex + 1}</span>;
  };

  return (
    <div className="prime-datatable-wrapper">
      <DataTable
        value={tableData}
        dataKey="id"
        filters={filters}
        filterDisplay="menu"
        loading={loading}
        responsiveLayout="scroll"
        emptyMessage="No data found."
        header={null}
        scrollable
        scrollHeight="60vh"
        stripedRows
        resizableColumns
        columnResizeMode="fit"
        className="p-datatable-gridlines"
      >
        {/* Row number column */}
        <Column
          header="#"
          body={rowNumberTemplate}
          style={{ width: '4rem', textAlign: 'center' }}
          frozen
          className="row-number-column"
        />
        {keys.map((key) => (
          <Column
            key={key}
            field={key}
            header={formatColumnHeader(key)}
            sortable
            filter
            filterPlaceholder={`Search ${formatColumnHeader(key)}`}
            body={(rowData) => formatCellValue(rowData, { field: key })}
            style={{ minWidth: "12rem" }}
            className={
              key.toLowerCase().includes("description")
                ? "description-column"
                : ""
            }
          />
        ))}
      </DataTable>
    </div>
  );
};

export default TableDisplay;
