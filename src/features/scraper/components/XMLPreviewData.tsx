import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { XMLPreviewDataProps, XMLRowData } from "../../../model/xmlPreviewData";
import apiService from "../../../services/api";
import "./XMLPreviewData.css";

const XMLPreviewData: React.FC<XMLPreviewDataProps> = ({
  isOpen,
  xmlData,
  onClose,
  onAddRow,
  onActionSelect,
  onParse,
}) => {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [displayData, setDisplayData] = useState<XMLRowData[]>([]);
  const [availableFields, setAvailableFields] = useState<string[]>([]);
  const [editableRows, setEditableRows] = useState<Set<string | number>>(
    new Set()
  );

  // Handle dropdown change for action selection
  const handleActionChange = (id: string | number, value: string) => {
    setDisplayData((prevData) => {
      const updatedData = prevData.map((row) =>
        row.id === id ? { ...row, selectedAction: value } : row
      );

      // If onActionSelect callback is provided, call it with the updated field mappings
      if (onActionSelect) {
        const fieldMappings: { [key: string]: string } = {};
        updatedData.forEach((row) => {
          if (row.selectedAction) {
            fieldMappings[row.fieldName] = row.selectedAction;
          }
        });
        onActionSelect(fieldMappings);
      }

      return updatedData;
    });
  };

  // Process XML data when it changes
  useEffect(() => {
    if (xmlData && xmlData.length > 0) {
      // Extract the first item from the XML data
      const firstItem = xmlData[0] as Record<string, any>;

      // Extract available fields from XML data
      const fields = Object.keys(firstItem).filter(
        (key) => key !== "contentType"
      );
      setAvailableFields(fields);

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
            "pubDate" in firstItem
              ? firstItem.pubDate
              : "date" in firstItem
              ? firstItem.date
              : "-",
            null,
            2
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
            "image" in firstItem
              ? firstItem.image
              : "enclosure" in firstItem
              ? firstItem.enclosure
              : "-",
            null,
            2
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
            "description" in firstItem
              ? firstItem.description
              : "content" in firstItem
              ? firstItem.content
              : "-",
            null,
            2
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

    // Create a new row with empty values and add it to the display data
    const newRow: XMLRowData = {
      id: newId,
      fieldName: "New Field",
      value: "-",
      rawXml: "-",
      selectedAction: "",
    };

    setDisplayData([...displayData, newRow]);

    // Mark this row as editable
    setEditableRows((prev) => {
      const newSet = new Set(prev);
      newSet.add(newId);
      return newSet;
    });

    // If onAddRow callback is provided, call it
    if (onAddRow) onAddRow();
  };

  // Handle removing a row
  const handleRemoveRow = (id: string | number) => {
    // Convert id to number for comparison if it's a string
    const numId = typeof id === "number" ? id : parseInt(id.toString()) || 0;

    // Don't allow removing rows with id <= 4 (standard fields)
    if (numId <= 4) return;

    setDisplayData((prevData) => prevData.filter((row) => row.id !== id));

    // Remove from editable rows if present
    setEditableRows((prev) => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // Handle field name editing
  const handleFieldNameChange = (id: string | number, newName: string) => {
    setDisplayData((prevData) =>
      prevData.map((row) =>
        row.id === id ? { ...row, fieldName: newName } : row
      )
    );
  };

  // Handle key press in editable field
  const handleKeyPress = (
    e: KeyboardEvent<HTMLInputElement>,
    id: string | number
  ) => {
    if (e.key === "Enter") {
      // Remove from editable rows on Enter key
      setEditableRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Handle parse button click
  const handleParse = async () => {
    if (isSubmitting) return;

    // Collect field mappings
    const fieldMappings: { [key: string]: string } = {};

    displayData.forEach((row) => {
      if (row.selectedAction) {
        fieldMappings[row.fieldName] = row.selectedAction;
      }
    });

    // Create payload for API request
    const payload: Record<string, any> = {
      contentType: "xml",
      fieldMappings: fieldMappings,
    };

    // If there's XML data, add it to the payload
    if (xmlData && xmlData.length > 0) {
      payload.xmlData = xmlData;
    }

    setIsSubmitting(true);

    try {
      // First submit the data to the API using the XML-specific endpoint
      const response = await apiService.submitXmlParseRequest(payload);
      
      // No need to send approve action since the XML parse endpoint already handles this

      // If onParse callback is provided, call it
      if (onParse) {
        // Call onParse without arguments as per its interface definition
        onParse();
      }

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error submitting XML field mappings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="xml-preview-modal">
      <div className="xml-preview-content">
        <div className="xml-preview-header">
          <h2>Preview XML Data</h2>
          <div className="xml-preview-actions">
            <button className="btn-close" onClick={onClose} title="Close">
              &times;
            </button>
          </div>
        </div>

        <div className="xml-preview-submit">
          <button
            className="btn-submit-xml"
            onClick={handleParse}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit XML Mapping"}
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
                {displayData.map((row) => {
                  // Convert id to number for comparison if it's a string
                  const numId =
                    typeof row.id === "number"
                      ? row.id
                      : parseInt(row.id.toString()) || 0;
                  const canRemove = numId > 4;

                  return (
                    <tr key={row.id}>
                      <td className="xml-row-number-column">{row.id}</td>
                      <td className="xml-data-label">
                        <div className="xml-field-content">
                          <div className="xml-field-name">
                            {editableRows.has(row.id) ? (
                              <input
                                type="text"
                                className="xml-field-name-input"
                                value={row.fieldName}
                                onChange={(e) =>
                                  handleFieldNameChange(row.id, e.target.value)
                                }
                                onKeyPress={(e) => handleKeyPress(e, row.id)}
                                onBlur={() => {
                                  setEditableRows((prev) => {
                                    const newSet = new Set(prev);
                                    newSet.delete(row.id);
                                    return newSet;
                                  });
                                }}
                                autoFocus
                              />
                            ) : (
                              row.fieldName
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="xml-dropdown-column">
                        <div className="xml-dropdown-container">
                          <select
                            className="xml-action-dropdown"
                            value={row.selectedAction || ""}
                            onChange={(e: ChangeEvent<HTMLSelectElement>) =>
                              handleActionChange(row.id, e.target.value)
                            }
                          >
                            <option value="">Select XML data</option>
                            {xmlData &&
                              xmlData.length > 0 &&
                              Object.entries(xmlData[0] as Record<string, any>)
                                .filter(([key]) => key !== "contentType")
                                .map(([key, value]) => (
                                  <option key={key} value={key}>
                                    {key}:{" "}
                                    {typeof value === "string"
                                      ? value.length > 30
                                        ? value.substring(0, 30) + "..."
                                        : value
                                      : JSON.stringify(value).substring(0, 30) +
                                        (JSON.stringify(value).length > 30
                                          ? "..."
                                          : "")}
                                  </option>
                                ))}
                          </select>
                          {canRemove && (
                            <button
                              className="btn-remove-row"
                              onClick={() => handleRemoveRow(row.id)}
                              title="Remove row"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
