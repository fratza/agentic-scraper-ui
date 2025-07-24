export interface UrlItem {
  id: string;
  url: string;
}

export interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: NewTaskFormData) => void;
  initialData?: Partial<NewTaskFormData>;
  urls: string[];
  urlObjects?: UrlItem[];
  isLoadingUrls?: boolean;
}

export interface NewTaskFormData {
  task_name: string;
  url: string;
  url_id?: string;
  frequency: {
    value: number;
    unit: 'minutes' | 'hours' | 'days' | 'weeks';
  };
}
