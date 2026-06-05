import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useOutletsQuery, OutletFilters } from './queries/useOutletsQuery';

const DEBOUNCE_MS = 400;
const PAGE_SIZE = 20;

/**
 * Server-side paginated + searched + filtered outlets.
 *
 * Filter & page state lives in the URL so back/forward and refresh preserve it.
 */
export const useOutletsList = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const searchFromUrl = searchParams.get('q') ?? '';
  const outletStatus = searchParams.get('status');
  const locationId = searchParams.get('locationId');
  const aseId = searchParams.get('aseId');
  const currentPage = Math.max(0, parseInt(searchParams.get('page') ?? '0', 10) || 0);

  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [debouncedQuery, setDebouncedQuery] = useState(searchFromUrl);

  const updateParams = useCallback((patch: Record<string, string | null>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev);
      for (const [key, value] of Object.entries(patch)) {
        if (value === null || value === '') next.delete(key);
        else next.set(key, value);
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    const trimmed = searchQuery.trim();
    debounceTimer.current = setTimeout(() => {
      if (trimmed === debouncedQuery) return;
      setDebouncedQuery(trimmed);
      updateParams({ q: trimmed || null, page: null });
    }, DEBOUNCE_MS);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchQuery, debouncedQuery, updateParams]);

  const setOutletStatus = useCallback((v: string | null) => {
    updateParams({ status: v, page: null });
  }, [updateParams]);
  const setLocationId = useCallback((v: string | null) => {
    updateParams({ locationId: v, page: null });
  }, [updateParams]);
  const setAseId = useCallback((v: string | null) => {
    updateParams({ aseId: v, page: null });
  }, [updateParams]);
  const setCurrentPage = useCallback((updater: number | ((prev: number) => number)) => {
    const next = typeof updater === 'function' ? updater(currentPage) : updater;
    updateParams({ page: next > 0 ? String(next) : null });
  }, [updateParams, currentPage]);

  const filters: OutletFilters = useMemo(() => ({
    search: debouncedQuery || undefined,
    outletStatus: outletStatus || undefined,
    locationId: locationId || undefined,
    aseId: aseId || undefined,
  }), [debouncedQuery, outletStatus, locationId, aseId]);

  const { data, isLoading, error: queryError } = useOutletsQuery(currentPage, PAGE_SIZE, filters);

  const outlets = useMemo(() => data?.content || [], [data]);
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;
  const error = queryError ? (queryError as Error).message : '';

  const isFiltered = Boolean(debouncedQuery || outletStatus || locationId || aseId);

  const clearAllFilters = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  return {
    outlets,
    isLoading,
    isSearchMode: Boolean(debouncedQuery),
    isFiltered,
    error,
    searchQuery,
    setSearchQuery,
    outletStatus,
    setOutletStatus,
    locationId,
    setLocationId,
    aseId,
    setAseId,
    clearAllFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
  };
};
