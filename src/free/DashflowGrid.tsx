import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
} from '@tanstack/react-table';
import { rowsToCsv, type GridColumn } from './csv';
import { Table, Td, Th, Tr } from './table';

export type DashflowGridColumn<T extends Record<string, unknown>> = GridColumn<T>;

export type DashflowGridVariant = 'default' | 'bordered' | 'muted' | 'striped' | 'flush';
export type DashflowGridSize = 'sm' | 'md' | 'lg';

export type DashflowGridProps<T extends Record<string, unknown>> = {
  columns: DashflowGridColumn<T>[];
  rows: T[];
  caption?: string;
  pageSize?: number;
  getRowId?: (row: T, index: number) => string;
  onSelectionChange?: (ids: string[]) => void;
  onCsvExport?: (csv: string) => void;
  /** Surface treatment for the grid chrome and table. */
  variant?: DashflowGridVariant;
  /** Cell and control density. */
  size?: DashflowGridSize;
  /** Show Export CSV / page controls. */
  showToolbar?: boolean;
  /** Include the select column and selection count. */
  enableSelection?: boolean;
  /** Show the last exported CSV preview under the table. */
  showCsvPreview?: boolean;
  className?: string;
};

function defaultRowId<T extends Record<string, unknown>>(row: T, index: number) {
  const id = row.id;
  return id == null ? String(index) : String(id);
}

const VARIANT_SHELL: Record<DashflowGridVariant, string> = {
  default: '',
  bordered: 'rounded-lg border border-slate-200 p-3',
  muted: 'rounded-lg bg-slate-50 p-3',
  striped: '',
  flush: '',
};

const VARIANT_HEAD: Record<DashflowGridVariant, string> = {
  default: 'bg-slate-50',
  bordered: 'bg-white',
  muted: 'bg-slate-100',
  striped: 'bg-slate-50',
  flush: 'bg-transparent',
};

const SIZE_TEXT: Record<DashflowGridSize, string> = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

const SIZE_CELL: Record<DashflowGridSize, string> = {
  sm: '[&_th]:px-2 [&_th]:py-1 [&_td]:px-2 [&_td]:py-1',
  md: '',
  lg: '[&_th]:px-5 [&_th]:py-3 [&_td]:px-5 [&_td]:py-3',
};

const SIZE_BTN: Record<DashflowGridSize, string> = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-3 py-1 text-sm',
  lg: 'px-4 py-1.5 text-sm',
};

/** Free client grid: sort, page, row select, CSV of the current page (G03). No backend. */
export function DashflowGrid<T extends Record<string, unknown>>({
  columns,
  rows,
  caption = 'Dashflow grid',
  pageSize = 10,
  getRowId = defaultRowId,
  onSelectionChange,
  onCsvExport,
  variant = 'default',
  size = 'md',
  showToolbar = true,
  enableSelection = true,
  showCsvPreview = true,
  className = '',
}: DashflowGridProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [lastCsv, setLastCsv] = useState('');

  useEffect(() => {
    setPagination((prev) =>
      prev.pageSize === pageSize ? prev : { pageIndex: 0, pageSize },
    );
  }, [pageSize]);

  const columnDefs = useMemo<ColumnDef<T>[]>(() => {
    const selectCol: ColumnDef<T> = {
      id: 'select',
      header: ({ table }) => (
        <input
          type="checkbox"
          aria-label="Select all rows on this page"
          checked={table.getIsAllPageRowsSelected()}
          ref={(el) => {
            if (el) el.indeterminate = table.getIsSomePageRowsSelected();
          }}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          aria-label={`Select row ${row.id}`}
          checked={row.getIsSelected()}
          disabled={!row.getCanSelect()}
          onChange={row.getToggleSelectedHandler()}
        />
      ),
      enableSorting: false,
    };
    const dataCols: ColumnDef<T>[] = columns.map((col) => ({
      accessorKey: col.key,
      header: col.header,
      enableSorting: col.sortable !== false,
      cell: (info) => info.getValue() as ReactNode,
    }));
    return enableSelection ? [selectCol, ...dataCols] : dataCols;
  }, [columns, enableSelection]);

  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    state: { sorting, pagination, rowSelection },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    onRowSelectionChange: (updater) => {
      setRowSelection((prev) => {
        const next = typeof updater === 'function' ? updater(prev) : updater;
        onSelectionChange?.(Object.keys(next).filter((id) => next[id]));
        return next;
      });
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId,
    enableRowSelection: enableSelection,
  });

  const pageRows = table.getRowModel().rows;
  const selectedCount = table.getSelectedRowModel().rows.length;
  const pageCount = table.getPageCount();
  const pageIndex = table.getState().pagination.pageIndex;

  function exportPageCsv() {
    const visible = pageRows.map((r) => r.original);
    const csv = rowsToCsv(columns, visible);
    setLastCsv(csv);
    onCsvExport?.(csv);
  }

  return (
    <div
      className={`space-y-3 ${SIZE_TEXT[size]} ${VARIANT_SHELL[variant]} ${className}`.trim()}
      data-testid="dashflow-grid"
    >
      {showToolbar ? (
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            className={`rounded border border-slate-300 ${SIZE_BTN[size]}`}
            onClick={exportPageCsv}
          >
            Export CSV
          </button>
          {enableSelection ? (
            <span data-testid="selection-count">{selectedCount} selected</span>
          ) : null}
          <span data-testid="page-status">
            Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
          </span>
          <button
            type="button"
            className={`rounded border border-slate-300 disabled:opacity-40 ${SIZE_BTN[size]}`}
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <button
            type="button"
            className={`rounded border border-slate-300 disabled:opacity-40 ${SIZE_BTN[size]}`}
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      ) : null}
      <Table
        className={`min-w-full text-left ${SIZE_CELL[size]}`.trim()}
        aria-label={caption}
      >
        <caption className="sr-only">{caption}</caption>
        <thead className={VARIANT_HEAD[variant]}>
          {table.getHeaderGroups().map((group) => (
            <Tr key={group.id}>
              {group.headers.map((header) => {
                const sorted = header.column.getIsSorted();
                const canSort = header.column.getCanSort();
                return (
                  <Th
                    key={header.id}
                    aria-sort={
                      sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'
                    }
                  >
                    {header.isPlaceholder ? null : canSort ? (
                      <button
                        type="button"
                        className="font-bold"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {sorted === 'asc' ? ' ↑' : sorted === 'desc' ? ' ↓' : ''}
                      </button>
                    ) : (
                      flexRender(header.column.columnDef.header, header.getContext())
                    )}
                  </Th>
                );
              })}
            </Tr>
          ))}
        </thead>
        <tbody className={variant === 'striped' ? '[&_tr:nth-child(even)]:bg-slate-50' : undefined}>
          {pageRows.map((row) => (
            <Tr key={row.id} data-selected={row.getIsSelected() ? 'true' : 'false'}>
              {row.getVisibleCells().map((cell) => (
                <Td key={cell.id}>
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </Td>
              ))}
            </Tr>
          ))}
        </tbody>
      </Table>
      {showCsvPreview && lastCsv ? (
        <pre data-testid="csv-output" className="overflow-x-auto rounded bg-slate-50 p-2 text-xs">
          {lastCsv}
        </pre>
      ) : null}
    </div>
  );
}
