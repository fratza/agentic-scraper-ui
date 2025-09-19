import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { classNames } from "primereact/utils";
import { NewTaskModalProps, NewTaskFormData } from "./types";
import apiService from "../../../services/api";
import { useFormLoading } from "../../../context/LoadingContext";
import "./NewTaskModal.css";

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  urls,
  urlObjects = [],
  isLoadingUrls = false,
}) => {
  const [formData, setFormData] = useState<NewTaskFormData>({
    taskName: initialData?.taskName || "",
    url: initialData?.url || "",
    urlId: initialData?.urlId || "",
    frequency: {
      value: initialData?.frequency?.value || 1,
      unit: initialData?.frequency?.unit || "hours",
    },
  });

  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Get current date and time for runAt field
      const currentDateTime = new Date().toISOString();

      // Call the API to submit the task
      const response = await apiService.submitMonitorTask({
        taskName: formData.taskName,
        url: formData.url,
        urlId: formData.urlId,
        runAt: currentDateTime,
        frequency: {
          value: formData.frequency.value,
          unit: formData.frequency.unit,
        },
      });

      // Call the parent's onSubmit with the form data
      onSubmit(formData);

      // Show success modal
      setShowSuccess(true);
      onClose();
    } catch (error) {
      console.error("Failed to create task:", error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (
    field: "taskName" | "url" | "urlId" | "frequency",
    value:
      | string
      | number
      | { value: number; unit: "minutes" | "hours" | "days" | "weeks" },
  ) => {
    setFormData((prev) => {
      if (field === "frequency" && typeof value === "object") {
        return {
          ...prev,
          frequency: {
            ...prev.frequency,
            ...value,
          },
        };
      }
      return {
        ...prev,
        [field]: value,
      } as NewTaskFormData;
    });
  };

  const intervalTypes = [
    { label: "Minutes", value: "minutes" },
    { label: "Hours", value: "hours" },
    { label: "Days", value: "days" },
    { label: "Weeks", value: "weeks" },
  ];

  if (!isOpen && !showSuccess) return null;

  if (showSuccess) {
    return (
      <div className="modal-overlay" role="dialog" aria-modal="true">
        <div className="modal-content">
          <div className="modal-header">
            <h2 className="modal-title">Task Created</h2>
            <Button
              className="modal-close-button"
              onClick={onClose}
              aria-label="Close"
              type="button"
              tooltip="Close"
              tooltipOptions={{ position: "left" }}
            >
              ✕
            </Button>
          </div>
          <div className="modal-body">
            <p>Your task has been created successfully!</p>
          </div>
          <div className="modal-footer flex justify-between items-center">
            <Button
              label="Close"
              className="modal-submit-button"
              onClick={() => setShowSuccess(false)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">New Task</h2>
          <Button
            className="modal-close-button"
            onClick={() => setShowSuccess(false)}
            aria-label="Close"
            type="button"
            tooltip="Close"
            tooltipOptions={{ position: "left" }}
          >
            ✕
          </Button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="taskName">Task Name</label>
            <InputText
              id="taskName"
              value={formData.taskName}
              onChange={(e) => handleInputChange("taskName", e.target.value)}
              className={classNames("form-control", {
                "p-invalid": !formData.taskName,
              })}
              required
              placeholder="Enter task name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="taskUrl">URL</label>
            <select
              id="taskUrl"
              value={formData.url || ""}
              onChange={(e) => {
                const selectedUrl = e.target.value;
                handleInputChange("url", selectedUrl);

                // Find the URL ID for the selected URL
                const selectedUrlObject = urlObjects.find(
                  (item) => item.url === selectedUrl,
                );
                if (selectedUrlObject) {
                  handleInputChange("urlId", selectedUrlObject.id);
                } else {
                  // Clear the URL ID if no matching URL is found
                  handleInputChange("urlId", "");
                }
              }}
              className="p-inputtext p-component form-control"
              required
              disabled={isLoadingUrls}
            >
              <option value="">
                {isLoadingUrls ? "Loading URLs..." : "Select URL"}
              </option>
              {!isLoadingUrls &&
                urls.map((url) => (
                  <option key={url} value={url}>
                    {url}
                  </option>
                ))}
            </select>
            {isLoadingUrls && (
              <small className="text-sm text-gray-500 mt-1">
                Loading available URLs...
              </small>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="intervalValue">Schedule Frequency</label>
            <div className="interval-inputs">
              <InputText
                id="intervalValue"
                value={formData.frequency.value.toString()}
                onChange={(e) =>
                  handleInputChange("frequency", {
                    ...formData.frequency,
                    value: parseInt(e.target.value) || 1,
                  })
                }
                className="form-control w-20"
                type="number"
                min="1"
                required
              />
              <Dropdown
                id="intervalType"
                value={formData.frequency.unit}
                options={intervalTypes}
                onChange={(e) =>
                  handleInputChange("frequency", {
                    ...formData.frequency,
                    unit: e.value as "minutes" | "hours" | "days" | "weeks",
                  })
                }
                className="form-control"
                placeholder="Select interval"
              />
              <small className="text-sm text-gray-500 mt-1">
                Example: 1 hour → every hour, 2 days → every 2 days
              </small>
            </div>
          </div>

          <div className="modal-footer flex justify-between items-center">
            <Button
              label="Cancel"
              className="modal-cancel-button"
              onClick={onClose}
              type="button"
            />
            <Button
              label={isSubmitting ? "Creating Task..." : "Create Task"}
              className="modal-submit-button"
              type="submit"
              disabled={
                !formData.taskName ||
                !formData.url ||
                !formData.frequency.value ||
                isSubmitting
              }
              loading={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};
