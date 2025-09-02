import React, { useState } from "react";
import { InputText } from "primereact/inputtext";
import { Tooltip } from "primereact/tooltip";
import { SquareMenu, CircleMinus } from "lucide-react";
import formatDistanceToNow from "date-fns/formatDistanceToNow";
import { ScrapingTask } from "./types";
import { Button } from "primereact/button";
import "./TaskTable.css";

interface TaskTableProps {
  tasks: ScrapingTask[];
  onRunTask: (taskId: string) => void;
}

export const TaskTable: React.FC<TaskTableProps> = ({ tasks, onRunTask }) => {
  const formatSchedule = (schedule: string) => {
    // Simple formatting for common cron patterns
    if (schedule === "0 */3 * * *") return "Every 3 hours";
    if (schedule === "0 0 * * *") return "Daily at midnight";
    if (schedule === "*/15 * * *") return "Every 15 minutes";
    return schedule; // Return as is if no match
  };

  return (
    <div className="monitoring-table task-table-container">
      <Tooltip target=".schedule-help" />
      <table className="w-full task-table">
        <thead>
          <tr>
            <th className="task-th">Task Name</th>
            <th className="task-th">URL</th>
            <th className="task-th interval">Interval</th>
            <th className="task-th">Last Run</th>
            <th className="task-th">Next Run</th>
            <th className="task-th status">Status</th>
            <th className="task-th actions">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr
              key={task.id}
              className={task.status === "error" ? "error-row" : ""}
            >
              <td className="task-td">{task.name}</td>
              <td className="task-td url">
                <a
                  href={task.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  {new URL(task.url).hostname}
                </a>
              </td>
              <td className="task-td">
                <span>
                  {task.intervalValue} {task.intervalType}
                </span>
              </td>
              <td className="task-td">
                {task.lastRun
                  ? `${formatDistanceToNow(new Date(task.lastRun), {
                      addSuffix: true,
                    })}`
                  : "Never"}
              </td>
              <td className="task-td">
                {formatDistanceToNow(new Date(task.nextRun), {
                  addSuffix: true,
                })}
              </td>
              <td className="task-td">
                <span className={`status-badge ${task.status}`}>
                  {task.status.charAt(0).toUpperCase() + task.status.slice(1)}
                </span>
              </td>
              <td className="actions-cell task-td actions">
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
