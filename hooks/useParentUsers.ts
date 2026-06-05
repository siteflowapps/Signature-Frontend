import { useState, useEffect, useCallback } from 'react';
import { SystemUser } from '../types';
import { apiService } from '../network/apiService';
import { ROLE_CONFIG } from '../utils/roleConfig';

/**
 * Custom hook for fetching and managing parent users.
 * Single Responsibility: Only handles loading parent users based on role changes.
 */
export const useParentUsers = (currentRole: string, businessId: string | undefined) => {
  const [parentUsers, setParentUsers] = useState<SystemUser[]>([]);
  const [isLoadingParents, setIsLoadingParents] = useState(false);

  const loadParentUsers = useCallback(async (targetRole: string) => {
    setIsLoadingParents(true);
    try {
      const response = await apiService.users.getByRole(targetRole, 0, 500);
      if (response.success && response.data) {
        const users = response.data; // flat array — no pagination wrapper
        // businessId filter kept as a safety guard for cross-business isolation
        const filtered = businessId
          ? users.filter(u => u.businessId === businessId)
          : users;
        setParentUsers(filtered);
      }
    } catch (err) {
      console.error(`Failed to load ${targetRole}s`, err);
    } finally {
      setIsLoadingParents(false);
    }
  }, [businessId]);

  useEffect(() => {
    const config = ROLE_CONFIG[currentRole];
    const parentRole = config?.parentRole;

    if (parentRole && businessId) {
      loadParentUsers(parentRole);
    } else {
      setParentUsers([]);
    }
  }, [currentRole, businessId, loadParentUsers]);

  return { parentUsers, isLoadingParents };
};
