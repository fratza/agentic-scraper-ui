import React from "react";

/**
 * Props for the TableDisplay component
 */
export interface TableDisplayProps {
  tableData: any[];
  loading: boolean;
  formatColumnHeader: (key: string) => string;
  formatCellValue: (rowData: any, column: { field: string }) => React.ReactNode;
  keys: string[];
}
