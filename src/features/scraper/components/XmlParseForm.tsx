import React, { useState, FormEvent, ChangeEvent } from "react";
import "./ScraperForm.css";
import apiService from "../../../services/api";
import { isValidUrl } from "../../../lib/utils";
import { XmlParseFormProps, FormSubmitData, FormErrors } from "../../../model";

const XmlParseForm: React.FC<XmlParseFormProps> = ({
  onSubmit,
  onSwitchToRegular,
}) => {
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

    // Submit with XML parse type
    try {
      // Send data to backend API
      const response = await apiService.submitScrapeRequest(formData);
      // Scrape request submitted successfully

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
