import { ReactElement } from 'react';

/**
 * Interface for URL row data in the OriginUrlsTable
 */
export interface UrlRow {
  id: string;
  origin_url: string;
  status?: string;
}

/**
 * Props for the OriginUrlsTable component
 */
export interface OriginUrlsTableProps {
  data?: UrlRow[];
  onViewResult: (url: string) => void;
  title?: string | ReactElement;
  originUrl?: string;
  loading?: boolean;
}

/**
 * Status types for URL rows
 */
export type UrlStatus = 'Active' | 'Pending' | 'Completed' | 'Error' | 'Unknown';

/**
 * Interface for API response from URL list endpoint
 */
export interface UrlListResponse {
  status: "success" | "error";
  data: string[] | UrlRow[];
  message?: string;
}

/**
 * Interface for TaskNameModal props
 */
export interface TaskNameModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskName: string, id: string) => void;
  id: string;
}

/**
 * Interface for TaskNameModal form data
 */
export interface TaskNameFormData {
  task_name: string;
}
