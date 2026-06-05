import { useState, useCallback, useMemo } from 'react';
import { Invoice, BulkApproveResponse } from '../types';
import { apiService } from '../network/apiService';
import { getErrorMessage } from '../utils/errorUtils';

/**
 * Custom hook: Single Responsibility for bulk invoice selection & approval logic.
 * Encapsulates selection state, eligibility filtering, and API interaction.
 */
export const useBulkInvoiceApprove = (invoices: Invoice[], onSuccess: () => void) => {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [results, setResults] = useState<BulkApproveResponse['data'] | null>(null);
  const [error, setError] = useState('');

  // Only ASM_APPROVED invoices are eligible for finance approval
  const eligibleInvoices = useMemo(
    () => invoices.filter(inv => inv.status === 'ASM_APPROVED'),
    [invoices]
  );

  const selectedInvoices = useMemo(
    () => invoices.filter(inv => selectedIds.has(inv.id)),
    [invoices, selectedIds]
  );

  const selectedTotalAmount = useMemo(
    () => selectedInvoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.value || 0), 0),
    [selectedInvoices]
  );

  const isAllEligibleSelected = eligibleInvoices.length > 0 && eligibleInvoices.every(inv => selectedIds.has(inv.id));

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleSelectAll = useCallback(() => {
    if (isAllEligibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligibleInvoices.map(inv => inv.id)));
    }
  }, [isAllEligibleSelected, eligibleInvoices]);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const openConfirmModal = useCallback(() => {
    if (selectedIds.size > 0) setShowConfirmModal(true);
  }, [selectedIds]);

  const closeConfirmModal = useCallback(() => {
    if (!isProcessing) setShowConfirmModal(false);
  }, [isProcessing]);

  const closeResultsModal = useCallback(() => {
    setShowResultsModal(false);
    setResults(null);
  }, []);

  const submitBulkApprove = useCallback(async (remarks: string) => {
    if (selectedIds.size === 0 || isProcessing) return;
    setIsProcessing(true);
    setError('');

    try {
      const res = await apiService.invoices.bulkApprove(Array.from(selectedIds), remarks);
      if (res.success) {
        setResults(res.data);
        setShowConfirmModal(false);
        setShowResultsModal(true);
        setSelectedIds(new Set());
        onSuccess(); // Refresh the invoice list
      } else {
        setError(res.error || 'Bulk approval failed');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsProcessing(false);
    }
  }, [selectedIds, isProcessing, onSuccess]);

  return {
    selectedIds,
    selectedInvoices,
    selectedTotalAmount,
    eligibleInvoices,
    isAllEligibleSelected,
    isProcessing,
    showConfirmModal,
    showResultsModal,
    results,
    error,
    toggleSelect,
    toggleSelectAll,
    clearSelection,
    openConfirmModal,
    closeConfirmModal,
    closeResultsModal,
    submitBulkApprove,
  };
};
