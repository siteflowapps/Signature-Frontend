import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setAuthData, clearAuthData } from '../utils/tokenStorage';

const getBaseUrl = () => {
  if (typeof window === 'undefined') return '/api/v1/';
  
  const hostname = window.location.hostname;
  
  if (hostname === 'qa.signature.siteflow.tech') {
    return 'https://qa.signature.siteflow.tech/api/v1/';
  } else if (hostname === 'uat.signature.siteflow.tech') {
    return 'https://uat.signature.siteflow.tech/api/v1/';
  } else if (hostname === 'signature.siteflow.tech') {
    return 'https://signature.siteflow.tech/api/v1/';
  }
  
  return '/api/v1/';
};

const BASE_URL = getBaseUrl();

// Generate a unique idempotency key per request, e.g. idem-1781012512233-7pxkk9
const generateIdempotencyKey = (): string => {
  const random = Math.random().toString(36).slice(2, 8);
  return `idem-${Date.now()}-${random}`;
};

// Create the axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// For multiple simultaneous requests that might trigger a refresh, we need a queue
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// 1. Request Interceptor: Attach the access token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (config.headers) {
      config.headers['Idempotency-Key'] = generateIdempotencyKey();
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 2. Response Interceptor: Handle errors and auto-refresh token
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If it's a 401 Unauthorized, and we haven't already retried this request
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      
      // If the failed request was trying to refresh or login, do not attempt auto-refresh
      if (originalRequest.url?.includes('auth/refresh') || originalRequest.url?.includes('auth/login')) {
         return Promise.reject(error);
      }

      if (isRefreshing) {
        // If we are already refreshing, queue this request
        try {
          const token = await new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          });
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return apiClient(originalRequest);
        } catch (err) {
          return Promise.reject(err);
        }
      }

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        // No refresh token available, force logout
        clearAuthData();
        // Only redirect if we're not already on the login page to avoid loops
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Important: Call axios directly to avoid interceptor loops
        const { data } = await axios.post(`${BASE_URL}auth/refresh`, {
          refreshToken, // Adjust body payload based on the actual backend expectation if different
        }, {
          headers: { 'Idempotency-Key': generateIdempotencyKey() },
        });

        const newAccessToken = data?.data?.accessToken;
        const newRefreshToken = data?.data?.refreshToken;
        
        // Let's assume the refresh endpoint only returns new tokens. 
        // We need to keep the existing role/userId. We fetch them before overwriting.
        const currentRole = localStorage.getItem('siteflow_user_role') || '';
        const currentUserId = localStorage.getItem('siteflow_user_id') || '';

        setAuthData(newAccessToken, newRefreshToken, currentRole, currentUserId);

        // Process the queue with new token
        processQueue(null, newAccessToken);
        isRefreshing = false;

        // Re-run original failed request with new token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);

      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        isRefreshing = false;
        
        // Refresh token failed completely (expired or invalid)
        clearAuthData();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    // For any other error, just throw it back
    return Promise.reject(error);
  }
);

export default apiClient;
