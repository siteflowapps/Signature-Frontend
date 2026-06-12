import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { apiService } from '../network/apiService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { HierarchyMember, Location, SystemUser, UserRole } from '../types';
import { ROLE_LABELS, getRoleBadgeColor } from '../utils/roleConfig';
import { getErrorMessage } from '../utils/errorUtils';
import { ChangeRolePanel } from '../components/ChangeRolePanel';
import { ChangeParentPanel } from '../components/ChangeParentPanel';
import { TransferSubordinatesPanel } from '../components/TransferSubordinatesPanel';
import { DeactivateUserPanel } from '../components/DeactivateUserPanel';
import { ReactivateUserPanel } from '../components/ReactivateUserPanel';
import { EditUserProfilePanel } from '../components/EditUserProfilePanel';
import { queryKeys } from '../hooks/queries/queryKeys';
import { useUserHierarchyQuery, useInvalidateHierarchy } from '../hooks/queries/useUserHierarchyQuery';

// Sales-tree roles can be promoted (backend SALES_TREE_ROLES = RSM, ASM, ASE). CSO is a leaf.
const PROMOTABLE_ROLES = new Set(['ASE', 'ASM', 'RSM']);
// CSO has a reporting line (parent ASE) so it can be reassigned, even though it's not promotable.
const PARENT_CHANGEABLE_ROLES = new Set(['CSO', 'ASE', 'ASM']);
// Roles that hold transferable user subordinates (ASE manages outlets/distributors, not users).
const SUBORDINATE_HOLDING_ROLES = new Set(['ASM', 'RSM']);
// Roles that use the new hierarchy-aware deactivate/reactivate panels.
const HIERARCHY_DEACTIVATE_ROLES = new Set(['ASE', 'ASM']);
// Roles that belong to the sales ladder — show the Reporting hierarchy card for these.
const HIERARCHY_VISIBLE_ROLES = new Set(['CSO', 'ASE', 'ASM', 'RSM']);
// Roles that show the "Mapped Distributors" card.
const DISTRIBUTOR_VISIBLE_ROLES = new Set(['ASE', 'ASM', 'RSM', 'CSO']);
// Of those, only these can actually hold directly-assigned distributors (backend FieldDistributorAssignment).
const DISTRIBUTOR_HOLDING_ROLES = new Set(['ASE', 'ASM']);

const getInitials = (name: string | undefined) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

interface ActionRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}

