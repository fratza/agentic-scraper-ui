import React, { useState, useEffect } from "react";
import "./XMLPreviewData.css";
import { XMLPreviewDataProps, XMLRowData } from "../../../model";
import { Button } from "primereact/button";

const XMLPreviewData: React.FC<XMLPreviewDataProps> = ({
  isOpen,
  xmlData,
  onClose,
  onAddRow,
}) => {
  const [displayData, setDisplayData] = useState<XMLRowData[]>([]);
  const [showRawXml, setShowRawXml] = useState<Record<string | number, boolean>>({});

  // Process XML data when it changes
  useEffect(() => {
    if (xmlData && xmlData.length > 0) {
      // Extract the first item from the XML data
      const firstItem = xmlData[0] as Record<string, any>;
      
      // Store the original raw XML data for each field

      // Create structured rows for display
      const rows: XMLRowData[] = [];

      // Add standard fields if they exist
      if ("title" in firstItem) {
        rows.push({
          id: 1,
          fieldName: "Title",
          value: firstItem.title || "-",
          rawXml: JSON.stringify(firstItem.title, null, 2),
        });
      }

      if ("pubDate" in firstItem || "date" in firstItem) {
        rows.push({
          id: 2,
          fieldName: "Date",
          value:
            ("pubDate" in firstItem ? firstItem.pubDate : "") ||
            ("date" in firstItem ? firstItem.date : "") ||
            "-",
          rawXml: JSON.stringify(
            "pubDate" in firstItem ? firstItem.pubDate : 
            "date" in firstItem ? firstItem.date : "-", 
            null, 2
          ),
        });
      }

      if ("image" in firstItem || "enclosure" in firstItem) {
        rows.push({
          id: 3,
          fieldName: "Image",
          value:
            ("image" in firstItem ? firstItem.image : "") ||
            ("enclosure" in firstItem && firstItem.enclosure?.url
              ? firstItem.enclosure.url
              : "-"),
          rawXml: JSON.stringify(
            "image" in firstItem ? firstItem.image : 
            "enclosure" in firstItem ? firstItem.enclosure : "-", 
            null, 2
          ),
        });
      }

      if ("description" in firstItem || "content" in firstItem) {
        rows.push({
          id: 4,
          fieldName: "Description",
          value:
            ("description" in firstItem ? firstItem.description : "") ||
            ("content" in firstItem ? firstItem.content : "") ||
            "-",
          rawXml: JSON.stringify(
            "description" in firstItem ? firstItem.description : 
            "content" in firstItem ? firstItem.content : "-", 
            null, 2
          ),
        });
      }

      // If no standard fields were found, create rows from all available fields
      if (rows.length === 0) {
        let id = 1;
        for (const [key, value] of Object.entries(firstItem)) {
          if (key !== "contentType") {
            // Skip the contentType field
            rows.push({
              id: id++,
              fieldName: key.charAt(0).toUpperCase() + key.slice(1),
              value: value || "-",
              rawXml: JSON.stringify(value, null, 2),
            });
          }
        }
      }

      setDisplayData(rows);
    }
  }, [xmlData]);

  if (!isOpen) return null;

  // Function to render image or fallback to text
  const renderImage = (url: string) => {
    if (!url || url === "-") return "-";

    // Check if the URL is valid
    try {
      new URL(url);
      return (
        <>
          <img
            src={url}
            alt="Preview"
            className="xml-image-preview"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              // Add a fallback text element that will be shown if image fails to load
              const fallbackText = document.createElement("span");
              fallbackText.textContent = url;
              e.currentTarget.parentNode?.appendChild(fallbackText);
            }}
          />
          <span style={{ display: "none" }}>{url}</span>
        </>
      );
    } catch (e) {
      return url;
    }
  };

  // Function to render field value based on field name
  const renderFieldValue = (fieldName: string, value: any) => {
    if (
      fieldName.toLowerCase() === "image" ||
      fieldName.toLowerCase().includes("image")
    ) {
      return renderImage(value);
    } else if (
      fieldName.toLowerCase() === "description" ||
      fieldName.toLowerCase().includes("content")
    ) {
      return <div className="xml-description">{value}</div>;
    } else {
      return value;
    }
  };

  // Handle adding a new row
  const handleAddRow = () => {
    const newId =
      displayData.length > 0
        ? Math.max(
            ...displayData.map((row) =>
              typeof row.id === "number"
                ? row.id
                : parseInt(row.id.toString()) || 0
            )
          ) + 1
        : 1;
    setDisplayData([
      ...displayData,
      { id: newId, fieldName: "New Field", value: "-", rawXml: "-" },
    ]);
    if (onAddRow) onAddRow();
  };

  // Toggle raw XML display for a specific row
  const toggleRawXml = (id: string | number) => {
    setShowRawXml(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  return (
    <div className="xml-preview-modal">
      <div className="xml-preview-content">
        <div className="xml-preview-header">
          <h2>Preview XML Data</h2>
          <button className="xml-close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="xml-preview-body">
          <div className="xml-data-table-container">
            <table className="xml-data-table">
              <thead>
                <tr>
                  <th className="xml-row-number-column">#</th>
                  <th>Field</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayData.map((row) => (
                  <tr key={row.id}>
                    <td className="xml-row-number-column">{row.id}</td>
                    <td className="xml-data-label">
                      <div className="xml-field-content">
                        <div className="xml-field-name">{row.fieldName}</div>
                        <div className="xml-field-value">
                          {renderFieldValue(row.fieldName, row.value)}
                        </div>
                      </div>
                    </td>
                    <td className="xml-actions-column">
                      <Button 
                        icon={showRawXml[row.id] ? "pi pi-eye-slash" : "pi pi-eye"} 
                        className="p-button-rounded p-button-text p-button-sm"
                        onClick={() => toggleRawXml(row.id)}
                        tooltip="Toggle XML Data"
                        tooltipOptions={{ position: 'top' }}
                      />
                      {showRawXml[row.id] && row.rawXml && (
                        <div className="xml-raw-data">
                          <pre>{row.rawXml}</pre>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="xml-add-row-container">
            <button className="btn-add-row" onClick={handleAddRow}>
              <span>+</span> Add New Row
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XMLPreviewData;
