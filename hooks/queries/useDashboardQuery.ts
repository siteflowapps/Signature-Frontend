import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../network/apiService';
import { queryKeys } from './queryKeys';

/**
 * React Query hook for fetching dashboard statistics.
 * Replaces the hand-rolled useDashboardStats hook in Dashboard.tsx.
 */
export const useDashboardQuery = () => {
  return useQuery({
    queryKey: queryKeys.dashboard,
    queryFn: async () => {
      const res = await apiService.dashboard.getStats();
      if (res.success) return res.data;
      throw new Error('Failed to fetch dashboard stats');
    },
  });
};
