import type { Meta, StoryObj } from '@storybook/react';
import { DATAGRID_REGISTRY, isProEntry } from '../registry';

function RegistryList() {
  return (
    <ul className="space-y-1 text-sm">
      {DATAGRID_REGISTRY.map((entry) => (
        <li key={entry.id} className="flex items-center gap-2">
          <span
            className={
              isProEntry(entry)
                ? 'rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-900'
                : 'rounded bg-emerald-100 px-1.5 py-0.5 text-xs font-medium text-emerald-900'
            }
          >
            {entry.tier === 'pro' ? 'Pro' : 'Free'}
          </span>
          <code>{entry.id}</code>
          <span>{entry.title}</span>
        </li>
      ))}
    </ul>
  );
}

const meta: Meta<typeof RegistryList> = {
  title: 'Datagrid/Registry',
  component: RegistryList,
};

export default meta;
type Story = StoryObj<typeof RegistryList>;

export const FreeAndPro: Story = {};
