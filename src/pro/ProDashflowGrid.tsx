import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  fetchPeoplePage,
  getMockStore,
  makeMockPeople,
  updateMockPerson,
  type MockPerson,
} from './mock-server';

const ROW_H = 36;

export type ProDashflowGridProps = {
  mode?: 'virtual' | 'server';
  height?: number;
  pinName?: boolean;
  inlineEdit?: boolean;
  pageSize?: number;
  rowCount?: number;
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
}: ProDashflowGridProps) {
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

  const rows = mode === 'server' ? serverRows : localRows;
  const pageCount = mode === 'server' ? Math.max(1, Math.ceil(total / pageSize)) : 1;

  const start = Math.max(0, Math.floor(scrollTop / ROW_H) - 4);
  const visible = Math.ceil(height / ROW_H) + 8;
  const end = Math.min(rows.length, start + visible);
  const windowed = mode === 'virtual' ? rows.slice(start, end) : rows;

  function saveEdit(id: string, field: 'name' | 'role', value: string) {
    if (mode === 'server') updateMockPerson(id, { [field]: value });
    const row = rows.find((r) => r.id === id);
    if (row) row[field] = value;
    setEditing(null);
    setBump((n) => n + 1);
  }

  const pinClass = pinName ? 'sticky left-0 z-10 bg-white shadow-[1px_0_0_#e2e8f0]' : '';

  return (
    <div className="space-y-2 text-sm" data-testid="pro-grid" data-bump={bump}>
      {mode === 'server' ? (
        <div className="flex items-center gap-2">
          <span data-testid="server-status">{loading ? 'Loading mock page…' : `Mock page ${pageIndex + 1} of ${pageCount}`}</span>
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
      )}
      <div
        className="overflow-auto rounded border border-slate-200"
        style={mode === 'virtual' ? { height } : undefined}
        data-testid="virtual-scroller"
        onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      >
        <table className="w-full text-left">
          <thead className="sticky top-0 z-20 bg-slate-50">
            <tr>
              <th className={`border-b px-3 py-2 ${pinClass}`}>Name</th>
              <th className="border-b px-3 py-2">Role</th>
            </tr>
          </thead>
          {mode === 'virtual' ? (
            <tbody>
              <tr style={{ height: start * ROW_H }}>
                <td colSpan={2} />
              </tr>
              {windowed.map((row) => (
                <ProRow
                  key={row.id}
                  row={row}
                  pinClass={pinClass}
                  inlineEdit={inlineEdit}
                  editing={editing}
                  setEditing={setEditing}
                  saveEdit={saveEdit}
                />
              ))}
              <tr style={{ height: Math.max(0, (rows.length - end) * ROW_H) }}>
                <td colSpan={2} />
              </tr>
            </tbody>
          ) : (
            <tbody>
              {windowed.map((row) => (
                <ProRow
                  key={row.id}
                  row={getMockStore().find((p) => p.id === row.id) ?? row}
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
  pinClass,
  inlineEdit,
  editing,
  setEditing,
  saveEdit,
}: {
  row: MockPerson;
  pinClass: string;
  inlineEdit: boolean;
  editing: { id: string; field: 'name' | 'role' } | null;
  setEditing: (v: { id: string; field: 'name' | 'role' } | null) => void;
  saveEdit: (id: string, field: 'name' | 'role', value: string) => void;
}) {
  return (
    <tr data-testid="pro-row" style={{ height: ROW_H }}>
      <td className={`border-b px-3 py-1 ${pinClass}`}>
        <EditableCell
          row={row}
          field="name"
          inlineEdit={inlineEdit}
          editing={editing}
          setEditing={setEditing}
          saveEdit={saveEdit}
        />
      </td>
      <td className="border-b px-3 py-1">
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
