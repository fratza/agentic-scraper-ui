import { ReactElement } from 'react';

export interface OriginUrlsTableProps {
  data: Array<{ id: string; origin_url: string }>;
  onViewResult: (url: string) => void;
  title?: string | ReactElement;
}

export interface UrlRow {
  id: string;
  origin_url: string;
}
