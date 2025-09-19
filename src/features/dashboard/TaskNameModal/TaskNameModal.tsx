import React, { useState } from "react";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { classNames } from "primereact/utils";
import { TaskNameModalProps, TaskNameFormData } from "../../../model/dashboard";
import ButtonLoader from "../../../components/common/ButtonLoader";
import "./TaskNameModal.css";

export const TaskNameModal: React.FC<TaskNameModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  id,
  isSubmitting = false,
}) => {
  const [formData, setFormData] = useState<TaskNameFormData>({
    taskName: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    if (formData.taskName.trim()) {
      onSubmit(formData.taskName, id);
      // Don't close modal here - let parent handle it after API call
    }
  };

  const handleInputChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      taskName: value,
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="task-name-modal-overlay" role="dialog" aria-modal="true">
      <div className="task-name-modal-content">
        <div className="task-name-modal-header">
          <h2 className="task-name-modal-title">Name Your Task</h2>
          <Button
            icon="pi pi-times"
            className="task-name-modal-close-button"
            onClick={onClose}
            aria-label="Close"
            type="button"
          />
        </div>
        <form onSubmit={handleSubmit} className="task-name-modal-body">
          <div className="form-group">
            <label htmlFor="taskName">Task Name</label>
            <InputText
              id="taskName"
              value={formData.taskName}
              onChange={(e) => handleInputChange(e.target.value)}
              className={classNames("form-control", {
                "p-invalid": submitted && !formData.taskName.trim(),
              })}
              required
              placeholder="Enter task name"
              autoFocus
            />
            {submitted && !formData.taskName.trim() && (
              <small className="p-error">Task name is required.</small>
            )}
          </div>

          <div className="task-name-modal-footer">
            <Button
              label="Cancel"
              className="task-name-modal-cancel-button p-button-text"
              onClick={onClose}
              type="button"
              disabled={isSubmitting}
            />
            <Button
              label={isSubmitting ? "Submitting..." : "Submit"}
              className="task-name-modal-submit-button"
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskNameModal;
