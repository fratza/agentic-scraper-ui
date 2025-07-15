export type TaskStatus = 'active' | 'inactive' | 'error';

export interface ScrapingTask {
  id: string;
  name: string;
  url: string;
  intervalValue: number;
  intervalType: 'hours' | 'minutes' | 'days' | 'weeks';
  lastRun: Date | null;
  nextRun: Date;
  status: TaskStatus;
  lastError?: string;
  description?: string;
  isEditing?: boolean;
  tempSchedule?: string;
}

export const mockTasks: ScrapingTask[] = [
  {
    id: '1',
    name: 'Product Scraper',
    url: 'https://example.com/products',
    intervalValue: 3,
    intervalType: 'hours',
    lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    nextRun: new Date(Date.now() + 1 * 60 * 60 * 1000), // In 1 hour
    status: 'active' as const,
    description: 'Scrapes product data from e-commerce sites',
  },
  {
    id: '2',
    name: 'Price Tracker',
    url: 'https://example.com/prices',
    intervalValue: 1,
    intervalType: 'days',
    lastRun: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
    nextRun: new Date(new Date().setHours(24, 0, 0, 0)), // Next midnight
    status: 'inactive' as const,
    description: 'Tracks price changes for products',
  },
  {
    id: '3',
    name: 'Inventory Sync',
    url: 'https://example.com/inventory',
    intervalValue: 15,
    intervalType: 'minutes',
    lastRun: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
    nextRun: new Date(Date.now() + 15 * 60 * 1000), // In 15 minutes
    status: 'error' as const,
    lastError: 'Connection timeout',
    description: 'Synchronizes inventory levels with external systems',
  },
];
