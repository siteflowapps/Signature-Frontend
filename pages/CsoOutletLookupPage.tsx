import React, { useEffect, useMemo, useState } from 'react';
import { apiService } from '../network/apiService';
import { CsoOutletAssignment, Outlet, SystemUser, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorUtils';

// Roles allowed to (re)assign a CSO on the backend (PUT /outlets/{id}/cso).
const ASSIGN_ROLES: UserRole[] = [UserRole.SUPER_ADMIN, UserRole.NHQ_ADMIN, UserRole.ASM, UserRole.ASE];

const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0]?.[0]?.toUpperCase() ?? '?';
};

const AVATAR_COLORS = [
  'from-indigo-500 to-indigo-700',
  'from-violet-500 to-violet-700',
  'from-sky-500 to-sky-700',
  'from-emerald-500 to-emerald-700',
  'from-rose-500 to-rose-700',
  'from-amber-500 to-amber-700',
];
const avatarColor = (name: string) => AVATAR_COLORS[(name.charCodeAt(0) || 0) % AVATAR_COLORS.length];

// ── CSO Card (left list) ───────────────────────────────────────────────────────
const CsoCard: React.FC<{ cso: SystemUser; isSelected: boolean; onClick: () => void }> = ({ cso, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 border ${
      isSelected
        ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-500/25'
        : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5'
    }`}
  >
    <div className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColor(cso.name)} flex items-center justify-center shadow-sm`}>
      <span className="text-xs font-black text-white">{getInitials(cso.name)}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>{cso.name}</p>
      <p className={`text-xs font-medium truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>{cso.phone ?? 'No phone'}</p>
    </div>
    <span
      className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
        isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
      }`}
    >
      {cso.status}
    </span>
  </button>
);

// ── Outlet Row (right, an assigned outlet) ─────────────────────────────────────
const OutletRow: React.FC<{
  assignment: CsoOutletAssignment;
  index: number;
  onReassign: () => void;
  canAssign: boolean;
}> = ({ assignment, index, onReassign, canAssign }) => (
  <div
    className="group flex items-center gap-4 px-5 py-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all"
    style={{ animationDelay: `${index * 40}ms` }}
  >
    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-800 truncate">{assignment.outletName}</p>
      <p className="text-xs text-slate-400 font-medium">
        Assigned {assignment.effectiveFrom ? new Date(assignment.effectiveFrom).toLocaleDateString() : '—'}
      </p>
    </div>
    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
    {canAssign && (
      <button
        onClick={onReassign}
        className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors opacity-0 group-hover:opacity-100"
        title="Reassign to another CSO"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m4 6H4m0 0l4 4m-4-4l4-4" />
        </svg>
        Reassign
      </button>
    )}
  </div>
);

// ── Right Panel Placeholder ────────────────────────────────────────────────────
const RightPanelPlaceholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-100 flex items-center justify-center mb-5 shadow-inner">
      <svg className="w-9 h-9 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    </div>
    <h3 className="text-base font-black text-slate-700 mb-2">Select a CSO</h3>
    <p className="text-sm text-slate-400 max-w-[240px] leading-relaxed">
      Pick a Customer Sales Officer from the list to view and manage their assigned outlets.
    </p>
  </div>
);

