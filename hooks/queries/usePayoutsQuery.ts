import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../network/apiService';
import { queryKeys } from './queryKeys';

/**
 * React Query hook for paginated payout fetching.
 * Only fetches when enabled is true (e.g. when the Payouts tab is active).
 */
export const usePayoutsQuery = (page: number, size: number, enabled = true) => {
  return useQuery({
    queryKey: queryKeys.payouts.list(page, size),
    queryFn: async () => {
      const res = await apiService.payouts.getAll(page, size);
      if (res.success && res.data) return res.data;
      throw new Error(res.error || 'Failed to fetch payouts');
    },
    enabled,
  });
};

/**
 * React Query hook for payout estimate calculation.
 */
export const usePayoutEstimateQuery = (invoiceId: string | null) => {
  return useQuery({
    queryKey: queryKeys.payouts.estimate(invoiceId || ''),
    queryFn: async () => {
      const res = await apiService.payouts.calculatePayout(invoiceId!);
      if (res.success) return res.data;
      throw new Error('Failed to calculate payout estimate');
    },
    enabled: !!invoiceId,
  });
};
