# Change Log

## 0.1.0 — 2026-09-21

- Scaffold Vite + Storybook + TypeScript (G01). Peer `@dashflowx/core` >= 3.0.0.
- Owns table primitives (`Table` / `Tr` / `Th` / `Td` and lowercase aliases) extracted from core (G02). Core keeps deprecated re-exports.
- Free client grid: sort, page, row select, CSV of the current page (G03). In-memory rows only.
- Pro (`src/pro/`): virtual window, mocked server pages, sticky pin, inline edit (G04). Excel/grouping stay N06.
- Dual package `@dashflowx/datagrid` / `@dashflowx/datagrid-pro`. Not published (G06).
- Registry (G05): `DATAGRID_REGISTRY` with F04 helpers; ids unique vs `core.*`; editor palette exports.
