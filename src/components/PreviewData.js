import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import './PreviewData.css';

const PreviewData = () => {
  const [previewData, setPreviewData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPreviewData = async () => {
      try {
        setLoading(true);
        const data = await apiService.getSamplePreview();
        setPreviewData(data);
        setError(null);
      } catch (err) {
        setError('Failed to load preview data. Please try again later.');
        console.error('Error fetching preview data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPreviewData();
  }, []);

  if (loading) {
    return <div className="preview-loading">Loading preview data...</div>;
  }

  if (error) {
    return <div className="preview-error">{error}</div>;
  }

  if (!previewData) {
    return <div className="preview-empty">No preview data available.</div>;
  }

  return (
    <div className="preview-container">
      <h2>Data Preview</h2>
      <div className="preview-content">
        {Array.isArray(previewData) ? (
          <table className="preview-table">
            <thead>
              {previewData.length > 0 && (
                <tr>
                  {Object.keys(previewData[0]).map((key) => (
                    <th key={key}>{key}</th>
                  ))}
                </tr>
              )}
            </thead>
            <tbody>
              {previewData.map((item, index) => (
                <tr key={index}>
                  {Object.values(item).map((value, i) => (
                    <td key={i}>
                      {typeof value === 'object' ? JSON.stringify(value) : value}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <pre>{JSON.stringify(previewData, null, 2)}</pre>
        )}
      </div>
    </div>
  );
};

export default PreviewData;
