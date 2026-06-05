import apiClient from './apiClient';
import { AuthResponse, LoginRequest, UserMeResponse, BusinessCreateRequest, BusinessCreateResponse, BusinessListResponse, LocationListResponse, UserListResponse, SystemUser, CreateUserRequest, CreateUserResponse, Distributor, DistributorListResponse, DistributorCreateRequest, DistributorCreateResponse, SlabListResponse, Outlet, OutletListResponse, InvoiceListResponse, InvoiceSingleResponse, Invoice, BulkApproveResponse, PayoutEstimateResponse, PayoutCycleResponse, PayoutListResponse, PayoutSingleResponse, HierarchyRelation, HierarchyMember, UserHierarchy, DashboardStatsResponse, SupportTicket, StockItemResponse, StockReportSubmitRequest, StockReportSubmitResponse, StockReportListResponse } from '../types';

export const apiService = {
  /**
   * Authentication Endpoints
   */
  auth: {
    login: async (credentials: LoginRequest): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/login/email', credentials);
      return response.data;
    },
    sendOtp: async (data: { phone: string }): Promise<{ success: boolean; data: string }> => {
      const response = await apiClient.post<{ success: boolean; data: string }>('/auth/login/otp/request', data);
      return response.data;
    },
    retryOtp: async (data: { phone: string }): Promise<{ success: boolean; data: string }> => {
      const response = await apiClient.post<{ success: boolean; data: string }>('/auth/login/otp/retry', data);
      return response.data;
    },
    verifyOtp: async (data: { phone: string; otp: string }): Promise<AuthResponse> => {
      const response = await apiClient.post<AuthResponse>('/auth/login/otp/verify', data);
      return response.data;
    },
    getMe: async (): Promise<UserMeResponse> => {
      const response = await apiClient.get<UserMeResponse>('/users/me');
      return response.data;
    },
    /**
     * Server-side logout — invalidates the refresh token on the backend.
     * Caller should still clear local state regardless of the result.
     */
    logout: async (refreshToken?: string | null): Promise<{ success: boolean; error?: string }> => {
      try {
        await apiClient.post('/auth/logout', refreshToken ? { refreshToken } : {});
        return { success: true };
      } catch (err) {
        return { success: false, error: err instanceof Error ? err.message : 'Logout failed' };
      }
    },
    // Future auth methods...
    // refresh: async () => { ... }
  },

  /**
   * Business Endpoints
   */
  business: {
    create: async (data: BusinessCreateRequest): Promise<BusinessCreateResponse> => {
      const response = await apiClient.post<BusinessCreateResponse>('/business', data);
      return response.data;
    },
    getAll: async (page = 0, size = 20): Promise<BusinessListResponse> => {
      const response = await apiClient.get<BusinessListResponse>(`/business?page=${page}&size=${size}`);
      return response.data;
    },
  },

  /**
   * Location Endpoints
   */
  locations: {
    getAll: async (): Promise<LocationListResponse> => {
      const response = await apiClient.get<LocationListResponse>('/locations');
      return response.data;
    },
    searchByPincode: async (pincode: string): Promise<LocationListResponse> => {
      const response = await apiClient.get<LocationListResponse>(`/locations?pincode=${encodeURIComponent(pincode)}`);
      return response.data;
    },
  },

  /**
   * User Management Endpoints
   */
  users: {
    getAll: async (page = 0, size = 10): Promise<UserListResponse> => {
      const response = await apiClient.get<UserListResponse>(`/users?page=${page}&size=${size}&sort=createdAt,desc`);
      return response.data;
    },
    getByRole: async (role: string, page = 0, size = 500): Promise<{ success: boolean; data: SystemUser[]; timestamp: string }> => {
      const response = await apiClient.get<{ success: boolean; data: SystemUser[]; timestamp: string }>(`/users/by-role/${role}?page=${page}&size=${size}`);
      return response.data;
    },
    create: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
      const response = await apiClient.post<CreateUserResponse>('/users', data);
      return response.data;
    },
    /** Partial profile update — any combination of name, email, locationId. */
    update: async (
      userId: string,
      payload: { name?: string; email?: string; locationId?: string },
    ): Promise<{ success: boolean; data?: SystemUser | null; error?: string; errorCode?: string; timestamp: string }> => {
      const response = await apiClient.put<{ success: boolean; data?: SystemUser | null; error?: string; errorCode?: string; timestamp: string }>(`/users/${userId}`, payload);
      return response.data;
    },
    getDistributorsByUser: async (userId: string): Promise<{ success: boolean; data: { id: string; name: string }[]; timestamp: string }> => {
      const response = await apiClient.get<{ success: boolean; data: { id: string; name: string }[]; timestamp: string }>(`/users/${userId}/distributors`);
      return response.data;
    },
    addDistributors: async (userId: string, distributorIds: string[]): Promise<{ success: boolean; data: { id: string; name: string }[]; timestamp: string }> => {
      const response = await apiClient.post<{ success: boolean; data: { id: string; name: string }[]; timestamp: string }>(`/users/${userId}/distributors`, { distributorIds });
      return response.data;
    },
    removeDistributors: async (userId: string, distributorIds: string[]): Promise<{ success: boolean; timestamp: string }> => {
      const response = await apiClient.delete<{ success: boolean; timestamp: string }>(`/users/${userId}/distributors`, { data: { distributorIds } });
      return response.data;
    },
    search: async (query: string, page = 0, size = 20): Promise<UserListResponse> => {
      const response = await apiClient.get<UserListResponse>(`/users?search=${encodeURIComponent(query)}&page=${page}&size=${size}&sort=createdAt,desc`);
      return response.data;
    },
    updateStatus: async (userId: string, status: string): Promise<{ success: boolean; data?: SystemUser | null; error?: string; errorCode?: string; timestamp: string }> => {
      const response = await apiClient.patch<{ success: boolean; data?: SystemUser | null; error?: string; errorCode?: string; timestamp: string }>(`/users/${userId}/status`, { status });
      return response.data;
    },
    changeRole: async (
      userId: string,
      payload: {
        newRole: string;
        newParentId?: string;
        transferOutletsToAseId?: string;
        transferDistributorsToAseId?: string;
        transferSubordinatesToUserId?: string;
        reason: string;
      },
    ): Promise<{ success: boolean; data?: SystemUser | null; error?: string; errorCode?: string; timestamp: string }> => {
      const response = await apiClient.post<{ success: boolean; data?: SystemUser | null; error?: string; errorCode?: string; timestamp: string }>(`/users/${userId}/change-role`, payload);
      return response.data;
    },
    changeParent: async (
      userId: string,
      payload: { newParentId: string; reason: string },
    ): Promise<{ success: boolean; data?: SystemUser | null; error?: string; errorCode?: string; timestamp: string }> => {
      const response = await apiClient.post<{ success: boolean; data?: SystemUser | null; error?: string; errorCode?: string; timestamp: string }>(`/users/${userId}/change-parent`, payload);
      return response.data;
    },
    transferSubordinates: async (
      payload: { fromUserId: string; toUserId: string; reason: string },
    ): Promise<{ success: boolean; data?: unknown; error?: string; errorCode?: string; timestamp: string }> => {
      const response = await apiClient.post<{ success: boolean; data?: unknown; error?: string; errorCode?: string; timestamp: string }>('/users/transfer-subordinates', payload);
      return response.data;
    },
    deactivate: async (
      userId: string,
      payload: {
        transferSubordinatesToUserId?: string;
        transferOutletsToAseId?: string;
        transferDistributorsToAseId?: string;
        reason: string;
      },
    ): Promise<{ success: boolean; data?: SystemUser | null; error?: string; errorCode?: string; timestamp: string }> => {
      const response = await apiClient.post<{ success: boolean; data?: SystemUser | null; error?: string; errorCode?: string; timestamp: string }>(`/users/${userId}/deactivate`, payload);
      return response.data;
    },
    reactivate: async (
      userId: string,
      payload: { newParentId?: string; reason: string },
    ): Promise<{ success: boolean; data?: SystemUser | null; error?: string; errorCode?: string; timestamp: string }> => {
      const response = await apiClient.post<{ success: boolean; data?: SystemUser | null; error?: string; errorCode?: string; timestamp: string }>(`/users/${userId}/reactivate`, payload);
      return response.data;
    },
  },

  /**
   * Distributor Manager (DM) Endpoints
   */
  dm: {
    getMyDistributors: async (): Promise<{ success: boolean; data: { id: string; name: string; phone?: string; gstNumber?: string; dmsId?: string; location?: { id: string; region?: string; state?: string; city?: string; pincode?: string } }[]; timestamp: string; requestId?: string }> => {
      const response = await apiClient.get<{ success: boolean; data: { id: string; name: string; phone?: string; gstNumber?: string; dmsId?: string; location?: { id: string; region?: string; state?: string; city?: string; pincode?: string } }[]; timestamp: string; requestId?: string }>('/dm/distributors');
      return response.data;
    },
    getDistributors: async (dmId: string): Promise<{ success: boolean; data: { id: string; name: string }[]; timestamp: string }> => {
      const response = await apiClient.get<{ success: boolean; data: { id: string; name: string }[]; timestamp: string }>(`/dm/${dmId}/distributors`);
      return response.data;
    },
    addDistributors: async (dmId: string, distributorIds: string[]): Promise<{ success: boolean; data: { id: string; name: string }[]; timestamp: string }> => {
      const response = await apiClient.post<{ success: boolean; data: { id: string; name: string }[]; timestamp: string }>(`/dm/${dmId}/distributors`, { distributorIds });
      return response.data;
    },
    removeDistributors: async (dmId: string, distributorIds: string[]): Promise<{ success: boolean; timestamp: string }> => {
      const response = await apiClient.delete<{ success: boolean; timestamp: string }>(`/dm/${dmId}/distributors`, { data: { distributorIds } });
      return response.data;
    },
  },

  /**
   * Distributor Endpoints
   */
  distributors: {
    getAll: async (page = 0, size = 20): Promise<DistributorListResponse> => {
      const response = await apiClient.get<DistributorListResponse>(`/distributors?page=${page}&size=${size}&sort=createdAt,desc`);
      return response.data;
    },
    getById: async (distributorId: string): Promise<{ success: boolean; data?: Distributor | null; error?: string }> => {
      const response = await apiClient.get<{ success: boolean; data?: Distributor | null; error?: string }>(`/distributors/${distributorId}`);
      return response.data;
    },
    search: async (searchTerm: string, page = 0, size = 100): Promise<DistributorListResponse> => {
      const response = await apiClient.get<DistributorListResponse>(`/distributors?search=${encodeURIComponent(searchTerm)}&page=${page}&size=${size}&sort=createdAt,desc`);
      return response.data;
    },
    create: async (data: DistributorCreateRequest): Promise<DistributorCreateResponse> => {
      const response = await apiClient.post<DistributorCreateResponse>('/distributors', data);
      return response.data;
    },
    updateStatus: async (distributorId: string, status: string): Promise<{ success: boolean; data?: Distributor | null; error?: string; errorCode?: string; timestamp: string }> => {
      const response = await apiClient.patch<{ success: boolean; data?: Distributor | null; error?: string; errorCode?: string; timestamp: string }>(`/distributors/${distributorId}/status`, { status });
      return response.data;
    },
    deactivate: async (distributorId: string): Promise<{ success: boolean; data?: Distributor | null; error?: string; errorCode?: string; requestId?: string; timestamp: string }> => {
      const response = await apiClient.post<{ success: boolean; data?: Distributor | null; error?: string; errorCode?: string; requestId?: string; timestamp: string }>(`/distributors/${distributorId}/deactivate`, {});
      return response.data;
    },
    /** Partial update — any combination of name, gstNumber, address, locationId, dmsId. */
    update: async (
      distributorId: string,
      payload: { name?: string; gstNumber?: string; address?: string; locationId?: string; dmsId?: string },
    ): Promise<{ success: boolean; data?: Distributor | null; error?: string; errorCode?: string; timestamp: string }> => {
      const response = await apiClient.put<{ success: boolean; data?: Distributor | null; error?: string; errorCode?: string; timestamp: string }>(`/distributors/${distributorId}`, payload);
      return response.data;
    },
  },

  /**
   * Slab Endpoints
   */
  slabs: {
    getAll: async (page = 0, size = 20): Promise<SlabListResponse> => {
      const response = await apiClient.get<SlabListResponse>(`/slabs?page=${page}&size=${size}`);
      return response.data;
    },
  },

  /**
   * Outlet Endpoints
   */
  outlets: {
    getAll: async (page = 0, size = 20): Promise<OutletListResponse> => {
      const response = await apiClient.get<OutletListResponse>(`/outlets?page=${page}&size=${size}&sort=createdAt,desc`);
      return response.data;
    },
    list: async (params: {
      page?: number;
      size?: number;
      search?: string;
      outletStatus?: string;
      locationId?: string;
      aseId?: string;
    }): Promise<OutletListResponse> => {
      const qs = new URLSearchParams();
      qs.set('page', String(params.page ?? 0));
      qs.set('size', String(params.size ?? 20));
      if (params.search) qs.set('search', params.search);
      if (params.outletStatus) qs.set('outletStatus', params.outletStatus);
      if (params.locationId) qs.set('locationId', params.locationId);
      if (params.aseId) qs.set('aseId', params.aseId);
      qs.set('sort', 'createdAt,desc');
      const response = await apiClient.get<OutletListResponse>(`/outlets?${qs.toString()}`);
      return response.data;
    },
    deactivate: async (outletId: string): Promise<{ success: boolean; data?: { id: string; outletStatus: string; operationalStatus: string } | null; error?: string; errorCode?: string; timestamp: string }> => {
      const response = await apiClient.post<{ success: boolean; data?: { id: string; outletStatus: string; operationalStatus: string } | null; error?: string; errorCode?: string; timestamp: string }>(`/outlets/${outletId}/deactivate`, {});
      return response.data;
    },
    /**
     * Partial update — any combination of name, ownerName, email, outletType, address.
     * `reason` is mandatory and is recorded as the audit trail for the change.
     */
    update: async (
      outletId: string,
      payload: { reason: string; name?: string; ownerName?: string; email?: string; outletType?: string; address?: string },
    ): Promise<{ success: boolean; data?: Outlet | null; error?: string; errorCode?: string; timestamp: string }> => {
      const response = await apiClient.put<{ success: boolean; data?: Outlet | null; error?: string; errorCode?: string; timestamp: string }>(`/outlets/${outletId}`, payload);
      return response.data;
    },
  },

  /**
   * Invoice Endpoints
   */
  invoices: {
    getById: async (id: string): Promise<{ success: boolean; data: Invoice; timestamp: string }> => {
      const response = await apiClient.get<{ success: boolean; data: Invoice; timestamp: string }>(`/invoices/${id}`);
      return response.data;
    },
    getAll: async (page = 0, size = 50): Promise<InvoiceListResponse> => {
      const response = await apiClient.get<InvoiceListResponse>(`/invoices?page=${page}&size=${size}`);
      return response.data;
    },
    getByOutlet: async (outletId: string, page = 0, size = 10): Promise<InvoiceListResponse> => {
      const response = await apiClient.get<InvoiceListResponse>(`/invoices?outletId=${outletId}&page=${page}&size=${size}`);
      return response.data;
    },
    approve: async (id: string, remarks: string): Promise<InvoiceSingleResponse> => {
      const response = await apiClient.post<InvoiceSingleResponse>(`/invoices/${id}/approve`, { remarks });
      return response.data;
    },
    reject: async (id: string, remarks: string): Promise<InvoiceSingleResponse> => {
      const response = await apiClient.post<InvoiceSingleResponse>(`/invoices/${id}/reject`, { remarks });
      return response.data;
    },
    edit: async (id: string, formData: FormData): Promise<InvoiceSingleResponse> => {
      const response = await apiClient.patch<InvoiceSingleResponse>(`/invoices/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    bulkApprove: async (invoiceIds: string[], remarks: string): Promise<BulkApproveResponse> => {
      const response = await apiClient.post<BulkApproveResponse>('/invoices/bulk-approve', { invoiceIds, remarks });
      return response.data;
    }
  },

  /**
   * Payout Endpoints
   */
  payouts: {
    calculatePayout: async (invoiceId: string): Promise<PayoutEstimateResponse> => {
      const response = await apiClient.get<PayoutEstimateResponse>(`/payouts/calculate/${invoiceId}`);
      return response.data;
    },
    runCycle: async (): Promise<PayoutCycleResponse> => {
      const response = await apiClient.post<PayoutCycleResponse>('/payouts/run-cycle');
      return response.data;
    },
    getAll: async (page = 0, size = 10): Promise<PayoutListResponse> => {
      const response = await apiClient.get<PayoutListResponse>(`/payouts?page=${page}&size=${size}`);
      return response.data;
    },
    getById: async (id: string): Promise<PayoutSingleResponse> => {
      const response = await apiClient.get<PayoutSingleResponse>(`/payouts/${id}`);
      return response.data;
    },
    markPaid: async (id: string): Promise<PayoutSingleResponse> => {
      const response = await apiClient.post<PayoutSingleResponse>(`/payouts/${id}/mark-paid`);
      return response.data;
    },
  },

  /**
   * Hierarchy Endpoints
   */
  hierarchy: {
    getMyHierarchy: async (): Promise<{ success: boolean; data: HierarchyRelation[]; timestamp: string }> => {
      const response = await apiClient.get<{ success: boolean; data: HierarchyRelation[]; timestamp: string }>('/hierarchy');
      return response.data;
    },
    getUpwardByAse: async (aseId: string): Promise<{ success: boolean; data: HierarchyMember[]; timestamp: string }> => {
      const response = await apiClient.get<{ success: boolean; data: HierarchyMember[]; timestamp: string }>(`/hierarchy/upward?aseId=${encodeURIComponent(aseId)}`);
      return response.data;
    },
    /**
     * Full domain hierarchy for any ladder role (ASE / ASM / SM / RBL).
     * Returns self + parents (upward chain) + siblings (peers in same domain) + children (direct reports).
     */
    getByUserId: async (userId: string): Promise<{ success: boolean; data: UserHierarchy; timestamp: string }> => {
      const response = await apiClient.get<{ success: boolean; data: UserHierarchy; timestamp: string }>(`/hierarchy/user/${encodeURIComponent(userId)}`);
      return response.data;
    },
  },

  /**
   * Dashboard Endpoints
   */
  dashboard: {
    getStats: async (): Promise<DashboardStatsResponse> => {
      const response = await apiClient.get<DashboardStatsResponse>('/dashboard');
      return response.data;
    },
  },

  /**
   * Support Ticket Endpoints
   */
  supportTickets: {
    getAll: async (page = 0, size = 20): Promise<{ success: boolean; data: { content: SupportTicket[]; page: number; size: number; totalElements: number; totalPages: number; last: boolean }; timestamp: string }> => {
      const response = await apiClient.get(`/support-tickets?page=${page}&size=${size}`);
      return response.data;
    },
    updateStatus: async (id: string, status: string, resolutionNote: string): Promise<{ success: boolean; data: SupportTicket; timestamp: string }> => {
      const response = await apiClient.patch(`/support-tickets/${id}/status`, { status, resolutionNote });
      return response.data;
    },
  },

  /**
   * Stock Management Endpoints
   */
  stock: {
    getItems: async (): Promise<StockItemResponse> => {
      const response = await apiClient.get<StockItemResponse>('/stock/items');
      return response.data;
    },
    submitReport: async (payload: StockReportSubmitRequest): Promise<StockReportSubmitResponse> => {
      const response = await apiClient.post<StockReportSubmitResponse>('/stock/reports', payload);
      return response.data;
    },
    getAllReports: async (params: {
      page?: number;
      size?: number;
      dmId?: string;
      aseId?: string;
      asmId?: string;
      smId?: string;
      locationId?: string;
      week?: string;
    } = {}): Promise<StockReportListResponse> => {
      const qs = new URLSearchParams();
      qs.set('page', String(params.page ?? 0));
      qs.set('size', String(params.size ?? 20));
      if (params.dmId) qs.set('dmId', params.dmId);
      if (params.aseId) qs.set('aseId', params.aseId);
      if (params.asmId) qs.set('asmId', params.asmId);
      if (params.smId) qs.set('smId', params.smId);
      if (params.locationId) qs.set('locationId', params.locationId);
      if (params.week) qs.set('week', params.week);
      
      const response = await apiClient.get<StockReportListResponse>(`/stock/reports?${qs.toString()}`);
      return response.data;
    },
    getMyReports: async (page = 0, size = 20, week?: string): Promise<StockReportListResponse> => {
      let url = `/stock/reports/mine?page=${page}&size=${size}`;
      if (week) url += `&week=${week}`;
      const response = await apiClient.get<StockReportListResponse>(url);
      return response.data;
    },
    getReportsByDistributor: async (distributorId: string, page = 0, size = 20, week?: string): Promise<StockReportListResponse> => {
      let url = `/stock/reports?distributorId=${distributorId}&page=${page}&size=${size}`;
      if (week) url += `&week=${week}`;
      const response = await apiClient.get<StockReportListResponse>(url);
      return response.data;
    },
    getDashboard: async (params: { week?: string; locationId?: string; dmId?: string; asmId?: string } = {}): Promise<StockDashboardResponse> => {
      const qs = new URLSearchParams();
      if (params.week) qs.set('week', params.week);
      if (params.locationId) qs.set('locationId', params.locationId);
      if (params.dmId) qs.set('dmId', params.dmId);
      if (params.asmId) qs.set('asmId', params.asmId);
      const response = await apiClient.get<StockDashboardResponse>(`/stock/dashboard?${qs.toString()}`);
      return response.data;
    },
    getPending: async (params: { asmId?: string; dmId?: string } = {}): Promise<StockPendingResponse> => {
      const qs = new URLSearchParams();
      if (params.asmId) qs.set('asmId', params.asmId);
      if (params.dmId) qs.set('dmId', params.dmId);
      const response = await apiClient.get<StockPendingResponse>(`/stock/pending?${qs.toString()}`);
      return response.data;
    },
    export: async (params: { dmId?: string; date?: string } = {}): Promise<Blob> => {
      const qs = new URLSearchParams();
      if (params.dmId) qs.set('dmId', params.dmId);
      if (params.date) qs.set('date', params.date);
      
      const response = await apiClient.get(`/stock/export?${qs.toString()}`, {
        responseType: 'blob'
      });
      return response.data;
    },
  },

  // Add more modules here as needed (campaigns, etc.)
};
