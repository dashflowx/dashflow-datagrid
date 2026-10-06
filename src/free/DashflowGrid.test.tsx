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

  it('shows a sort indicator on every sortable header before sorting', async () => {
    const user = userEvent.setup();
    renderGrid();
    const indicators = screen.getAllByTestId('sort-indicator');
    expect(indicators.length).toBeGreaterThan(0);
    for (const el of indicators) expect(el).toHaveTextContent('↕');
    await user.click(screen.getByRole('button', { name: /^Name/ }));
    expect(screen.getByRole('button', { name: /^Name/ })).toHaveTextContent('Name↑');
  });

  it('only sortable columns get a sort button and aria-sort', async () => {
    const user = userEvent.setup();
    render(
      <DashflowGrid
        columns={[
          { key: 'name', header: 'Name' },
          { key: 'role', header: 'Role', sortable: false },
        ]}
        rows={PEOPLE}
        pageSize={5}
      />,
    );
    expect(screen.queryByRole('button', { name: /^Role/ })).not.toBeInTheDocument();
    const roleHead = screen.getByRole('columnheader', { name: 'Role' });
    expect(roleHead).not.toHaveAttribute('aria-sort');
    expect(screen.getByRole('columnheader', { name: 'Select all rows on this page' })).not.toHaveAttribute(
      'aria-sort',
    );
    const nameHead = screen.getByRole('columnheader', { name: /^Name/ });
    expect(nameHead).toHaveAttribute('aria-sort', 'none');
    await user.click(screen.getByRole('button', { name: /^Name/ }));
    expect(nameHead).toHaveAttribute('aria-sort', 'ascending');
    await user.click(roleHead);
    expect(nameHead).toHaveAttribute('aria-sort', 'ascending');
  });

  it('drops an active sort when its column becomes unsortable', async () => {
    const user = userEvent.setup();
    const sortableCols = [
      { key: 'name' as const, header: 'Name' },
      { key: 'role' as const, header: 'Role' },
    ];
    const { rerender } = render(
      <DashflowGrid columns={sortableCols} rows={PEOPLE} pageSize={20} />,
    );
    const firstName = () => screen.getAllByRole('cell')[1].textContent;
    const unsorted = firstName();
    await user.click(screen.getByRole('button', { name: /^Name/ }));
    await user.click(screen.getByRole('button', { name: /^Name/ }));
    expect(firstName()).toBe('Tim');
    rerender(
      <DashflowGrid
        columns={[{ ...sortableCols[0], sortable: false }, sortableCols[1]]}
        rows={PEOPLE}
        pageSize={20}
      />,
    );
    expect(firstName()).toBe(unsorted);
    expect(screen.getByRole('columnheader', { name: 'Name' })).not.toHaveAttribute('aria-sort');
  });

  it('returns to page 1 when the sort changes', async () => {
    const user = userEvent.setup();
    renderGrid();
    await user.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByTestId('page-status')).toHaveTextContent('Page 2 of 3');
    await user.click(screen.getByRole('button', { name: /^Name/ }));
    expect(screen.getByTestId('page-status')).toHaveTextContent('Page 1 of 3');
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
