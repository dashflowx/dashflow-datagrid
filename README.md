# @dashflowx/datagrid

Client data grid on `@dashflowx/core`. Table primitives live here; core re-exports `table`/`tr`/`th`/`td` as deprecated.

```bash
cd dashflow-datagrid
yarn install
yarn test
yarn storybook   # http://localhost:6008
```

No database. Free: sort, page, select, CSV with your `columns` + `rows`. Pro (`@dashflowx/datagrid-pro`): same data shape plus virtual scroll, `fetchPage` server paging, pin, inline edit.

```tsx
import { ProDashflowGrid } from '@dashflowx/datagrid-pro';

const columns = [
  { key: 'sku', header: 'SKU', pin: true, editable: false },
  { key: 'customer', header: 'Customer', editable: true },
  { key: 'total', header: 'Total', editable: false },
];

<ProDashflowGrid mode="virtual" columns={columns} rows={orders} height={280} />
```

Do not `npm publish` on a laptop. Public package: `@dashflowx/datagrid` (G06). Further publishes need X05.

## Run locally

- Start: `yarn install && yarn test && yarn storybook` → http://localhost:6008
- Database: **none**
- Task prefix: **G**. Prompt: `docs/CURSOR_PROMPT.md`
- Publish: `docs/NPM_PUBLISH.md` (ask X05).

