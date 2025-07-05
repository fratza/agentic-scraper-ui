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
          reject(new Error("Preview request timed out"));
        }, 120000); // 2 minutes timeout (increased from 30 seconds)
      });

      // Create a new promise for SSE connection
      const ssePromise = new Promise((resolve, reject) => {
        // Create SSE connection
        const eventSource = apiService.createPreviewEventSource(formData);
        previewEventSourceRef.current = eventSource;

        // Handle connection open
        eventSource.onopen = () => {
          console.log("Preview SSE connection established");
          // Add a timeout to handle case where connection is established but no events are received
          setTimeout(() => {
            // If we're still loading and haven't received any events
            if (loading && !previewData) {
              console.log("No preview events received after connection open");
              // Try a fallback approach - make a direct API call
              apiService
                .getSamplePreview()
                .then((data) => {
                  if (data) {
                    console.log("Received fallback preview data:", data);
                    // Use raw data directly without enrichment
                    console.log(
                      "Setting raw preview data from fallback:",
                      data
                    );
                    setPreviewData(data);
                    setLoading(false);
                    // Close the SSE connection since we're using fallback data
                    apiService.closeEventSource(eventSource);
                    previewEventSourceRef.current = null;
                  }
                })
                .catch((err) =>
                  console.error("Fallback preview request failed:", err)
                );
            }
          }, 10000); // Wait 10 seconds for events before trying fallback
        };

        // Handle connect event
        eventSource.addEventListener("connect", (event) => {
          console.log("SSE connection established with event:", event);
          // This just confirms the connection, we still need to wait for data
        });

        // Handle message events (contains the actual preview data)
        eventSource.addEventListener("preview", (event) => {
          try {
            const parsedData = JSON.parse(event.data);
            console.log("Received SSE message data:", parsedData);

            // Use the raw data directly from the backend
            // This preserves the original structure sent by the server
            console.log("Setting raw preview data:", parsedData);
            setPreviewData(parsedData);
            setLoading(false);

            // Close the SSE connection since we have the data
            apiService.closeEventSource(eventSource);
            previewEventSourceRef.current = null;
            resolve(parsedData);
          } catch (err) {
            console.error("Error parsing preview data:", err);
            reject(err);
          }
        });

        // Handle errors
        eventSource.onerror = (err) => {
          console.error("Preview SSE error:", err);
          apiService.closeEventSource(eventSource);
          previewEventSourceRef.current = null;

          // Instead of rejecting, let's try a fallback approach
          console.log("Trying fallback after SSE error");
          apiService
            .getSamplePreview()
            .then((data) => {
              if (data) {
                console.log(
                  "Received fallback preview data after error:",
                  data
                );
                // Use raw data directly without enrichment
                console.log(
                  "Setting raw preview data from error fallback:",
                  data
                );
                setPreviewData(data);
                setLoading(false);
                resolve(data);
              } else {
                reject(
                  new Error("Error in preview data stream and fallback failed")
                );
              }
            })
            .catch((err) => {
              console.error("Fallback preview request failed:", err);
              reject(
                new Error("Error in preview data stream and fallback failed")
              );
            });
        };
      });

      // Set up a status update for long-running requests
      const statusUpdateInterval = setInterval(() => {
        console.log("Still waiting for preview data...");
        // You could update UI here to show waiting time or a more detailed status
      }, 10000); // Update every 10 seconds

      try {
        // Race between SSE and timeout
        await Promise.race([ssePromise, timeoutPromise]);
      } finally {
        // Clear the status update interval
        clearInterval(statusUpdateInterval);
      }
    } catch (err) {
      console.error("Error fetching preview data:", err);

      if (err.message === "Preview request timed out") {
        // Instead of showing error, we could continue waiting or show a more friendly message
        setError(
          "The backend is still processing. You can continue waiting or try again later."
        );
      } else {
        // Fallback to creating minimal data structure if API fails
        const fallbackPreviewData = {
          data: {
            message: "No data available",
            error: "API connection failed",
          },
          timestamp: new Date().toISOString(),
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
   * Start the scraping process using SSE for status updates
   */
  const startScraping = useCallback(
    async (resume_link) => {
      if (!previewData) return;

      // Check if resume_link exists, if not, set error and return
      if (!resume_link) {
        setError("Session expired. Please try again.");
        return;
      }

      setScraping(true);
      setProgress(0);
      setError(null);

      // Log the resume_link that will be sent to n8n
      console.log("Triggering n8n workflow with resume_link:", resume_link);

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
            resume_link: resume_link || null, // Pass resume_link if provided
          });
          currentJobId = response.jobId;
          setJobId(currentJobId);
        }

        // Set up SSE for scraping progress
        const eventSource = apiService.createScrapingEventSource(currentJobId);
        scrapingEventSourceRef.current = eventSource;

        // Handle connection open
        eventSource.onopen = () => {
          console.log("Scraping SSE connection established");
        };

        // Handle connect event
        eventSource.addEventListener("connect", (event) => {
          console.log("Scraping SSE connection established with event:", event);
        });

        // Handle message events (contains progress or completion data)
        eventSource.addEventListener("message", (event) => {
          try {
            const parsedData = JSON.parse(event.data);
            console.log("Received scraping message data:", parsedData);

            // Check if this is a progress update
            if (
              parsedData.type === "progress" ||
              parsedData.progress !== undefined
            ) {
              setProgress(parsedData.progress || 0);
            }
            // Check if this is a completion message
            else if (parsedData.type === "completed" || parsedData.data) {
              setScrapedData(parsedData.data || []);
              setScraping(false);
              setProgress(100);

              // Close the connection since scraping is complete
              apiService.closeEventSource(eventSource);
              scrapingEventSourceRef.current = null;
            }
          } catch (err) {
            console.error("Error parsing message data:", err);
          }
        });

        // Handle errors
        eventSource.addEventListener("error", (event) => {
          try {
            const data = JSON.parse(event.data);
            setError("Scraping failed: " + (data.error || "Unknown error"));
          } catch (err) {
            setError("Scraping failed with an unknown error");
            console.error("Error parsing error data:", err);
          }
          setScraping(false);

          // Close the connection on error
          apiService.closeEventSource(eventSource);
          scrapingEventSourceRef.current = null;
        });

        // Handle general errors
        eventSource.onerror = () => {
          console.error("Scraping SSE connection error");
          setError("Lost connection to the server");
          setScraping(false);

          // Close the connection
          apiService.closeEventSource(eventSource);
          scrapingEventSourceRef.current = null;
        };

        // Safety timeout
        setTimeout(() => {
          if (scrapingEventSourceRef.current === eventSource) {
            setError("Scraping timed out. Please try again.");
            setScraping(false);

            // Close the connection
            apiService.closeEventSource(eventSource);
            scrapingEventSourceRef.current = null;
          }
        }, config.ui.progressTimeout);
      } catch (err) {
        console.error("Error starting scrape:", err);
        setError("Failed to start scraping. Please try again.");
        setScraping(false);
      }
    },
    [previewData, jobId]
  );

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
