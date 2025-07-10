import { ReactNode } from 'react';

/**
 * Props for the XMLPreviewData component
 */
export interface XMLPreviewDataProps {
  isOpen: boolean;
  onClose: () => void;
  xmlData: XMLRowData[];
  onAddRow: () => void;
}

/**
 * Structure for XML row data
 */
export interface XMLRowData {
  id: string | number;
  fieldName: string;
  value: any;
}
