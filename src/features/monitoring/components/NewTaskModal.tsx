import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dropdown } from 'primereact/dropdown';
import { classNames } from 'primereact/utils';
import { NewTaskModalProps, NewTaskFormData } from './types';
import './NewTaskModal.css';

export const NewTaskModal: React.FC<NewTaskModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  urls,
}) => {
  const [formData, setFormData] = useState<NewTaskFormData>({
    name: initialData?.name || '',
    url: initialData?.url || '',
    intervalValue: initialData?.intervalValue || 1,
    intervalType: initialData?.intervalType || 'hours',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
    onClose(); // Close the modal after submission
  };

  const handleInputChange = (field: keyof NewTaskFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: field === 'intervalValue' ? parseInt(value as string) : value,
    }));
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
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={classNames('form-control', {
                'p-invalid': !formData.name,
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
                value={formData.intervalValue.toString()}
                onChange={(e) =>
                  handleInputChange('intervalValue', e.target.value)
                }
                className="form-control w-20"
                type="number"
                min="1"
                required
              />
              <Dropdown
                id="intervalType"
                value={formData.intervalType}
                options={intervalTypes}
                onChange={(e) =>
                  handleInputChange('intervalType', e.value)
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
    disabled={!formData.name || !formData.url || !formData.intervalValue}
  />
</div>
        </form>
      </div>
    </div>
  );
};
