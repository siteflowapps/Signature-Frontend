import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from './AuthContext';
import { apiService } from '../network/apiService';
import * as tokenStorage from '../utils/tokenStorage';

// Mock the network and storage layer
vi.mock('../network/apiService', () => ({
  apiService: {
    auth: {
      getMe: vi.fn(),
      login: vi.fn(),
    }
  }
}));

vi.mock('../utils/tokenStorage', () => ({
  getAccessToken: vi.fn(),
  isTokenValid: vi.fn(),
  decodeToken: vi.fn(),
  getUserRole: vi.fn(),
  getUserId: vi.fn(),
  clearAuthData: vi.fn(),
  setAuthData: vi.fn(),
  getRefreshToken: vi.fn()
}));

const TestComponent = () => {
  const { user, login, logout, isAuthenticated, isLoading } = useAuth();
  
  return (
    <div>
      <div data-testid="loading">{isLoading ? 'loading' : 'ready'}</div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'unauthenticated'}</div>
      <div data-testid="user-name">{user ? user.name : 'none'}</div>
      <button onClick={() => login({ email: 'test@admin.com', password: 'password' })}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (tokenStorage.getAccessToken as any).mockReturnValue(null);
    (tokenStorage.isTokenValid as any).mockReturnValue(false);
  });

  it('renders unauthenticated state initially when no token exists', async () => {
    render(<AuthProvider><TestComponent /></AuthProvider>);
    
    // Wait for internal useEffects
    await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('unauthenticated');
    expect(screen.getByTestId('user-name').textContent).toBe('none');
    expect(tokenStorage.clearAuthData).toHaveBeenCalled();
  });

  it('hydrates user state when valid token exists', async () => {
    const mockToken = 'mocked-ey.token';
    const mockPayload = { sub: '123', role: 'SUPER_ADMIN', name: 'John Admin' };
    
    (tokenStorage.getAccessToken as any).mockReturnValue(mockToken);
    (tokenStorage.isTokenValid as any).mockReturnValue(true);
    (tokenStorage.decodeToken as any).mockReturnValue(mockPayload);
    (tokenStorage.getUserRole as any).mockReturnValue('SUPER_ADMIN');
    (tokenStorage.getUserId as any).mockReturnValue('123');
    
    (apiService.auth.getMe as any).mockResolvedValue({ success: true, data: { name: 'John Admin', id: '123' } });

    render(<AuthProvider><TestComponent /></AuthProvider>);

    await waitFor(() => {
        expect(screen.getByTestId('loading').textContent).toBe('ready');
    });

    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    expect(screen.getByTestId('user-name').textContent).toBe('John Admin');
  });
});
