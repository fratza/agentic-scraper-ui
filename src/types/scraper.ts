// Define types for the scraper state and data
export interface PreviewData {
  data?: {
    run_id?: string;
    [key: string]: any;
  };
  run_id?: string;
  sample?: Array<any>;
  timestamp?: string;
  [key: string]: any;
}

export interface ScraperHook {
  loading: boolean;
  previewData: PreviewData | null;
  extractedData: any[] | null;
  scraping: boolean;
  progress: number;
  error: string | null;
  handleFormSubmit: (formData: any) => Promise<void>;
  startScraping: (resume_link: string) => Promise<void>;
  resetScraper: () => void;
}
