/**
 * Centralized query key factory.
 * Using a factory pattern ensures cache invalidation is type-safe and consistent.
 */
export const queryKeys = {
  dashboard: ['dashboard'] as const,

  outlets: {
    all: ['outlets'] as const,
    list: (page: number, size: number, filters: { search?: string; outletStatus?: string; locationId?: string; aseId?: string } = {}) =>
      ['outlets', 'list', page, size, filters.search ?? '', filters.outletStatus ?? '', filters.locationId ?? '', filters.aseId ?? ''] as const,
  },

  invoices: {
    all: ['invoices'] as const,
    list: (page: number, size: number) => ['invoices', 'list', page, size] as const,
    detail: (id: string) => ['invoices', 'detail', id] as const,
    byOutlet: (outletId: string, page: number, size: number) => ['invoices', 'outlet', outletId, page, size] as const,
  },

  payouts: {
    all: ['payouts'] as const,
    list: (page: number, size: number) => ['payouts', 'list', page, size] as const,
    estimate: (invoiceId: string) => ['payouts', 'estimate', invoiceId] as const,
  },

  businesses: {
    all: ['businesses'] as const,
    list: (page: number, size: number) => ['businesses', 'list', page, size] as const,
  },

  users: {
    all: ['users'] as const,
    list: (page: number, size: number) => ['users', 'list', page, size] as const,
    byRole: (role: string, page: number, size: number) => ['users', 'byRole', role, page, size] as const,
  },

  distributors: {
    all: ['distributors'] as const,
    list: (page: number, size: number) => ['distributors', 'list', page, size] as const,
  },

  locations: ['locations'] as const,
  hierarchy: {
    all: ['hierarchy'] as const,
    user: (userId: string) => ['hierarchy', 'user', userId] as const,
  },
};
