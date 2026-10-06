import type { Meta, StoryObj } from '@storybook/react';
import { useCallback, useMemo, useState } from 'react';
import { ProDashflowGrid, type ProDashflowGridColumn } from './ProDashflowGrid';
import { makeMockPeople, type MockPerson } from './mock-server';

type OrderRow = {
  id: string;
  sku: string;
  customer: string;
  status: string;
  total: string;
};

const ORDER_COLUMNS: ProDashflowGridColumn<OrderRow>[] = [
  { key: 'sku', header: 'SKU', pin: true, editable: false },
  { key: 'customer', header: 'Customer', editable: true },
  { key: 'status', header: 'Status', editable: true },
  { key: 'total', header: 'Total', editable: false },
];

const ORDER_ROWS: OrderRow[] = Array.from({ length: 120 }, (_, i) => ({
  id: String(i + 1),
  sku: `SKU-${1000 + i}`,
  customer: `Customer ${i + 1}`,
  status: i % 3 === 0 ? 'Shipped' : i % 3 === 1 ? 'Pending' : 'Packed',
  total: `$${(40 + (i % 20) * 7).toFixed(2)}`,
}));

const PEOPLE_COLUMNS: ProDashflowGridColumn<MockPerson>[] = [
  { key: 'name', header: 'Name', pin: true, editable: true },
  { key: 'role', header: 'Role', editable: true },
];

const meta: Meta<typeof ProDashflowGrid> = {
  title: 'Datagrid/Pro',
  component: ProDashflowGrid,
  tags: ['autodocs'],
  argTypes: {
    mode: { control: 'select', options: ['virtual', 'server'] },
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'muted', 'striped', 'flush'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof ProDashflowGrid>;

/** Virtual + pin + inline edit + read-only column — full Pro feature set. */
export const AllFeatures: Story = {
  render: () => (
    <ProDashflowGrid
      mode="virtual"
      columns={ORDER_COLUMNS}
      rows={ORDER_ROWS}
      height={280}
      pinName
      inlineEdit
      showMeta
      variant="bordered"
      size="md"
      onRowChange={(row, patch) => console.log('row change', row.id, patch)}
    />
  ),
};

/** Real columns + rows (virtual). Prefer this over `rowCount` demos. */
export const WithYourData: Story = {
  render: () => (
    <ProDashflowGrid
      mode="virtual"
      columns={ORDER_COLUMNS}
      rows={ORDER_ROWS}
      height={280}
      pinName
      inlineEdit
      variant="bordered"
      size="md"
    />
  ),
};

/** Server pages from your API-shaped loader (in-memory here). */
export const ServerWithYourData: Story = {
  render: function ServerOrders() {
    const store = useMemo(() => [...ORDER_ROWS], []);
    const [revision, setRevision] = useState(0);

    const fetchPage = useCallback(
      async ({ pageIndex, pageSize }: { pageIndex: number; pageSize: number }) => {
        await new Promise((r) => setTimeout(r, 40));
        void revision;
        const start = pageIndex * pageSize;
        return { rows: store.slice(start, start + pageSize), total: store.length };
      },
      [store, revision],
    );

    return (
      <ProDashflowGrid
        mode="server"
        columns={ORDER_COLUMNS}
        fetchPage={fetchPage}
        pageSize={8}
        pinName
        inlineEdit
        variant="muted"
        onRowChange={(row, patch) => {
          const idx = store.findIndex((r) => r.id === row.id);
          if (idx >= 0) Object.assign(store[idx], patch);
          setRevision((n) => n + 1);
        }}
      />
    );
  },
};

export const Modes: Story = {
  render: () => (
    <div className="space-y-8">
      <ProDashflowGrid
        mode="virtual"
        columns={ORDER_COLUMNS}
        rows={ORDER_ROWS.slice(0, 40)}
        height={200}
        inlineEdit={false}
      />
      <ProDashflowGrid
        mode="server"
        columns={ORDER_COLUMNS}
        pageSize={5}
        inlineEdit={false}
        fetchPage={async ({ pageIndex, pageSize }) => {
          const start = pageIndex * pageSize;
          return {
            rows: ORDER_ROWS.slice(start, start + pageSize),
            total: ORDER_ROWS.length,
          };
        }}
      />
    </div>
  ),
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      {(['default', 'bordered', 'muted', 'striped', 'flush'] as const).map((variant) => (
        <ProDashflowGrid
          key={variant}
          variant={variant}
          columns={ORDER_COLUMNS}
          rows={ORDER_ROWS.slice(0, 12)}
          height={140}
          inlineEdit={false}
          size="sm"
        />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <ProDashflowGrid
          key={size}
          size={size}
          columns={ORDER_COLUMNS}
          rows={ORDER_ROWS.slice(0, 12)}
          height={160}
          inlineEdit={false}
        />
      ))}
    </div>
  ),
};

export const ColumnPinAndReadOnly: Story = {
  render: () => (
    <ProDashflowGrid
      mode="virtual"
      columns={ORDER_COLUMNS}
      rows={ORDER_ROWS.slice(0, 40)}
      height={240}
      inlineEdit
      pinName={false}
    />
  ),
};

export const TallScroller: Story = {
  render: () => (
    <ProDashflowGrid
      mode="virtual"
      columns={ORDER_COLUMNS}
      rows={ORDER_ROWS}
      height={420}
      inlineEdit={false}
    />
  ),
};

export const NoPinNoEditNoMeta: Story = {
  render: () => (
    <ProDashflowGrid
      mode="virtual"
      columns={ORDER_COLUMNS}
      rows={ORDER_ROWS.slice(0, 24)}
      height={200}
      pinName={false}
      inlineEdit={false}
      showMeta={false}
    />
  ),
};

export const VirtualScroll: Story = {
  args: {
    mode: 'virtual',
    rowCount: 200,
    height: 280,
    pinName: true,
    inlineEdit: false,
    variant: 'default',
    size: 'md',
  },
};

export const ServerModel: Story = {
  args: { mode: 'server', pageSize: 8, pinName: true, inlineEdit: false, variant: 'bordered' },
};

export const PinAndInlineEdit: Story = {
  render: () => (
    <ProDashflowGrid
      mode="virtual"
      columns={PEOPLE_COLUMNS}
      rows={makeMockPeople(24)}
      height={280}
      pinName
      inlineEdit
      variant="muted"
      size="sm"
    />
  ),
};
