import React, { useState, useEffect } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Paginator } from "primereact/paginator";
import { ProgressSpinner } from "primereact/progressspinner";
import { Button } from "primereact/button";
import "./TableDisplay.css";

interface TableDisplayProps {
  tableData: any[];
  filters: any;
  loading: boolean;
  formatColumnHeader: (key: string) => string;
  formatCellValue: (rowData: any, column: { field: string }) => React.ReactNode;
  keys: string[];
  onDownloadCSV?: () => void;
}

const TableDisplay: React.FC<TableDisplayProps> = ({
  tableData,
  filters,
  loading,
  formatColumnHeader,
  formatCellValue,
  keys,
  onDownloadCSV,
}) => {
  const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [first, setFirst] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [filteredData, setFilteredData] = useState<any[]>(tableData);

  // Update filtered data when tableData changes
  useEffect(() => {
    setFilteredData(tableData);
  }, [tableData]);

  // Handle global filter input change
  const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setGlobalFilterValue(value);
    
    // Filter the data based on the search value
    if (value.trim()) {
      const filtered = tableData.filter(item => {
        return keys.some(key => {
          const cellValue = item[key];
          if (cellValue === null || cellValue === undefined) return false;
          return String(cellValue).toLowerCase().includes(value.toLowerCase());
        });
      });
      setFilteredData(filtered);
    } else {
      setFilteredData(tableData);
    }
    
    // Reset to first page when filtering
    setFirst(0);
    setCurrentPage(0);
  };

  // Options for rows per page dropdown
  const rowsPerPageOptions = [
    { label: "10", value: 10 },
    { label: "25", value: 25 },
    { label: "50", value: 50 },
    { label: "100", value: 100 },
  ];

  // Handle pagination change
  const onPageChange = (event: { first: number; rows: number; page: number }) => {
    setFirst(event.first);
    setRowsPerPage(event.rows);
    setCurrentPage(event.page);
  };

  // Handle rows per page change
  const onRowsPerPageChange = (e: { value: number }) => {
    const newRowsPerPage = e.value;
    setRowsPerPage(newRowsPerPage);
    setFirst(0); // Reset to first page
    setCurrentPage(0);
  };

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
      <div className="table-header">
        <div className="search-container">
          <span className="p-input-icon-left">
            <i className="pi pi-search" aria-hidden="true" />
            <InputText
              value={globalFilterValue}
              onChange={onGlobalFilterChange}
              placeholder="Search"
              className="global-search"
              aria-label="Search across all data"
            />
          </span>
        </div>
        <div className="table-actions">
          <div className="rows-per-page">
            <label htmlFor="rows-per-page" className="rows-label">
              Rows per page:
            </label>
            <Dropdown
              id="rows-per-page"
              value={rowsPerPage}
              options={rowsPerPageOptions}
              onChange={onRowsPerPageChange}
              className="rows-dropdown"
              aria-label="Select number of rows per page"
            />
          </div>
          
          {onDownloadCSV && (
            <Button
              icon="pi pi-download"
              label="Download CSV"
              className="download-btn p-button-sm"
              onClick={onDownloadCSV}
              aria-label="Download data as CSV file"
            />
          )}
        </div>
      </div>
      {loading ? (
        loadingTemplate
      ) : (
        <>
          <DataTable
            value={filteredData}
            rows={rowsPerPage}
            first={first}
            tableStyle={{ minWidth: "50rem" }}
            filters={filters}
            filterDisplay="menu"
            emptyMessage={emptyMessage}
            responsiveLayout="stack"
            breakpoint="768px"
            globalFilterFields={keys}
            dataKey="id"
            className="data-table"
            scrollable
            scrollHeight="flex"
            stripedRows
            showGridlines
            size="small"
            rowHover
            resizableColumns
            reorderableColumns
            paginator
            paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
            currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
            paginatorClassName="custom-paginator"
            paginatorPosition="bottom"
            lazy={false}
          >
            {/* Row number column */}
            <Column
              header="#"
              body={(data, options) => options.rowIndex + first + 1}
              style={{ width: '4rem' }}
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
                sortable
                filter
                filterPlaceholder={`Search ${formatColumnHeader(key)}`}
                style={{ minWidth: '12rem' }}
              />
            ))}
          </DataTable>
        </>
      )}
    </div>
  );
};

export default TableDisplay;
