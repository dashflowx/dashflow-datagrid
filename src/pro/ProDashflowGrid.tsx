import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchPeoplePage,
  getMockStore,
  makeMockPeople,
  updateMockPerson,
  type MockPerson,
} from './mock-server';

const ROW_H_BY_SIZE = { sm: 32, md: 36, lg: 44 } as const;

export type ProDashflowGridMode = 'virtual' | 'server';
export type ProDashflowGridVariant = 'default' | 'bordered' | 'muted' | 'striped' | 'flush';
export type ProDashflowGridSize = 'sm' | 'md' | 'lg';

export type ProDashflowGridProps = {
  mode?: ProDashflowGridMode;
  height?: number;
  pinName?: boolean;
  inlineEdit?: boolean;
  pageSize?: number;
  rowCount?: number;
  /** Surface treatment for the scroller chrome. */
  variant?: ProDashflowGridVariant;
  /** Row height and type density. */
  size?: ProDashflowGridSize;
  /** Show virtual/server status line above the table. */
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
  default: 'bg-slate-50',
  bordered: 'bg-white',
  muted: 'bg-slate-100',
  striped: 'bg-slate-50',
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

/**
 * Pro grid: windowed virtual rows, mocked server pages, sticky pin, inline edit.
 * Excel/grouping stay on N06. No production API.
 */
export function ProDashflowGrid({
  mode = 'virtual',
  height = 280,
  pinName = true,
  inlineEdit = true,
  pageSize = 8,
  rowCount = 200,
  variant = 'default',
  size = 'md',
  showMeta = true,
  className = '',
}: ProDashflowGridProps) {
  const rowH = ROW_H_BY_SIZE[size];
  const localRows = useMemo(() => makeMockPeople(rowCount), [rowCount]);
  const [serverRows, setServerRows] = useState<MockPerson[]>([]);
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scrollTop, setScrollTop] = useState(0);
  const [editing, setEditing] = useState<{ id: string; field: 'name' | 'role' } | null>(null);
  const [bump, setBump] = useState(0);

  const loadServer = useCallback(async () => {
    setLoading(true);
    const res = await fetchPeoplePage({ pageIndex, pageSize, sortKey: 'name', sortDir: 'asc' });
    setServerRows(res.rows);
    setTotal(res.total);
    setLoading(false);
  }, [pageIndex, pageSize]);

  useEffect(() => {
    if (mode === 'server') void loadServer();
  }, [mode, loadServer]);

  useEffect(() => {
    setPageIndex(0);
  }, [pageSize, mode]);

  const rows = mode === 'server' ? serverRows : localRows;
  const pageCount = mode === 'server' ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  const start = Math.max(0, Math.floor(scrollTop / rowH) - 4);
  const visible = Math.ceil(height / rowH) + 8;
  const end = Math.min(rows.length, start + visible);
  const windowed = mode === 'virtual' ? rows.slice(start, end) : rows;

  function saveEdit(id: string, field: 'name' | 'role', value: string) {
    if (mode === 'server') updateMockPerson(id, { [field]: value });
    const row = rows.find((r) => r.id === id);
    if (row) row[field] = value;
    setEditing(null);
    setBump((n) => n + 1);
  }

  const pinClass = pinName
    ? `sticky left-0 z-10 shadow-[1px_0_0_#e2e8f0] ${
        variant === 'muted' ? 'bg-slate-50' : 'bg-white'
      }`
    : '';

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
              {loading ? 'Loading mock page…' : `Mock page ${pageIndex + 1} of ${pageCount}`}
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
              <th className={`border-b ${SIZE_PAD[size]} ${pinClass}`}>Name</th>
              <th className={`border-b ${SIZE_PAD[size]}`}>Role</th>
            </tr>
          </thead>
          {mode === 'virtual' ? (
            <tbody className={variant === 'striped' ? '[&_tr:nth-child(even)]:bg-slate-50' : undefined}>
              <tr style={{ height: start * rowH }}>
                <td colSpan={2} />
              </tr>
              {windowed.map((row) => (
                <ProRow
                  key={row.id}
                  row={row}
                  rowH={rowH}
                  cellPad={SIZE_CELL[size]}
                  pinClass={pinClass}
                  inlineEdit={inlineEdit}
                  editing={editing}
                  setEditing={setEditing}
                  saveEdit={saveEdit}
                />
              ))}
              <tr style={{ height: Math.max(0, (rows.length - end) * rowH) }}>
                <td colSpan={2} />
              </tr>
            </tbody>
          ) : (
            <tbody className={variant === 'striped' ? '[&_tr:nth-child(even)]:bg-slate-50' : undefined}>
              {windowed.map((row) => (
                <ProRow
                  key={row.id}
                  row={getMockStore().find((p) => p.id === row.id) ?? row}
                  rowH={rowH}
                  cellPad={SIZE_CELL[size]}
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

function ProRow({
  row,
  rowH,
  cellPad,
  pinClass,
  inlineEdit,
  editing,
  setEditing,
  saveEdit,
}: {
  row: MockPerson;
  rowH: number;
  cellPad: string;
  pinClass: string;
  inlineEdit: boolean;
  editing: { id: string; field: 'name' | 'role' } | null;
  setEditing: (v: { id: string; field: 'name' | 'role' } | null) => void;
  saveEdit: (id: string, field: 'name' | 'role', value: string) => void;
}) {
  return (
    <tr data-testid="pro-row" style={{ height: rowH }}>
      <td className={`border-b ${cellPad} ${pinClass}`}>
        <EditableCell
          row={row}
          field="name"
          inlineEdit={inlineEdit}
          editing={editing}
          setEditing={setEditing}
          saveEdit={saveEdit}
        />
      </td>
      <td className={`border-b ${cellPad}`}>
        <EditableCell
          row={row}
          field="role"
          inlineEdit={inlineEdit}
          editing={editing}
          setEditing={setEditing}
          saveEdit={saveEdit}
        />
      </td>
    </tr>
  );
}

function EditableCell({
  row,
  field,
  inlineEdit,
  editing,
  setEditing,
  saveEdit,
}: {
  row: MockPerson;
  field: 'name' | 'role';
  inlineEdit: boolean;
  editing: { id: string; field: 'name' | 'role' } | null;
  setEditing: (v: { id: string; field: 'name' | 'role' } | null) => void;
  saveEdit: (id: string, field: 'name' | 'role', value: string) => void;
}) {
  const active = editing?.id === row.id && editing.field === field;
  if (active) {
    return (
      <input
        aria-label={`Edit ${field} for ${row.id}`}
        className="w-full rounded border px-1"
        defaultValue={row[field]}
        autoFocus
        onBlur={(e) => saveEdit(row.id, field, e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
        }}
      />
    );
  }
  if (!inlineEdit) return <>{row[field]}</>;
  return (
    <button
      type="button"
      className="text-left"
      aria-label={`Edit ${field} for ${row.id}`}
      onClick={() => setEditing({ id: row.id, field })}
    >
      {row[field]}
    </button>
  );
}
