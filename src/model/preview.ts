/**
 * Props for the Preview component
 */
export interface PreviewProps {
  previewData: any;
  onScrape: (resumeLink: string) => void;
  scraping: boolean;
  progress: number;
  scrapedData: any[] | null;
  error: string | null;
  onClose: () => void;
  resetScraper: () => void;
}
