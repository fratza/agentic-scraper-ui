import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { NewTaskModalProps, NewTaskFormData } from './types';
import apiService from '../../../services/api';
import './NewTaskModal.css';

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  urls,
}) => {
  const [formData, setFormData] = useState<NewTaskFormData>({
    task_name: initialData?.task_name || '',
    url: initialData?.url || '',
    frequency: {
      value: initialData?.frequency?.value || 1,
      unit: initialData?.frequency?.unit || 'hours'
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Call the API to submit the task
      const response = await apiService.submitMonitorTask({
        task_name: formData.task_name,
        url: formData.url,
        frequency: {
          value: formData.frequency.value,
          unit: formData.frequency.unit
        }
      });
      
      // Call the parent's onSubmit with the form data
      onSubmit(formData);
      
      // Show success message (you might want to use a toast notification here)
      console.log('Task created successfully:', response);
      
      // Close the modal after successful submission
      onClose();
    } catch (error) {
      console.error('Failed to create task:', error);
      // You might want to show an error message to the user here
    }
  };

  const handleInputChange = (
    field: 'task_name' | 'url' | 'frequency',
    value: string | number | { value: number; unit: 'minutes' | 'hours' | 'days' | 'weeks' }
  ) => {
    setFormData(prev => {
      if (field === 'frequency' && typeof value === 'object') {
        return {
          ...prev,
          frequency: {
            ...prev.frequency,
            ...value
          }
        };
      }
      return {
        ...prev,
        [field]: value
      } as NewTaskFormData;
    });
  };

  const intervalTypes = [
    { label: 'Minutes', value: 'minutes' },
    { label: 'Hours', value: 'hours' },
    { label: 'Days', value: 'days' },
    { label: 'Weeks', value: 'weeks' },
  ];

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">New Task</h2>
          <Button
            icon="pi pi-times"
            className="modal-close-button"
            onClick={onClose}
            aria-label="Close"
            type="button"
          />
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label htmlFor="taskName">Task Name</label>
            <InputText
              id="taskName"
              value={formData.task_name}
              onChange={(e) => handleInputChange('task_name', e.target.value)}
              className={classNames('form-control', {
                'p-invalid': !formData.task_name,
              })}
              required
              placeholder="Enter task name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="taskUrl">URL</label>
            <select
              id="taskUrl"
              value={formData.url || ''}
              onChange={(e) => handleInputChange('url', e.target.value)}
              className="p-inputtext p-component form-control"
              required
            >
              <option value="">Select URL</option>
              {urls.map((url) => (
                <option key={url} value={url}>
                  {url}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="intervalValue">Schedule Frequency</label>
            <div className="interval-inputs">
              <InputText
                id="intervalValue"
                value={formData.frequency.value.toString()}
                onChange={(e) =>
                  handleInputChange('frequency', {
                    ...formData.frequency,
                    value: parseInt(e.target.value) || 1
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
                  handleInputChange('frequency', {
                    ...formData.frequency,
                    unit: e.value as 'minutes' | 'hours' | 'days' | 'weeks'
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
    label="Create Task"
    className="modal-submit-button"
    type="submit"
    disabled={!formData.task_name || !formData.url || !formData.frequency.value}
  />
</div>
        </form>
      </div>
    </div>
  );
};
