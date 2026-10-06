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
