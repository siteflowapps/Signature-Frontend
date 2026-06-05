import React, { useEffect, useRef, useState } from 'react';
import { apiService } from '../network/apiService';
import { Location, SystemUser } from '../types';

const OUTLET_STATUS_OPTIONS = [
  { value: 'DRAFT_KYC', label: 'Draft KYC' },
  { value: 'ASM_PENDING', label: 'ASM Pending' },
  { value: 'ASM_APPROVED', label: 'ASM Approved' },
  { value: 'REJECTED', label: 'Rejected' },
  { value: 'SUSPENDED', label: 'Suspended' },
  { value: 'INACTIVE', label: 'Inactive' },
];

const formatStatus = (value: string) =>
  OUTLET_STATUS_OPTIONS.find(o => o.value === value)?.label || value.replace(/_/g, ' ');

interface OutletFilterBarProps {
  outletStatus: string | null;
  setOutletStatus: (v: string | null) => void;
  locationId: string | null;
  setLocationId: (v: string | null) => void;
  aseId: string | null;
  setAseId: (v: string | null) => void;
  isFiltered: boolean;
  clearAllFilters: () => void;
}

/**
 * Inline pill-style filter bar for the Outlets list.
 * Three popover triggers (Status / Location / ASE) plus active-filter chips below.
 */
