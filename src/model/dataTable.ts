import { ReactElement } from 'react';

/**
 * Props for the DataTable component
 */
export interface DataTableProps {
  data: any[] | Record<string, any>;
  title?: string | ReactElement;
  headers?: Record<string, string>; // Optional custom headers mapping (key -> display name)
  cellClassName?: string; // Optional CSS class for table cells
  headerClassName?: string; // Optional CSS class for table headers
}
