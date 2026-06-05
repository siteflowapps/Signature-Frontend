import { useState, useEffect, useCallback } from 'react';
import { apiService } from '../network/apiService';
import { Slab } from '../types';
import { getFriendlyErrorMessage } from '../utils/errorUtils';

export const useSlabsList = () => {
  const [slabs, setSlabs] = useState<Slab[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(20);

  const fetchSlabs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiService.slabs.getAll(currentPage, pageSize);
      if (response.success) {
        setSlabs(response.data.content);
        setTotalPages(response.data.totalPages);
        setTotalElements(response.data.totalElements);
      } else {
        setError(getFriendlyErrorMessage(response));
      }
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchSlabs();
  }, [fetchSlabs]);

  return {
    slabs,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    pageSize,
    refresh: fetchSlabs,
  };
};
