import { PreviewData } from './api';

/**
 * Interface for the scraper hook functionality
 */
export interface ScraperHook {
  loading: boolean;
  previewData: PreviewData | null;
  extractedData: any[] | null;
  originUrl: string | null;
  scraping: boolean;
  progress: number;
  error: string | null;
  handleFormSubmit: (formData: any) => Promise<void>;
  startScraping: () => Promise<void>;
  resetScraper: () => void;
}
