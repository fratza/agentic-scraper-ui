/**
 * Utility functions for exporting data to CSV format
 */

/**
 * Generic function to export data to CSV
 * @param data Array of objects to export
 * @param headers Object mapping column keys to header names
 * @param filename Name of the CSV file to download
 */
export const exportToCSV = <T extends Record<string, any>>(
  data: T[],
  headers: Record<keyof T, string>,
  filename: string = "export.csv"
): void => {
  if (!data || data.length === 0) {
    console.warn("No data to export");
    return;
  }

  // Create header row from the headers object
  const headerRow = Object.values(headers).join(",");

  // Create data rows
  const rows = data.map((item) => {
    return Object.keys(headers)
      .map((key) => {
        const value = item[key];
        if (value === null || value === undefined) {
          return '""';
        }
        if (typeof value === "object" && value instanceof Date) {
          return `"${value.toLocaleDateString()}"`;
        }
        if (typeof value === "object") {
          return `"${JSON.stringify(value).replace(/"/g, '""')}"`;
        }
        if (typeof value === "string") {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return `"${value}"`;
      })
      .join(",");
  });

  // Combine header and rows
  const csvContent = [headerRow, ...rows].join("\n");

  // Create and download the file
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Function to format a date value for display
 * @param date Date string or Date object
 * @param defaultValue Value to return if date is invalid
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date | undefined | null,
  defaultValue: string = "N/A"
): string => {
  if (!date) return defaultValue;
  try {
    return new Date(date).toLocaleDateString();
  } catch (e) {
    return defaultValue;
  }
};
