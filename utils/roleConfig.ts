/**
 * Centralized role configuration — Single source of truth for all role behavior.
 * Open/Closed: Adding a new role = add one entry here, zero changes elsewhere.
 */

export interface RoleConfig {
  /** Human-readable label for display */
  label: string;
  /** Whether this role authenticates via phone (OTP) instead of email */
  isFieldRole: boolean;
  /** The parent role this role reports to (for manager dropdown) */
  parentRole?: string;
  /** Default auth type for this role */
  defaultAuthType: 'EMAIL' | 'OTP';
  /** Hierarchy breadcrumb for UI display */
  hierarchyHint?: string;
}

export const ROLE_CONFIG: Record<string, RoleConfig> = {
  NHQ_ADMIN: {
    label: 'NHQ Admin',
    isFieldRole: true,
    defaultAuthType: 'OTP',
  },
  BUSINESS_ADMIN: {
    label: 'Business Admin',
    isFieldRole: true,
    defaultAuthType: 'OTP',
  },
  BUSINESS_USER: {
    label: 'Business User',
    isFieldRole: true,
    defaultAuthType: 'OTP',
  },
  FINANCE_ADMIN: {
    label: 'Finance Admin',
    isFieldRole: true,
    defaultAuthType: 'OTP',
  },
  FINANCE_MANAGER: {
    label: 'Finance Manager',
    isFieldRole: true,
    defaultAuthType: 'OTP',
  },
  MARKETING_MANAGER: {
    label: 'Marketing Manager',
    isFieldRole: true,
    defaultAuthType: 'OTP',
  },
  COOLER_TEAM: {
    label: 'Cooler Team',
    isFieldRole: true,
    defaultAuthType: 'OTP',
  },
  RSM: {
    label: 'Regional Sales Manager',
    isFieldRole: true,
    defaultAuthType: 'OTP',
  },
  ASM: {
    label: 'Area Sales Manager',
    isFieldRole: true,
    parentRole: 'RSM',
    defaultAuthType: 'OTP',
    hierarchyHint: 'RSM → ASM',
  },
  ASE: {
    label: 'Area Sales Executive',
    isFieldRole: true,
    parentRole: 'ASM',
    defaultAuthType: 'OTP',
    hierarchyHint: 'RSM → ASM → ASE',
  },
  CSO: {
    label: 'CSO',
    isFieldRole: true,
    parentRole: 'ASE',
    defaultAuthType: 'OTP',
    hierarchyHint: 'RSM → ASM → ASE → CSO',
  },
  DISTRIBUTOR: {
    label: 'Distributor',
    isFieldRole: true,
    defaultAuthType: 'OTP',
  },
  DISTRIBUTOR_MANAGER: {
    label: 'Distributor Manager',
    isFieldRole: true,
    defaultAuthType: 'OTP',
  },
  SUPPORT: {
    label: 'Support',
    isFieldRole: false,
    defaultAuthType: 'EMAIL',
  },
};

/** All role labels including non-creatable roles (for display in tables) */
export const ROLE_LABELS: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  SALES_EXECUTIVE: 'Sales Executive',
  OUTLET: 'Outlet',
  RETAILER: 'Retailer',
  CSO: 'CSO',
  // Merge in config labels
  ...Object.fromEntries(
    Object.entries(ROLE_CONFIG).map(([key, config]) => [key, config.label])
  ),
};

/** Badge color map for table display */
export const getRoleBadgeColor = (role: string): string => {
  switch (role) {
    case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-700';
    case 'NHQ_ADMIN': return 'bg-violet-100 text-violet-700';
    case 'BUSINESS_ADMIN': return 'bg-indigo-100 text-indigo-700';
    case 'BUSINESS_USER': return 'bg-indigo-100 text-indigo-700';
    case 'FINANCE_ADMIN': return 'bg-amber-100 text-amber-700';
    case 'FINANCE_MANAGER': return 'bg-amber-100 text-amber-700';
    case 'MARKETING_MANAGER': return 'bg-pink-100 text-pink-700';
    case 'COOLER_TEAM': return 'bg-cyan-100 text-cyan-700';
    case 'RSM': return 'bg-blue-100 text-blue-700';
    case 'ASM': return 'bg-teal-100 text-teal-700';
    case 'ASE': return 'bg-green-100 text-green-700';
    case 'CSO': return 'bg-lime-100 text-lime-700';
    case 'RETAILER': return 'bg-orange-100 text-orange-700';
    case 'SALES_EXECUTIVE': return 'bg-emerald-100 text-emerald-700';
    case 'OUTLET': return 'bg-orange-100 text-orange-700';
    case 'DISTRIBUTOR': return 'bg-amber-100 text-amber-700';
    case 'DISTRIBUTOR_MANAGER': return 'bg-orange-100 text-orange-800';
    case 'SUPPORT': return 'bg-sky-100 text-sky-700';
    default: return 'bg-slate-100 text-slate-700';
  }
};

/** Get available roles for a given user type */
export const getAvailableRoles = (isAdmin: boolean, isBusinessAdmin: boolean): string[] => {
  // Roles a Super Admin can assign (every backend role except SUPER_ADMIN and RETAILER)
  if (isAdmin) {
    return ['NHQ_ADMIN', 'FINANCE_MANAGER', 'MARKETING_MANAGER', 'COOLER_TEAM', 'RSM', 'ASM', 'ASE', 'CSO'];
  } else if (isBusinessAdmin) {
    // NHQ Admin cannot create SUPER_ADMIN or peer NHQ_ADMIN accounts
    return ['FINANCE_MANAGER', 'MARKETING_MANAGER', 'COOLER_TEAM', 'RSM', 'ASM', 'ASE', 'CSO'];
  }
  return [];
};

/** Get config for a role, with safe fallback */
export const getRoleConfig = (role: string): RoleConfig | undefined => {
  return ROLE_CONFIG[role];
};

/** Check if a role requires a parent selection */
export const requiresParent = (role: string): boolean => {
  return !!ROLE_CONFIG[role]?.parentRole;
};

/** Get the parent role label for display */
export const getParentLabel = (role: string): string => {
  const parentRole = ROLE_CONFIG[role]?.parentRole;
  return parentRole ? (ROLE_LABELS[parentRole] || parentRole) : '';
};

/** Role filter options for the Users table */
export const ROLE_FILTERS = ['ALL', 'NHQ_ADMIN', 'BUSINESS_ADMIN', 'BUSINESS_USER', 'FINANCE_ADMIN', 'FINANCE_MANAGER', 'MARKETING_MANAGER', 'COOLER_TEAM', 'RSM', 'ASM', 'ASE', 'DISTRIBUTOR', 'DISTRIBUTOR_MANAGER', 'SUPPORT'];
