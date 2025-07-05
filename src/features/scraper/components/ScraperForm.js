import React, { useState } from 'react';
import './ScraperForm.css';
import apiService from '../../../services/api';
import { isValidUrl } from '../../../lib/utils';

const ScraperForm = ({ onSubmit }) => {
  const [url, setUrl] = useState("");
  const [scrapeTarget, setScrapeTarget] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const newErrors = {};

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
      return;
    }

    // Clear errors
    setErrors({});

    // Prepare data for submission
    const formData = { url, scrapeTarget };

    try {
      // Send data to backend API
      const response = await apiService.submitScrapeRequest(formData);
      console.log("Scrape request submitted successfully:", response);

      // Pass the response to parent component
      onSubmit({ url, scrapeTarget, jobId: response.jobId });
    } catch (error) {
      console.error("Error submitting scrape request:", error);
      // Handle API errors
      setErrors({
        api:
          error.response?.data?.message ||
          "Failed to connect to the server. Please try again.",
      });
    }
  };

  return (
    <div className="scraper-form-container fade-in">
      <form id="scraper-form" onSubmit={handleSubmit}>
        <div className={`form-group ${errors.url ? "error" : ""}`}>
          <label htmlFor="url">URL</label>
          <input
            type="url"
            id="url"
            name="url"
            placeholder="Enter the website URL to scrape"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          {errors.url && <div className="error-message">{errors.url}</div>}
        </div>

        <div className={`form-group ${errors.scrapeTarget ? "error" : ""}`}>
          <label htmlFor="scrape-target">What do you want to scrape</label>
          <textarea
            id="scrape-target"
            name="scrape-target"
            placeholder="E.g., product prices, article titles, images"
            rows="3"
            value={scrapeTarget}
            onChange={(e) => setScrapeTarget(e.target.value)}
          ></textarea>
          {errors.scrapeTarget && (
            <div className="error-message">{errors.scrapeTarget}</div>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-submit">
            <span>Submit</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScraperForm;