const ActionRow: React.FC<ActionRowProps> = ({ icon, title, description, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className="w-full flex items-center justify-between gap-4 px-5 py-4 hover:bg-indigo-50/50 transition-colors text-left group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
  >
    <div className="flex items-center gap-4 min-w-0">
      <div className="w-10 h-10 rounded-xl bg-indigo-50 group-hover:bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0 transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm font-bold text-slate-900">{title}</div>
        <div className="text-xs text-slate-500 mt-0.5">{description}</div>
      </div>
    </div>
    <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
    </svg>
  </button>
);

const UserDetail: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const initialUser: SystemUser | undefined = (location.state as { user?: SystemUser })?.user;
  const backTo = (location.state as { from?: string })?.from || '/users';

  const [userData, setUserData] = useState<SystemUser | undefined>(initialUser);
  const [statusOverride, setStatusOverride] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  // Mapped distributors (only fetched for roles that can hold them: ASE / ASM)
  const [distributors, setDistributors] = useState<{ id: string; name: string; phone?: string | null; dmsId?: string | null }[]>([]);
  const [distLoading, setDistLoading] = useState(false);
  const [distError, setDistError] = useState<string | null>(null);

  // Resolve the user's location to display city/pincode in the identity card.
  useEffect(() => {
    if (!userData?.locationId) { setUserLocation(null); return; }
    let cancelled = false;
    apiService.locations.getAll()
      .then(res => {
        if (cancelled || !res.success) return;
        const match = (res.data || []).find(l => l.id === userData.locationId) || null;
        setUserLocation(match);
      })
      .catch(() => { if (!cancelled) setUserLocation(null); });
    return () => { cancelled = true; };
  }, [userData?.locationId]);

  const isLadderRole = userData ? ['CSO', 'ASE', 'ASM', 'RSM'].includes(userData.role) : false;
  const { data: hierarchyData, isLoading: hierarchyLoading } = useUserHierarchyQuery(isLadderRole ? userData?.id : undefined);

  // Fetch mapped distributors for roles that can hold them (ASE/ASM). RSM/CSO show a placeholder instead.
  useEffect(() => {
    if (!userData || !DISTRIBUTOR_HOLDING_ROLES.has(userData.role)) {
      setDistributors([]);
      setDistError(null);
      return;
    }
    let cancelled = false;
    setDistLoading(true);
    setDistError(null);
    (async () => {
      try {
        const res = await apiService.users.getDistributorsByUser(userData.id);
        if (cancelled) return;
        if (!res.success) { setDistError('Could not load distributors.'); return; }
        const base = res.data || [];
        // Enrich each mapping with phone + DMS ID (the mapping endpoint only returns id/name).
        const enriched = await Promise.all(base.map(async (d) => {
          try {
            const full = await apiService.distributors.getById(d.id);
            return { id: d.id, name: d.name, phone: full.data?.phone, dmsId: full.data?.dmsId };
          } catch {
            return { id: d.id, name: d.name };
          }
        }));
        if (!cancelled) setDistributors(enriched);
      } catch {
        if (!cancelled) setDistError('Could not load distributors.');
      } finally {
        if (!cancelled) setDistLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [userData?.id, userData?.role]);
  const invalidateHierarchy = useInvalidateHierarchy();

  const [openPanel, setOpenPanel] = useState<'role' | 'parent' | 'transfer' | 'deactivate' | 'reactivate' | null>(null);
  const [pendingStatusToggle, setPendingStatusToggle] = useState<null | 'INACTIVE' | 'ACTIVE'>(null);
  const [statusToggleLoading, setStatusToggleLoading] = useState(false);
  const [statusToggleError, setStatusToggleError] = useState<string | null>(null);

  const canManage = currentUser?.role === UserRole.SUPER_ADMIN || currentUser?.role === UserRole.NHQ_ADMIN || currentUser?.role === UserRole.BUSINESS_ADMIN;
  const isSelf = !!currentUser?.id && currentUser.id === id;
  const effectiveStatus = statusOverride ?? userData?.status ?? 'UNKNOWN';
  const isActive = effectiveStatus === 'ACTIVE';

  const refreshUsersCache = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    invalidateHierarchy();
  }, [queryClient, invalidateHierarchy]);

  const handleProfileUpdated = useCallback((updated: SystemUser) => {
    setUserData(prev => (prev ? { ...prev, ...updated } : updated));
    refreshUsersCache();
  }, [refreshUsersCache]);

  const handleDeactivateSuccess = useCallback(() => {
    setStatusOverride('INACTIVE');
    refreshUsersCache();
  }, [refreshUsersCache]);

  const handleReactivateSuccess = useCallback(() => {
    setStatusOverride('ACTIVE');
    refreshUsersCache();
  }, [refreshUsersCache]);

  /** Legacy status flip via PATCH /users/{id}/status — used for RBL + non-hierarchy roles. */
  const handleLegacyStatusToggle = async () => {
    if (!id || !userData || !pendingStatusToggle) return;
    setStatusToggleLoading(true);
    setStatusToggleError(null);
    try {
      const res = await apiService.users.updateStatus(id, pendingStatusToggle);
      if (res.success) {
        setStatusOverride(pendingStatusToggle);
        const verb = pendingStatusToggle === 'ACTIVE' ? 'reactivated' : 'deactivated';
        showToast(`${userData.name || 'User'} ${verb}`, 'success');
        setPendingStatusToggle(null);
        refreshUsersCache();
      } else {
        setStatusToggleError(res.error || 'Failed to update status.');
      }
    } catch (err) {
      setStatusToggleError(getErrorMessage(err));
    } finally {
      setStatusToggleLoading(false);
    }
  };

  // Tree rendering — parents (top-down) → self → children. New API gives parents top-most first;
  // sort defensively in case ordering changes server-side.
  const ROLE_RANK: Record<string, number> = { RSM: 0, ASM: 1, ASE: 2, CSO: 3 };
  const treeAncestors = useMemo(() => {
    if (!hierarchyData) return [] as HierarchyMember[];
    return [...hierarchyData.parents].sort((a, b) => (ROLE_RANK[a.role] ?? 99) - (ROLE_RANK[b.role] ?? 99));
  }, [hierarchyData]);
  const treeChildren = useMemo(() => hierarchyData?.children ?? [], [hierarchyData]);
  const treeSiblings = useMemo(() => hierarchyData?.siblings ?? [], [hierarchyData]);
  const selfDepth = treeAncestors.length;

  if (!userData) {
    return (
      <div className="space-y-6 pb-20">
        <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
          <Link to={backTo} className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            Users
          </Link>
          <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
          <span className="text-slate-800">Detail</span>
        </div>
        <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
          <p className="text-slate-700 font-bold mb-2">User context unavailable</p>
          <p className="text-slate-400 text-sm mb-6">Open this user from the Users list to see full details.</p>
          <button
            type="button"
            onClick={() => navigate(backTo)}
            className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  const roleLabel = ROLE_LABELS[userData.role] || userData.role;
  const canChangeRole = canManage && PROMOTABLE_ROLES.has(userData.role) && isActive && !isSelf;
  const canChangeParent = canManage && PARENT_CHANGEABLE_ROLES.has(userData.role) && isActive && !isSelf;
  const canTransfer = canManage && SUBORDINATE_HOLDING_ROLES.has(userData.role) && isActive && !isSelf;
  const canDeactivate = canManage && isActive && !isSelf;
  const canReactivate = canManage && !isActive && !isSelf;
  const usesHierarchyDeactivate = HIERARCHY_DEACTIVATE_ROLES.has(userData.role);
  const hasAnyManageAction = canChangeRole || canChangeParent || canTransfer;

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
        <Link to={backTo} className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Users
        </Link>
        <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        <span className="text-slate-800">{userData.name || 'User'}</span>
      </div>

      {/* Identity card */}
      <div className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
        <div className="flex items-start gap-5">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-base font-black shrink-0 ${getRoleBadgeColor(userData.role)}`}>
            {getInitials(userData.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{userData.name || '—'}</h1>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                {effectiveStatus}
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(userData.role)}`}>{roleLabel}</span>
              <span className="text-xs text-slate-400 font-medium">{userData.authType === 'EMAIL' ? 'Email login' : 'OTP login'}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Phone</div>
                <div className="text-slate-700 font-medium">{userData.phone || '—'}</div>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</div>
                <div className="text-slate-700 font-medium truncate">{userData.email || '—'}</div>
              </div>
              <div className="min-w-0">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Location</div>
                <div className="text-slate-700 font-medium truncate">
                  {userLocation ? `${userLocation.city || '—'} · ${userLocation.pincode}` : (userData.locationId ? '…' : '—')}
                </div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Joined</div>
                <div className="text-slate-700 font-medium">{formatDate(userData.createdAt)}</div>
              </div>
            </div>
          </div>
          {canManage && !isSelf && (
            <button
              type="button"
              onClick={() => setIsEditProfileOpen(true)}
              className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 transition-colors"
              title="Edit name, email, or location"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit profile
            </button>
          )}
        </div>
      </div>

      {/* Hierarchy + at-a-glance row */}
      <div className={`grid grid-cols-1 gap-5 ${HIERARCHY_VISIBLE_ROLES.has(userData.role) ? 'lg:grid-cols-3' : ''}`}>
        {/* Hierarchy card — only for the sales ladder roles */}
        {HIERARCHY_VISIBLE_ROLES.has(userData.role) && (
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Reporting hierarchy</h2>
            {!hierarchyLoading && hierarchyData && (
              <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <span>{treeSiblings.length} peer{treeSiblings.length === 1 ? '' : 's'}</span>
                <span className="text-slate-300">·</span>
                <span>{treeChildren.length} report{treeChildren.length === 1 ? '' : 's'}</span>
              </div>
            )}
          </div>
          {hierarchyLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-9 rounded-lg bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : !hierarchyData ? (
            <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
              <span className="inline-block px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-[0.15em] mb-2">Coming Soon</span>
              <p className="text-sm font-medium text-slate-500">Reporting hierarchy is currently unavailable.</p>
            </div>
          ) : (
            <ol className="space-y-1.5">
              {/* Upward chain */}
              {treeAncestors.map((m, idx) => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 py-2 pr-3 rounded-lg"
                  style={{ paddingLeft: `${idx * 16 + 8}px` }}
                >
                  {idx > 0 && (
                    <svg className="w-3.5 h-3.5 text-slate-300 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17l5-5-5-5" />
                    </svg>
                  )}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(m.role)}`}>{m.role}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-slate-800 truncate">{m.name}</div>
                    {m.phone && <div className="text-xs text-slate-400 truncate">{m.phone}</div>}
                  </div>
                </li>
              ))}

              {/* Self */}
              <li
                className="flex items-center gap-3 py-2 pr-3 rounded-lg bg-indigo-50/60 border border-indigo-100"
                style={{ paddingLeft: `${selfDepth * 16 + 8}px` }}
              >
                {selfDepth > 0 && (
                  <svg className="w-3.5 h-3.5 text-slate-300 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17l5-5-5-5" />
                  </svg>
                )}
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(userData.role)}`}>{userData.role}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-black text-indigo-700 truncate">{userData.name}</div>
                  {userData.phone && <div className="text-xs text-slate-400 truncate">{userData.phone}</div>}
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest text-indigo-500">You</span>
              </li>

              {/* Direct reports */}
              {treeChildren.map(m => (
                <li
                  key={m.id}
                  className="flex items-center gap-3 py-2 pr-3 rounded-lg"
                  style={{ paddingLeft: `${(selfDepth + 1) * 16 + 8}px` }}
                >
                  <svg className="w-3.5 h-3.5 text-slate-300 -ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17l5-5-5-5" />
                  </svg>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(m.role)}`}>{m.role}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-slate-800 truncate">{m.name}</div>
                    {m.phone && <div className="text-xs text-slate-400 truncate">{m.phone}</div>}
                  </div>
                </li>
              ))}

              {/* Peers / siblings hint */}
              {treeSiblings.length > 0 && (
                <li className="pt-3 mt-2 border-t border-slate-100">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Peers in this domain</div>
                  <div className="flex flex-wrap gap-1.5">
                    {treeSiblings.slice(0, 8).map(m => (
                      <span key={m.id} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100">
                        <span className={`px-1.5 rounded text-[9px] font-bold uppercase tracking-wider ${getRoleBadgeColor(m.role)}`}>{m.role}</span>
                        <span className="truncate max-w-[140px]">{m.name}</span>
                      </span>
                    ))}
                    {treeSiblings.length > 8 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md bg-slate-50 text-slate-500 text-xs font-medium border border-slate-100">
                        +{treeSiblings.length - 8} more
                      </span>
                    )}
                  </div>
                </li>
              )}
            </ol>
          )}
        </div>
        )}

        {/* At a glance */}
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">At a glance</h2>
          <dl className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 font-medium">Role</dt>
              <dd className="font-bold text-slate-900">{roleLabel}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 font-medium">Status</dt>
              <dd className="font-bold text-slate-900">{effectiveStatus}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 font-medium">Auth type</dt>
              <dd className="font-bold text-slate-900">{userData.authType || '—'}</dd>
            </div>
            <div className="flex items-center justify-between">
              <dt className="text-slate-500 font-medium">Joined</dt>
              <dd className="font-bold text-slate-900">{formatDate(userData.createdAt)}</dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Mapped Distributors — ASE/ASM (real data), RSM/CSO (placeholder) */}
      {DISTRIBUTOR_VISIBLE_ROLES.has(userData.role) && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Mapped Distributors</h2>
            {DISTRIBUTOR_HOLDING_ROLES.has(userData.role) && !distLoading && !distError && (
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {distributors.length} mapped
              </span>
            )}
          </div>

          {!DISTRIBUTOR_HOLDING_ROLES.has(userData.role) ? (
            // RSM / CSO — distributors aren't directly assigned to this role
            <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
              <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-600 mb-1">Not applicable for {roleLabel}</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Distributors are mapped directly to ASE and ASM users only. {roleLabel}s don't hold distributor assignments.
              </p>
            </div>
          ) : distLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (<div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />))}
            </div>
          ) : distError ? (
            <div className="py-6 text-center text-sm font-medium text-red-500">{distError}</div>
          ) : distributors.length === 0 ? (
            <div className="py-8 text-center bg-slate-50/50 rounded-xl border border-slate-100 border-dashed">
              <p className="text-sm font-medium text-slate-500">No distributors mapped yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {distributors.map(d => (
                <div key={d.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 bg-white">
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{d.name}</p>
                    <p className="text-xs text-slate-400 truncate">
                      {[d.phone, d.dmsId ? `DMS: ${d.dmsId}` : null].filter(Boolean).join('  ·  ') || 'No contact info'}
                    </p>
                  </div>
                  <span className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Manage actions */}
      {canManage && hasAnyManageAction && (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 pt-5 pb-3 border-b border-slate-50">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Manage</h2>
          </div>
          <div className="divide-y divide-slate-50">
            {canChangeRole && (
              <ActionRow
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l-4-4m4 4l4-4" />
                  </svg>
                }
                title="Change role"
                description={userData.role === 'RSM' ? 'Reassign subordinates and keep role' : 'Promote to the next level in the hierarchy'}
                onClick={() => {}}
                disabled={true}
              />
            )}
            {canChangeParent && (
              <ActionRow
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 014-4h2a4 4 0 014 4v2zm3-12a4 4 0 11-8 0 4 4 0 018 0zm6 4a3 3 0 100-6 3 3 0 000 6z" />
                  </svg>
                }
                title="Change reporting manager"
                description={`Move this ${roleLabel} under a different ${ROLE_LABELS[userData.role === 'CSO' ? 'ASE' : userData.role === 'ASE' ? 'ASM' : 'RSM'] || ''}. Subordinates move along.`}
                onClick={() => {}}
                disabled={true}
              />
            )}
            {canTransfer && (
              <ActionRow
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                }
                title="Transfer subordinates"
                description={`Move all direct reports of this ${roleLabel} to another ${roleLabel} without changing their role.`}
                onClick={() => {}}
                disabled={true}
              />
            )}
          </div>
        </div>
      )}

      {/* Danger zone */}
      {(canDeactivate || canReactivate) && (
        <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden ${canReactivate ? 'border-emerald-100' : 'border-red-100'}`}>
          <div className={`px-5 pt-5 pb-3 border-b ${canReactivate ? 'border-emerald-50' : 'border-red-50'}`}>
            <h2 className={`text-[10px] font-black uppercase tracking-[0.2em] ${canReactivate ? 'text-emerald-600' : 'text-red-500'}`}>
              {canReactivate ? 'Restore access' : 'Danger zone'}
            </h2>
          </div>
          <div className="px-5 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <div className="text-sm font-bold text-slate-900">
                {canReactivate ? 'Reactivate user' : 'Deactivate user'}
              </div>
              <div className="text-xs text-slate-500 mt-1">
                {canReactivate
                  ? 'Restore login access. You\'ll be asked to confirm the new reporting line.'
                  : usesHierarchyDeactivate
                    ? 'Pick who takes over outlets, distributors, or subordinates before deactivating.'
                    : 'User loses access immediately. Reversible by support.'}
              </div>
            </div>
            {canDeactivate && (
              <button
                type="button"
                disabled={true}
                className="px-4 py-2 text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl opacity-50 cursor-not-allowed shrink-0"
              >
                Deactivate
              </button>
            )}
            {canReactivate && (
              <button
                type="button"
                disabled={true}
                className="px-4 py-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-xl opacity-50 cursor-not-allowed shrink-0"
              >
                Reactivate
              </button>
            )}
          </div>
        </div>
      )}

      {/* Panels */}
      <ChangeRolePanel
        isOpen={openPanel === 'role'}
        user={userData}
        onClose={() => setOpenPanel(null)}
        onSuccess={refreshUsersCache}
      />
      <ChangeParentPanel
        isOpen={openPanel === 'parent'}
        user={userData}
        onClose={() => setOpenPanel(null)}
        onSuccess={refreshUsersCache}
      />
      <TransferSubordinatesPanel
        isOpen={openPanel === 'transfer'}
        user={userData}
        onClose={() => setOpenPanel(null)}
        onSuccess={refreshUsersCache}
      />
      <DeactivateUserPanel
        isOpen={openPanel === 'deactivate'}
        user={userData}
        onClose={() => setOpenPanel(null)}
        onSuccess={handleDeactivateSuccess}
      />
      <ReactivateUserPanel
        isOpen={openPanel === 'reactivate'}
        user={userData}
        onClose={() => setOpenPanel(null)}
        onSuccess={handleReactivateSuccess}
      />
      <EditUserProfilePanel
        isOpen={isEditProfileOpen}
        user={userData}
        initialLocation={userLocation}
        onClose={() => setIsEditProfileOpen(false)}
        onSuccess={handleProfileUpdated}
      />

      {/* Legacy status toggle confirmation — used for RBL & non-hierarchy roles. */}
      {pendingStatusToggle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="px-6 pt-6 pb-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${pendingStatusToggle === 'ACTIVE' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                {pendingStatusToggle === 'ACTIVE' ? (
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                  </svg>
                )}
              </div>
              <h2 className="text-base font-black text-slate-900 mb-2">
                {pendingStatusToggle === 'ACTIVE' ? 'Reactivate this user?' : 'Deactivate this user?'}
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700">{userData.name || 'This user'}</span> ({roleLabel}) will be marked
                <span className="font-bold text-slate-700"> {pendingStatusToggle}</span>
                {pendingStatusToggle === 'ACTIVE' ? ' and can log in again.' : ' and will no longer be able to log in.'}
              </p>
              {statusToggleError && (<p className="mt-3 text-xs font-medium text-red-500">{statusToggleError}</p>)}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setPendingStatusToggle(null); setStatusToggleError(null); }}
                disabled={statusToggleLoading}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
              >Cancel</button>
              <button
                type="button"
                onClick={handleLegacyStatusToggle}
                disabled={statusToggleLoading}
                className={`px-4 py-2 text-sm font-bold text-white rounded-xl shadow-sm transition-colors disabled:opacity-40 flex items-center gap-2 ${
                  pendingStatusToggle === 'ACTIVE'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/25'
                    : 'bg-red-600 hover:bg-red-700 shadow-red-500/25'
                }`}
              >
                {statusToggleLoading && (
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {statusToggleLoading
                  ? (pendingStatusToggle === 'ACTIVE' ? 'Reactivating…' : 'Deactivating…')
                  : (pendingStatusToggle === 'ACTIVE' ? 'Reactivate User' : 'Deactivate User')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reduced privileges hint */}
      {!canManage && (
        <div className="p-4 text-xs text-slate-500 bg-slate-50 border border-slate-100 rounded-xl">
          You don't have permission to manage this user. Only Super Admins and Business Admins can change roles, reassign reporting lines, or deactivate users.
        </div>
      )}
    </div>
  );
};

export default UserDetail;
