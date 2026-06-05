import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiService } from './apiService';
import apiClient from './apiClient';

vi.mock('./apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('auth endpoints', () => {
    it('should successfully post login credentials', async () => {
      const mockResponse = { data: { success: true, data: { token: 'fake-token' } } };
      (apiClient.post as any).mockResolvedValue(mockResponse);

      const credentials = { email: 'test@example.com', password: 'password123' };
      const response = await apiService.auth.login(credentials);

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login/email', credentials);
      expect(response).toEqual(mockResponse.data);
    });

    it('should successfully GET me profile', async () => {
      const mockResponse = { data: { success: true, data: { name: 'Test User' } } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const response = await apiService.auth.getMe();

      expect(apiClient.get).toHaveBeenCalledWith('/users/me');
      expect(response).toEqual(mockResponse.data);
    });
  });

  describe('business endpoints', () => {
    it('should fetch paginated businesses', async () => {
      const mockResponse = { data: { content: [], totalPages: 1 } };
      (apiClient.get as any).mockResolvedValue(mockResponse);

      const response = await apiService.business.getAll(1, 10);

      expect(apiClient.get).toHaveBeenCalledWith('/business?page=1&size=10');
      expect(response).toEqual(mockResponse.data);
    });
  });
});
