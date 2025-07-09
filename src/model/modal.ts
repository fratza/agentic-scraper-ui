import { ReactNode } from 'react';

/**
 * Props for the Modal component
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}
