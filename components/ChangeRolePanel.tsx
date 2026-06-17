import React, { useEffect, useMemo, useState } from 'react';
import { SlideOverPanel } from './SlideOverPanel';
import { apiService } from '../network/apiService';
import { useToast } from '../context/ToastContext';
import { ROLE_LABELS, getRoleBadgeColor } from '../utils/roleConfig';
import { getErrorMessage } from '../utils/errorUtils';
import { HierarchyMember, SystemUser } from '../types';
import { useUserHierarchyQuery, useInvalidateHierarchy } from '../hooks/queries/useUserHierarchyQuery';

interface ChangeRolePanelProps {
  isOpen: boolean;
  user: SystemUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

const PROMOTION_TARGET: Record<string, string> = {
  ASE: 'ASM',
  ASM: 'RSM',
  RSM: 'RSM',
};

/** Parent role required for the *target* role (omit when target sits at top). */
const PARENT_ROLE_FOR_TARGET: Record<string, string | undefined> = {
  ASM: 'RSM',
  RSM: undefined,
};

export const ChangeRolePanel: React.FC<ChangeRolePanelProps> = ({ isOpen, user, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const invalidateHierarchy = useInvalidateHierarchy();

  const targetRole = user ? PROMOTION_TARGET[user.role] : undefined;
  const parentRoleNeeded = targetRole ? PARENT_ROLE_FOR_TARGET[targetRole] : undefined;
  const isAseFlow = user?.role === 'ASE';

  const { data: hierarchy, isLoading: hierarchyLoading } = useUserHierarchyQuery(isOpen ? user?.id : undefined);

  const [newParentId, setNewParentId] = useState<string>('');
  const [parentSearch, setParentSearch] = useState('');
  const [successorId, setSuccessorId] = useState<string>('');
  const [successorSearch, setSuccessorSearch] = useState('');
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setNewParentId('');
    setParentSearch('');
    setSuccessorId('');
    setSuccessorSearch('');
    setReason('');
    setSubmitError(null);
  }, [isOpen, user?.id]);

  const parentCandidates: HierarchyMember[] = useMemo(() => {
    if (!hierarchy || !parentRoleNeeded) return [];
    return hierarchy.parents.filter(p => p.role === parentRoleNeeded);
  }, [hierarchy, parentRoleNeeded]);

  const siblingCandidates: HierarchyMember[] = useMemo(() => {
    return hierarchy?.siblings ?? [];
  }, [hierarchy]);

  const filterMembers = (list: HierarchyMember[], q: string) => {
    const trimmed = q.trim().toLowerCase();
    if (!trimmed) return list.slice(0, 20);
    return list
      .filter(p => p.name?.toLowerCase().includes(trimmed) || p.phone?.toLowerCase().includes(trimmed))
      .slice(0, 20);
  };

  const filteredParents = useMemo(() => filterMembers(parentCandidates, parentSearch), [parentCandidates, parentSearch]);
  const filteredSiblings = useMemo(() => filterMembers(siblingCandidates, successorSearch), [siblingCandidates, successorSearch]);

  const selectedParent = useMemo(() => parentCandidates.find(p => p.id === newParentId) || null, [parentCandidates, newParentId]);
  const selectedSuccessor = useMemo(() => siblingCandidates.find(s => s.id === successorId) || null, [siblingCandidates, successorId]);

  const noSiblings = !hierarchyLoading && siblingCandidates.length === 0;
  const parentRequired = Boolean(parentRoleNeeded);
  const canSubmit = Boolean(
    user && targetRole && successorId && (!parentRequired || newParentId) && reason.trim().length >= 4 && !submitting && !noSiblings,
  );

