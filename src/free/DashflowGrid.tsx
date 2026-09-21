import { useMemo, useState, type ReactNode } from 'react';
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

export type DashflowGridProps<T extends Record<string, unknown>> = {
  columns: DashflowGridColumn<T>[];
  rows: T[];
  caption?: string;
  pageSize?: number;
  getRowId?: (row: T, index: number) => string;
  onSelectionChange?: (ids: string[]) => void;
  onCsvExport?: (csv: string) => void;
};

function defaultRowId<T extends Record<string, unknown>>(row: T, index: number) {
  const id = row.id;
  return id == null ? String(index) : String(id);
}

/** Free client grid: sort, page, row select, CSV of the current page (G03). No backend. */
export function DashflowGrid<T extends Record<string, unknown>>({
  columns,
  rows,
  caption = 'Dashflow grid',
  pageSize = 10,
  getRowId = defaultRowId,
  onSelectionChange,
  onCsvExport,
}: DashflowGridProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize,
  });
  const [lastCsv, setLastCsv] = useState('');

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
    return [selectCol, ...dataCols];
  }, [columns]);

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
    enableRowSelection: true,
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
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1"
          onClick={exportPageCsv}
        >
          Export CSV
        </button>
        <span data-testid="selection-count">{selectedCount} selected</span>
        <span data-testid="page-status">
          Page {pageCount === 0 ? 0 : pageIndex + 1} of {pageCount}
        </span>
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </button>
        <button
          type="button"
          className="rounded border border-slate-300 px-3 py-1 disabled:opacity-40"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </button>
      </div>
      <Table className="min-w-full text-left text-sm" aria-label={caption}>
        <caption className="sr-only">{caption}</caption>
        <thead className="bg-slate-50">
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
        <tbody>
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
      {lastCsv ? (
        <pre data-testid="csv-output" className="overflow-x-auto rounded bg-slate-50 p-2 text-xs">
          {lastCsv}
        </pre>
      ) : null}
    </div>
  );
}
