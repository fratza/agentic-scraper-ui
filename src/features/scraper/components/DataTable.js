import React, { useState, useEffect } from 'react';
import './DataTable.css';

// PrimeReact imports
import { DataTable as PrimeDataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";

// Import PrimeReact styles if not already imported in the app
// These will be ignored if already imported elsewhere
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";

const DataTable = ({ data, title = "Scraped Data" }) => {
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState({});
  const [globalFilterValue, setGlobalFilterValue] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Initialize data and filters when component mounts or data changes
  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setLoading(false);
      return;
    }
    
    // Process data for the table
    const processedData = data.map((item, index) => {
      return { ...item, id: `row-${index}` };
    });
    
    setTableData(processedData);
    initFilters();
    setLoading(false);
  }, [data]);
  
  // If no data is available, return null
  if (!data || !Array.isArray(data) || data.length === 0) {
    return null;
  }
  
  // Get keys from the first data item
  const keys = Object.keys(data[0]);
  
  // Initialize filters for all columns
  const initFilters = () => {
    const initFilters = {};
    
    if (tableData.length > 0) {
      Object.keys(tableData[0]).forEach(key => {
        if (key !== 'id') { // Skip the id field
          initFilters[key] = { value: null, matchMode: FilterMatchMode.CONTAINS };
        }
      });
    }
    
    setFilters(initFilters);
  };
  
  // Handle global filter change
  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    
    // Apply global filter to all columns
    keys.forEach(key => {
      _filters[key] = { value, matchMode: FilterMatchMode.CONTAINS };
    });
    
    setFilters(_filters);
    setGlobalFilterValue(value);
  };

  // Format column header from camelCase or snake_case
  const formatColumnHeader = (key) => {
    return key
      .replace(/([A-Z])/g, ' $1') // Insert space before capital letters
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()) // Capitalize first letter
      .join(' ');
  };

  // Format cell value based on type for PrimeReact DataTable
  const formatCellValue = (rowData, column) => {
    const key = column.field;
    const value = rowData[key];
    
    if (typeof value === 'boolean') {
      return (
        <i 
          className={value ? 'pi pi-check' : 'pi pi-times'} 
          style={{ color: value ? '#10b981' : '#ef4444', fontSize: '1.2rem' }}
        />
      );
    } else if (value === null || value === undefined) {
      return '-';
    } else if (typeof value === 'object') {
      return JSON.stringify(value);
    } else {
      return value;
    }
  };
  
  // Header template for the DataTable with search functionality
  const renderHeader = () => {
    return (
      <div className="flex justify-content-between align-items-center">
        <h3 className="m-0">{title}</h3>
        <div className="p-input-icon-left">
          <i className="pi pi-search" />
          <InputText 
            value={globalFilterValue} 
            onChange={onGlobalFilterChange} 
            placeholder="Search..." 
          />
        </div>
      </div>
    );
  };
  
  const header = renderHeader();

  return (
    <div className="data-table-container fade-in">
      <div className="prime-datatable-wrapper">
        <PrimeDataTable 
          value={tableData} 
          paginator 
          rows={5} 
          rowsPerPageOptions={[5, 10, 25]} 
          dataKey="id"
          filters={filters}
          filterDisplay="menu"
          loading={loading}
          responsiveLayout="scroll"
          emptyMessage="No data found."
          header={header}
          scrollable 
          scrollHeight="400px"
          stripedRows
          size="small"
          className="p-datatable-sm p-datatable-gridlines"
        >
          {keys.map((key) => (
            <Column 
              key={key} 
              field={key} 
              header={formatColumnHeader(key)} 
              sortable 
              filter 
              filterPlaceholder={`Search ${formatColumnHeader(key)}`}
              body={(rowData) => formatCellValue(rowData, { field: key })}
              style={{ minWidth: '10rem' }}
            />
          ))}
        </PrimeDataTable>
      </div>
    </div>
  );
};

export default DataTable;
