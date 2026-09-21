/**
 * Datagrid registry (G05). Shape matches docs/projects/registry.ts (F04).
 * Ids must stay unique vs CORE_REGISTRY (`core.*`).
 */

export type RegistryTier = 'free' | 'pro';

export type RegistryEntry = {
  id: string;
  title: string;
  tier: RegistryTier;
  editor: boolean;
};

export type ComponentRegistry = readonly RegistryEntry[];

export const DATAGRID_REGISTRY = [
  { id: 'datagrid.table', title: 'Table primitives', tier: 'free', editor: true },
  { id: 'datagrid.grid', title: 'Client grid', tier: 'free', editor: true },
  { id: 'datagrid.virtual', title: 'Virtual scroll', tier: 'pro', editor: true },
  { id: 'datagrid.server', title: 'Server model', tier: 'pro', editor: true },
  { id: 'datagrid.pin', title: 'Column pin', tier: 'pro', editor: true },
  { id: 'datagrid.inline-edit', title: 'Inline edit', tier: 'pro', editor: true },
] as const satisfies ComponentRegistry;

export function isProEntry(entry: RegistryEntry): boolean {
  return entry.tier === 'pro';
}

export function editorPalette(registry: ComponentRegistry = DATAGRID_REGISTRY): RegistryEntry[] {
  return registry.filter((entry) => entry.editor);
}

export function assertUniqueRegistryIds(registry: ComponentRegistry = DATAGRID_REGISTRY): void {
  const seen = new Set<string>();
  for (const entry of registry) {
    if (seen.has(entry.id)) {
      throw new Error(`Duplicate registry id: ${entry.id}`);
    }
    seen.add(entry.id);
  }
}

export default DATAGRID_REGISTRY;
