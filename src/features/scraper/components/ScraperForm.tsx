import React, { useState, FormEvent, ChangeEvent } from "react";
import XmlParseForm from "./XmlParseForm";
import "./ScraperForm.css";
import apiService from "../../../services/api";
import { isValidUrl } from "../../../lib/utils";
import { ScraperFormProps, FormSubmitData, FormErrors } from "../../../model";

const ScraperForm: React.FC<ScraperFormProps> = ({ onSubmit }) => {
  const [url, setUrl] = useState<string>("");
  const [scrapeTarget, setScrapeTarget] = useState<string>("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showXmlForm, setShowXmlForm] = useState<boolean>(false);

  const handleSwitchToXmlMode = () => {
    setShowXmlForm(true);
  };

  const handleSwitchToRegularMode = () => {
    setShowXmlForm(false);
  };

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

    // Validate scrape target
    if (scrapeTarget.trim() === "") {
      newErrors.scrapeTarget = "Please specify what to scrape";
    }

    // If there are errors, update state and return
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Clear errors
    setErrors({});

    // Prepare data for submission
    const formData = { url, scrapeTarget };

    try {
      // Send data to backend API
      const response = await apiService.submitScrapeRequest(formData);
      // Scrape request submitted successfully

      // Pass the response to parent component
      onSubmit({ url, scrapeTarget, jobId: response.jobId });
    } catch (error: any) {
      // Handle submission error silently
      // Handle API errors
      setErrors({
        api:
          error.response?.data?.message ||
          "Failed to connect to the server. Please try again.",
      });
      // Reset submitting state on error
      setIsSubmitting(false);
    }
  };

  if (showXmlForm) {
    return (
      <XmlParseForm
        onSubmit={onSubmit}
        onSwitchToRegular={handleSwitchToRegularMode}
      />
    );
  }

  return (
    <div className="scraper-form-container fade-in">
      <form id="scraper-form" onSubmit={handleSubmit}>
        <div className={`form-group ${errors.url ? "error" : ""}`}>
          <div className="label-row">
            <label htmlFor="url">URL</label>
            <button
              type="button"
              className="btn-xml-option"
              onClick={handleSwitchToXmlMode}
              disabled={isSubmitting}
            >
              XML Parse
            </button>
          </div>
          <input
            type="url"
            id="url"
            name="url"
            placeholder="Enter the website URL to scrape"
            value={url}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setUrl(e.target.value)
            }
          />
          {errors.url && <div className="error-message">{errors.url}</div>}
        </div>

        <div className={`form-group ${errors.scrapeTarget ? "error" : ""}`}>
          <label htmlFor="scrape-target">What do you want to scrape</label>
          <textarea
            id="scrape-target"
            name="scrape-target"
            placeholder="E.g., product prices, article titles, images"
            rows={3}
            value={scrapeTarget}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
              setScrapeTarget(e.target.value)
            }
          ></textarea>
          {errors.scrapeTarget && (
            <div className="error-message">{errors.scrapeTarget}</div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit" disabled={isSubmitting}>
            <span>{isSubmitting ? "Submitting..." : "Submit"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScraperForm;
