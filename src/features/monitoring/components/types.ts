export interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: NewTaskFormData) => void;
  initialData?: Partial<NewTaskFormData>;
  urls: string[];
}

export interface NewTaskFormData {
  task_name: string;
  url: string;
  frequency: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
  };
}
