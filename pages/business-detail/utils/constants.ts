/**
 * Role badge color mapping for the business detail team table.
 */
export const getRoleBadgeColor = (role: string): string => {
  const roleColors: Record<string, string> = {
    BUSINESS_ADMIN: 'bg-blue-50 text-blue-700',
    FINANCE_ADMIN: 'bg-purple-50 text-purple-700',
    RBL: 'bg-orange-50 text-orange-700',
    SM: 'bg-green-50 text-green-700',
    ASM: 'bg-amber-50 text-amber-700',
    ASE: 'bg-cyan-50 text-cyan-700',
  };
  return roleColors[role] || 'bg-slate-100 text-slate-600';
};

/**
 * Available roles for the Add User form within a business.
 */
export const AVAILABLE_ROLES = [
  'BUSINESS_ADMIN',
  'FINANCE_ADMIN',
  'BUSINESS_USER',
  'RBL',
  'SM',
  'ASM',
  'ASE',
] as const;
