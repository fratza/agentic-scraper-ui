import axios, { AxiosInstance } from "axios";
import { config } from "../lib/config";

// Define types for API responses and parameters
interface ScrapeRequestData {
  url?: string;
  scrapeTarget?: string;
  resume_link?: string;
  [key: string]: any;
}

interface ScrapeResponse {
  jobId: string;
  directTriggered?: boolean;
}

interface PreviewData {
  data?: any;
  timestamp?: string;
  [key: string]: any;
}

interface ScrapeStatus {
  status: string;
  progress?: number;
  message?: string;
}

interface ScrapeResults {
  data: any[];
  timestamp: string;
}

// URL List API types
interface UrlListItem {
  id: string;
  origin_url: string;
}

export interface UrlListResponse {
  status: 'success' | 'error';
  data: UrlListItem[];
}

// Initialize axios instance with centralized config
export const apiClient: AxiosInstance = axios.create({
  baseURL: config.api.baseUrl,
  timeout: config.api.timeout,
  headers: {
    "Content-Type": "application/json",
  },
});

// SSE endpoint URLs
const PREVIEW_SSE_URL = `${config.api.baseUrl.replace("/api", "")}/api/preview/events`;
const EXTRACTED_DATA_SSE_URL = `${config.api.baseUrl.replace(
  "/api",
  ""
)}/api/scraped-data/events`;

// Generate a unique session token for this client
const SESSION_TOKEN = `${Date.now()}-${Math.random()
  .toString(36)
  .substring(2, 15)}`;

// API service functions
const apiService = {
  // Submit a scraping request
  submitScrapeRequest: async (
    data: ScrapeRequestData
  ): Promise<ScrapeResponse> => {
    try {
      // Log the data being sent, including resume_link if present
      // Submit scrape request
      const response = await apiClient.post("/scrape", data);
      return response.data;
    } catch (error) {
      console.error("Error submitting scrape request:", error);
      throw error;
    }
  },

  // Directly trigger n8n workflow with resume_link
  triggerN8nWorkflow: (resumeLink: string): boolean => {
    if (!resumeLink) {
      console.error("No resume_link provided to trigger n8n workflow");
      return false;
    }

    try {
      // Trigger n8n workflow
      // Make a POST request to the resume_link to trigger the n8n workflow
      // This is done without waiting for a response
      fetch(resumeLink, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        // You can add a body if needed by the n8n workflow
        body: JSON.stringify({
          source: "direct-trigger",
          timestamp: Date.now(),
        }),
      })
        .then(() => {})
        .catch((err) => console.error("Error triggering n8n workflow:", err));

      return true;
    } catch (error) {
      console.error("Error triggering n8n workflow:", error);
      return false;
    }
  },

  // Get scraping status
  getScrapeStatus: async (jobId: string): Promise<ScrapeStatus> => {
    try {
      const response = await apiClient.get(`/scrape/status/${jobId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting scrape status:", error);
      throw error;
    }
  },

  // Get scraping results
  getScrapeResults: async (jobId: string): Promise<ScrapeResults> => {
    try {
      const response = await apiClient.get(`/scrape/results/${jobId}`);
      return response.data;
    } catch (error) {
      console.error("Error getting scrape results:", error);
      throw error;
    }
  },

  // URL List API
  async getUrlList(): Promise<UrlListResponse> {
    try {
      const response = await apiClient.get(config.api.endpoints.urlList);
      return response.data;
    } catch (error) {
      console.error("Error fetching URL list:", error);
      throw error;
    }
  },

  // Get sample preview data - Legacy method, kept for reference
  getSamplePreview: async (signal?: AbortSignal): Promise<PreviewData> => {
    try {
      // Make the API call with a minimum display time for loading state
      // This ensures users see the loading indicator even if the response is fast
      const [response] = await Promise.all([
        apiClient.get("/preview/sample_data", { signal }),
        new Promise((resolve) => setTimeout(resolve, 1000)),
      ]);

      return response.data;
    } catch (error: any) {
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
  createPreviewEventSource: (formData: ScrapeRequestData): EventSource => {
    // Create query string from form data
    const params = new URLSearchParams();
    if (formData.url) params.append("url", formData.url);
    if (formData.scrapeTarget) params.append("target", formData.scrapeTarget);
    if (formData.parseType) params.append("parseType", formData.parseType);

    // Add session token
    params.append("sessionToken", SESSION_TOKEN);

    // Create and return the EventSource
    const eventSourceUrl = `${PREVIEW_SSE_URL}?${params.toString()}`;
    // Connect to SSE endpoint for preview
    return new EventSource(eventSourceUrl);
  },

  // Create an SSE connection for scraping progress and extracted data
  createScrapingEventSource: (
    jobId: string,
    runId: string | null
  ): EventSource => {
    // Using the dedicated extracted-data endpoint
    const params = new URLSearchParams();

    // Use runId if provided, otherwise fall back to jobId
    if (runId) {
      params.append("run_id", runId);
    } else if (jobId) {
      params.append("jobId", jobId);
    }

    // Add session token
    params.append("sessionToken", SESSION_TOKEN);

    const eventSourceUrl = `${EXTRACTED_DATA_SSE_URL}?${params.toString()}`;
    // Connect to SSE endpoint for extracted data
    return new EventSource(eventSourceUrl);
  },

  // Close an SSE connection
  closeEventSource: (eventSource: EventSource): void => {
    if (eventSource && eventSource.readyState !== EventSource.CLOSED) {
      eventSource.close();
    }
  },

  // Submit preview data with approve or cancel action and optional payload
  submitPreviewData: async (
    action: "approve" | "cancel",
    payload: Record<string, any> = {}
  ): Promise<any> => {
    try {
      // Send action to backend with optional payload
      const response = await apiClient.post("/proceed-scrape", {
        action: action,
        ...payload,
      });

      return response.data;
    } catch (error) {
      console.error(`Error in ${action} action:`, error);
      throw error;
    }
  },
};

export default apiService;
