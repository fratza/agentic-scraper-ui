export interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: NewTaskFormData) => void;
  initialData?: Partial<NewTaskFormData>;
  urls: string[];
}

export interface NewTaskFormData {
  name: string;
  url: string;
  intervalValue: number;
  intervalType: "minutes" | "hours" | "days" | "weeks";
}
