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
            console.log("Raw SSE event data:", event.data);
            const parsedData = JSON.parse(event.data);
            console.log("Parsed SSE message data:", parsedData);

            // Extract the actual data from the structure
            // The SSE data structure is: { timestamp: "...", data: { ... } }
            let previewData = parsedData;

            // Check if the data is nested inside a data property
            if (parsedData && parsedData.data) {
              console.log("Data is nested inside data property");
              previewData = parsedData.data;
            }

            console.log("Extracted preview data:", previewData);

            // Debug the structure of the data
            console.log("Preview data structure:", {
              hasData: !!previewData,
              hasSample: previewData && !!previewData.sample,
              sampleType:
                previewData && previewData.sample
                  ? typeof previewData.sample
                  : "none",
              isArray:
                previewData && previewData.sample
                  ? Array.isArray(previewData.sample)
                  : false,
              hasResumeLink: previewData && !!previewData.resume_link,
              keys: previewData ? Object.keys(previewData) : [],
            });

            // If the data doesn't have a sample property but is an array or object,
            // we need to add it to make the table display work
            if (
              previewData &&
              !previewData.sample &&
              typeof previewData === "object"
            ) {
              console.log("Adding sample property to preview data");
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
   * Start the scraping process using the job ID from the preview data
   * or directly trigger n8n workflow if resume_link is provided
   */
  const startScraping = useCallback(
    async (resume_link) => {
      if (!previewData) return;

      // Reset any previous scraping state
      setScrapedData(null);
      setError(null);
      setScraping(true);
      setProgress(0);

      // Close any existing scraping event source
      if (scrapingEventSourceRef.current) {
        apiService.closeEventSource(scrapingEventSourceRef.current);
        scrapingEventSourceRef.current = null;
      }

      // If resume_link is provided, directly trigger the n8n workflow
      if (resume_link) {
        console.log(
          "Directly triggering n8n workflow with resume_link:",
          resume_link
        );

        // Store the resume_link in localStorage with a timestamp
        try {
          localStorage.setItem("resume_link", resume_link);
          localStorage.setItem("resume_link_timestamp", Date.now());
          console.log("Stored resume_link in localStorage:", resume_link);
        } catch (err) {
          console.error("Failed to store resume_link in localStorage:", err);
        }

        // Trigger the n8n workflow directly
        const triggered = apiService.triggerN8nWorkflow(resume_link);

        if (triggered) {
          // Keep scraping state true until we receive the scrapedData event
          // Don't simulate progress or auto-complete the process
          console.log("N8n workflow triggered, waiting for scrapedData event");

          // Set up SSE for scraped data
          try {
            const eventSource = apiService.createScrapingEventSource(
              `direct-${Date.now()}`
            );
            scrapingEventSourceRef.current = eventSource;

            // Handle connection open
            eventSource.onopen = () => {
              console.log("Direct scraping SSE connection established");
            };

            // Handle scrapedData events
            eventSource.addEventListener("scrapedData", (event) => {
              try {
                console.log("Raw scrapedData event:", event.data);
                const parsedData = JSON.parse(event.data);
                console.log("Received scrapedData:", parsedData);

                // Set the scraped data and update UI state
                setScrapedData(parsedData.data || parsedData);
                setScraping(false);
                setProgress(100);

                // Close the connection
                console.log(
                  "Closing direct scraping SSE connection after receiving scrapedData event"
                );
                apiService.closeEventSource(eventSource);
                scrapingEventSourceRef.current = null;
              } catch (err) {
                console.error("Error parsing scrapedData:", err);
              }
            });

            // Handle errors
            eventSource.addEventListener("error", (event) => {
              console.error("Direct scraping SSE error:", event);
              setError("Error receiving scraped data");
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
            }, config.ui.progressTimeout);
          } catch (err) {
            console.error("Error setting up direct scraping SSE:", err);
            setError("Failed to connect to scraped data stream");
            setScraping(false);
          }

          return;
        } else {
          setError("Failed to trigger n8n workflow");
          setScraping(false);
          return;
        }
      } else {
        // Try to retrieve from localStorage if not provided
        try {
          const storedLink = localStorage.getItem("resume_link");
          const timestamp = localStorage.getItem("resume_link_timestamp");

          // Check if the link is still valid (less than 30 minutes old)
          const isValid =
            timestamp && Date.now() - parseInt(timestamp) < 30 * 60 * 1000;

          if (storedLink && isValid) {
            // Use the stored link to directly trigger n8n workflow
            console.log("Retrieved resume_link from localStorage:", storedLink);
            const triggered = apiService.triggerN8nWorkflow(storedLink);

            if (triggered) {
              // Keep scraping state true until we receive the scrapedData event
              console.log(
                "N8n workflow triggered with stored link, waiting for scrapedData event"
              );

              // Set up SSE for scraped data
              try {
                const eventSource = apiService.createScrapingEventSource(
                  `stored-${Date.now()}`
                );
                scrapingEventSourceRef.current = eventSource;

                // Handle connection open
                eventSource.onopen = () => {
                  console.log(
                    "Stored link scraping SSE connection established"
                  );
                };

                // Handle scrapedData events
                eventSource.addEventListener("scrapedData", (event) => {
                  try {
                    console.log(
                      "Raw scrapedData event from stored link:",
                      event.data
                    );
                    const parsedData = JSON.parse(event.data);
                    console.log(
                      "Received scrapedData from stored link:",
                      parsedData
                    );

                    // Set the scraped data and update UI state
                    setScrapedData(parsedData.data || parsedData);
                    setScraping(false);
                    setProgress(100);

                    // Close the connection
                    console.log("Closing stored link scraping SSE connection");
                    apiService.closeEventSource(eventSource);
                    scrapingEventSourceRef.current = null;
                  } catch (err) {
                    console.error(
                      "Error parsing scrapedData from stored link:",
                      err
                    );
                  }
                });

                // Handle errors
                eventSource.addEventListener("error", (event) => {
                  console.error("Stored link scraping SSE error:", event);
                  setError("Error receiving scraped data");
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
                }, config.ui.progressTimeout);
              } catch (err) {
                console.error(
                  "Error setting up stored link scraping SSE:",
                  err
                );
                setError("Failed to connect to scraped data stream");
                setScraping(false);
              }

              return;
            }
          } else {
            setError(
              "Session expired. Please try again. You may need to refresh the page to get a new session."
            );
            setScraping(false); // Reset scraping state
            return;
          }
        } catch (err) {
          console.error(
            "Failed to retrieve resume_link from localStorage:",
            err
          );
        }

        // If we get here, we need to use the regular scraping flow with backend
        // Use the current job ID
        const currentJobId = jobId;

        if (!currentJobId) {
          setError("No job ID available for scraping");
          setScraping(false);
          return;
        }

        try {
          // Set up SSE for scraping progress
          const eventSource =
            apiService.createScrapingEventSource(currentJobId);
          scrapingEventSourceRef.current = eventSource;

          // Handle connection open
          eventSource.onopen = () => {
            console.log("Scraping SSE connection established");
          };

          // Handle connect event
          eventSource.addEventListener("connect", (event) => {
            console.log(
              "Scraping SSE connection established with event:",
              event
            );
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
                setProgress(100);
                // We no longer wait for scrapedData event after completion
                // The scrapedData event will be handled separately
              }
            } catch (err) {
              console.error("Error parsing message data:", err);
            }
          });

          // Handle scrapedData events (contains the final scraped data)
          eventSource.addEventListener("scrapedData", (event) => {
            try {
              console.log("Raw scrapedData event:", event.data);
              const parsedData = JSON.parse(event.data);
              console.log("Received scrapedData:", parsedData);

              // Set the scraped data and update UI state
              setScrapedData(parsedData.data || parsedData);
              setScraping(false);
              setProgress(100);

              // Close the connection immediately after receiving the scrapedData event
              console.log(
                "Closing scraping SSE connection after receiving scrapedData event"
              );
              apiService.closeEventSource(eventSource);
              scrapingEventSourceRef.current = null;
            } catch (err) {
              console.error("Error parsing scrapedData:", err);
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

          // Safety timeout - no longer need to double it since we're not waiting for multiple events
          setTimeout(() => {
            if (scrapingEventSourceRef.current === eventSource) {
              setError(
                "Scraping and data processing timed out. Please try again."
              );
              setScraping(false);

              // Close the connection
              apiService.closeEventSource(eventSource);
              scrapingEventSourceRef.current = null;
            }
          }, config.ui.progressTimeout); // Standard timeout since we're only waiting for a single event
        } catch (err) {
          console.error("Error starting scrape:", err);
          setError("Failed to start scraping. Please try again.");
          setScraping(false);
        }
      }
    },
    [previewData, jobId]
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
