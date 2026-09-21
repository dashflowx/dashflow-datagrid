import { ProDashflowGrid } from './ProDashflowGrid';

/** @deprecated Use ProDashflowGrid mode="virtual". Kept as the original G01 stub name. */
export function VirtualScrollGrid() {
  return <ProDashflowGrid mode="virtual" rowCount={200} height={280} />;
}
