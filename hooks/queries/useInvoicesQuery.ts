import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../network/apiService';
import { queryKeys } from './queryKeys';

/**
 * React Query hook for paginated invoice fetching.
 */
export const useInvoicesQuery = (page: number, size: number) => {
  return useQuery({
    queryKey: queryKeys.invoices.list(page, size),
    queryFn: async () => {
      const res = await apiService.invoices.getAll(page, size);
      if (res.success && res.data) return res.data;
      throw new Error(res.error || 'Failed to fetch invoices');
    },
  });
};

/**
 * React Query hook for fetching a single invoice by ID.
 * Only runs when invoiceId is provided.
 */
export const useInvoiceDetailQuery = (invoiceId: string | null) => {
  return useQuery({
    queryKey: queryKeys.invoices.detail(invoiceId || ''),
    queryFn: async () => {
      const res = await apiService.invoices.getById(invoiceId!);
      if (res.success) return res.data;
      throw new Error('Failed to fetch invoice details');
    },
    enabled: !!invoiceId,
  });
};
