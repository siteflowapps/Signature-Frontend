
import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { useUsersQuery } from './queries/useUsersQuery';
import { apiService } from '../network/apiService';
import { SystemUser } from '../types';

const DEBOUNCE_MS = 400;

/**
 * Custom hook for fetching, paginating, and searching the users list.
 *
 * - When searchQuery is EMPTY: uses React Query to paginate through all users (existing behaviour).
 * - When searchQuery is NON-EMPTY: debounces 400ms then calls GET /users?search=... for
 *   a true server-side global search across ALL pages.
 * - Role filter is always applied client-side on top of whichever result set is active.
 */
export const useUsersList = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  // ── Search-mode state ──────────────────────────────────────────────────────
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SystemUser[]>([]);
  const [searchTotal, setSearchTotal] = useState(0);
  const [searchTotalPages, setSearchTotalPages] = useState(1);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce: update debouncedQuery after user stops typing
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    if (!searchQuery.trim()) {
      setDebouncedQuery('');
      setSearchResults([]);
      setSearchTotal(0);
      setSearchTotalPages(1);
      setSearchError('');
      return;
    }
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
      setCurrentPage(0); // reset to page 0 on new search
    }, DEBOUNCE_MS);
    return () => { if (debounceTimer.current) clearTimeout(debounceTimer.current); };
  }, [searchQuery]);

  // Fire API search when debouncedQuery or currentPage changes (search mode only)
  useEffect(() => {
    if (!debouncedQuery) return;
    let cancelled = false;
    const run = async () => {
      try {
        setIsSearching(true);
        setSearchError('');
        const res = await apiService.users.search(debouncedQuery, currentPage, pageSize);
        if (cancelled) return;
        if (res.success) {
          setSearchResults(res.data.content);
          setSearchTotal(res.data.totalElements);
          setSearchTotalPages(res.data.totalPages);
        } else {
          setSearchError('Search failed.');
        }
      } catch {
        if (!cancelled) setSearchError('Search request failed.');
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    };
    run();
    return () => { cancelled = true; };
  }, [debouncedQuery, currentPage]);

  // ── Normal (browse) mode — React Query ────────────────────────────────────
  const isSearchMode = Boolean(debouncedQuery);
  const { data, isLoading: browseLoading, error: queryError } = useUsersQuery(
    isSearchMode ? 0 : currentPage,  // don't waste fetches in search mode
    pageSize,
    !isSearchMode                    // disable query while in search mode
  );

  const browseUsers = useMemo(() => data?.content || [], [data]);
  const browseTotalPages = data?.totalPages || 1;
  const browseTotalElements = data?.totalElements || 0;
  const browseError = queryError ? (queryError as Error).message : '';

  // ── Unified values ─────────────────────────────────────────────────────────
  const rawUsers   = isSearchMode ? searchResults : browseUsers;
  const totalPages = isSearchMode ? searchTotalPages : browseTotalPages;
  const totalElements = isSearchMode ? searchTotal : browseTotalElements;
  const isLoading  = isSearchMode ? isSearching : browseLoading;
  const error      = isSearchMode ? searchError : browseError;

  // Role filter is always client-side (fast, no round-trip needed)
  const users = useMemo(() => {
    if (roleFilter === 'ALL') return rawUsers;
    return rawUsers.filter(u => u.role === roleFilter);
  }, [rawUsers, roleFilter]);

  // Reset page when switching modes
  const handleSetSearchQuery = useCallback((q: string) => {
    setSearchQuery(q);
    if (!q) setCurrentPage(0);
  }, []);

  return {
    users,
    isLoading,
    isSearchMode,
    error,
    searchQuery,
    setSearchQuery: handleSetSearchQuery,
    roleFilter,
    setRoleFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
  };
};
