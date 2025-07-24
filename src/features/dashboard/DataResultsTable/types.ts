import { ReactElement } from 'react';

export interface DataResultsTableProps {
  data: any[];
  originUrl: string | null;
  onBackToMain: () => void;
  onDownloadCSV: (data: any[]) => void;
  isXmlContent: boolean;
  id?: string; // ID for the data results, used when submitting task name
}

export interface XmlHeaders extends Record<string, string> {
  title: string;
  date: string;
  image: string;
  description: string;
}
