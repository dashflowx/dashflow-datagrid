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

export const NoSelection: Story = {
  args: {
    columns,
    rows: PEOPLE.slice(0, 5),
    pageSize: 5,
    enableSelection: false,
    caption: 'People no select',
  },
};
