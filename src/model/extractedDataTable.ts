import { FilterMatchMode } from "primereact/api";

/**
 * Props for the ExtractedDataTable component
 */
export interface ExtractedDataTableProps {
  extractedData?: any;
  onBackToMain?: () => void;
}

/**
 * Props for the ImageWithToggle component used in ExtractedDataTable
 */
export interface ImageWithToggleProps {
  url: string;
}

/**
 * Filter display options for data tables
 */
export interface FilterDisplayOptions {
  [key: string]: {
    value: any;
    matchMode: FilterMatchMode;
  };
}
