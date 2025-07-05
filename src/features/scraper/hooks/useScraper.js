import { useState, useCallback } from 'react';
import apiService from '../services/api';
import { config } from '../../../lib/config';

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

  /**
   * Handle form submission and fetch preview data from the backend
   */
  const handleFormSubmit = useCallback(async (formData) => {
    // Reset states
    setLoading(true);
    setError(null);
    setPreviewData(null); // Clear any previous preview data
    setScrapedData(null);
    
    // Create a controller for potential request cancellation
    const controller = new AbortController();
    const signal = controller.signal;
    
    try {
      // Fetch preview data from the backend with a timeout
      const fetchPromise = apiService.getSamplePreview(signal);
      
      // Set a timeout for the API call (30 seconds)
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 30000);
      
      // Wait for the data
      const data = await fetchPromise;
      clearTimeout(timeoutId);
      
      // If we got here, we have data from the backend
      // Enrich the data with form information
      const enrichedData = {
        ...data,
        url: formData.url,
        target: formData.scrapeTarget,
        timestamp: new Date().toISOString(),
        status: 'ready'
      };
      
      // Store the jobId if it exists in the response
      if (formData.jobId) {
        setJobId(formData.jobId);
      }
      
      // Update state with the data from backend
      setPreviewData(enrichedData);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error fetching preview data:', err);
      
      // Check if this was a timeout or abort
      if (err.name === 'AbortError') {
        setError('Request timed out. The backend is taking too long to respond.');
      } else {
        // Fallback to creating local preview data if API fails
        const fallbackPreviewData = {
          url: formData.url,
          target: formData.scrapeTarget,
          timestamp: new Date().toISOString(),
          status: 'ready',
          note: 'Using fallback preview data due to API error'
        };
        
        setPreviewData(fallbackPreviewData);
        setError('Could not fetch preview data from server. Using fallback data.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Start the scraping process
   */
  const startScraping = useCallback(async () => {
    if (!previewData) return;
    
    setScraping(true);
    setProgress(0);
    setError(null);
    
    try {
      // If we don't have a jobId yet, submit a new scrape request
      if (!jobId) {
        const response = await apiService.submitScrapeRequest({
          url: previewData.url,
          scrapeTarget: previewData.target
        });
        setJobId(response.jobId);
      }
      
      // Start polling for status
      pollScrapeStatus();
    } catch (err) {
      console.error('Error starting scrape:', err);
      setError('Failed to start scraping. Please try again.');
      setScraping(false);
    }
  }, [previewData, jobId]);
  
  /**
   * Poll for scraping status
   */
  const pollScrapeStatus = useCallback(async () => {
    if (!jobId) return;
    
    try {
      // Poll for status every second
      const statusInterval = setInterval(async () => {
        try {
          const statusResponse = await apiService.getScrapeStatus(jobId);
          
          // Update progress
          setProgress(statusResponse.progress || 0);
          
          // If complete, get results
          if (statusResponse.status === 'completed') {
            clearInterval(statusInterval);
            fetchScrapeResults();
          } else if (statusResponse.status === 'failed') {
            clearInterval(statusInterval);
            setError('Scraping failed: ' + (statusResponse.error || 'Unknown error'));
            setScraping(false);
          }
        } catch (err) {
          console.error('Error polling status:', err);
        }
      }, config.ui.progressPollInterval);
      
      // Safety timeout after configured timeout period
      setTimeout(() => {
        clearInterval(statusInterval);
        if (scraping) {
          setError('Scraping timed out. Please try again.');
          setScraping(false);
        }
      }, config.ui.progressTimeout);
    } catch (err) {
      console.error('Error in poll status:', err);
      setError('Error checking scrape status');
      setScraping(false);
    }
  }, [jobId, scraping]);

  /**
   * Fetch scraping results
   */
  const fetchScrapeResults = useCallback(async () => {
    try {
      const resultsResponse = await apiService.getScrapeResults(jobId);
      
      // Set the scraped data from the API response
      setScrapedData(resultsResponse.data || []);
      setScraping(false);
    } catch (err) {
      console.error('Error fetching results:', err);
      setError('Failed to fetch scraping results');
      setScraping(false);
      
      // Fallback to sample data if API fails
      if (previewData) {
        const target = previewData.target.toLowerCase();
        let fallbackData;
        
        if (target.includes('product') || target.includes('price')) {
          fallbackData = generateProductData();
        } else if (target.includes('article') || target.includes('blog')) {
          fallbackData = generateArticleData();
        } else if (target.includes('image')) {
          fallbackData = generateImageData();
        } else {
          fallbackData = generateGenericData();
        }
        
        setScrapedData(fallbackData);
      }
    }
  }, [jobId, previewData]);

  /**
   * Reset the scraper state
   */
  const resetScraper = useCallback(() => {
    setPreviewData(null);
    setScrapedData(null);
    setScraping(false);
    setProgress(0);
    setJobId(null);
    setError(null);
  }, []);

  // Sample data generators
  const generateProductData = () => {
    return [
      { name: "Product A", price: "$19.99", rating: 4.5, inStock: true },
      { name: "Product B", price: "$24.99", rating: 3.8, inStock: true },
      { name: "Product C", price: "$15.99", rating: 4.2, inStock: false }
    ];
  };

  const generateArticleData = () => {
    return [
      { title: "Latest Industry News", author: "Jane Doe", date: "2023-05-15", readTime: "5 min" },
      { title: "10 Tips for Success", author: "John Smith", date: "2023-05-10", readTime: "8 min" },
      { title: "The Future of Technology", author: "Alex Johnson", date: "2023-05-05", readTime: "12 min" }
    ];
  };

  const generateImageData = () => {
    return [
      { url: "https://example.com/image1.jpg", alt: "Product showcase", width: 800, height: 600 },
      { url: "https://example.com/image2.jpg", alt: "Team photo", width: 1200, height: 800 },
      { url: "https://example.com/image3.jpg", alt: "Office location", width: 1600, height: 900 }
    ];
  };

  const generateGenericData = () => {
    return [
      { id: 1, title: "Item 1", description: "Description for item 1" },
      { id: 2, title: "Item 2", description: "Description for item 2" },
      { id: 3, title: "Item 3", description: "Description for item 3" },
      { id: 4, title: "Item 4", description: "Description for item 4" }
    ];
  };

  return {
    loading,
    previewData,
    scrapedData,
    scraping,
    progress,
    error,
    handleFormSubmit,
    startScraping,
    resetScraper
  };
};

export default useScraper;
