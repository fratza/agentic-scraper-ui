import axios from "axios";

// Set the base URL for API calls
// Replace with your actual backend URL when deploying
const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// SSE endpoint URL
const SSE_URL = `${API_URL.replace('/api', '')}/api/preview/events`;

// API service functions
const apiService = {
  // Submit a scraping request
  submitScrapeRequest: async (data) => {
    try {
      // Log the data being sent, including resume_link if present
      console.log("Submitting scrape request with data:", data);
      
      // If resume_link is provided, use a different endpoint to trigger n8n workflow
      if (data.resume_link) {
        console.log("Using resume_link to trigger n8n workflow:", data.resume_link);
        const response = await apiClient.post("/scrape/resume", { resume_link: data.resume_link });
        return response.data;
      } else {
        // Regular scrape without resume_link
        const response = await apiClient.post("/scrape", data);
        return response.data;
      }
    } catch (error) {
      console.error("Error submitting scrape request:", error);
      throw error;
    }
  },

  // Get scraping status
  getScrapeStatus: async (jobId) => {
    try {
      const response = await apiClient.get(`/scrape/status/${jobId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting scrape status:", error);
      throw error;
    }
  },

  // Get scraping results
  getScrapeResults: async (jobId) => {
    try {
      const response = await apiClient.get(`/scrape/results/${jobId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting scrape results:", error);
      throw error;
    }
  },

  // Get sample preview data - Legacy method, kept for reference
  getSamplePreview: async (signal) => {
    try {
      // Make the API call with a minimum display time for loading state
      // This ensures users see the loading indicator even if the response is fast
      const [response] = await Promise.all([
        apiClient.get("/preview/sample_data", { signal }),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      return response.data;
    } catch (error) {
      // Check if this is an abort error (timeout)
      if (error.name === "AbortError" || error.name === "CanceledError") {
        const timeoutError = new Error("Request timed out");
        timeoutError.name = "AbortError";
        throw timeoutError;
      }

      console.error("Error getting preview sample data:", error);
      throw error;
    }
  },
  
  // Create an SSE connection for preview data
  createPreviewEventSource: (formData) => {
    // Create query string from form data
    const params = new URLSearchParams();
    if (formData.url) params.append('url', formData.url);
    if (formData.scrapeTarget) params.append('target', formData.scrapeTarget);
    
    // Create and return the EventSource
    const eventSourceUrl = `${SSE_URL}?${params.toString()}`;
    console.log('Connecting to SSE endpoint:', eventSourceUrl);
    return new EventSource(eventSourceUrl);
  },
  
  // Create an SSE connection for scraping progress
  createScrapingEventSource: (jobId) => {
    // Using the same SSE endpoint with a jobId parameter
    const params = new URLSearchParams();
    params.append('jobId', jobId);
    const eventSourceUrl = `${SSE_URL}?${params.toString()}`;
    return new EventSource(eventSourceUrl);
  },
  // Close an SSE connection
  closeEventSource: (eventSource) => {
    if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
      eventSource.close();
    }
  },
};

export default apiService;
