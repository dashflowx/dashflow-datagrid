import {
  ProDashflowGrid,
  type ProDashflowGridProps,
  type ProDashflowGridSize,
  type ProDashflowGridVariant,
} from './ProDashflowGrid';

export type VirtualScrollGridProps = Omit<ProDashflowGridProps, 'mode'> & {
  /** Always `virtual`. Prefer `ProDashflowGrid mode="virtual"`. */
  mode?: 'virtual';
};

export type VirtualScrollGridSize = ProDashflowGridSize;
export type VirtualScrollGridVariant = ProDashflowGridVariant;

/**
 * @deprecated Use `ProDashflowGrid mode="virtual"`. Kept as the original G01 stub name.
 * Forwards the same variant / size / pin / edit props as ProDashflowGrid.
 */
export function VirtualScrollGrid({
  columns,
  rows,
  rowCount = 200,
  height = 280,
  pinName = true,
  inlineEdit = false,
  variant = 'default',
  size = 'md',
  showMeta = true,
  className = '',
  pageSize,
  mode,
  ...rest
}: VirtualScrollGridProps) {
  void mode;
  return (
    <ProDashflowGrid
      mode="virtual"
      columns={columns}
      rows={rows}
      rowCount={rowCount}
      height={height}
      pinName={pinName}
      inlineEdit={inlineEdit}
      variant={variant}
      size={size}
      showMeta={showMeta}
      className={className}
      pageSize={pageSize}
      {...rest}
    />
  );
}
