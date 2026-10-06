import type { Meta, StoryObj } from '@storybook/react';
import { VirtualScrollGrid } from './VirtualScrollGrid';

const meta: Meta<typeof VirtualScrollGrid> = {
  title: 'Datagrid/Pro/VirtualScrollGrid',
  component: VirtualScrollGrid,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'bordered', 'muted', 'striped', 'flush'],
    },
    size: { control: 'select', options: ['sm', 'md', 'lg'] },
  },
};

export default meta;
type Story = StoryObj<typeof VirtualScrollGrid>;

/** @deprecated Prefer ProDashflowGrid mode="virtual". */
export const Default: Story = {
  args: {
    rowCount: 200,
    height: 280,
    pinName: true,
    inlineEdit: false,
    variant: 'default',
    size: 'md',
  },
};

export const BorderedCompact: Story = {
  args: {
    rowCount: 80,
    height: 220,
    variant: 'bordered',
    size: 'sm',
    pinName: true,
    inlineEdit: false,
  },
};
