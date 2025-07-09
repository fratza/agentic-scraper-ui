/**
 * Common interfaces used across multiple components
 */

/**
 * Table data row
 */
export interface TableRow {
  id: string;
  [key: string]: any;
}

/**
 * Filter configuration for tables
 */
export interface FilterConfig {
  value: any;
  matchMode: string;
}

/**
 * Form data for scrape requests
 */
export interface FormSubmitData {
  url: string;
  scrapeTarget?: string;
  jobId?: string;
  parseType?: string;
}

/**
 * Form errors structure
 */
export interface FormErrors {
  url?: string;
  scrapeTarget?: string;
  api?: string;
}
