import React, { createContext, useContext, ReactNode } from 'react';
import useScraper from '../features/scraper/hooks/useScraper';
import { PreviewData } from '../types/scraper';

// Define the context type
interface ScraperContextType {
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

// Create the context with a default value
const ScraperContext = createContext<ScraperContextType | undefined>(undefined);

// Provider component
interface ScraperProviderProps {
  children: ReactNode;
}

export const ScraperProvider: React.FC<ScraperProviderProps> = ({ children }) => {
  // Use the useScraper hook to get all the scraper functionality
  const scraperState = useScraper();
  
  return (
    <ScraperContext.Provider value={scraperState}>
      {children}
    </ScraperContext.Provider>
  );
};

// Custom hook for using the scraper context
export const useScraperContext = (): ScraperContextType => {
  const context = useContext(ScraperContext);
  
  if (context === undefined) {
    throw new Error('useScraperContext must be used within a ScraperProvider');
  }
  
  return context;
};
