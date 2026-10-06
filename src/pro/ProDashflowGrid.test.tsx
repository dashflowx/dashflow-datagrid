import { describe, expect, it } from 'vitest';
import { fetchPeoplePage, makeMockPeople } from './mock-server';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProDashflowGrid } from './ProDashflowGrid';
import { VirtualScrollGrid } from './VirtualScrollGrid';

describe('mock server (G04)', () => {
  it('returns a page of in-memory rows, not a production API', async () => {
    const res = await fetchPeoplePage({ pageIndex: 1, pageSize: 8 });
    expect(res.rows).toHaveLength(8);
    expect(res.total).toBeGreaterThan(8);
    expect(res.rows[0].id).toBe('9');
    expect(makeMockPeople(3)).toHaveLength(3);
  });
});

describe('ProDashflowGrid', () => {
  it('virtual mode renders a window, not every row', () => {
    render(<ProDashflowGrid mode="virtual" rowCount={200} height={280} inlineEdit={false} />);
    const meta = screen.getByTestId('virtual-meta').textContent ?? '';
    const shown = Number(meta.match(/Rendering (\d+)/)?.[1]);
    expect(shown).toBeGreaterThan(0);
    expect(shown).toBeLessThan(200);
    expect(screen.getAllByTestId('pro-row').length).toBe(shown);
  });

  it('renders caller columns and rows (proper Pro data)', () => {
    const columns = [
      { key: 'sku' as const, header: 'SKU', pin: true },
      { key: 'customer' as const, header: 'Customer', editable: true },
      { key: 'total' as const, header: 'Total', editable: false },
    ];
    const rows = Array.from({ length: 80 }, (_, i) => ({
      id: String(i + 1),
      sku: `SKU-${i + 1}`,
      customer: `Customer ${i + 1}`,
      total: `$${i}.00`,
    }));
    render(
      <ProDashflowGrid
        mode="virtual"
        columns={columns}
        rows={rows}
        height={200}
        inlineEdit={false}
      />,
    );
    expect(screen.getByText('SKU')).toBeInTheDocument();
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByText('SKU-1')).toBeInTheDocument();
    const meta = screen.getByTestId('virtual-meta').textContent ?? '';
    expect(meta).toMatch(/of 80 rows/);
  });

  it('pages server data from fetchPage', async () => {
    const store = Array.from({ length: 20 }, (_, i) => ({
      id: String(i + 1),
      name: `Item ${i + 1}`,
      role: 'Stock',
    }));
    render(
      <ProDashflowGrid
        mode="server"
        columns={[
          { key: 'name', header: 'Name', pin: true },
          { key: 'role', header: 'Role' },
        ]}
        pageSize={5}
        inlineEdit={false}
        fetchPage={async ({ pageIndex, pageSize }) => {
          const start = pageIndex * pageSize;
          return { rows: store.slice(start, start + pageSize), total: store.length };
        }}
      />,
    );
    expect(await screen.findByText('Item 1')).toBeInTheDocument();
    expect(screen.getByTestId('server-status').textContent).toMatch(/Page 1 of 4/);
  });

  it('edits a cell inline', async () => {
    const user = userEvent.setup();
    render(<ProDashflowGrid mode="virtual" rowCount={12} height={280} inlineEdit />);
    await user.click(screen.getByRole('button', { name: 'Edit name for 1' }));
    const input = screen.getByRole('textbox', { name: 'Edit name for 1' });
    await user.clear(input);
    await user.type(input, 'Edited');
    await user.tab();
    expect(screen.getByRole('button', { name: 'Edit name for 1' })).toHaveTextContent('Edited');
  });

  it('commits caller-row edits on Enter and reports them', async () => {
    const user = userEvent.setup();
    const changes: unknown[] = [];
    render(
      <ProDashflowGrid
        mode="virtual"
        columns={[
          { key: 'sku', header: 'SKU', pin: true, editable: false },
          { key: 'customer', header: 'Customer' },
        ]}
        rows={[{ id: '1', sku: 'SKU-1', customer: 'Ada' }]}
        height={200}
        inlineEdit
        onRowChange={(_row, patch) => changes.push(patch)}
      />,
    );
    expect(screen.queryByRole('button', { name: 'Edit sku for 1' })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Edit customer for 1' }));
    const input = screen.getByRole('textbox', { name: 'Edit customer for 1' });
    await user.clear(input);
    await user.type(input, 'Grace{Enter}');
    expect(screen.getByRole('button', { name: 'Edit customer for 1' })).toHaveTextContent('Grace');
    expect(changes).toEqual([{ customer: 'Grace' }]);
  });

  it('applies variant, size, and meta toggle', () => {
    render(
      <ProDashflowGrid
        mode="virtual"
        rowCount={20}
        height={200}
        variant="bordered"
        size="sm"
        showMeta={false}
        inlineEdit={false}
      />,
    );
    const root = screen.getByTestId('pro-grid');
    expect(root).toHaveAttribute('data-variant', 'bordered');
    expect(root).toHaveAttribute('data-size', 'sm');
    expect(root.className).toContain('text-xs');
    expect(screen.queryByTestId('virtual-meta')).not.toBeInTheDocument();
    expect(screen.getByTestId('virtual-scroller').className).toContain('border-2');
  });
});

describe('VirtualScrollGrid (deprecated G01 alias)', () => {
  it('forwards variant and size to ProDashflowGrid virtual mode', () => {
    render(
      <VirtualScrollGrid rowCount={40} height={200} variant="muted" size="lg" inlineEdit={false} />,
    );
    const root = screen.getByTestId('pro-grid');
    expect(root).toHaveAttribute('data-mode', 'virtual');
    expect(root).toHaveAttribute('data-variant', 'muted');
    expect(root).toHaveAttribute('data-size', 'lg');
    expect(root.className).toContain('text-base');
  });
});
