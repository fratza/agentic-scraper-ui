import { FormSubmitData } from './common';

/**
 * Props for the ScraperForm component
 */
export interface ScraperFormProps {
  onSubmit: (data: FormSubmitData) => void;
}
