// src/utils/tokenStorage.ts
import { jwtDecode } from "jwt-decode";

const ACCESS_TOKEN_KEY = 'siteflow_access_token';
const REFRESH_TOKEN_KEY = 'siteflow_refresh_token';
const USER_ROLE_KEY = 'siteflow_user_role';
const USER_ID_KEY = 'siteflow_user_id';

/**
 * Get the current access token
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * Get the current refresh token
 */
export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Get the user role
 */
export const getUserRole = (): string | null => {
  return localStorage.getItem(USER_ROLE_KEY);
};

/**
 * Get user id
 */
export const getUserId = (): string | null => {
  return localStorage.getItem(USER_ID_KEY);
};

/**
 * Decode access token payload
 */
interface JwtPayload {
  exp?: number;
  role?: string;
  sub?: string;
  name?: string;
  email?: string;
  businessId?: string;
  locationId?: string;
  [key: string]: unknown;
}

export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode(token);
  } catch (_error) {
    return null;
  }
};

/**
 * Check if token is valid and not expired
 */
export const isTokenValid = (token: string): boolean => {
  try {
    const decoded: JwtPayload = jwtDecode(token);
    if (!decoded || !decoded.exp) return false;
    
    // Check if exp is greater than current time (in seconds)
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp > currentTime;
  } catch (_error) {
    return false;
  }
};

/**
 * Save auth data to storage
 */
export const setAuthData = (
  accessToken: string,
  refreshToken: string,
  role?: string,
  userId?: string
): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  
  if (role) localStorage.setItem(USER_ROLE_KEY, role);
  if (userId) localStorage.setItem(USER_ID_KEY, userId);

  // If role/userid not explicitly provided, try to decode from token
  const decoded = decodeToken(accessToken);
  if (decoded) {
    if (!role && decoded.role) localStorage.setItem(USER_ROLE_KEY, decoded.role);
    if (!userId && decoded.sub) localStorage.setItem(USER_ID_KEY, decoded.sub);
  }
};

/**
 * Clear all auth data from storage (Logout)
 */
export const clearAuthData = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(USER_ROLE_KEY);
  localStorage.removeItem(USER_ID_KEY);
  
  // Also clear the old mock data just in case
  localStorage.removeItem('auth_user');
  localStorage.removeItem('auth_token');
};
