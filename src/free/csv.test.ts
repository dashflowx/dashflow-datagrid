import { describe, expect, it } from 'vitest';
import { csvCell, rowsToCsv } from './csv';

const columns = [
  { key: 'name' as const, header: 'Name' },
  { key: 'role' as const, header: 'Role' },
];

describe('rowsToCsv', () => {
  it('quotes commas and quotes', () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
  });

  it('exports only the rows given (current page)', () => {
    const csv = rowsToCsv(columns, [
      { name: 'Ada', role: 'Engineer' },
      { name: 'Alan', role: 'Research' },
    ]);
    expect(csv).toBe('Name,Role\nAda,Engineer\nAlan,Research\n');
    expect(csv).not.toContain('Grace');
  });
});
