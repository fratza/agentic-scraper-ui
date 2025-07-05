/**
 * Type definitions for the Scraper UI application
 * 
 * Note: These are JSDoc type definitions since we're using JavaScript.
 * They provide documentation and can be used for better IDE support.
 */

/**
 * @typedef {Object} PreviewData
 * @property {string} url - The URL to scrape
 * @property {string} target - The target data to scrape
 * @property {string} timestamp - ISO timestamp of when the preview was created
 * @property {string} status - Current status of the preview
 */

/**
 * @typedef {Object} ScrapeFormData
 * @property {string} url - The URL to scrape
 * @property {string} scrapeTarget - The target data to scrape
 * @property {string} [jobId] - Optional job ID if resuming a previous job
 */

/**
 * @typedef {Object} ScrapeStatusResponse
 * @property {string} status - Current status of the scraping job (pending, in-progress, completed, failed)
 * @property {number} progress - Progress percentage (0-100)
 * @property {string} [error] - Error message if status is 'failed'
 * @property {string} jobId - Unique identifier for the scraping job
 */

/**
 * @typedef {Object} ScrapeResultsResponse
 * @property {Array<Object>} data - The scraped data results
 * @property {string} jobId - Unique identifier for the scraping job
 * @property {string} url - The URL that was scraped
 * @property {string} target - The target that was scraped
 * @property {string} timestamp - ISO timestamp of when the scraping was completed
 */

/**
 * @typedef {Object} ApiError
 * @property {string} message - Error message
 * @property {number} [statusCode] - HTTP status code
 * @property {string} [code] - Error code
 */

// Export empty object since this is just for documentation
export default {};
