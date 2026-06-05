import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../network/apiService';
import { queryKeys } from './queryKeys';

export interface OutletFilters {
  search?: string;
  outletStatus?: string;
  locationId?: string;
  aseId?: string;
}

/**
 * Paginated + filtered outlet fetching. When no filters are set, falls back
 * to the simple getAll. Otherwise hits the unified list endpoint.
 */
export const useOutletsQuery = (page: number, size: number, filters: OutletFilters = {}) => {
  const hasAnyFilter = Boolean(filters.search || filters.outletStatus || filters.locationId || filters.aseId);
  return useQuery({
    queryKey: queryKeys.outlets.list(page, size, filters),
    queryFn: async () => {
      const res = hasAnyFilter
        ? await apiService.outlets.list({ page, size, ...filters })
        : await apiService.outlets.getAll(page, size);
      if (res.success && res.data) return res.data;
      throw new Error(res.error || 'Failed to fetch outlets');
    },
  });
};
