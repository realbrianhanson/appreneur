import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Escape a value for safe CSV output.
 * - Coerces to string.
 * - Prefixes a single quote to any cell starting with = + - or @
 *   to guard against spreadsheet formula injection.
 * - Wraps in double quotes and escapes internal quotes by doubling them.
 */
export function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return '""';
  let s = String(value);
  if (/^[=+\-@]/.test(s)) {
    s = "'" + s;
  }
  return '"' + s.replace(/"/g, '""') + '"';
}

/** Join an array of cells into a CSV row using csvEscape on each cell. */
export function csvRow(cells: unknown[]): string {
  return cells.map(csvEscape).join(",");
}
