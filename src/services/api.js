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

// API service functions
const apiService = {
  // Submit a scraping request
  submitScrapeRequest: async (data) => {
    try {
      const response = await apiClient.post("/scrape", data);
      return response.data;
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

  // Get sample preview data
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
};

export default apiService;
