import { useState, useEffect, useCallback, useRef } from 'react';
import { Distributor } from '../types';
import { apiService } from '../network/apiService';
import { useToast } from '../context/ToastContext';
import { getFriendlyErrorMessage } from '../utils/errorUtils';

const DEBOUNCE_MS = 400;
const PAGE_SIZE = 20;

/**
 * Server-side paginated + searched distributors.
 *
 * - When searchQuery is EMPTY: GET /distributors?page=&size= (browse mode).
 * - When searchQuery is NON-EMPTY: debounces 400ms, then GET /distributors?search=…&page=&size=
 *   (global server-side search across all pages — same backend search used by
 *   the ASE-lookup "Add Distributors" typeahead).
 */
export const useDistributorsList = () => {
  const { showToast } = useToast();
  const [distributors, setDistributors] = useState<Distributor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Debounce searchQuery → debouncedQuery, and reset page to 0 on each new search.
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      setDebouncedQuery('');
      return;
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(trimmed);
      setCurrentPage(0);
    }, DEBOUNCE_MS);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchQuery]);

  const fetchDistributors = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = debouncedQuery
        ? await apiService.distributors.search(debouncedQuery, currentPage, PAGE_SIZE)
        : await apiService.distributors.getAll(currentPage, PAGE_SIZE);

      if (response.success && response.data) {
        setDistributors(response.data.content || []);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
        const errorMsg = response.error || 'Failed to fetch distributors';
        setError(errorMsg);
        showToast(errorMsg, 'error', 4000);
      }
    } catch (err: unknown) {
      const errorMsg = getFriendlyErrorMessage(err);
      setError(errorMsg);
      showToast(errorMsg, 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedQuery, showToast]);

  useEffect(() => {
    fetchDistributors();
  }, [fetchDistributors]);

  return {
    distributors,
    isLoading,
    isSearchMode: Boolean(debouncedQuery),
    error,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    refresh: fetchDistributors,
  };
};
