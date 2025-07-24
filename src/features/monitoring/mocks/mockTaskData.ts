import { NewTaskFormData } from '../components/types';

export const mockTaskFormData: NewTaskFormData = {
  task_name: 'Monitor Product Prices',
  url: 'https://example.com/products',
  frequency: {
    value: 1,
    unit: 'hours'
  }
};

export const mockUrls = [
  'https://example.com/products',
  'https://example.com/specials',
  'https://example.com/new-arrivals',
  'https://example.com/best-sellers',
  'https://example.com/clearance'
];

export const mockTasks = [
  {
    id: 'task-1',
    name: 'Monitor Homepage',
    url: 'https://example.com',
    intervalValue: 1,
    intervalType: 'hours' as const,
    lastRun: new Date(Date.now() - 3600000),
    nextRun: new Date(),
    status: 'active' as const,
    description: 'Monitoring homepage for changes'
  },
  {
    id: 'task-2',
    name: 'Price Tracker',
    url: 'https://example.com/products/special-offer',
    intervalValue: 6,
    intervalType: 'hours' as const,
    lastRun: new Date(Date.now() - 21600000),
    nextRun: new Date(Date.now() + 10800000),
    status: 'inactive' as const,
    description: 'Tracking price changes for special offers'
  },
  {
    id: 'task-3',
    name: 'Inventory Check',
    url: 'https://example.com/inventory',
    intervalValue: 1,
    intervalType: 'days' as const,
    lastRun: new Date(Date.now() - 86400000),
    nextRun: new Date(Date.now() + 3600000),
    status: 'active' as const,
    description: 'Daily inventory check'
  }
];