export const OutletFilterBar: React.FC<OutletFilterBarProps> = ({
  outletStatus,
  setOutletStatus,
  locationId,
  setLocationId,
  aseId,
  setAseId,
  isFiltered,
  clearAllFilters,
}) => {
  // Track captions for the UUID-based filters so chips can display human names.
  const [locationLabel, setLocationLabel] = useState<string | null>(null);
  const [aseLabel, setAseLabel] = useState<string | null>(null);

  useEffect(() => { if (!locationId) setLocationLabel(null); }, [locationId]);
  useEffect(() => { if (!aseId) setAseLabel(null); }, [aseId]);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <StatusFilterPill
          value={outletStatus}
          onChange={setOutletStatus}
        />
        <LocationFilterPill
          value={locationId}
          label={locationLabel}
          onChange={(id, loc) => {
            setLocationId(id);
            setLocationLabel(loc ? `${loc.pincode} · ${loc.city}` : null);
          }}
        />
        <AseFilterPill
          value={aseId}
          label={aseLabel}
          onChange={(id, name) => {
            setAseId(id);
            setAseLabel(name);
          }}
        />
        {isFiltered && (
          <button
            onClick={clearAllFilters}
            className="ml-auto text-xs font-bold text-slate-500 hover:text-slate-900 underline underline-offset-2 transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Active filter chips */}
      {isFiltered && (
        <div className="flex flex-wrap gap-1.5">
          {outletStatus && (
            <FilterChip label={`Status: ${formatStatus(outletStatus)}`} onClear={() => setOutletStatus(null)} />
          )}
          {locationId && (
            <FilterChip label={`Location: ${locationLabel || locationId.slice(0, 8)}`} onClear={() => setLocationId(null)} />
          )}
          {aseId && (
            <FilterChip label={`ASE: ${aseLabel || aseId.slice(0, 8)}`} onClear={() => setAseId(null)} />
          )}
        </div>
      )}
    </div>
  );
};

// ─── Shared pieces ────────────────────────────────────────────────────────────

const FilterChip: React.FC<{ label: string; onClear: () => void }> = ({ label, onClear }) => (
  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
    {label}
    <button onClick={onClear} className="hover:text-indigo-900 transition-colors" aria-label={`Clear ${label}`}>
      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
    </button>
  </span>
);

interface PillTriggerProps {
  label: string;
  hasValue: boolean;
  onClick: () => void;
}
const PillTrigger: React.FC<PillTriggerProps> = ({ label, hasValue, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
      hasValue
        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-500/20'
        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:text-slate-900'
    }`}
  >
    {label}
    <svg className="w-3 h-3 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" /></svg>
  </button>
);

const Popover: React.FC<{ open: boolean; onClose: () => void; children: React.ReactNode }> = ({ open, onClose, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div ref={ref} className="absolute z-30 mt-1 w-72 bg-white border border-slate-200 rounded-xl shadow-xl shadow-slate-900/10 overflow-hidden">
      {children}
    </div>
  );
};

// ─── Status filter ────────────────────────────────────────────────────────────

const StatusFilterPill: React.FC<{ value: string | null; onChange: (v: string | null) => void }> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const triggerLabel = value ? `Status: ${formatStatus(value)}` : 'Status';
  return (
    <div className="relative">
      <PillTrigger label={triggerLabel} hasValue={!!value} onClick={() => setOpen(o => !o)} />
      <Popover open={open} onClose={() => setOpen(false)}>
        <div className="py-1 max-h-72 overflow-y-auto">
          <button
            onClick={() => { onChange(null); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-xs font-bold transition-colors ${!value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
          >
            All statuses
          </button>
          <div className="h-px bg-slate-100 my-1" />
          {OUTLET_STATUS_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold transition-colors ${value === opt.value ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </Popover>
    </div>
  );
};

// ─── Location filter (pincode lookup) ─────────────────────────────────────────

const LocationFilterPill: React.FC<{
  value: string | null;
  label: string | null;
  onChange: (id: string | null, location: Location | null) => void;
}> = ({ value, label, onChange }) => {
  const [open, setOpen] = useState(false);
  const [pincode, setPincode] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!open || pincode.trim().length < 3) { setResults([]); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await apiService.locations.searchByPincode(pincode.trim());
        setResults(res.success ? res.data || [] : []);
        if (!res.success) setErr('No matches.');
      } catch {
        setErr('Failed to load locations.');
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [pincode, open]);

  const triggerLabel = value ? `Location: ${label || value.slice(0, 8)}` : 'Location';

  return (
    <div className="relative">
      <PillTrigger label={triggerLabel} hasValue={!!value} onClick={() => setOpen(o => !o)} />
      <Popover open={open} onClose={() => setOpen(false)}>
        <div className="p-2">
          <input
            type="text"
            autoFocus
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
            placeholder="Type pincode…"
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <div className="max-h-64 overflow-y-auto pb-1">
          {value && (
            <button
              onClick={() => { onChange(null, null); setOpen(false); setPincode(''); setResults([]); }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              Clear location
            </button>
          )}
          {loading && <div className="px-3 py-3 text-xs text-slate-400">Searching…</div>}
          {!loading && pincode.trim().length < 3 && !value && (
            <div className="px-3 py-3 text-xs text-slate-400">Enter at least 3 digits.</div>
          )}
          {!loading && err && <div className="px-3 py-3 text-xs text-red-500">{err}</div>}
          {!loading && results.map(loc => (
            <button
              key={loc.id}
              onClick={() => {
                onChange(loc.id, loc);
                setOpen(false);
                setPincode('');
                setResults([]);
              }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${value === loc.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              <div className="font-bold">{loc.pincode}</div>
              <div className="text-[11px] text-slate-500">{[loc.city, loc.state].filter(Boolean).join(', ')}</div>
            </button>
          ))}
        </div>
      </Popover>
    </div>
  );
};

// ─── ASE filter (list + client-side search) ───────────────────────────────────

const AseFilterPill: React.FC<{
  value: string | null;
  label: string | null;
  onChange: (id: string | null, name: string | null) => void;
}> = ({ value, label, onChange }) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [ases, setAses] = useState<SystemUser[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Lazy-load ASEs the first time the popover opens.
  useEffect(() => {
    if (!open || loaded) return;
    setLoading(true);
    apiService.users.getByRole('ASE')
      .then(res => {
        if (res.success) setAses(res.data || []);
        else setErr('Could not load ASEs.');
        setLoaded(true);
      })
      .catch(() => setErr('Failed to load ASEs.'))
      .finally(() => setLoading(false));
  }, [open, loaded]);

  const filtered = query.trim()
    ? ases.filter(u => (u.name || '').toLowerCase().includes(query.trim().toLowerCase()))
    : ases;

  const triggerLabel = value ? `ASE: ${label || value.slice(0, 8)}` : 'ASE';

  return (
    <div className="relative">
      <PillTrigger label={triggerLabel} hasValue={!!value} onClick={() => setOpen(o => !o)} />
      <Popover open={open} onClose={() => setOpen(false)}>
        <div className="p-2">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search ASE by name…"
            className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none"
          />
        </div>
        <div className="max-h-64 overflow-y-auto pb-1">
          {value && (
            <button
              onClick={() => { onChange(null, null); setOpen(false); setQuery(''); }}
              className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              Clear ASE
            </button>
          )}
          {loading && <div className="px-3 py-3 text-xs text-slate-400">Loading ASEs…</div>}
          {!loading && err && <div className="px-3 py-3 text-xs text-red-500">{err}</div>}
          {!loading && !err && filtered.length === 0 && (
            <div className="px-3 py-3 text-xs text-slate-400">No ASEs match.</div>
          )}
          {!loading && filtered.map(ase => (
            <button
              key={ase.id}
              onClick={() => { onChange(ase.id, ase.name); setOpen(false); setQuery(''); }}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${value === ase.id ? 'bg-indigo-50 text-indigo-700' : 'text-slate-700 hover:bg-slate-50'}`}
            >
              <div className="font-bold">{ase.name}</div>
            </button>
          ))}
        </div>
      </Popover>
    </div>
  );
};
