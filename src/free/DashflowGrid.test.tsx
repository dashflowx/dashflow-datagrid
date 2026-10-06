import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashflowGrid } from './DashflowGrid';
import { PEOPLE } from './DashflowGrid.stories';

const columns = [
  { key: 'name' as const, header: 'Name' },
  { key: 'role' as const, header: 'Role' },
];

function renderGrid() {
  return render(
    <DashflowGrid columns={columns} rows={PEOPLE} pageSize={5} caption="People" />
  );
}

describe('DashflowGrid G03', () => {
  it('sorts by name when the header is clicked', async () => {
    const user = userEvent.setup();
    renderGrid();
    const nameBtn = screen.getByRole('button', { name: /^Name/ });
    await user.click(nameBtn);
    const cells = screen.getAllByRole('cell');
    // first data cell after the checkbox on row 1
    expect(cells[1]).toHaveTextContent('Ada');
    await user.click(nameBtn);
    expect(screen.getAllByRole('cell')[1]).toHaveTextContent('Tim');
  });

  it('pages client-side without a backend', async () => {
    const user = userEvent.setup();
    renderGrid();
    expect(screen.getByTestId('page-status')).toHaveTextContent('Page 1 of 3');
    expect(screen.getByText('Ada')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByTestId('page-status')).toHaveTextContent('Page 2 of 3');
    expect(screen.queryByText('Ada')).not.toBeInTheDocument();
    expect(screen.getByText('Tim')).toBeInTheDocument();
  });

  it('tracks row selection', async () => {
    const user = userEvent.setup();
    renderGrid();
    expect(screen.getByTestId('selection-count')).toHaveTextContent('0 selected');
    await user.click(screen.getByRole('checkbox', { name: 'Select row 1' }));
    expect(screen.getByTestId('selection-count')).toHaveTextContent('1 selected');
    expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toBeChecked();
  });

  it('exports CSV for the current page only', async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.click(screen.getByRole('button', { name: 'Export CSV' }));
    const csv = screen.getByTestId('csv-output').textContent ?? '';
    expect(csv).toMatch(/^Name,Role\n/);
    expect(csv).toContain('Ada');
    expect(csv).not.toContain('Tim');
    expect(csv.split('\n').filter(Boolean)).toHaveLength(6);
  });

  it('applies variant, size, and selection toggle', () => {
    render(
      <DashflowGrid
        columns={columns}
        rows={PEOPLE.slice(0, 3)}
        pageSize={5}
        variant="bordered"
        size="sm"
        enableSelection={false}
        showToolbar={false}
      />,
    );
    const root = screen.getByTestId('dashflow-grid');
    expect(root.className).toContain('border-slate-200');
    expect(root.className).toContain('text-xs');
    expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Export CSV' })).not.toBeInTheDocument();
  });
});
