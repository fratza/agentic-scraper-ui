/**
 * Type definitions for the Scraper UI application
 */

/**
 * Preview data returned from the API
 */
export interface PreviewData {
  url?: string;
  target?: string;
  timestamp?: string;
  status?: string;
  data?: any;
  run_id?: string;
  sample?: Array<any>;
  [key: string]: any;
}

/**
 * Form data for scrape requests
 */
export interface ScrapeFormData {
  url: string;
  scrapeTarget: string;
  jobId?: string;
  resume_link?: string;
}

/**
 * Response from the scrape status API
 */
export interface ScrapeStatusResponse {
  status: string;
  progress: number;
  error?: string;
  jobId: string;
}

/**
 * Response from the scrape results API
 */
export interface ScrapeResultsResponse {
  data: Array<Record<string, any>>;
  jobId: string;
  url: string;
  target: string;
  timestamp: string;
}

/**
 * API error structure
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  code?: string;
}

/**
 * Server-sent event data structure
 */
export interface SSEEventData {
  type: string;
  data: any;
  timestamp: string;
}

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