// ── Assign Outlets Modal (search outlets, assign to this CSO) ───────────────────
const AssignOutletsModal: React.FC<{
  cso: SystemUser;
  existingIds: string[];
  onClose: () => void;
  onAssigned: () => void;
}> = ({ cso, existingIds, onClose, onAssigned }) => {
  const { showToast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Outlet[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [picked, setPicked] = useState<Outlet[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!searchTerm.trim()) { setOptions([]); return; }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiService.outlets.list({ search: searchTerm, size: 20 });
        setOptions(res.success ? res.data.content : []);
      } catch {
        setOptions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const togglePick = (o: Outlet) => {
    if (existingIds.includes(o.id)) return;
    setPicked(prev => (prev.some(p => p.id === o.id) ? prev.filter(p => p.id !== o.id) : [...prev, o]));
  };

  const handleSave = async () => {
    if (picked.length === 0) return;
    setSubmitting(true);
    try {
      const results = await Promise.allSettled(picked.map(o => apiService.outlets.assignCso(o.id, cso.id)));
      const ok = results.filter(r => r.status === 'fulfilled' && (r.value as { success: boolean }).success).length;
      const failed = picked.length - ok;
      showToast(
        `${ok} outlet${ok !== 1 ? 's' : ''} assigned to ${cso.name}${failed ? ` · ${failed} failed` : ''}`,
        failed ? 'error' : 'success',
        4000,
      );
      onAssigned();
      onClose();
    } catch (err) {
      showToast(getErrorMessage(err), 'error', 4000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-black text-slate-900">Assign Outlets</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">to {cso.name}</p>
          </div>
          <button onClick={onClose} disabled={submitting} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40" aria-label="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 pt-4 pb-2 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              autoFocus
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search outlets by name…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            {isSearching && (
              <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <svg className="animate-spin w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              </div>
            )}
          </div>

          {picked.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3">
              {picked.map(o => (
                <span key={o.id} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {o.name}
                  <button type="button" onClick={() => setPicked(prev => prev.filter(p => p.id !== o.id))} className="p-0.5 hover:bg-indigo-200 rounded-md text-indigo-500 hover:text-indigo-800" aria-label={`Remove ${o.name}`}>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-[200px]">
          {!searchTerm.trim() ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <p className="text-xs text-slate-400 font-medium">Start typing to search outlets.</p>
            </div>
          ) : isSearching ? (
            <div className="space-y-2 pt-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />)}</div>
          ) : options.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <p className="text-xs text-slate-400 font-medium">No outlets found.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {options.map(o => {
                const isExisting = existingIds.includes(o.id);
                const isPicked = picked.some(p => p.id === o.id);
                return (
                  <li key={o.id}>
                    <button
                      type="button"
                      disabled={isExisting}
                      onClick={() => togglePick(o)}
                      className={`w-full flex items-center gap-3 py-3 text-left ${isExisting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-50 hover:px-3 hover:-mx-3 rounded-lg transition-all'}`}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center ${isPicked || isExisting ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                        {(isPicked || isExisting) && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{o.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">{[o.locality, o.city, o.outletStatus].filter(Boolean).join(' · ')}</p>
                      </div>
                      {isExisting && <span className="flex-shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">Already assigned</span>}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs font-medium text-slate-500">
            {picked.length > 0 ? <span>{picked.length} selected</span> : <span className="text-slate-400">No outlets selected</span>}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40">Cancel</button>
            <button
              type="button"
              onClick={handleSave}
              disabled={picked.length === 0 || submitting}
              className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {submitting ? 'Assigning…' : picked.length > 0 ? `Assign ${picked.length}` : 'Assign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Reassign Modal (move one outlet to another CSO) ────────────────────────────
const ReassignModal: React.FC<{
  assignment: CsoOutletAssignment;
  currentCso: SystemUser;
  csoOptions: SystemUser[];
  onClose: () => void;
  onReassigned: () => void;
}> = ({ assignment, currentCso, csoOptions, onClose, onReassigned }) => {
  const { showToast } = useToast();
  const [query, setQuery] = useState('');
  const [targetId, setTargetId] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const candidates = useMemo(() => {
    const q = query.trim().toLowerCase();
    return csoOptions
      .filter(c => c.id !== currentCso.id)
      .filter(c => !q || c.name.toLowerCase().includes(q) || (c.phone ?? '').includes(q));
  }, [csoOptions, currentCso.id, query]);

  const handleConfirm = async () => {
    if (!targetId) return;
    setSubmitting(true);
    try {
      const res = await apiService.outlets.assignCso(assignment.outletId, targetId, reason.trim() || undefined);
      if (res.success) {
        const target = csoOptions.find(c => c.id === targetId);
        showToast(`${assignment.outletName} reassigned${target ? ` to ${target.name}` : ''}`, 'success', 4000);
        onReassigned();
        onClose();
      } else {
        showToast(res.error || 'Failed to reassign outlet.', 'error', 4000);
        setSubmitting(false);
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error', 4000);
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-black text-slate-900">Reassign Outlet</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">{assignment.outletName} · from {currentCso.name}</p>
          </div>
          <button onClick={onClose} disabled={submitting} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40" aria-label="Close">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 pt-4 pb-2 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search CSO to reassign to…"
              className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-[160px]">
          {candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <p className="text-xs text-slate-400 font-medium">No other CSOs found.</p>
            </div>
          ) : (
            <ul className="space-y-1.5 py-1">
              {candidates.map(c => (
                <li key={c.id}>
                  <button
                    type="button"
                    onClick={() => setTargetId(c.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left border transition-all ${targetId === c.id ? 'bg-indigo-50 border-indigo-200' : 'border-transparent hover:bg-slate-50'}`}
                  >
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br ${avatarColor(c.name)} flex items-center justify-center`}>
                      <span className="text-[10px] font-black text-white">{getInitials(c.name)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{c.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{c.phone ?? 'No phone'}</p>
                    </div>
                    <div className={`flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center ${targetId === c.id ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                      {targetId === c.id && <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-6 pt-2 pb-4 border-t border-slate-100 flex-shrink-0">
          <input
            type="text"
            value={reason}
            onChange={e => setReason(e.target.value)}
            placeholder="Reason (optional)"
            className="w-full px-3 py-2 mb-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={onClose} disabled={submitting} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40">Cancel</button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!targetId || submitting}
              className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>}
              {submitting ? 'Reassigning…' : 'Reassign'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ──────────────────────────────────────────────────────────────────
const CsoOutletLookupPage: React.FC = () => {
  const { user } = useAuth();
  const canAssign = user ? ASSIGN_ROLES.includes(user.role) : false;

  const [csoList, setCsoList] = useState<SystemUser[]>([]);
  const [csoLoading, setCsoLoading] = useState(true);
  const [csoError, setCsoError] = useState<string | null>(null);

  const [selectedCso, setSelectedCso] = useState<SystemUser | null>(null);
  const [outlets, setOutlets] = useState<CsoOutletAssignment[]>([]);
  const [outletsLoading, setOutletsLoading] = useState(false);
  const [outletsError, setOutletsError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [pendingReassign, setPendingReassign] = useState<CsoOutletAssignment | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setCsoLoading(true);
        const res = await apiService.users.getByRole('CSO');
        if (res.success) setCsoList(res.data);
        else setCsoError('Failed to load CSOs.');
      } catch {
        setCsoError('An error occurred while fetching CSOs.');
      } finally {
        setCsoLoading(false);
      }
    };
    load();
  }, []);

  const loadOutlets = async (csoId: string) => {
    try {
      setOutletsLoading(true);
      setOutletsError(null);
      const res = await apiService.outlets.byCso(csoId);
      if (res.success) setOutlets(res.data);
      else setOutletsError('Could not load outlets for this CSO.');
    } catch {
      setOutletsError('An error occurred while fetching outlets.');
    } finally {
      setOutletsLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedCso) { setOutlets([]); return; }
    loadOutlets(selectedCso.id);
  }, [selectedCso]);

  const filteredCsos = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return csoList;
    return csoList.filter(c => c.name.toLowerCase().includes(q) || (c.phone ?? '').includes(q));
  }, [csoList, query]);

  return (
    <div className="flex flex-col h-full gap-0 -m-6">
      {/* Header */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">CSO Outlet Lookup</h1>
            <p className="text-sm text-slate-500 font-medium">Search a Customer Sales Officer and manage their assigned outlets</p>
          </div>
          {!csoLoading && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-500">{csoList.length} CSOs loaded</span>
            </div>
          )}
        </div>
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1 min-h-0">
        {/* LEFT: CSO list */}
        <div className="w-80 flex-shrink-0 border-r border-slate-100 bg-slate-50 flex flex-col min-h-0">
          <div className="p-4 border-b border-slate-100 bg-white flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Search by name or phone…"
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              )}
            </div>
            {query && <p className="text-xs text-slate-400 font-medium mt-2 pl-1">{filteredCsos.length} result{filteredCsos.length !== 1 ? 's' : ''}</p>}
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {csoLoading ? (
              Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-xl border border-slate-100 animate-pulse" />)
            ) : csoError ? (
              <div className="text-center py-10"><p className="text-sm text-red-500 font-medium">{csoError}</p></div>
            ) : filteredCsos.length === 0 ? (
              <div className="text-center py-10"><p className="text-sm text-slate-400 font-medium">No CSOs match your search.</p></div>
            ) : (
              filteredCsos.map(cso => (
                <CsoCard key={cso.id} cso={cso} isSelected={selectedCso?.id === cso.id} onClick={() => setSelectedCso(cso)} />
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Outlet detail panel */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
          {!selectedCso ? (
            <RightPanelPlaceholder />
          ) : (
            <>
              {/* CSO profile header */}
              <div className="px-6 py-5 bg-white border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColor(selectedCso.name)} flex items-center justify-center shadow-md`}>
                    <span className="text-sm font-black text-white">{getInitials(selectedCso.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">{selectedCso.name}</h2>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {selectedCso.phone ?? '—'}
                      </span>
                      <span className="text-slate-200">|</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">{selectedCso.status}</span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">{selectedCso.role}</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCso(null)} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors" aria-label="Clear selection">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              </div>

              {/* Outlets section header */}
              <div className="px-6 pt-5 pb-3 flex-shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Assigned Outlets</h3>
                  {!outletsLoading && !outletsError && (
                    <p className="text-xs text-slate-400 font-medium mt-0.5">{outlets.length} outlet{outlets.length !== 1 ? 's' : ''} assigned</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {outletsLoading && (
                    <div className="flex items-center gap-2 text-xs font-medium text-indigo-500">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                      Loading…
                    </div>
                  )}
                  {canAssign && (
                    <button onClick={() => setAssignModalOpen(true)} disabled={outletsLoading} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                      Assign Outlets
                    </button>
                  )}
                </div>
              </div>

              {/* Outlet list */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {outletsLoading ? (
                  <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 bg-white rounded-xl border border-slate-100 animate-pulse" />)}</div>
                ) : outletsError ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-slate-600 mb-1">Error loading outlets</p>
                    <p className="text-xs text-slate-400">{outletsError}</p>
                  </div>
                ) : outlets.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </div>
                    <p className="text-sm font-bold text-slate-600 mb-1">No outlets assigned</p>
                    <p className="text-xs text-slate-400 mb-4">This CSO has no outlets assigned yet.</p>
                    {canAssign && (
                      <button onClick={() => setAssignModalOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                        Assign an outlet
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {outlets.map((a, i) => (
                      <OutletRow key={a.id} assignment={a} index={i} canAssign={canAssign} onReassign={() => setPendingReassign(a)} />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {assignModalOpen && selectedCso && (
        <AssignOutletsModal
          cso={selectedCso}
          existingIds={outlets.map(o => o.outletId)}
          onClose={() => setAssignModalOpen(false)}
          onAssigned={() => loadOutlets(selectedCso.id)}
        />
      )}
      {pendingReassign && selectedCso && (
        <ReassignModal
          assignment={pendingReassign}
          currentCso={selectedCso}
          csoOptions={csoList}
          onClose={() => setPendingReassign(null)}
          onReassigned={() => loadOutlets(selectedCso.id)}
        />
      )}
    </div>
  );
};

export default CsoOutletLookupPage;
