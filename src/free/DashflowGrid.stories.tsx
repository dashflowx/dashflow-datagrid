import type { Meta, StoryObj } from '@storybook/react';
import { DashflowGrid } from './DashflowGrid';

export const PEOPLE = [
  { id: '1', name: 'Ada', role: 'Engineer' },
  { id: '2', name: 'Alan', role: 'Research' },
  { id: '3', name: 'Grace', role: 'Engineer' },
  { id: '4', name: 'Linus', role: 'Kernel' },
  { id: '5', name: 'Margaret', role: 'Navy' },
  { id: '6', name: 'Tim', role: 'WWW' },
  { id: '7', name: 'Barbara', role: 'Compiler' },
  { id: '8', name: 'Donald', role: 'TeX' },
  { id: '9', name: 'Ken', role: 'Unix' },
  { id: '10', name: 'Dennis', role: 'C' },
  { id: '11', name: 'Bjarne', role: 'C++' },
  { id: '12', name: 'Guido', role: 'Python' },
];

const columns = [
  { key: 'name' as const, header: 'Name' },
  { key: 'role' as const, header: 'Role' },
];

const columnsNoSort = [
  { key: 'name' as const, header: 'Name', sortable: false },
  { key: 'role' as const, header: 'Role', sortable: false },
];

const meta: Meta<typeof DashflowGrid> = {
  title: 'Datagrid/Free',
  component: DashflowGrid,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'muted', 'striped', 'flush'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
};

export default meta;
type Story = StoryObj<typeof DashflowGrid<(typeof PEOPLE)[number]>>;

/** Sort + page + select + CSV — full free feature set. */
export const AllFeatures: Story = {
  args: {
    columns,
    rows: PEOPLE,
    pageSize: 5,
    caption: 'People — sort, page, select, CSV',
    variant: 'default',
    size: 'md',
    showToolbar: true,
    enableSelection: true,
    showCsvPreview: true,
  },
};

export const SortPageSelectCsv: Story = {
  args: {
    columns,
    rows: PEOPLE,
    pageSize: 5,
    caption: 'People (in-memory, G03)',
    variant: 'default',
    size: 'md',
  },
};

export const Variants: Story = {
  render: () => (
    <div className="space-y-6">
      {(['default', 'bordered', 'muted', 'striped', 'flush'] as const).map((variant) => (
        <DashflowGrid
          key={variant}
          variant={variant}
          size="sm"
          pageSize={3}
          caption={`Variant ${variant}`}
          columns={columns}
          rows={PEOPLE}
          enableSelection={false}
          showCsvPreview={false}
        />
      ))}
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div className="space-y-6">
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <DashflowGrid
          key={size}
          size={size}
          pageSize={3}
          caption={`Size ${size}`}
          columns={columns}
          rows={PEOPLE.slice(0, 6)}
          enableSelection={false}
          showCsvPreview={false}
        />
      ))}
    </div>
  ),
};

export const SelectionAndCsv: Story = {
  args: {
    columns,
    rows: PEOPLE,
    pageSize: 5,
    caption: 'Selection + CSV callbacks',
    enableSelection: true,
    showCsvPreview: true,
    onSelectionChange: (ids) => console.log('selection', ids),
    onCsvExport: (csv) => console.log('csv', csv),
  },
};

export const PaginationOnly: Story = {
  args: {
    columns,
    rows: PEOPLE,
    pageSize: 2,
    caption: 'Small pages',
    enableSelection: false,
    showCsvPreview: false,
  },
};

export const NoSort: Story = {
  args: {
    columns: columnsNoSort,
    rows: PEOPLE.slice(0, 5),
    pageSize: 5,
    caption: 'sortable: false',
    enableSelection: false,
    showCsvPreview: false,
  },
};

export const NoToolbar: Story = {
  args: {
    columns,
    rows: PEOPLE.slice(0, 5),
    pageSize: 5,
    showToolbar: false,
    caption: 'No toolbar',
  },
};

export const NoSelection: Story = {
  args: {
    columns,
    rows: PEOPLE.slice(0, 5),
    pageSize: 5,
    enableSelection: false,
    caption: 'People no select',
  },
};

export const NoCsvPreview: Story = {
  args: {
    columns,
    rows: PEOPLE.slice(0, 5),
    pageSize: 5,
    showCsvPreview: false,
    caption: 'CSV export without preview',
  },
};

export const BorderedCompact: Story = {
  args: {
    columns,
    rows: PEOPLE,
    pageSize: 5,
    caption: 'People bordered',
    variant: 'bordered',
    size: 'sm',
  },
};
