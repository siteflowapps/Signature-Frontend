/**
 * Role badge color mapping for the business detail team table.
 */
export const getRoleBadgeColor = (role: string): string => {
  const roleColors: Record<string, string> = {
    NHQ_ADMIN: 'bg-violet-50 text-violet-700',
    BUSINESS_ADMIN: 'bg-blue-50 text-blue-700',
    FINANCE_ADMIN: 'bg-purple-50 text-purple-700',
    FINANCE_MANAGER: 'bg-purple-50 text-purple-700',
    MARKETING_MANAGER: 'bg-pink-50 text-pink-700',
    COOLER_TEAM: 'bg-cyan-50 text-cyan-700',
    RSM: 'bg-orange-50 text-orange-700',
    ASM: 'bg-amber-50 text-amber-700',
    ASE: 'bg-cyan-50 text-cyan-700',
  };
  return roleColors[role] || 'bg-slate-100 text-slate-600';
};

/**
 * Available roles for the Add User form within a business.
 */
export const AVAILABLE_ROLES = [
  'NHQ_ADMIN',
  'BUSINESS_ADMIN',
  'FINANCE_ADMIN',
  'FINANCE_MANAGER',
  'MARKETING_MANAGER',
  'COOLER_TEAM',
  'BUSINESS_USER',
  'RSM',
  'ASM',
  'ASE',
] as const;
