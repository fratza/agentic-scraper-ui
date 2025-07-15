import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Tooltip } from "primereact/tooltip";
import { SquareMenu, CircleMinus } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ScrapingTask } from "./types";
import { Button } from "primereact/button";

interface TaskTableProps {
  tasks: ScrapingTask[];
  onRunTask: (taskId: string) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, onRunTask }) => {
  const formatSchedule = (schedule: string) => {
    // Simple formatting for common cron patterns
    if (schedule === "0 */3 * * *") return "Every 3 hours";
    if (schedule === "0 0 * * *") return "Daily at midnight";
    if (schedule === "*/15 * * * *") return "Every 15 minutes";
    return schedule; // Return as is if no match
  };

  return (
    <div className="monitoring-table">
      <Tooltip target=".schedule-help" />
      <table className="w-full">
        <thead>
          <tr>
            <th>Task Name</th>
            <th>URL</th>
            <th>Interval</th>
            <th>Last Run</th>
            <th>Next Run</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className={task.status === "error" ? "error-row" : ""}
            >
              <td>{task.name}</td>
              <td>
                <a href={task.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700">
                  {new URL(task.url).hostname}
                </a>
              </td>
              <td>
                <span className="schedule-help" data-pr-tooltip={`${task.intervalValue} ${task.intervalType}`}>
                  {task.intervalValue} {task.intervalType}
                </span>
              </td>
              <td>
                {task.lastRun
                  ? `${formatDistanceToNow(new Date(task.lastRun), {
                      addSuffix: true,
                    })}`
                  : "Never"}
              </td>
              <td>
                {formatDistanceToNow(new Date(task.nextRun), {
                  addSuffix: true,
                })}
              </td>
              <td>
                <span className={`status-badge ${task.status}`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </td>
              <td className="actions-cell">
                <div className="flex justify-content-center gap-2">
                  <Button
                    className="p-button-sm p-button-text p-button-primary icon-button"
                    tooltip="Edit Task"
                    tooltipOptions={{ position: "top" }}
                    onClick={() => onRunTask(task.id)}
                  >
                    <SquareMenu size={18} />
                  </Button>
                  <Button
                    className="p-button-sm p-button-text p-button-danger icon-button"
                    tooltip="Delete Task"
                    tooltipOptions={{ position: "top" }}
                  >
                    <CircleMinus size={18} />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TaskTable;
