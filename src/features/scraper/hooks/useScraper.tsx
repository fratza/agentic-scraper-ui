import { useState, useCallback, useRef, useEffect } from "react";
import apiService from "../../../services/api";
import { config } from "../../../lib/config";
import { PreviewData, ScraperHook } from "../../../model";

/**
 * Custom hook for managing scraper state and operations
 */
const useScraper = (): ScraperHook => {
  const [loading, setLoading] = useState<boolean>(false);
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [extractedData, SetExtractedData] = useState<any[] | null>(null);
  const [originUrl, setOriginUrl] = useState<string | null>(null);
  const [scraping, setScraping] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs for event sources
  const previewEventSourceRef = useRef<EventSource | null>(null);
  const scrapingEventSourceRef = useRef<EventSource | null>(null);

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
  const handleFormSubmit = useCallback(async (formData: any) => {
    // Reset states
    setLoading(true);
    setError(null);
    setPreviewData(null); // Clear any previous preview data
    SetExtractedData(null);

    // Close any existing event source
    if (previewEventSourceRef.current) {
      apiService.closeEventSource(previewEventSourceRef.current);
      previewEventSourceRef.current = null;
    }

    try {
      // Set up timeout for preview data
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error("Preview request timed out"));
        }, 120000); // 2 minutes timeout (increased from 30 seconds)
      });

      // Create a new promise for SSE connection
      const ssePromise = new Promise<PreviewData>((resolve, reject) => {
        const eventSource = apiService.createPreviewEventSource(formData);
        previewEventSourceRef.current = eventSource;

        eventSource.onopen = () => {
          setTimeout(() => {
            if (loading && !previewData) {
              apiService
                .getSamplePreview()
                .then((data) => {
                  if (data) {
                    console.log("Setting preview data from fallback:", data);
                    setPreviewData(data);
                    setLoading(false);
                    apiService.closeEventSource(eventSource);
                    previewEventSourceRef.current = null;
                  }
                })
                .catch((err) =>
                  console.error("Fallback preview request failed:", err)
                );
            }
          }, 10000);
        };

        eventSource.addEventListener("connect", (event) => {
          // SSE connection established
          // This just confirms the connection, we still need to wait for data
        });

        // Handle message events (contains the actual preview data)
        eventSource.addEventListener("preview", (event: MessageEvent) => {
          try {
            const parsedData = JSON.parse(event.data);

            // Extract the actual data from the structure
            // The SSE data structure is: { timestamp: "...", data: { ... } }
            let previewData: PreviewData = parsedData;

            // Check if the data is nested inside a data property
            if (parsedData && parsedData.data) {
              previewData = parsedData.data;
            }

            // Check content type from the parsed data
            console.log("Preview data received:", parsedData);
            // The content_type is at the root level of the parsed data
            const contentType = parsedData.content_type || "html";
            console.log("Content type detected in preview:", contentType);

            // Store content type with the preview data
            // Handle both "rss" and "xml" content types
            const isXmlContent = contentType === "rss" || contentType === "xml";
            previewData = {
              ...previewData,
              contentType: isXmlContent ? "xml" : "html",
            };

            if (
              previewData &&
              !previewData.sample &&
              typeof previewData === "object"
            ) {
              previewData = {
                ...previewData,
                sample: Array.isArray(previewData)
                  ? previewData
                  : [previewData],
              };
            }

            setPreviewData(previewData);
            setLoading(false);

            // Close the SSE connection immediately after receiving the preview event
            console.log(
              "Closing preview SSE connection after receiving preview event"
            );
            apiService.closeEventSource(eventSource);
            previewEventSourceRef.current = null;
            resolve(previewData);
          } catch (err) {
            console.error("Error parsing preview data:", err);
            reject(err);
          }
        });

        // Handle errors
        eventSource.onerror = (err) => {
          // SSE connection error
          console.error("Preview SSE error:", err);
          apiService.closeEventSource(eventSource);
          previewEventSourceRef.current = null;

          // Instead of rejecting, let's try a fallback approach
          apiService
            .getSamplePreview()
            .then((data) => {
              if (data) {
                // Use raw data directly without enrichment
                setPreviewData(data);
                setLoading(false);
                resolve(data);
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
        // Still waiting for preview data
        // You could update UI here to show waiting time or a more detailed status
      }, 10000); // Update every 10 seconds

      try {
        // Race between SSE and timeout
        await Promise.race([ssePromise, timeoutPromise]);
      } finally {
        // Clear the status update interval
        clearInterval(statusUpdateInterval);
      }
    } catch (err: any) {
      console.error("Error fetching preview data:", err);

      if (err.message === "Preview request timed out") {
        // Instead of showing error, we could continue waiting or show a more friendly message
        setError(
          "The backend is still processing. You can continue waiting or try again later."
        );
      } else {
        // Fallback to creating minimal data structure if API fails
        const fallbackPreviewData: PreviewData = {
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
   * Start the scraping process using the resume_link and run_id from the preview data
   */
  const startScraping = useCallback(
    async (resume_link: string) => {
      // Reset any previous scraping state
      SetExtractedData(null);
      setError(null);
      setScraping(true); // Open the loading modal
      setProgress(0);

      // Close any existing scraping event source
      if (scrapingEventSourceRef.current) {
        apiService.closeEventSource(scrapingEventSourceRef.current);
        scrapingEventSourceRef.current = null;
      }

      // Extract run_id from preview data if available
      let runId: string | null = null;
      try {
        // Check different possible locations for run_id
        if (previewData?.data?.run_id) {
          runId = previewData.data.run_id;
        } else if (previewData?.run_id) {
          runId = previewData.run_id;
        } else if (previewData?.sample?.[0]?.run_id) {
          runId = previewData.sample[0].run_id;
        }

        if (runId) {
          // Found run_id in preview data
        }
      } catch (err) {
        console.error("Error extracting run_id from preview data:", err);
      }

      // Trigger the workflow if resume_link is provided
      if (resume_link) {
        console.log(
          "Triggering scraping workflow with resume_link:",
          resume_link
        );
        const triggered = apiService.triggerN8nWorkflow(resume_link);

        if (!triggered) {
          setError("Failed to trigger scraping workflow");
          setScraping(false);
          return;
        }
      }

      // Set up SSE for scraped data
      try {
        // Create SSE connection to listen for extractedData events
        const eventSource = apiService.createScrapingEventSource(
          `direct-${Date.now()}`,
          runId
        );
        scrapingEventSourceRef.current = eventSource;

        // Handle connection open
        eventSource.onopen = () => {
          // Scraping SSE connection established
        };

        eventSource.addEventListener("scrapedData", (event: MessageEvent) => {
          try {
            const parsedData = JSON.parse(event.data);

            console.log("Received scraped data:", parsedData);
            
            // Check for origin URL in the parsed data
            if (parsedData.url || parsedData.origin_url || (parsedData.data && parsedData.data.url)) {
              const url = parsedData.url || parsedData.origin_url || parsedData.data.url;
              setOriginUrl(url);
              console.log("Origin URL set:", url);
            }
            
            if (parsedData.data && parsedData.data.extractedData) {
              let extractedData = parsedData.data.extractedData;
              
              // If extractedData is an array, remove uuid from each item
              if (Array.isArray(extractedData)) {
                extractedData = extractedData.map(item => {
                  if (item && typeof item === 'object') {
                    const { uuid, ...rest } = item;
                    return rest;
                  }
                  return item;
                });
              } 
              // If extractedData is an object, remove uuid from it
              else if (extractedData && typeof extractedData === 'object') {
                const { uuid, ...rest } = extractedData;
                extractedData = rest;
              }
              
              // Set extracted data without uuid
              SetExtractedData(extractedData);
            } else {
              SetExtractedData([
                { message: "No Data Found" },
              ]);
            }

            setScraping(false);
            setProgress(100);

            // Close the SSE connection
            apiService.closeEventSource(eventSource);
            scrapingEventSourceRef.current = null;
          } catch (err) {
            console.error("Error parsing extractedData:", err);
            setError("Error processing extracted data");
            setScraping(false);
          }
        });

        // Handle progress events if available
        eventSource.addEventListener("message", (event: MessageEvent) => {
          try {
            const parsedData = JSON.parse(event.data);
            // Received progress message

            if (parsedData.progress !== undefined) {
              setProgress(parsedData.progress);
            }
          } catch (err) {
            console.error("Error parsing progress data:", err);
          }
        });

        // Handle errors
        eventSource.addEventListener("error", (event) => {
          // SSE connection error
          console.error("Scraping SSE error:", event);
          setError("Error receiving extracted data");
          setScraping(false);

          // Close the connection
          apiService.closeEventSource(eventSource);
          scrapingEventSourceRef.current = null;
        });

        // Safety timeout
        setTimeout(() => {
          if (scrapingEventSourceRef.current === eventSource) {
            setError("Scraping timed out. Please try again.");
            setScraping(false);

            // Close the connection
            apiService.closeEventSource(eventSource);
            scrapingEventSourceRef.current = null;
          }
        }, config.ui.progressTimeout || 240000);
      } catch (err) {
        console.error("Error setting up direct scraping SSE:", err);
        setError("Failed to connect to extracted data stream");
        setScraping(false);
      }
    },
    [previewData]
  );

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
    SetExtractedData(null);
    setScraping(false);
    setProgress(0);
    setJobId(null);
    setError(null);
  }, []);

  return {
    loading,
    previewData,
    extractedData, // Keeping for backward compatibility
    originUrl,
    scraping,
    progress,
    error,
    handleFormSubmit,
    startScraping,
    resetScraper,
  };
};

export default useScraper;
