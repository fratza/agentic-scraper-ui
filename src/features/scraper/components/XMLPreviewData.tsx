import React from 'react';
import './XMLPreviewData.css';
import { XMLPreviewDataProps, XMLRowData } from '../../../model';

const XMLPreviewData: React.FC<XMLPreviewDataProps> = ({
  isOpen,
  onClose,
  xmlData,
  onAddRow,
}) => {
  // If the modal is not open, don't render anything
  if (!isOpen) return null;

  // Function to render image or URL
  const renderImage = (imageUrl: string) => {
    if (!imageUrl) return '-';
    
    // Check if it's a valid image URL
    try {
      const url = new URL(imageUrl);
      const isImage = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url.pathname);
      
      if (isImage) {
        return (
          <img 
            src={imageUrl} 
            alt="Product" 
            className="xml-image-preview" 
            onError={(e) => {
              // If image fails to load, show the URL instead
              e.currentTarget.outerHTML = `<span>${imageUrl}</span>`;
            }}
          />
        );
      }
    } catch (e) {
      // Not a valid URL
    }
    
    // If not a valid image URL, just show the text
    return <span>{imageUrl}</span>;
  };

  return (
    <div className="xml-preview-container">
      <div className="xml-preview-header">
        <h2>Preview XML Data</h2>
      </div>
      
      <div className="xml-table-container">
        <div className="xml-table-responsive">
          <table className="xml-data-table">
            <thead>
              <tr>
                <th className="xml-row-number-column">#</th>
                <th>Field</th>
                <th>Value</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="xml-row-number-column">1</td>
                <td className="xml-data-label">Title</td>
                <td>{xmlData[0]?.title || '-'}</td>
                <td>
                  {/* Empty for now - will be used for future controls like edit/delete */}
                </td>
              </tr>
              <tr>
                <td className="xml-row-number-column">2</td>
                <td className="xml-data-label">Date</td>
                <td>{xmlData[0]?.date || '-'}</td>
                <td>
                  {/* Empty for now */}
                </td>
              </tr>
              <tr>
                <td className="xml-row-number-column">3</td>
                <td className="xml-data-label">Image</td>
                <td>{renderImage(xmlData[0]?.image || '')}</td>
                <td>
                  {/* Empty for now */}
                </td>
              </tr>
              <tr>
                <td className="xml-row-number-column">4</td>
                <td className="xml-data-label">Description</td>
                <td className="xml-description">{xmlData[0]?.description || '-'}</td>
                <td>
                  {/* Empty for now */}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="xml-add-row-container">
        <button className="btn-add-row" onClick={onAddRow}>
          <i className="fas fa-plus"></i> Add New Row
        </button>
      </div>
    </div>
  );
};

export default XMLPreviewData;
