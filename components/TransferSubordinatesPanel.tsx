import React, { useEffect, useMemo, useState } from 'react';
import { SlideOverPanel } from './SlideOverPanel';
import { apiService } from '../network/apiService';
import { useToast } from '../context/ToastContext';
import { ROLE_LABELS, getRoleBadgeColor } from '../utils/roleConfig';
import { getErrorMessage } from '../utils/errorUtils';
import { SystemUser } from '../types';
import { useUserHierarchyQuery, useInvalidateHierarchy } from '../hooks/queries/useUserHierarchyQuery';

interface TransferSubordinatesPanelProps {
  isOpen: boolean;
  user: SystemUser | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const TransferSubordinatesPanel: React.FC<TransferSubordinatesPanelProps> = ({ isOpen, user, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const invalidateHierarchy = useInvalidateHierarchy();

  const { data: hierarchy, isLoading: hierarchyLoading } = useUserHierarchyQuery(isOpen ? user?.id : undefined);

  const [toUserId, setToUserId] = useState('');
  const [search, setSearch] = useState('');
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    setToUserId('');
    setSearch('');
    setReason('');
    setSubmitError(null);
  }, [isOpen, user?.id]);

  const peers = useMemo(() => hierarchy?.siblings ?? [], [hierarchy]);

  const filteredPeers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return peers.slice(0, 20);
    return peers
      .filter(p => p.name?.toLowerCase().includes(q) || p.phone?.toLowerCase().includes(q))
      .slice(0, 20);
  }, [peers, search]);

  const selectedPeer = useMemo(() => peers.find(p => p.id === toUserId) || null, [peers, toUserId]);

  const noPeers = !hierarchyLoading && peers.length === 0;
  const canSubmit = Boolean(user && toUserId && reason.trim().length >= 4 && !submitting && !noPeers);

  const handleSubmit = async () => {
    if (!user || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await apiService.users.transferSubordinates({
        fromUserId: user.id,
        toUserId,
        reason: reason.trim(),
      });
      if (res.success) {
        showToast(`Subordinates moved from ${user.name} to ${selectedPeer?.name || 'new manager'}`, 'success');
        invalidateHierarchy();
        onSuccess();
        onClose();
      } else {
        setSubmitError(res.error || 'Failed to transfer subordinates.');
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

  const roleLabel = ROLE_LABELS[user.role] || user.role;

  return (
    <SlideOverPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Transfer Subordinates"
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
              {submitting ? 'Transferring…' : 'Confirm transfer'}
            </button>
          </div>
        </div>
      }
    >
      <div onKeyDown={handleKeyDown} className="space-y-7">
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1.5 rounded-lg text-[11px] font-black uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>{roleLabel}</span>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.15em]">Move team to another {roleLabel} in this domain</span>
        </div>

        {hierarchyLoading && (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (<div key={i} className="h-10 rounded-xl bg-slate-100 animate-pulse" />))}
          </div>
        )}

        {!hierarchyLoading && noPeers && (
          <div className="p-4 text-sm text-amber-700 bg-amber-50 border border-amber-100 rounded-xl">
            No peer <strong>{roleLabel}</strong> exists in this domain. Add a peer before transferring.
          </div>
        )}

        {!hierarchyLoading && !noPeers && (
          <>
            <section>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Transfer to (another {roleLabel})
              </label>
              <p className="text-xs text-slate-400 mb-2">
                All direct reports of <span className="font-bold">{user.name}</span> will move to the selected {roleLabel}.
              </p>
              <div className="relative mb-2">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${roleLabel} in this domain…`}
                  className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
                />
              </div>
              <div className="max-h-72 overflow-y-auto rounded-xl border border-slate-100 divide-y divide-slate-50 bg-white">
                {filteredPeers.length === 0 ? (
                  <div className="p-4 text-sm text-slate-400 text-center">No match.</div>
                ) : (
                  filteredPeers.map(p => (
                    <button
                      type="button"
                      key={p.id}
                      onClick={() => setToUserId(p.id)}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between gap-3 transition-colors ${
                        toUserId === p.id ? 'bg-indigo-50/70' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">{p.name}</div>
                        <div className="text-xs text-slate-400 truncate">{p.phone || '—'}</div>
                      </div>
                      {toUserId === p.id && (
                        <svg className="w-4 h-4 text-indigo-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </section>

            <section>
              <label htmlFor="transfer-reason" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Reason
              </label>
              <textarea
                id="transfer-reason"
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                placeholder={`e.g. ${roleLabel} on long leave — team reassigned`}
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all resize-none"
              />
            </section>

            {selectedPeer && (
              <section className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Review</p>
                <p className="text-sm text-slate-700 leading-relaxed">
                  All direct reports of <span className="font-bold">{user.name}</span> will move to{' '}
                  <span className="font-bold">{selectedPeer.name}</span>. <span className="font-bold">{user.name}</span>'s role stays unchanged.
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
