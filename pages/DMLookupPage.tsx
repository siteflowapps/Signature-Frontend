
import React, { useEffect, useState, useMemo } from 'react';
import { apiService } from '../network/apiService';
import { SystemUser, Distributor, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';

interface DmDistributor {
  id: string;
  name: string;
}

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
const avatarColor = (name: string) => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ── DM Card ──────────────────────────────────────────────────────────────────
const DmCard: React.FC<{
  dm: SystemUser;
  isSelected: boolean;
  onClick: () => void;
}> = ({ dm, isSelected, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group border ${
      isSelected
        ? 'bg-indigo-600 border-indigo-600 shadow-lg shadow-indigo-500/25'
        : 'bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5'
    }`}
  >
    <div
      className={`flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br ${avatarColor(dm.name)} flex items-center justify-center shadow-sm`}
    >
      <span className="text-xs font-black text-white">{getInitials(dm.name)}</span>
    </div>
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
        {dm.name}
      </p>
      <p className={`text-xs font-medium truncate ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
        {dm.phone ?? 'No phone'}
      </p>
    </div>
    <span
      className={`flex-shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
        isSelected ? 'bg-white/20 text-white' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
      }`}
    >
      {dm.status}
    </span>
  </button>
);

// ── Distributor Row ───────────────────────────────────────────────────────────
const DistributorRow: React.FC<{ dist: DmDistributor; index: number; onUnlink: () => void; canUnlink: boolean }> = ({ dist, index, onUnlink, canUnlink }) => (
  <div
    className="group flex items-center gap-4 px-5 py-4 bg-white rounded-xl border border-slate-100 hover:border-indigo-100 hover:shadow-sm transition-all"
    style={{ animationDelay: `${index * 40}ms` }}
  >
    <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center">
      <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-bold text-slate-800 truncate">{dist.name}</p>
      <p className="text-xs text-slate-400 font-mono">{dist.id.slice(0, 8)}…</p>
    </div>
    <div className="flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
    {canUnlink && (
      <button
        onClick={onUnlink}
        className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
        aria-label={`Unlink ${dist.name}`}
        title="Unlink distributor"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3" />
        </svg>
      </button>
    )}
  </div>
);

// ── Right Panel Empty / Placeholder ──────────────────────────────────────────
const RightPanelPlaceholder: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-full text-center py-20 px-6">
    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-100 flex items-center justify-center mb-5 shadow-inner">
      <svg className="w-9 h-9 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
      </svg>
    </div>
    <h3 className="text-base font-black text-slate-700 mb-2">Select a DM</h3>
    <p className="text-sm text-slate-400 max-w-[220px] leading-relaxed">
      Pick a Distributor Manager from the list to view their mapped distributors.
    </p>
  </div>
);

// ── Add Distributors Modal ───────────────────────────────────────────────────
const AddDistributorsModal: React.FC<{
  dm: SystemUser;
  existingIds: string[];
  onClose: () => void;
  onSaved: (updated: DmDistributor[]) => void;
}> = ({ dm, existingIds, onClose, onSaved }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [options, setOptions] = useState<Distributor[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [picked, setPicked] = useState<Distributor[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search
  useEffect(() => {
    if (!searchTerm.trim()) {
      setOptions([]);
      return;
    }
    const t = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await apiService.distributors.search(searchTerm);
        setOptions(res.success ? res.data.content : []);
      } catch {
        setOptions([]);
      } finally {
        setIsSearching(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [searchTerm]);

  const togglePick = (d: Distributor) => {
    if (existingIds.includes(d.id)) return;
    setPicked((prev) =>
      prev.some((p) => p.id === d.id) ? prev.filter((p) => p.id !== d.id) : [...prev, d]
    );
  };

  const removePick = (id: string) => setPicked((prev) => prev.filter((p) => p.id !== id));

  const handleSave = async () => {
    if (picked.length === 0) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await apiService.dm.addDistributors(
        dm.id,
        picked.map((p) => p.id)
      );
      if (res.success) {
        onSaved(res.data);
        onClose();
      } else {
        setError('Failed to map distributors. Please try again.');
      }
    } catch {
      setError('An error occurred while mapping distributors.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-base font-black text-slate-900">Map Distributors</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate">to {dm.name}</p>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-40"
            aria-label="Close"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search input */}
        <div className="px-6 pt-4 pb-2 flex-shrink-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              autoFocus
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search distributors by name…"
              className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
              {isSearching && (
                <svg className="animate-spin w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
            </div>
          </div>

          {/* Picked chips */}
          {picked.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-3">
              {picked.map((d) => (
                <span
                  key={d.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  {d.name}
                  <button
                    type="button"
                    onClick={() => removePick(d.id)}
                    className="p-0.5 hover:bg-indigo-200 rounded-md text-indigo-500 hover:text-indigo-800"
                    aria-label={`Remove ${d.name}`}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto px-6 pb-2 min-h-[200px]">
          {!searchTerm.trim() ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <p className="text-xs text-slate-400 font-medium">Start typing to search distributors.</p>
            </div>
          ) : isSearching ? (
            <div className="space-y-2 pt-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-12 bg-slate-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : options.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-8">
              <p className="text-xs text-slate-400 font-medium">No distributors found.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {options.map((d) => {
                const isExisting = existingIds.includes(d.id);
                const isPicked = picked.some((p) => p.id === d.id);
                return (
                  <li key={d.id}>
                    <button
                      type="button"
                      disabled={isExisting}
                      onClick={() => togglePick(d)}
                      className={`w-full flex items-center gap-3 py-3 text-left ${
                        isExisting ? 'opacity-60 cursor-not-allowed' : 'hover:bg-indigo-50 hover:px-3 hover:-mx-3 rounded-lg transition-all'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center ${
                        isPicked || isExisting
                          ? 'bg-indigo-600 border-indigo-600'
                          : 'border-slate-300'
                      }`}>
                        {(isPicked || isExisting) && (
                          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{d.name}</p>
                        <p className="text-[11px] text-slate-400 truncate">
                          {[d.phone, d.address || d.gstNumber || d.id.slice(0, 8)].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                      {isExisting && (
                        <span className="flex-shrink-0 text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                          Already mapped
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs font-medium text-slate-500">
            {error ? (
              <span className="text-red-500">{error}</span>
            ) : picked.length > 0 ? (
              <span>{picked.length} selected</span>
            ) : (
              <span className="text-slate-400">No distributors selected</span>
            )}
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
              onClick={handleSave}
              disabled={picked.length === 0 || submitting}
              className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {submitting ? 'Saving…' : picked.length > 0 ? `Add ${picked.length}` : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Unlink Confirmation Modal ────────────────────────────────────────────────
const UnlinkConfirmModal: React.FC<{
  dm: SystemUser;
  distributor: DmDistributor;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}> = ({ dm, distributor, onCancel, onConfirm }) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await onConfirm();
    } catch {
      setError('Failed to unlink. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
        <div className="px-6 pt-6 pb-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-base font-black text-slate-900 mb-2">Unlink distributor?</h2>
          <p className="text-sm text-slate-500 leading-relaxed">
            <span className="font-bold text-slate-700">{distributor.name}</span> will be removed from{' '}
            <span className="font-bold text-slate-700">{dm.name}</span>. This action can be undone by re-mapping.
          </p>
          {error && (
            <p className="mt-3 text-xs font-medium text-red-500">{error}</p>
          )}
        </div>
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting}
            className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm shadow-red-500/25 transition-colors disabled:opacity-40 flex items-center gap-2"
          >
            {submitting && (
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
            {submitting ? 'Unlinking…' : 'Unlink'}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const DmLookupPage: React.FC = () => {
  const { user } = useAuth();
  const isReadOnly = user?.role === UserRole.BUSINESS_USER;

  const [dmList, setDmList] = useState<SystemUser[]>([]);
  const [dmLoading, setDmLoading] = useState(true);
  const [dmError, setDmError] = useState<string | null>(null);

  const [selectedDm, setSelectedDm] = useState<SystemUser | null>(null);
  const [distributors, setDistributors] = useState<DmDistributor[]>([]);
  const [distLoading, setDistLoading] = useState(false);
  const [distError, setDistError] = useState<string | null>(null);

  const [query, setQuery] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [pendingUnlink, setPendingUnlink] = useState<DmDistributor | null>(null);

  // Fetch all DMs on mount
  useEffect(() => {
    const load = async () => {
      try {
        setDmLoading(true);
        const res = await apiService.users.getByRole('DISTRIBUTOR_MANAGER');
        if (res.success) setDmList(res.data);
        else setDmError('Failed to load DMs.');
      } catch {
        setDmError('An error occurred while fetching DMs.');
      } finally {
        setDmLoading(false);
      }
    };
    load();
  }, []);

  // Fetch distributors when an DM is selected
  useEffect(() => {
    if (!selectedDm) { setDistributors([]); return; }
    const load = async () => {
      try {
        setDistLoading(true);
        setDistError(null);
        const res = await apiService.dm.getDistributors(selectedDm.id);
        if (res.success) setDistributors(res.data);
        else setDistError('Could not load distributors for this DM.');
      } catch {
        setDistError('An error occurred while fetching distributors.');
      } finally {
        setDistLoading(false);
      }
    };
    load();
  }, [selectedDm]);

  const filteredDms = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return dmList;
    return dmList.filter(
      (a) =>
        a.name.toLowerCase().includes(q) ||
        (a.phone ?? '').includes(q)
    );
  }, [dmList, query]);

  const handleUnlinkConfirm = async () => {
    if (!selectedDm || !pendingUnlink) return;
    const unlinkedId = pendingUnlink.id;
    const res = await apiService.dm.removeDistributors(selectedDm.id, [unlinkedId]);
    if (res.success) {
      setDistributors((prev) => prev.filter((d) => d.id !== unlinkedId));
      setPendingUnlink(null);
    } else {
      throw new Error('Failed to unlink');
    }
  };

  return (
    <div className="flex flex-col h-full gap-0 -m-6">
      {/* ── Page header ─────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4 bg-white border-b border-slate-100 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">DM Distributor Lookup</h1>
            <p className="text-sm text-slate-500 font-medium">
              Search a Distributor Manager and view their mapped distributors
            </p>
          </div>
          {!dmLoading && (
            <div className="ml-auto flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-100 rounded-full">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <span className="text-xs font-bold text-slate-500">{dmList.length} DMs loaded</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Two-panel body ──────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0">

        {/* LEFT: DM list */}
        <div className="w-80 flex-shrink-0 border-r border-slate-100 bg-slate-50 flex flex-col min-h-0">
          {/* Search */}
          <div className="p-4 border-b border-slate-100 bg-white flex-shrink-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="dm-search"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name or phone…"
                className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              />
              {query && (
                <button onClick={() => setQuery('')} className="absolute inset-y-0 right-3 flex items-center text-slate-400 hover:text-slate-600">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            {query && (
              <p className="text-xs text-slate-400 font-medium mt-2 pl-1">
                {filteredDms.length} result{filteredDms.length !== 1 ? 's' : ''}
              </p>
            )}
          </div>

          {/* DM list scroll area */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {dmLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-16 bg-white rounded-xl border border-slate-100 animate-pulse" />
              ))
            ) : dmError ? (
              <div className="text-center py-10">
                <p className="text-sm text-red-500 font-medium">{dmError}</p>
              </div>
            ) : filteredDms.length === 0 ? (
              <div className="text-center py-10">
                <p className="text-sm text-slate-400 font-medium">No DMs match your search.</p>
              </div>
            ) : (
              filteredDms.map((dm) => (
                <DmCard
                  key={dm.id}
                  dm={dm}
                  isSelected={selectedDm?.id === dm.id}
                  onClick={() => setSelectedDm(dm)}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT: Distributor detail panel */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
          {!selectedDm ? (
            <RightPanelPlaceholder />
          ) : (
            <>
              {/* DM profile header */}
              <div className="px-6 py-5 bg-white border-b border-slate-100 flex-shrink-0">
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${avatarColor(selectedDm.name)} flex items-center justify-center shadow-md`}
                  >
                    <span className="text-sm font-black text-white">{getInitials(selectedDm.name)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-black text-slate-900 tracking-tight truncate">{selectedDm.name}</h2>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        {selectedDm.phone ?? '—'}
                      </span>
                      <span className="text-slate-200">|</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                        {selectedDm.status}
                      </span>
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full">
                        {selectedDm.role}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedDm(null)}
                    className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                    aria-label="Clear selection"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Distributors section header */}
              <div className="px-6 pt-5 pb-3 flex-shrink-0 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                    Mapped Distributors
                  </h3>
                  {!distLoading && !distError && (
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      {distributors.length} distributor{distributors.length !== 1 ? 's' : ''} assigned
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {distLoading && (
                    <div className="flex items-center gap-2 text-xs font-medium text-indigo-500">
                      <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Loading…
                    </div>
                  )}
                  {!isReadOnly && (
                    <button
                      onClick={() => setAddModalOpen(true)}
                      disabled={distLoading}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                      </svg>
                      Add Distributors
                    </button>
                  )}
                </div>
              </div>

              {/* Distributor list */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {distLoading ? (
                  <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-16 bg-white rounded-xl border border-slate-100 animate-pulse" />
                    ))}
                  </div>
                ) : distError ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-600 mb-1">Error loading distributors</p>
                    <p className="text-xs text-slate-400">{distError}</p>
                  </div>
                ) : distributors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-slate-600 mb-1">No distributors mapped</p>
                    <p className="text-xs text-slate-400 mb-4">This DM has no distributors assigned yet.</p>
                    {!isReadOnly && (
                      <button
                        onClick={() => setAddModalOpen(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                        </svg>
                        Map a distributor
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {distributors.map((dist, i) => (
                      <DistributorRow
                        key={dist.id}
                        dist={dist}
                        index={i}
                        onUnlink={() => setPendingUnlink(dist)}
                        canUnlink={!isReadOnly}
                      />
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {addModalOpen && selectedDm && (
        <AddDistributorsModal
          dm={selectedDm}
          existingIds={distributors.map((d) => d.id)}
          onClose={() => setAddModalOpen(false)}
          onSaved={(updated) => setDistributors(updated)}
        />
      )}
      {pendingUnlink && selectedDm && (
        <UnlinkConfirmModal
          dm={selectedDm}
          distributor={pendingUnlink}
          onCancel={() => setPendingUnlink(null)}
          onConfirm={handleUnlinkConfirm}
        />
      )}
    </div>
  );
};

export default DmLookupPage;
