import { useEffect, useMemo, useState } from 'react';
import {
  fetchPeoplePage,
  makeMockPeople,
  updateMockPerson,
  type MockPerson,
} from './mock-server';

const ROW_H_BY_SIZE = { sm: 32, md: 36, lg: 44 } as const;

export type ProDashflowGridMode = 'virtual' | 'server';
export type ProDashflowGridVariant = 'default' | 'bordered' | 'muted' | 'striped' | 'flush';
export type ProDashflowGridSize = 'sm' | 'md' | 'lg';

export type ProDashflowGridColumn<T extends Record<string, unknown>> = {
  key: keyof T & string;
  header: string;
  /** Sticky left column when true (or when it is the first column and `pinName`). */
  pin?: boolean;
  /** Allow click-to-edit for this column when `inlineEdit` is on. Default true for string fields. */
  editable?: boolean;
};

export type ProDashflowGridFetchPageArgs = {
  pageIndex: number;
  pageSize: number;
  sortKey?: string;
  sortDir?: 'asc' | 'desc';
};

export type ProDashflowGridFetchPageResult<T> = {
  rows: T[];
  total: number;
};

export type ProDashflowGridProps<T extends Record<string, unknown> = Record<string, unknown>> = {
  mode?: ProDashflowGridMode;
  /** Column definitions. When omitted, demo Name/Role columns are used. */
  columns?: ProDashflowGridColumn<T>[];
  /** Virtual-mode data. Prefer this over `rowCount` for real apps. */
  rows?: T[];
  /**
   * Server-mode loader. Return one page + total.
   * When omitted in server mode, the in-memory people mock is used (Storybook only).
   */
  fetchPage?: (
    args: ProDashflowGridFetchPageArgs,
  ) => Promise<ProDashflowGridFetchPageResult<T>>;
  getRowId?: (row: T, index: number) => string;
  /** Called after an inline edit commits. */
  onRowChange?: (row: T, patch: Partial<T>) => void;
  height?: number;
  /** Pin the first column (legacy Name pin). Ignored when a column sets `pin`. */
  pinName?: boolean;
  inlineEdit?: boolean;
  pageSize?: number;
  /** Demo fallback when `rows` is omitted in virtual mode. */
  rowCount?: number;
  variant?: ProDashflowGridVariant;
  size?: ProDashflowGridSize;
  showMeta?: boolean;
  className?: string;
};

const VARIANT_SHELL: Record<ProDashflowGridVariant, string> = {
  default: 'rounded border border-slate-200',
  bordered: 'rounded-lg border-2 border-slate-300 shadow-sm',
  muted: 'rounded border border-slate-200 bg-slate-50',
  striped: 'rounded border border-slate-200',
  flush: 'rounded border border-transparent',
};

const VARIANT_HEAD: Record<ProDashflowGridVariant, string> = {
  default: 'bg-slate-50 text-slate-700',
  bordered: 'bg-white text-slate-700',
  muted: 'bg-slate-100 text-slate-700',
  striped: 'bg-slate-50 text-slate-700',
  flush: 'bg-transparent',
};

const SIZE_TEXT: Record<ProDashflowGridSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const SIZE_PAD: Record<ProDashflowGridSize, string> = {
  sm: 'px-2 py-1',
  md: 'px-3 py-2',
  lg: 'px-4 py-2.5',
};

const SIZE_CELL: Record<ProDashflowGridSize, string> = {
  sm: 'px-2 py-0.5',
  md: 'px-3 py-1',
  lg: 'px-4 py-1.5',
};

const DEMO_COLUMNS: ProDashflowGridColumn<MockPerson>[] = [
  { key: 'name', header: 'Name', pin: true, editable: true },
  { key: 'role', header: 'Role', editable: true },
];

function defaultRowId<T extends Record<string, unknown>>(row: T, index: number) {
  const id = row.id;
  return id == null ? String(index) : String(id);
}

function cellText(value: unknown): string {
  return value == null ? '' : String(value);
}

/**
 * Pro grid: windowed virtual rows, server pages, sticky pin, inline edit.
 * Pass `columns` + `rows` (virtual) or `fetchPage` (server) for real data.
 * Excel/grouping stay on N06.
 */
