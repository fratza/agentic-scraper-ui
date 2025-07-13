import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { XMLPreviewDataProps, XMLRowData } from "../../../model/xmlPreviewData";
import apiService from "../../../services/api";
import { useMockData } from "../../../utils/environment";
import { mockXMLData } from "../../../data/mockTableData";
import "../../../styles/SharedTable.css";
import "./XMLPreviewData.css";

const XMLPreviewData: React.FC<XMLPreviewDataProps> = ({
  isOpen,
  xmlData: propXmlData,
  onClose,
  onAddRow,
  onActionSelect,
  onParse,
}) => {
  // Check if we should use mock data
  const shouldUseMockData = useMockData();

  // Use mock data if in local environment and no real data is provided
  const xmlData =
    shouldUseMockData && (!propXmlData || propXmlData.length === 0)
      ? mockXMLData
      : propXmlData;
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

      // Always show the four standard fields with empty values
      // These will be mapped from the XML data based on user actions
      const standardFields: XMLRowData[] = [
        { id: 1, fieldName: "Title", value: "-", rawXml: "" },
        { id: 2, fieldName: "Date", value: "-", rawXml: "" },
        { id: 3, fieldName: "Image", value: "-", rawXml: "" },
        { id: 4, fieldName: "Description", value: "-", rawXml: "" },
      ];

      setDisplayData(standardFields);
    } else {
      // If no XML data, still show the standard fields
      setDisplayData([
        { id: 1, fieldName: "Title", value: "-", rawXml: "" },
        { id: 2, fieldName: "Date", value: "-", rawXml: "" },
        { id: 3, fieldName: "Image", value: "-", rawXml: "" },
        { id: 4, fieldName: "Description", value: "-", rawXml: "" },
      ]);
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
      fieldName.toLowerCase().includes("image") ||
      fieldName.toLowerCase().includes("thumbnail") ||
      fieldName.toLowerCase().includes("photo")
    ) {
      return renderImage(value);
    }
    return value;
  };

  // Handle adding a new row
  const handleAddRow = () => {
    // Generate a unique ID for the new row
    const maxId = Math.max(
      ...displayData.map((row) =>
        typeof row.id === "number" ? row.id : parseInt(row.id.toString()) || 0
      )
    );
    const newId = maxId + 1;

    // Create a new row with default values
    const newRow: XMLRowData = {
      id: newId,
      fieldName: `Custom Field ${newId - 4}`,
      value: "-",
      rawXml: "",
    };

    // Add the new row to the display data
    setDisplayData((prevData) => [...prevData, newRow]);

    // If onAddRow callback is provided, call it
    if (onAddRow) {
      onAddRow();
    }
  };

  // Handle removing a row
  const handleRemoveRow = (id: string | number) => {
    // Remove the row from the display data
    setDisplayData((prevData) => prevData.filter((row) => row.id !== id));

    // If onActionSelect callback is provided, call it with the updated field mappings
    if (onActionSelect) {
      const fieldMappings: { [key: string]: string } = {};
      displayData
        .filter((row) => row.id !== id && row.selectedAction)
        .forEach((row) => {
          fieldMappings[row.fieldName] = row.selectedAction!;
        });
      onActionSelect(fieldMappings);
    }
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
      // Remove focus from the input field
      (e.target as HTMLInputElement).blur();

      // Remove the row from the editable rows set
      setEditableRows((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }
  };

  // Handle cancel button click
  const handleCancel = async () => {
    try {
      // Send cancel action to backend
      if (!shouldUseMockData) {
        await apiService.submitPreviewData("cancel");
      }
      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error canceling XML parsing:", error);
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
      // If we're in a local environment, simulate a successful response
      if (shouldUseMockData) {
        console.log("Using mock data for XML parsing");

        // Simulate loading delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // If onParse callback is provided, call it without parameters
        // The backend will handle the resume link
        if (onParse) {
          onParse();
        }

        // Close the modal
        onClose();
      } else {
        // Submit the data to the API using submitPreviewData with approve action
        // Include the XML payload in the request
        await apiService.submitPreviewData("approve", payload);

        // Notify parent component that parsing has started
        if (onParse) {
          onParse();
        }

        // Close the modal
        onClose();
      }
    } catch (error) {
      console.error("Error submitting XML field mappings:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="xml-preview-modal">
      {/* Loading overlay */}
      {isSubmitting && (
        <div className="xml-loading-overlay">
          <div className="xml-loading-spinner">
            <i className="fas fa-spinner fa-spin fa-2x"></i>
            <p>Processing XML data...</p>
          </div>
        </div>
      )}
      <div className="xml-preview-content">
        <div className="xml-preview-container">
          <div className="xml-table-responsive">
            <div className="xml-preview-header">
              <h3>Please set the data:</h3>
            </div>

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
                              <span
                                onClick={() =>
                                  setEditableRows((prev) =>
                                    new Set(prev).add(row.id)
                                  )
                                }
                              >
                                {row.fieldName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="xml-actions-column">
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
                                    {key}{" "}
                                    {typeof value === "string"
                                      ? value.length > 30
                                        ? `${value.substring(0, 30)}...`
                                        : value
                                      : `${JSON.stringify(value).substring(
                                          0,
                                          30
                                        )}${
                                          JSON.stringify(value).length > 30
                                            ? "..."
                                            : ""
                                        }`}
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

            <div className="xml-preview-actions">
              <button
                className="btn-add-row"
                onClick={handleAddRow}
                disabled={isSubmitting}
              >
                <span>+</span> Add New Row
              </button>
            </div>

            <div className="xml-buttons-container">
              <button className="btn-cancel-xml" onClick={handleCancel}>
                Cancel
              </button>
              <button
                className="btn-submit-xml"
                onClick={handleParse}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <i
                      className="fas fa-spinner fa-spin"
                      style={{ marginRight: "8px" }}
                    ></i>
                    Processing...
                  </>
                ) : (
                  "Submit"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default XMLPreviewData;
