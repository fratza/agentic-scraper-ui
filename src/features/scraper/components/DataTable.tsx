import React, { ReactElement } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import "../../../styles/SharedTable.css";
import "./DataTable.css";
import { DataTableProps } from "../../../model";

const DataTable: React.FC<DataTableProps> = ({
  data,
  title,
  headers,
  cellClassName,
  headerClassName,
}) => {
  // If data is empty or null, return null
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return null;
  }

  // Format the data for display
  const formatValue = (value: any): string | ReactElement => {
    if (value === null || value === undefined) {
      return "";
    }

    if (typeof value === "boolean") {
      return value ? "✓" : "✗";
    }

    if (typeof value === "object" && !Array.isArray(value)) {
      return <pre>{JSON.stringify(value, null, 2)}</pre>;
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }

    return String(value);
  };

  // Prepare data for the table
  const tableData = Array.isArray(data) ? data : [data];
  
  // Get all keys from the first item
  const firstItem = tableData[0];
  const keys = Object.keys(firstItem);

  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {title && (
        <Typography 
          variant="h6" 
          component="h3" 
          sx={{ mb: 1, fontWeight: 600, fontSize: '1rem' }}
          className="shared-table-title"
        >
          {title}
        </Typography>
      )}
      
      <TableContainer component={Paper} sx={{ boxShadow: 2, borderRadius: 1 }}>
        <Table size="small" sx={{ minWidth: 500 }} aria-label="data table">
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
              <TableCell 
                className={headerClassName} 
                sx={{ fontWeight: 'bold', width: '40px', padding: '6px 8px', fontSize: '0.75rem' }}
              >
                #
              </TableCell>
              
              {keys.map((key) => (
                <TableCell 
                  key={key} 
                  className={headerClassName}
                  sx={{ fontWeight: 'bold', padding: '6px 8px', fontSize: '0.75rem' }}
                >
                  {headers && headers[key] ? headers[key] : key}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          
          <TableBody>
            {tableData.map((row, index) => (
              <TableRow
                key={index}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, '&:hover': { backgroundColor: '#f8f9fa' } }}
              >
                <TableCell 
                  component="th" 
                  scope="row" 
                  sx={{ width: '40px', padding: '4px 8px', fontSize: '0.75rem' }}
                >
                  {index + 1}
                </TableCell>
                
                {keys.map((key) => (
                  <TableCell 
                    key={key} 
                    className={cellClassName}
                    sx={{ padding: '4px 8px', fontSize: '0.75rem' }}
                  >
                    {formatValue(row[key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DataTable;