  const handleSubmit = async () => {
    if (!user || !targetRole || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: Parameters<typeof apiService.users.changeRole>[1] = {
        newRole: targetRole,
        reason: reason.trim(),
      };
      if (parentRequired) payload.newParentId = newParentId;
      if (isAseFlow) {
        payload.transferOutletsToAseId = successorId;
        payload.transferDistributorsToAseId = successorId;
      } else {
        payload.transferSubordinatesToUserId = successorId;
      }

      const res = await apiService.users.changeRole(user.id, payload);
      if (res.success) {
        const verb = targetRole === user.role ? 'reassigned' : `promoted to ${ROLE_LABELS[targetRole] || targetRole}`;
        showToast(`${user.name || 'User'} ${verb}`, 'success');
        invalidateHierarchy();
        onSuccess();
        onClose();
      } else {
        setSubmitError(res.error || 'Failed to change role.');
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!user) return null;

  const fromBadgeClasses = getRoleBadgeColor(user.role);
  const toBadgeClasses = targetRole ? getRoleBadgeColor(targetRole) : 'bg-slate-100 text-slate-700';
  const roleLabel = ROLE_LABELS[user.role] || user.role;
  const targetLabel = targetRole ? (ROLE_LABELS[targetRole] || targetRole) : '';
  const parentLabel = parentRoleNeeded ? (ROLE_LABELS[parentRoleNeeded] || parentRoleNeeded) : '';

  const successorSectionLabel = isAseFlow ? 'Successor ASE' : `Transfer subordinates to (another ${roleLabel})`;
  const successorHelp = isAseFlow
    ? 'All outlets and distributors currently mapped to this ASE will move to the selected ASE.'
    : `All direct reports of this ${roleLabel} will move to the selected ${roleLabel}.`;
  const successorPlaceholder = `Search ${roleLabel} in this domain…`;

  return (
    <SlideOverPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Change Role"
      subtitle={user.name || 'User'}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-medium">
            <span className="hidden sm:inline">Press </span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-500">⌘↵</kbd>
            <span className="hidden sm:inline"> to submit</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {submitting ? 'Updating…' : 'Confirm change'}
            </button>
          </div>
        </div>
      }
    >
      <div onKeyDown={handleKeyDown} className="space-y-7">
        {/* Role transition */}
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${fromBadgeClasses}`}>{roleLabel}</span>
          <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
          <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${toBadgeClasses}`}>{targetLabel || '—'}</span>
          {targetRole === user.role && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Reassign subordinates</span>
          )}
        </div>

        {!targetRole && (
          <div className="p-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl">
            Promotions from <strong>{roleLabel}</strong> are not supported yet.
          </div>
        )}

        {hierarchyLoading && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (<div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />))}
          </div>
        )}

        {!hierarchyLoading && noSiblings && targetRole && (
          <div className="p-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl">
            No peer <strong>{roleLabel}</strong> exists in this domain to take over responsibilities. Add a peer first, then promote.
          </div>
        )}

        {!hierarchyLoading && targetRole && !noSiblings && (
          <>
            {/* New parent — from upward chain */}
            {parentRequired && (
              <section>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                  New reporting manager ({parentLabel})
                </label>
                {parentCandidates.length > 1 && (
                  <div className="relative mb-2">
                    <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      value={parentSearch}
                      onChange={e => setParentSearch(e.target.value)}
                      placeholder={`Search ${parentLabel}…`}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
                    />
                  </div>
                )}
                {filteredParents.length === 0 ? (
                  <div className="p-3.5 text-sm text-slate-500 bg-slate-50 border border-slate-100 rounded-xl">
                    No {parentLabel} found in this user's upward chain.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredParents.map(p => (
                      <button
                        type="button"
                        key={p.id}
                        onClick={() => setNewParentId(p.id)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                          newParentId === p.id
                            ? 'border-indigo-400 bg-indigo-50/60 ring-2 ring-indigo-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate">{p.name}</div>
                            <div className="text-xs text-slate-400 truncate">{p.phone || '—'}</div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(p.role)}`}>{p.role}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            )}

            {/* Successor — siblings */}
            <section>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {successorSectionLabel}
              </label>
              <p className="text-xs text-slate-400 mb-2">{successorHelp}</p>
              <div className="relative mb-2">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={successorSearch}
                  onChange={e => setSuccessorSearch(e.target.value)}
                  placeholder={successorPlaceholder}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
                />
              </div>
              <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-50 bg-white">
                {filteredSiblings.length === 0 ? (
                  <div className="p-4 text-sm text-slate-400 text-center">No match.</div>
                ) : (
                  filteredSiblings.map(s => (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => setSuccessorId(s.id)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                        successorId === s.id ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{s.name}</div>
                        <div className="text-xs text-slate-400 truncate">{s.phone || '—'}</div>
                      </div>
                      {successorId === s.id && (
                        <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </section>

            {/* Reason */}
            <section>
              <label htmlFor="change-role-reason" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Reason
              </label>
              <textarea
                id="change-role-reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder={isAseFlow
                  ? 'e.g. Promoted to ASM South after RSM approval'
                  : 'e.g. Reassigning territory after team restructure'}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all resize-none"
              />
            </section>

            {/* Review */}
            {(selectedSuccessor && (!parentRequired || selectedParent)) && (
              <section className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Review</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  <span className="font-bold">{user.name}</span>
                  {targetRole === user.role
                    ? <> will keep their <span className="font-bold">{targetLabel}</span> role.</>
                    : <> will become <span className="font-bold">{targetLabel}</span>{selectedParent && <> under <span className="font-bold">{selectedParent.name}</span></>}.</>
                  }
                  {' '}
                  {isAseFlow
                    ? <>All outlets and distributors will transfer to <span className="font-bold">{selectedSuccessor.name}</span>.</>
                    : <>All direct reports will transfer to <span className="font-bold">{selectedSuccessor.name}</span>.</>}
                </p>
              </section>
            )}

            {submitError && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
                {submitError}
              </div>
            )}
          </>
        )}
      </div>
    </SlideOverPanel>
  );
};