export function ProDashflowGrid<T extends Record<string, unknown> = MockPerson>({
  mode = 'virtual',
  columns: columnsProp,
  rows: rowsProp,
  fetchPage: fetchPageProp,
  getRowId = defaultRowId,
  onRowChange,
  height = 280,
  pinName = true,
  inlineEdit = true,
  pageSize = 8,
  rowCount = 200,
  variant = 'default',
  size = 'md',
  showMeta = true,
  className = '',
}: ProDashflowGridProps<T>) {
  const rowH = ROW_H_BY_SIZE[size];
  const usingDemoData = rowsProp == null && fetchPageProp == null && columnsProp == null;

  const columns = useMemo(() => {
    if (columnsProp?.length) return columnsProp;
    return DEMO_COLUMNS as unknown as ProDashflowGridColumn<T>[];
  }, [columnsProp]);

  const demoRows = useMemo(
    () => (usingDemoData || (mode === 'virtual' && rowsProp == null) ? makeMockPeople(rowCount) : []),
    [usingDemoData, mode, rowsProp, rowCount],
  );

  const localRows = (rowsProp ?? (demoRows as unknown as T[])) as T[];
  const [serverRows, setServerRows] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [editing, setEditing] = useState<{ id: string; field: string } | null>(null);
  const [draftRows, setDraftRows] = useState<Record<string, T>>({});
  const [bump, setBump] = useState(0);

  const resetKey = `${mode}|${pageSize}`;
  const [lastResetKey, setLastResetKey] = useState(resetKey);
  if (resetKey !== lastResetKey) {
    setLastResetKey(resetKey);
    setPageIndex(0);
  }

  const sortKey = columns[0]?.key;
  const requestKey = `${pageIndex}|${pageSize}`;
  const loading = mode === 'server' && loadedKey !== requestKey;

  useEffect(() => {
    if (mode !== 'server') return;
    let cancelled = false;
    const request: Promise<ProDashflowGridFetchPageResult<T>> = fetchPageProp
      ? fetchPageProp({ pageIndex, pageSize, sortKey, sortDir: 'asc' })
      : fetchPeoplePage({ pageIndex, pageSize, sortKey: 'name', sortDir: 'asc' }).then(
          (res) => ({ rows: res.rows as unknown as T[], total: res.total }),
        );
    void request.then((res) => {
      if (cancelled) return;
      setServerRows(res.rows);
      setTotal(res.total);
      setLoadedKey(requestKey);
    });
    return () => {
      cancelled = true;
    };
  }, [mode, fetchPageProp, pageIndex, pageSize, sortKey, requestKey]);

  const rows = mode === 'server' ? serverRows : localRows;
  const pageCount = mode === 'server' ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  const start = Math.max(0, Math.floor(scrollTop / rowH) - 4);
  const visible = Math.ceil(height / rowH) + 8;
  const end = Math.min(rows.length, start + visible);
  const windowed = mode === 'virtual' ? rows.slice(start, end) : rows;

  function resolveRow(row: T, index: number): T {
    const id = getRowId(row, index);
    return draftRows[id] ?? row;
  }

  function saveEdit(row: T, index: number, field: string, value: string) {
    const id = getRowId(row, index);
    const patch = { [field]: value } as Partial<T>;
    const next = { ...resolveRow(row, index), ...patch };

    if (usingDemoData && mode === 'server') {
      updateMockPerson(id, patch as Partial<Pick<MockPerson, 'name' | 'role'>>);
    }

    setDraftRows((prev) => ({ ...prev, [id]: next }));
    onRowChange?.(next, patch);
    setEditing(null);
    setBump((n) => n + 1);
  }

  function isPinned(col: ProDashflowGridColumn<T>, colIndex: number) {
    if (col.pin) return true;
    return pinName && colIndex === 0 && columns.every((c) => !c.pin);
  }

  function pinClass(col: ProDashflowGridColumn<T>, colIndex: number) {
    if (!isPinned(col, colIndex)) return '';
    return `sticky left-0 z-10 shadow-[1px_0_0_#e2e8f0] ${
      variant === 'muted' ? 'bg-slate-50 text-slate-900' : 'bg-white text-slate-900'
    }`;
  }

  return (
    <div
      className={`space-y-2 ${SIZE_TEXT[size]} ${className}`.trim()}
      data-testid="pro-grid"
      data-bump={bump}
      data-variant={variant}
      data-size={size}
      data-mode={mode}
    >
      {showMeta ? (
        mode === 'server' ? (
          <div className="flex items-center gap-2">
            <span data-testid="server-status">
              {loading
                ? 'Loading page…'
                : `Page ${pageIndex + 1} of ${pageCount}${usingDemoData ? ' (mock)' : ''}`}
            </span>
            <button
              type="button"
              className="rounded border px-2 py-1 disabled:opacity-40"
              disabled={pageIndex === 0 || loading}
              onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
            >
              Previous
            </button>
            <button
              type="button"
              className="rounded border px-2 py-1 disabled:opacity-40"
              disabled={pageIndex + 1 >= pageCount || loading}
              onClick={() => setPageIndex((p) => p + 1)}
            >
              Next
            </button>
          </div>
        ) : (
          <span data-testid="virtual-meta">
            Rendering {windowed.length} of {rows.length} rows
          </span>
        )
      ) : null}
      <div
        className={`overflow-auto ${VARIANT_SHELL[variant]}`}
        style={mode === 'virtual' ? { height } : undefined}
        data-testid="virtual-scroller"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <table className="w-full text-left">
          <thead className={`sticky top-0 z-20 ${VARIANT_HEAD[variant]}`}>
            <tr>
              {columns.map((col, colIndex) => (
                <th
                  key={col.key}
                  className={`border-b ${SIZE_PAD[size]} ${pinClass(col, colIndex)}`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          {mode === 'virtual' ? (
            <tbody className={variant === 'striped' ? '[&_tr:nth-child(even)]:bg-slate-50' : undefined}>
              <tr style={{ height: start * rowH }}>
                <td colSpan={columns.length} />
              </tr>
              {windowed.map((row, i) => {
                const index = start + i;
                return (
                  <ProRow
                    key={getRowId(row, index)}
                    row={resolveRow(row, index)}
                    rowId={getRowId(row, index)}
                    rowIndex={index}
                    rowH={rowH}
                    cellPad={SIZE_CELL[size]}
                    columns={columns}
                    pinClass={pinClass}
                    inlineEdit={inlineEdit}
                    editing={editing}
                    setEditing={setEditing}
                    saveEdit={saveEdit}
                  />
                );
              })}
              <tr style={{ height: Math.max(0, (rows.length - end) * rowH) }}>
                <td colSpan={columns.length} />
              </tr>
            </tbody>
          ) : (
            <tbody className={variant === 'striped' ? '[&_tr:nth-child(even)]:bg-slate-50' : undefined}>
              {windowed.map((row, index) => (
                <ProRow
                  key={getRowId(row, index)}
                  row={resolveRow(row, index)}
                  rowId={getRowId(row, index)}
                  rowIndex={index}
                  rowH={rowH}
                  cellPad={SIZE_CELL[size]}
                  columns={columns}
                  pinClass={pinClass}
                  inlineEdit={inlineEdit}
                  editing={editing}
                  setEditing={setEditing}
                  saveEdit={saveEdit}
                />
              ))}
            </tbody>
          )}
        </table>
      </div>
    </div>
  );
}

function ProRow<T extends Record<string, unknown>>({
  row,
  rowId,
  rowIndex,
  rowH,
  cellPad,
  columns,
  pinClass,
  inlineEdit,
  editing,
  setEditing,
  saveEdit,
}: {
  row: T;
  rowId: string;
  rowIndex: number;
  rowH: number;
  cellPad: string;
  columns: ProDashflowGridColumn<T>[];
  pinClass: (col: ProDashflowGridColumn<T>, colIndex: number) => string;
  inlineEdit: boolean;
  editing: { id: string; field: string } | null;
  setEditing: (v: { id: string; field: string } | null) => void;
  saveEdit: (row: T, index: number, field: string, value: string) => void;
}) {
  return (
    <tr data-testid="pro-row" style={{ height: rowH }}>
      {columns.map((col, colIndex) => (
        <td key={col.key} className={`border-b ${cellPad} ${pinClass(col, colIndex)}`}>
          <EditableCell
            row={row}
            rowId={rowId}
            rowIndex={rowIndex}
            field={col.key}
            editable={col.editable !== false}
            inlineEdit={inlineEdit}
            editing={editing}
            setEditing={setEditing}
            saveEdit={saveEdit}
          />
        </td>
      ))}
    </tr>
  );
}

function EditableCell<T extends Record<string, unknown>>({
  row,
  rowId,
  rowIndex,
  field,
  editable,
  inlineEdit,
  editing,
  setEditing,
  saveEdit,
}: {
  row: T;
  rowId: string;
  rowIndex: number;
  field: string;
  editable: boolean;
  inlineEdit: boolean;
  editing: { id: string; field: string } | null;
  setEditing: (v: { id: string; field: string } | null) => void;
  saveEdit: (row: T, index: number, field: string, value: string) => void;
}) {
  const value = cellText(row[field]);
  const active = editing?.id === rowId && editing.field === field;
  if (active) {
    return (
      <input
        aria-label={`Edit ${field} for ${rowId}`}
        className="w-full rounded border px-1"
        defaultValue={value}
        autoFocus
        onBlur={(e) => saveEdit(row, rowIndex, field, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
      />
    );
  }
  if (!inlineEdit || !editable) return <>{value}</>;
  return (
    <button
      type="button"
      className="text-left"
      aria-label={`Edit ${field} for ${rowId}`}
      onClick={() => setEditing({ id: rowId, field })}
    >
      {value}
    </button>
  );
}
