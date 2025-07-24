import React, { useState, useEffect } from "react";
import axios from "axios";
import apiService from "../services/api";
import { motion } from "framer-motion";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { SquareMenu, CirclePlus } from "lucide-react";
import { NewTaskModal } from "../features/monitoring/components/NewTaskModal";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import {
  mockTasks,
  ScrapingTask,
  TaskStatus,
} from "../features/monitoring/types";
import TaskTable from "../features/monitoring/TaskTable";
import { useScraperContext } from "../context/ScraperContext";
import DataResultsTable from "../features/dashboard/DataResultsTable";
import OriginUrlsTable from "../features/dashboard/OriginUrlsTable";
import { useMockData } from "../utils/environment";
import { mockTemplateData } from "../data/mockTableData";
import { mockOriginUrls } from "../data/mockOriginUrls";
import { UrlListResponse } from "../model/dashboard";
import "../styles/Dashboard.css";

// Helper function to convert data to CSV
const convertToCSV = (data: any[]): string => {
  if (!data || data.length === 0) return "";

  // Get all unique keys from all objects
  const keys = Array.from(
    new Set(
      data.flatMap((item) =>
        typeof item === "object" && item !== null ? Object.keys(item) : []
      )
    )
  );

  // Create header row
  const header = keys.join(",");

  // Create data rows
  const rows = data
    .map((item) => {
      if (typeof item !== "object" || item === null) {
        return "";
      }

      return keys
        .map((key) => {
          const value = item[key];
          if (value === null || value === undefined) {
            return "";
          }
          if (typeof value === "object") {
            return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
          }
          if (typeof value === "string") {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(",");
    })
    .join("\n");

  return `${header}\n${rows}`;
};

// Helper function to download CSV
const downloadCSV = (
  data: any[],
  filename: string = "extracted_data.csv"
): void => {
  const csv = convertToCSV(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const Dashboard: React.FC = () => {
  // Get mock data flag early so it can be used in useEffect
  const shouldUseMockData = useMockData();

  const [activeTab, setActiveTab] = useState("data");
  const [tasks, setTasks] = useState<ScrapingTask[]>(mockTasks);
  const [showNewTaskDialog, setShowNewTaskDialog] = useState(false);
  const [isLoadingUrls, setIsLoadingUrls] = useState(false);
  const [newTask, setNewTask] = useState<Partial<ScrapingTask>>({
    name: "",
    url: "",
    intervalValue: 1,
    intervalType: "hours" as const,
  });
  const [apiData, setApiData] = useState<
    { id: string; origin_url: string; status?: string }[]
  >([]);
  const [showApiData, setShowApiData] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showUrlTable, setShowUrlTable] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalTypes = [
    { label: "Hours", value: "hours" },
    { label: "Minutes", value: "minutes" },
    { label: "Days", value: "days" },
    { label: "Weeks", value: "weeks" },
  ];

  // State for URLs to be used in the New Task modal
  const [urls, setUrls] = useState<string[]>([]);
  // State to store the full URL objects with IDs
  const [urlObjects, setUrlObjects] = useState<
    Array<{ id: string; url: string }>
  >([]);
  // Ref to track if we're already fetching URLs to prevent duplicate calls
  const isFetchingUrls = React.useRef(false);

  // Function to fetch URLs from the API
  const fetchUrls = async (showLoadingState = true) => {
    // If we're already fetching URLs, don't start another fetch
    if (isFetchingUrls.current) {
      console.log('URL fetch already in progress, skipping duplicate call');
      return { success: true, data: [] };
    }
    
    // Set the flag to indicate we're fetching URLs
    isFetchingUrls.current = true;
    
    try {
      if (showLoadingState) {
        setIsLoadingUrls(true);
      }

      const response = await apiService.getUrlList();
      if (response.status === "success" && Array.isArray(response.data)) {
        // Store the full URL objects for future reference
        setUrlObjects(response.data);
        // Extract just the URL strings for the dropdown
        const urlStrings = response.data.map((item) => item.url);
        setUrls(urlStrings);

        // Transform the data for the URL table display
        const transformedData = response.data.map((item, index) => {
          return {
            id: item.id || `url-${index}`,
            origin_url: item.url,
            // Add random status for demonstration
            status: ["Active", "Pending", "Completed", "Error"][
              Math.floor(Math.random() * 4)
            ],
          };
        });

        // Update the API data for the table
        setApiData(transformedData);
        return { success: true, data: transformedData };
      } else {
        console.error("Invalid URL list response format", response);
        // Fallback to empty arrays if the response format is unexpected
        setUrlObjects([]);
        setUrls([]);
        return { success: false, error: "Invalid response format" as string };
      }
    } catch (error) {
      console.error("Error fetching URL list:", error);
      setUrlObjects([]);
      setUrls([]);
      setError("Failed to load URLs. Please try again.");
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    } finally {
      if (showLoadingState) {
        setIsLoadingUrls(false);
      }
      // Reset the flag when we're done, regardless of success or failure
      isFetchingUrls.current = false;
    }
  };

  // Mock URLs for development/testing
  const mockUrls = [
    "https://example.com/page1",
    "https://example.com/page2",
    "https://example.com/page3",
  ];

  // Fetch URL list on component mount
  useEffect(() => {
    const fetchInitialUrlList = async () => {
      // Set loading state to true and clear any previous errors
      setLoading(true);
      setIsLoadingUrls(true);
      setError(null);
      setShowApiData(false);

      try {
        if (shouldUseMockData) {
          // Use mock data in local environment
          // Add a slight delay to simulate API call for better UX
          await new Promise((resolve) => setTimeout(resolve, 500));
          setApiData(mockOriginUrls);
          
          // Set mock URLs for the dropdown
          setUrls(mockUrls);
          
          // Create mock URL objects
          const mockUrlObjects = mockUrls.map((url, index) => ({
            id: `mock-${index}`,
            url
          }));
          setUrlObjects(mockUrlObjects);
        } else {
          // Use the consolidated fetchUrls function with loading state handled separately
          const result = await fetchUrls(false);
          if (!result.success) {
            throw new Error(result.error || "Failed to fetch URL list");
          }
        }

        // Only show the data after it's successfully loaded
        setShowApiData(true);
      } catch (error) {
        setError("Failed to fetch URL list. Please try again later.");
        console.error("Error fetching URL list:", error);
        // Set empty data to avoid showing stale data
        setApiData([]);
        setUrls([]);
        setUrlObjects([]);
      } finally {
        // Set loading to false after everything is done
        setLoading(false);
        setIsLoadingUrls(false);
      }
    };

    fetchInitialUrlList();
  }, [shouldUseMockData]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Fetch URL list when "Okay, Looks good" button is clicked
  const handleOkClick = async () => {
    setLoading(true);
    try {
      if (shouldUseMockData) {
        // Use mock data in local environment
        setApiData(mockOriginUrls);
        setShowUrlTable(true);
      } else {
        // Use the consolidated fetchUrls function
        const result = await fetchUrls(false);
        if (result.success) {
          setShowUrlTable(true);
        } else {
          throw new Error("Failed to fetch URL list");
        }
      }
    } catch (error) {
      setError("Failed to fetch URL list");
      console.error("Error fetching URL list:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunTask = (taskId: string) => {
    // In a real app, this would trigger the task via API
    const task = tasks.find((t) => t.id === taskId);
    if (task) {
      // Simulate task running
      const status: TaskStatus = Math.random() > 0.8 ? "error" : "active";
      const updatedTask: ScrapingTask = {
        ...task,
        lastRun: new Date(),
        nextRun: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours later
        status,
        lastError: status === "error" ? "Failed to fetch data" : undefined,
      };

      setTasks(tasks.map((t) => (t.id === taskId ? updatedTask : t)));
    }
  };

  const handleCreateTask = async (formData: any) => {
    try {
      // The API call is already handled in the NewTaskModal component
      // Here we just need to update the local state with the new task
      
      // Create a new task object for the UI
      const newTaskObj: ScrapingTask = {
        id: `task-${Date.now()}`, // In a real app, this would come from the API response
        name: formData.task_name,
        url: formData.url,
        intervalValue: formData.frequency.value,
        intervalType: formData.frequency.unit as
          | "hours"
          | "minutes"
          | "days"
          | "weeks",
        lastRun: null,
        nextRun: new Date(), // Would be calculated based on schedule in a real app
        status: "active",
        description: "", // Add description if available in formData
      };

      // Update the tasks list
      setTasks([...tasks, newTaskObj]);
      
      // Reset the new task form data
      setNewTask({
        name: "",
        url: "",
        intervalValue: 1,
        intervalType: "hours" as const,
      });
      
      // Show success message (could be replaced with a toast notification)
      console.log('Task added to dashboard:', newTaskObj);
    } catch (error) {
      console.error('Error handling task creation:', error);
      // Could add error handling UI feedback here
    }
  };
  const {
    resetScraper,
    extractedData: rawExtractedData,
    originUrl,
  } = useScraperContext();

  // Type the extracted data to include _contentType
  const extractedData = rawExtractedData as
    | (any & { _contentType?: string })
    | null;
  // Check if we should use mock data
  // shouldUseMockData is now declared at the top of the component

  // Log extracted data for debugging
  useEffect(() => {}, [extractedData]);

  // Process extracted data for table display and remove UUIDs
  const getTableData = () => {
    // Helper function to remove UUID from a single item
    const removeUuid = (item: any): any => {
      if (item === null || typeof item !== "object") {
        return item;
      }

      // Create a new object without the uuid field
      const { uuid, ...rest } = item;

      // Recursively process nested objects and arrays
      const result: Record<string, any> = {};
      for (const [key, value] of Object.entries(rest)) {
        if (Array.isArray(value)) {
          result[key] = value.map((item) => removeUuid(item));
        } else if (value !== null && typeof value === "object") {
          result[key] = removeUuid(value);
        } else {
          result[key] = value;
        }
      }

      return result;
    };

    // If we have real extracted data, process it
    if (extractedData) {
      // If it's already an array, process each item
      if (Array.isArray(extractedData)) {
        return extractedData.length > 0 ? extractedData.map(removeUuid) : null;
      }

      // If it's an object with data property that's an array
      if (typeof extractedData === "object" && extractedData !== null) {
        // Check for data property
        const dataObj = extractedData as Record<string, any>;

        if (dataObj.data && Array.isArray(dataObj.data)) {
          return dataObj.data.length > 0 ? dataObj.data.map(removeUuid) : null;
        }

        // Check for extractedData property
        if (dataObj.extractedData && Array.isArray(dataObj.extractedData)) {
          return dataObj.extractedData.length > 0
            ? dataObj.extractedData.map(removeUuid)
            : null;
        }
      }

      // If it's a plain object, wrap it in an array and remove UUID
      return [removeUuid(extractedData)];
    }

    // If we're in a local environment and have no real data, use mock data
    if (shouldUseMockData) {
      console.log("Using mock template data");
      return mockTemplateData;
    }

    return null;
  };

  const tableData = getTableData();
  // Use mock URL if in local environment and no real URL is available
  const displayUrl =
    originUrl || (shouldUseMockData ? "https://example.com/template" : null);

  // Check if the content type is XML
  const isXmlContent =
    extractedData?._contentType === "xml" ||
    extractedData?._contentType === "rss";

  // Define fixed headers for XML content
  const xmlHeaders = {
    title: "Title",
    date: "Date",
    image: "Image",
    description: "Description",
  };

  // Handle navigation back to main page
  const handleBackToMain = (): void => {
    resetScraper();
    window.location.href = "/";
  };

  return (
    <>
      {/* Skip link for keyboard accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>

      <motion.div
        className="template-page"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container">
          <h1 className="page-title" id="main-content" tabIndex={-1}>
            Scraped Data Results
          </h1>

          <section className="content-section" aria-labelledby="intro-heading">
            <Card className="intro-card">
              <h2 id="intro-heading">Scraped Data Results</h2>
              <p>
                View and manage the data extracted from your web scraping
                session.
              </p>
              <div className="card-actions">
                <Button
                  icon="pi pi-refresh"
                  label="Refresh Results"
                  className="btn btn-primary"
                  onClick={resetScraper}
                  aria-label="Refresh data"
                />
              </div>
            </Card>
          </section>

          <section
            className="content-section"
            aria-labelledby="data-heading"
            aria-live="polite"
          >
            <Card className="info-card">
              <div className="card-tabs">
                <div className="tab-header">
                  <button
                    className={`tab-button ${
                      activeTab === "data" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("data")}
                  >
                    Data Results
                  </button>
                  <button
                    className={`tab-button ${
                      activeTab === "monitoring" ? "active" : ""
                    }`}
                    onClick={() => handleTabClick("monitoring")}
                  >
                    Monitoring
                  </button>
                </div>
                <div className="tab-content">
                  <div
                    className={`tab-pane ${
                      activeTab === "data" ? "active" : ""
                    }`}
                  >
                    {showUrlTable ? (
                      <div className="data-preview-container">
                        <div className="origin-url-container"></div>

                        {loading && !showApiData && (
                          <div
                            className="loading-container"
                            style={{ textAlign: "center", padding: "2rem" }}
                          >
                            <div
                              className="loading-spinner"
                              style={{ marginBottom: "1rem" }}
                            >
                              <i
                                className="pi pi-spin pi-spinner"
                                style={{ fontSize: "2rem" }}
                              ></i>
                            </div>
                            <p>Loading URL data from API...</p>
                          </div>
                        )}

                        {!loading && error && (
                          <div
                            className="error-container"
                            style={{
                              padding: "1rem",
                              margin: "1rem 0",
                              backgroundColor: "var(--red-50)",
                              border: "1px solid var(--red-200)",
                              borderRadius: "4px",
                              color: "var(--red-700)",
                            }}
                          >
                            <i
                              className="pi pi-exclamation-triangle"
                              style={{ marginRight: "0.5rem" }}
                            ></i>
                            {error}
                          </div>
                        )}

                        {(showApiData || !loading) && (
                          <OriginUrlsTable
                            data={apiData}
                            onViewResult={(url) => {
                              // TODO: Implement view result functionality
                              console.log("Viewing result for:", url);
                            }}
                            title="Origin URLs"
                            loading={loading}
                          />
                        )}
                      </div>
                    ) : tableData ? (
                      <DataResultsTable
                        data={tableData}
                        originUrl={displayUrl}
                        onBackToMain={handleBackToMain}
                        onDownloadCSV={downloadCSV}
                        isXmlContent={isXmlContent}
                        id={extractedData?.jobId || extractedData?.run_id || null}
                      />
                    ) : (
                      <p>
                        No data found. Please run a new scrape to extract data.
                      </p>
                    )}
                  </div>

                  <div
                    className={`tab-pane ${
                      activeTab === "monitoring" ? "active" : ""
                    }`}
                  >
                    <div className="monitoring-dashboard">
                      <div className="dashboard-header">
                        <h3>Scheduled Tasks</h3>
                        <Button
                          className="btn btn-primary"
                          onClick={() => {
                            // Use the already fetched URLs instead of making a new API call
                            setShowNewTaskDialog(true);
                          }}
                          aria-label="Create new task"
                        >
                          <CirclePlus size={18} />
                          New Task
                        </Button>
                      </div>

                      <div className="task-table-container">
                        <TaskTable tasks={tasks} onRunTask={handleRunTask} />
                      </div>
                    </div>

                    <NewTaskModal
                      isOpen={showNewTaskDialog}
                      onClose={() => setShowNewTaskDialog(false)}
                      onSubmit={handleCreateTask}
                      initialData={newTask}
                      urls={urls}
                      urlObjects={urlObjects}
                      isLoadingUrls={isLoadingUrls || loading}
                    />
                  </div>
                </div>
              </div>

              <div className="card-actions mt-4">
                <div className="spacer"></div>
                {tableData && !showUrlTable && (
                  <>
                    <Button
                      icon="pi pi-search"
                      label="New Scrape"
                      className="btn btn-primary"
                      onClick={() => (window.location.href = "/")}
                      aria-label="Start new scrape"
                    />
                    <Button
                      icon="pi pi-check"
                      label="Okay, Looks good!"
                      className="btn btn-primary"
                      onClick={handleOkClick}
                      aria-label="Fetch URL list"
                      loading={loading}
                    />
                  </>
                )}

                {error && <div className="p-error mt-2">{error}</div>}
              </div>
            </Card>
          </section>
        </div>
      </motion.div>
    </>
  );
};

export default Dashboard;
