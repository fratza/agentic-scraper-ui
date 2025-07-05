import { useState, useCallback } from "react";
import apiService from "../services/api";
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
      const MAX_ATTEMPTS = 10;
      const POLL_INTERVAL = 3000; // 3 seconds
      let attempt = 0;
      let data = null;

      const controller = new AbortController();
      const signal = controller.signal;

      // Polling loop
      while (attempt < MAX_ATTEMPTS) {
        try {
          // Try fetching preview from backend
          const fetchPromise = apiService.getSamplePreview(signal);

          // Timeout for each attempt
          const timeoutId = setTimeout(() => {
            controller.abort();
          }, 30000); // 30 seconds

          data = await fetchPromise;
          clearTimeout(timeoutId);

          // If data contains sample, break the loop
          if (data?.sample) break;
        } catch (err) {
          console.error(`Polling attempt ${attempt + 1} failed:`, err);
          // Only wait before next try if not aborted
          if (err.name !== "AbortError") {
            await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL));
          }
        }

        attempt++;
      }

      if (!data?.sample) {
        throw new Error("Preview data not available after polling.");
      }

      // Enrich the data with form information
      const enrichedData = {
        ...data,
        url: formData.url,
        target: formData.scrapeTarget,
        timestamp: new Date().toISOString(),
        status: "ready",
      };

      if (formData.jobId) {
        setJobId(formData.jobId);
      }

      setPreviewData(enrichedData);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error("Error fetching preview data:", err);

      if (err.name === "AbortError") {
        setError(
          "Request timed out. The backend is taking too long to respond."
        );
      } else {
        // Fallback to creating local preview data if API fails
        const fallbackPreviewData = {
          url: formData.url,
          target: formData.scrapeTarget,
          timestamp: new Date().toISOString(),
          status: "ready",
          note: "Using fallback preview data due to API error",
        };

        setPreviewData(fallbackPreviewData);
        setError(
          "Could not fetch preview data from server. Using fallback data."
        );
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
          scrapeTarget: previewData.target,
        });
        setJobId(response.jobId);
      }

      // Start polling for status
      pollScrapeStatus();
    } catch (err) {
      console.error("Error starting scrape:", err);
      setError("Failed to start scraping. Please try again.");
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
          if (statusResponse.status === "completed") {
            clearInterval(statusInterval);
            fetchScrapeResults();
          } else if (statusResponse.status === "failed") {
            clearInterval(statusInterval);
            setError(
              "Scraping failed: " + (statusResponse.error || "Unknown error")
            );
            setScraping(false);
          }
        } catch (err) {
          console.error("Error polling status:", err);
        }
      }, config.ui.progressPollInterval);

      // Safety timeout after configured timeout period
      setTimeout(() => {
        clearInterval(statusInterval);
        if (scraping) {
          setError("Scraping timed out. Please try again.");
          setScraping(false);
        }
      }, config.ui.progressTimeout);
    } catch (err) {
      console.error("Error in poll status:", err);
      setError("Error checking scrape status");
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
      console.error("Error fetching results:", err);
      setError("Failed to fetch scraping results");
      setScraping(false);

      // Just set error state without fallback data
      setScrapedData(null);
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
