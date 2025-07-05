import { useState, useCallback, useRef, useEffect } from "react";
import apiService from "../../../services/api";
import { config } from "../../../lib/config";

/**
 * Custom hook for managing scraper state and operations
 */
const useScraper = () => {
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [scrapedData, setScrapedData] = useState(null);
  const [scraping, setScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState(null);

  // Refs for event sources
  const previewEventSourceRef = useRef(null);
  const scrapingEventSourceRef = useRef(null);
  
  // Cleanup event sources on unmount
  useEffect(() => {
    return () => {
      if (previewEventSourceRef.current) {
        apiService.closeEventSource(previewEventSourceRef.current);
      }
      if (scrapingEventSourceRef.current) {
        apiService.closeEventSource(scrapingEventSourceRef.current);
      }
    };
  }, []);

  /**
   * Handle form submission and fetch preview data from the backend using SSE
   */
  const handleFormSubmit = useCallback(async (formData) => {
    // Reset states
    setLoading(true);
    setError(null);
    setPreviewData(null); // Clear any previous preview data
    setScrapedData(null);
    
    // Close any existing event source
    if (previewEventSourceRef.current) {
      apiService.closeEventSource(previewEventSourceRef.current);
      previewEventSourceRef.current = null;
    }

    try {
      // Set up timeout for preview data
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Preview request timed out'));
        }, 30000); // 30 seconds timeout
      });
      
      // Create a new promise for SSE connection
      const ssePromise = new Promise((resolve, reject) => {
        // Create SSE connection
        const eventSource = apiService.createPreviewEventSource(formData);
        previewEventSourceRef.current = eventSource;
        
        // Handle connection open
        eventSource.onopen = () => {
          console.log('Preview SSE connection established');
        };
        
        // Handle preview data events
        eventSource.addEventListener('preview', (event) => {
          try {
            const data = JSON.parse(event.data);
            
            // Enrich the data with form information
            const enrichedData = {
              ...data,
              url: formData.url,
              target: formData.scrapeTarget,
              timestamp: new Date().toISOString(),
              status: 'ready',
            };
            
            if (formData.jobId) {
              setJobId(formData.jobId);
            }
            
            setPreviewData(enrichedData);
            setError(null);
            resolve(enrichedData);
            
            // Close the connection since we got what we needed
            apiService.closeEventSource(eventSource);
            previewEventSourceRef.current = null;
          } catch (err) {
            console.error('Error parsing preview data:', err);
            reject(err);
          }
        });
        
        // Handle errors
        eventSource.onerror = (err) => {
          console.error('Preview SSE error:', err);
          apiService.closeEventSource(eventSource);
          previewEventSourceRef.current = null;
          reject(new Error('Error in preview data stream'));
        };
      });
      
      // Race between SSE and timeout
      await Promise.race([ssePromise, timeoutPromise]);
      
    } catch (err) {
      console.error('Error fetching preview data:', err);
      
      if (err.message === 'Preview request timed out') {
        setError('Request timed out. The backend is taking too long to respond.');
      } else {
        // Fallback to creating local preview data if API fails
        const fallbackPreviewData = {
          url: formData.url,
          target: formData.scrapeTarget,
          timestamp: new Date().toISOString(),
          status: 'ready',
          note: 'Using fallback preview data due to API error',
        };
        
        setPreviewData(fallbackPreviewData);
        setError('Could not fetch preview data from server. Using fallback data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Start the scraping process using SSE for status updates
   */
  const startScraping = useCallback(async () => {
    if (!previewData) return;

    setScraping(true);
    setProgress(0);
    setError(null);
    
    // Close any existing event source
    if (scrapingEventSourceRef.current) {
      apiService.closeEventSource(scrapingEventSourceRef.current);
      scrapingEventSourceRef.current = null;
    }

    try {
      // If we don't have a jobId yet, submit a new scrape request
      let currentJobId = jobId;
      if (!currentJobId) {
        const response = await apiService.submitScrapeRequest({
          url: previewData.url,
          scrapeTarget: previewData.target,
        });
        currentJobId = response.jobId;
        setJobId(currentJobId);
      }

      // Set up SSE for scraping progress
      const eventSource = apiService.createScrapingEventSource(currentJobId);
      scrapingEventSourceRef.current = eventSource;
      
      // Handle connection open
      eventSource.onopen = () => {
        console.log('Scraping SSE connection established');
      };
      
      // Handle progress updates
      eventSource.addEventListener('progress', (event) => {
        try {
          const data = JSON.parse(event.data);
          setProgress(data.progress || 0);
        } catch (err) {
          console.error('Error parsing progress data:', err);
        }
      });
      
      // Handle completion
      eventSource.addEventListener('completed', (event) => {
        try {
          const data = JSON.parse(event.data);
          setScrapedData(data.data || []);
          setScraping(false);
          setProgress(100);
          
          // Close the connection since scraping is complete
          apiService.closeEventSource(eventSource);
          scrapingEventSourceRef.current = null;
        } catch (err) {
          console.error('Error parsing completion data:', err);
        }
      });
      
      // Handle errors
      eventSource.addEventListener('error', (event) => {
        try {
          const data = JSON.parse(event.data);
          setError('Scraping failed: ' + (data.error || 'Unknown error'));
        } catch (err) {
          setError('Scraping failed with an unknown error');
          console.error('Error parsing error data:', err);
        }
        setScraping(false);
        
        // Close the connection on error
        apiService.closeEventSource(eventSource);
        scrapingEventSourceRef.current = null;
      });
      
      // Handle general errors
      eventSource.onerror = () => {
        console.error('Scraping SSE connection error');
        setError('Lost connection to the server');
        setScraping(false);
        
        // Close the connection
        apiService.closeEventSource(eventSource);
        scrapingEventSourceRef.current = null;
      };
      
      // Safety timeout
      setTimeout(() => {
        if (scrapingEventSourceRef.current === eventSource) {
          setError('Scraping timed out. Please try again.');
          setScraping(false);
          
          // Close the connection
          apiService.closeEventSource(eventSource);
          scrapingEventSourceRef.current = null;
        }
      }, config.ui.progressTimeout);
      
    } catch (err) {
      console.error('Error starting scrape:', err);
      setError('Failed to start scraping. Please try again.');
      setScraping(false);
    }
  }, [previewData, jobId]);

  // Removed pollScrapeStatus as it's replaced by SSE

  // Removed fetchScrapeResults as it's replaced by SSE

  /**
   * Reset the scraper state and close any active connections
   */
  const resetScraper = useCallback(() => {
    // Close any active SSE connections
    if (previewEventSourceRef.current) {
      apiService.closeEventSource(previewEventSourceRef.current);
      previewEventSourceRef.current = null;
    }
    
    if (scrapingEventSourceRef.current) {
      apiService.closeEventSource(scrapingEventSourceRef.current);
      scrapingEventSourceRef.current = null;
    }
    
    // Reset all state
    setPreviewData(null);
    setScrapedData(null);
    setScraping(false);
    setProgress(0);
    setJobId(null);
    setError(null);
  }, []);

  // No mock data generators - removed

  return {
    loading,
    previewData,
    scrapedData,
    scraping,
    progress,
    error,
    handleFormSubmit,
    startScraping,
    resetScraper,
  };
};

export default useScraper;
