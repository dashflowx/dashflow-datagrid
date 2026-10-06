import type { Meta, StoryObj } from '@storybook/react';
import { ProDashflowGrid } from './ProDashflowGrid';

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
  args: {
    mode: 'virtual',
    rowCount: 24,
    height: 280,
    pinName: true,
    inlineEdit: true,
    variant: 'muted',
    size: 'sm',
  },
};
