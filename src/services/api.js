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

// SSE endpoint URLs
const PREVIEW_SSE_URL = `${API_URL.replace('/api', '')}/api/preview/events`;
const SCRAPED_DATA_SSE_URL = `${API_URL.replace('/api', '')}/api/scraped-data/events`;

// Generate a unique session token for this client
const SESSION_TOKEN = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;

// API service functions
const apiService = {
  // Submit a scraping request
  submitScrapeRequest: async (data) => {
    try {
      // Log the data being sent, including resume_link if present
      console.log("Submitting scrape request with data:", data);
      
      // If resume_link is provided, directly trigger n8n workflow without backend call
      if (data.resume_link) {
        console.log("Directly triggering n8n workflow with resume_link:", data.resume_link);
        // Return a mock response with a jobId to maintain compatibility with existing code
        return { jobId: `direct-${Date.now()}`, directTriggered: true };
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

  // Directly trigger n8n workflow with resume_link
  triggerN8nWorkflow: (resumeLink) => {
    if (!resumeLink) {
      console.error("No resume_link provided to trigger n8n workflow");
      return false;
    }
    
    try {
      console.log("Directly triggering n8n workflow with URL:", resumeLink);
      // Make a POST request to the resume_link to trigger the n8n workflow
      // This is done without waiting for a response
      fetch(resumeLink, { 
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json'
        },
        // You can add a body if needed by the n8n workflow
        body: JSON.stringify({
          source: 'direct-trigger',
          timestamp: Date.now()
        })
      })
        .then(() => console.log("N8n workflow trigger request sent"))
        .catch(err => console.error("Error triggering n8n workflow:", err));
      
      return true;
    } catch (error) {
      console.error("Error triggering n8n workflow:", error);
      return false;
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
    
    // Add session token
    params.append('sessionToken', SESSION_TOKEN);
    
    // Create and return the EventSource
    const eventSourceUrl = `${PREVIEW_SSE_URL}?${params.toString()}`;
    console.log('Connecting to SSE endpoint for preview:', eventSourceUrl);
    return new EventSource(eventSourceUrl);
  },
  
  // Create an SSE connection for scraping progress and scraped data
  createScrapingEventSource: (jobId) => {
    // Using the dedicated scraped-data endpoint with a jobId parameter
    const params = new URLSearchParams();
    params.append('jobId', jobId);
    
    // Add session token
    params.append('sessionToken', SESSION_TOKEN);
    
    const eventSourceUrl = `${SCRAPED_DATA_SSE_URL}?${params.toString()}`;
    console.log('Connecting to SSE endpoint for scraped data:', eventSourceUrl);
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
