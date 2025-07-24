import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { classNames } from 'primereact/utils';
import { TaskNameModalProps, TaskNameFormData } from '../../../model/dashboard';
import './TaskNameModal.css';

export const TaskNameModal: React.FC<TaskNameModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  id
}) => {
  const [formData, setFormData] = useState<TaskNameFormData>({
    task_name: '',
  });

  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    
    if (formData.task_name.trim()) {
      onSubmit(formData.task_name, id);
      onClose();
    }
  };

  const handleInputChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      task_name: value
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
              value={formData.task_name}
              onChange={(e) => handleInputChange(e.target.value)}
              className={classNames('form-control', {
                'p-invalid': submitted && !formData.task_name.trim(),
              })}
              required
              placeholder="Enter task name"
              autoFocus
            />
            {submitted && !formData.task_name.trim() && (
              <small className="p-error">Task name is required.</small>
            )}
          </div>

          <div className="task-name-modal-footer">
            <Button
              label="Cancel"
              className="task-name-modal-cancel-button p-button-text"
              onClick={onClose}
              type="button"
            />
            <Button
              label="Submit"
              className="task-name-modal-submit-button"
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskNameModal;
