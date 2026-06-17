import React, { createContext, useContext, useState, PropsWithChildren, useEffect } from 'react';
import { User, UserRole, LoginRequest } from '../types';
import { apiService } from '../network/apiService';
import { setAuthData, clearAuthData, getUserRole, getUserId, getAccessToken, getRefreshToken, isTokenValid, decodeToken } from '../utils/tokenStorage';
import { getFriendlyErrorMessage } from '../utils/errorUtils';

/**
 * Only these roles are allowed to log in to the Signature web dashboard.
 * Mobile-only roles (ASE, ASM, CSO, OUTLET) are intentionally excluded.
 */
const SIGNATURE_ALLOWED_ROLES: string[] = [
  'SUPER_ADMIN',
  'NHQ_ADMIN',
  'BUSINESS_ADMIN',
  'BUSINESS_USER',
  'FINANCE_ADMIN',
  'FINANCE_MANAGER',
  'MARKETING_MANAGER',
  'COOLER_TEAM',
  'RSM',
  'DISTRIBUTOR',
  'DISTRIBUTOR_MANAGER',
  'SUPPORT',
];

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginRequest) => Promise<void>;
  sendOtp: (phone: string) => Promise<{ success: boolean; data: string }>;
  retryOtp: (phone: string) => Promise<{ success: boolean; data: string }>;
  verifyOtp: (phone: string, otp: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // On mount, check if there's an existing valid session
  useEffect(() => {
    const initAuth = async () => {
      const token = getAccessToken();
      
      if (token && isTokenValid(token)) {
        const payload = decodeToken(token);
        const roleStr = getUserRole() || payload?.role;
        const idStr = getUserId() || payload?.sub;

        if (roleStr && idStr) {
          // Block roles not allowed on this dashboard
          if (!SIGNATURE_ALLOWED_ROLES.includes(roleStr)) {
            clearAuthData();
            setIsLoading(false);
            return;
          }
          // Try to fetch the full user profile from the server
          try {
            const meResponse = await apiService.auth.getMe();
            if (meResponse.success && meResponse.data) {
              // The backend returns a detailed user object
              setUser({ ...meResponse.data, role: (roleStr as UserRole) });
              setIsLoading(false);
              return;
            }
          } catch (error) {
            console.error("Failed to fetch user profile, falling back to JWT payload", error);
          }

          // Fallback if the user fetch fails
          setUser({
             id: idStr,
             name: payload?.name || payload?.email?.split('@')[0] || (roleStr === 'SUPER_ADMIN' ? 'Admin User' : 'App User'),
             email: payload?.email || undefined, 
             role: (roleStr as UserRole) || UserRole.SUPER_ADMIN,
             businessId: payload?.businessId,
             locationId: payload?.locationId,
          });
        }
      } else {
        clearAuthData();
        setUser(null);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    try {
      setIsLoading(true);
      const data = await apiService.auth.login(credentials);
      
      if (data && data.success && data.data) {
        await handleAuthSuccess(data, credentials.email);
      } else {
        throw new Error(data.error || 'Authentication failed');
      }
    } catch (error: any) {
        const friendlyMessage = getFriendlyErrorMessage(error);
        throw new Error(friendlyMessage);
    } finally {
        setIsLoading(false);
    }
  };

  const sendOtp = async (phone: string) => {
    try {
      setIsLoading(true);
      return await apiService.auth.sendOtp({ phone });
    } catch (error: any) {
      const friendlyMessage = getFriendlyErrorMessage(error);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const retryOtp = async (phone: string) => {
    try {
      setIsLoading(true);
      return await apiService.auth.retryOtp({ phone });
    } catch (error: any) {
      const friendlyMessage = getFriendlyErrorMessage(error);
      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    try {
      setIsLoading(true);
      const data = await apiService.auth.verifyOtp({ phone, otp });
      
      if (data && data.success && data.data) {
        await handleAuthSuccess(data, undefined);
      } else {
        throw new Error(data.error || 'OTP verification failed');
      }
    } catch (error: any) {
      let friendlyMessage = getFriendlyErrorMessage(error);
      
      // The backend returns a generic auth error even for OTP failures. 
      // We intercept it to make it more user-friendly for this specific flow.
      if (
        friendlyMessage.toLowerCase().includes('invalid username or password') ||
        friendlyMessage.toLowerCase().includes('bad credentials')
      ) {
        friendlyMessage = 'Invalid or expired OTP. Please try again.';
      }

      throw new Error(friendlyMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (data: any, email?: string) => {
    if (!isTokenValid(data.data.accessToken)) {
      throw new Error("Received an invalid or expired token from server.");
    }

    // Block roles not allowed on this dashboard
    const incomingRole = data.data.role || '';
    if (!SIGNATURE_ALLOWED_ROLES.includes(incomingRole)) {
      clearAuthData();
      throw new Error('Access denied. Your role does not have permission to access this dashboard. Please contact your administrator.');
    }

    // Save to secure storage
    setAuthData(
      data.data.accessToken, 
      data.data.refreshToken, 
      data.data.role, 
      data.data.userId
    );

    const userRole = (data.data.role as UserRole) || UserRole.SUPER_ADMIN;
    const payload = decodeToken(data.data.accessToken);
    // Attempt to fetch fresh user profile from the server
    try {
      const meResponse = await apiService.auth.getMe();
      if (meResponse.success && meResponse.data) {
        setUser({ ...meResponse.data, role: userRole });
        return;
      }
    } catch (error) {
      console.error("Failed to fetch user profile from API, falling back to JWT", error);
    }

    // Fallback user context
    setUser({
      id: data.data.userId,
      name: payload?.name || payload?.email?.split('@')[0] || (userRole === UserRole.SUPER_ADMIN ? 'Admin User' : 'App User'),
      email: email || payload?.email || undefined,
      role: userRole,
      businessId: payload?.businessId,
      locationId: payload?.locationId,
    });
  };

  const logout = async () => {
    const refreshToken = getRefreshToken();
    // Best-effort server-side invalidation; ignore failures so the user still signs out locally.
    await apiService.auth.logout(refreshToken);
    setUser(null);
    clearAuthData();
  };

  return (
    <AuthContext.Provider value={{ user, login, sendOtp, retryOtp, verifyOtp, logout, isAuthenticated: !!user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
