import { describe, expect, it } from 'vitest';
import { Table, Td, Th, Tr, table, td, th, tr } from './table';

describe('table primitives (G02)', () => {
  it('exports PascalCase and lowercase aliases', () => {
    expect(Table).toBe(table);
    expect(Tr).toBe(tr);
    expect(Th).toBe(th);
    expect(Td).toBe(td);
  });
});
