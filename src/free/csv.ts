export type GridColumn<T> = {
  key: keyof T & string;
  header: string;
  sortable?: boolean;
};

export function csvCell(value: unknown): string {
  const s = value == null ? '' : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

/** CSV for the rows passed in (caller supplies the current page). */
export function rowsToCsv<T extends Record<string, unknown>>(
  columns: GridColumn<T>[],
  rows: T[]
): string {
  const header = columns.map((c) => csvCell(c.header)).join(',');
  const body = rows
    .map((row) => columns.map((c) => csvCell(row[c.key])).join(','))
    .join('\n');
  return body ? `${header}\n${body}\n` : `${header}\n`;
}
