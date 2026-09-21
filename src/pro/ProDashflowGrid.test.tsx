import { describe, expect, it } from 'vitest';
import { fetchPeoplePage, makeMockPeople } from './mock-server';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProDashflowGrid } from './ProDashflowGrid';

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
});
