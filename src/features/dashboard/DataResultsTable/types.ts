import { ReactElement } from 'react';

export interface DataResultsTableProps {
  data: any[];
  originUrl: string | null;
  onBackToMain: () => void;
  onDownloadCSV: (data: any[]) => void;
  isXmlContent: boolean;
}

export interface XmlHeaders extends Record<string, string> {
  title: string;
  date: string;
  image: string;
  description: string;
}
