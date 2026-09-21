import type { Meta, StoryObj } from '@storybook/react';
import { ProDashflowGrid } from './ProDashflowGrid';

const meta: Meta<typeof ProDashflowGrid> = {
  title: 'Datagrid/Pro',
  component: ProDashflowGrid,
};

export default meta;
type Story = StoryObj<typeof ProDashflowGrid>;

export const VirtualScroll: Story = {
  args: { mode: 'virtual', rowCount: 200, height: 280, pinName: true, inlineEdit: false },
};

export const ServerModel: Story = {
  args: { mode: 'server', pageSize: 8, pinName: true, inlineEdit: false },
};

export const PinAndInlineEdit: Story = {
  args: { mode: 'virtual', rowCount: 24, height: 280, pinName: true, inlineEdit: true },
};
