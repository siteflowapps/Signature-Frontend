import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../network/apiService';
import { queryKeys } from './queryKeys';

/**
 * React Query hook for paginated user fetching.
 * Pass enabled=false to suspend the query (e.g. while in search mode).
 */
export const useUsersQuery = (page: number, size: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.users.list(page, size),
    queryFn: async () => {
      const res = await apiService.users.getAll(page, size);
      if (res.success && res.data) return res.data;
      throw new Error(res.error || 'Failed to fetch users');
    },
    enabled,
  });
};

