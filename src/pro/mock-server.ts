export type MockPerson = {
  id: string;
  name: string;
  role: string;
};

const FIRST = ['Ada', 'Alan', 'Grace', 'Linus', 'Margaret', 'Tim', 'Barbara', 'Donald', 'Ken', 'Dennis'];
const ROLES = ['Engineer', 'Research', 'Kernel', 'Navy', 'WWW', 'Compiler', 'Unix', 'C'];

export function makeMockPeople(count: number): MockPerson[] {
  return Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    name: `${FIRST[i % FIRST.length]} ${i + 1}`,
    role: ROLES[i % ROLES.length],
  }));
}

const STORE = makeMockPeople(400);

export type FetchPeoplePageArgs = {
  pageIndex: number;
  pageSize: number;
  sortKey?: 'name' | 'role';
  sortDir?: 'asc' | 'desc';
};

/** In-memory “server”. No production API (G04). */
export async function fetchPeoplePage(args: FetchPeoplePageArgs): Promise<{
  rows: MockPerson[];
  total: number;
}> {
  await new Promise((r) => setTimeout(r, 40));
  const rows = [...STORE];
  if (args.sortKey) {
    const dir = args.sortDir === 'desc' ? -1 : 1;
    const key = args.sortKey;
    rows.sort((a, b) => a[key].localeCompare(b[key]) * dir);
  }
  const start = args.pageIndex * args.pageSize;
  return { rows: rows.slice(start, start + args.pageSize), total: rows.length };
}

export function getMockStore(): MockPerson[] {
  return STORE;
}

export function updateMockPerson(id: string, patch: Partial<Pick<MockPerson, 'name' | 'role'>>) {
  const row = STORE.find((p) => p.id === id);
  if (row) Object.assign(row, patch);
  return row;
}
