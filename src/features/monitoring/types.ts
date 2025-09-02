export type TaskStatus = "active" | "inactive" | "error";

export interface ScrapingTask {
  id: string;
  name: string;
  url: string;
  intervalValue: number;
  intervalType: "hours" | "minutes" | "days" | "weeks";
  lastRun: Date | null;
  nextRun: Date;
  status: TaskStatus;
  lastError?: string;
  description?: string;
  isEditing?: boolean;
  tempSchedule?: string;
}
