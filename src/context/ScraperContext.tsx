import React, { createContext, useContext } from 'react';
import useScraper from '../features/scraper/hooks/useScraper';
import { ScraperHook, ScraperProviderProps } from '../model';

// Use the ScraperHook interface from model folder
type ScraperContextType = ScraperHook;

// Create the context with a default value
const ScraperContext = createContext<ScraperContextType | undefined>(undefined);

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
