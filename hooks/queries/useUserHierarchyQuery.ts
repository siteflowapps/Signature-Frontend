import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../network/apiService';
import { UserHierarchy } from '../../types';
import { queryKeys } from './queryKeys';

/**
 * Fetches the full domain hierarchy (self, parents, siblings, children) for any
 * ladder-role user. Returns undefined data when no userId is provided.
 */
export const useUserHierarchyQuery = (userId: string | undefined) =>
  useQuery({
    queryKey: userId ? queryKeys.hierarchy.user(userId) : ['hierarchy', 'user', 'none'],
    queryFn: async (): Promise<UserHierarchy> => {
      if (!userId) throw new Error('userId required');
      const res = await apiService.hierarchy.getByUserId(userId);
      if (res.success && res.data) return res.data;
      throw new Error('Failed to fetch user hierarchy');
    },
    enabled: Boolean(userId),
    staleTime: 30_000,
  });

/**
 * Invalidates hierarchy queries — call after any mutation that reorganizes
 * users (change-role, change-parent, transfer-subordinates, deactivate, reactivate).
 */
export const useInvalidateHierarchy = () => {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: queryKeys.hierarchy.all });
};
