import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../network/apiService';
import { queryKeys } from './queryKeys';

/**
 * React Query hook for paginated business fetching.
 */
export const useBusinessesQuery = (page: number, size: number) => {
  return useQuery({
    queryKey: queryKeys.businesses.list(page, size),
    queryFn: async () => {
      const res = await apiService.business.getAll(page, size);
      if (res.success && res.data) return res.data;
      throw new Error(res.error || 'Failed to fetch businesses');
    },
  });
};
