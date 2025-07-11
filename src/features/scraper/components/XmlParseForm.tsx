import React, { useState, FormEvent, ChangeEvent } from "react";
import "./ScraperForm.css";
import apiService from "../../../services/api";
import { isValidUrl } from "../../../lib/utils";
import { XmlParseFormProps, FormSubmitData, FormErrors } from "../../../model";
import { useMockData } from "../../../utils/environment";
import { mockFormData } from "../../../data/mockTableData";

const XmlParseForm: React.FC<XmlParseFormProps> = ({
  onSubmit,
  onSwitchToRegular,
}) => {
  // Check if we should use mock data
  const shouldUseMockData = useMockData();
  const [url, setUrl] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Prevent multiple submissions
    if (isSubmitting) return;

    // Set submitting state to true
    setIsSubmitting(true);

    // Validate form
    const newErrors: FormErrors = {};

    // Validate URL
    if (!isValidUrl(url)) {
      newErrors.url = "Please enter a valid URL";
    }

    // If there are errors, update state and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Clear errors
    setErrors({});

    const formData = { url };

    // If we're in a local environment, use mock data instead of making API calls
    if (shouldUseMockData) {
      console.log("Using mock data for XML form submission");
      
      // Simulate loading delay
      setTimeout(() => {
        // Use mock form data response
        const mockResponse = {
          jobId: `mock-job-${Date.now()}`,
          ...mockFormData
        };
        
        // Pass the mock response to parent component
        onSubmit({ url, jobId: mockResponse.jobId, contentType: "xml" });
        
        // Reset submitting state
        setIsSubmitting(false);
      }, 1000);
      
      return;
    }
    
    // Submit with XML parse type
    try {
      // Send data to backend API using the scrape endpoint
      const response = await apiService.submitScrapeRequest(formData);
      // XML parse request submitted successfully

      // Pass the response to parent component
      onSubmit({ url, jobId: response.jobId, contentType: "xml" });
    } catch (error: any) {
      setErrors({
        api:
          error.response?.data?.message ||
          "Failed to connect to the server. Please try again.",
      });
      // Reset submitting state on error
      setIsSubmitting(false);
    }
  };

  return (
    <div className="scraper-form-container fade-in">
      <form id="xml-parse-form" onSubmit={handleSubmit}>
        <div className="form-header">
          <h3>XML Parse Mode</h3>
          <button
            type="button"
            className="btn-switch-mode"
            onClick={onSwitchToRegular}
          >
            Switch to Regular Mode
          </button>
        </div>

        <div className={`form-group ${errors.url ? "error" : ""}`}>
          <div className="label-row">
            <label htmlFor="url">URL</label>
            <button
              type="button"
              className="btn-xml-option active"
              disabled={true}
            >
              XML Parse
            </button>
          </div>
          <input
            type="url"
            id="url"
            name="url"
            placeholder="Enter the website URL to parse XML from"
            value={url}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUrl(e.target.value)
            }
          />
          {errors.url && <div className="error-message">{errors.url}</div>}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            <span>{isSubmitting ? "Submitting..." : "Parse XML"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default XmlParseForm;
