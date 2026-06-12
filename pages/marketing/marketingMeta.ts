import { MarketingAssetType, MarketingItem } from '../../types';

// Status/date helpers are asset-request-generic — reuse them from the cooler module.
export { STATUS_META, statusBadge, statusLabel, formatDate, isOverdue } from '../cooler/coolerMeta';

export const MARKETING_ITEM_LABEL: Record<MarketingAssetType, string> = {
  NON_LIT_BOARD: 'Non-lit Board',
  GLOW_SIGN_BOARD: 'Glow Sign Board',
  ACP_BOARD: 'ACP Board',
  BRANDED_TRAYS: 'Branded Trays',
  WALL_BRANDING: 'Wall Branding',
  END_CAP: 'End Cap',
};

export const marketingItemLabel = (t?: MarketingAssetType | null) => (t ? MARKETING_ITEM_LABEL[t] ?? t : '—');

/** One-line summary of a request's items, e.g. "2× Glow Sign Board, 1× End Cap". */
export const itemsSummary = (items?: MarketingItem[] | null): string => {
  if (!items || items.length === 0) return 'No items';
  return items.map(i => `${i.quantity ?? 1}× ${marketingItemLabel(i.assetType)}`).join(', ');
};

/** Total asset quantity across all items. */
export const itemsCount = (items?: MarketingItem[] | null): number =>
  (items || []).reduce((sum, i) => sum + (i.quantity ?? 0), 0);
