import { FormSubmitData } from './common';

/**
 * Props for the XmlParseForm component
 */
export interface XmlParseFormProps {
  onSubmit: (data: FormSubmitData) => void;
  onSwitchToRegular: () => void;
}
