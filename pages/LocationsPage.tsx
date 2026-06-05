import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../network/apiService';
import { Location } from '../types';

type SearchState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'found'; locations: Location[]; pincode: string }
  | { status: 'not-found'; pincode: string }
  | { status: 'error'; pincode: string };

const RECENT_LIMIT = 5;

const LocationsPage: React.FC = () => {
  const [pincode, setPincode] = useState('');
  const [result, setResult] = useState<SearchState>({ status: 'idle' });
  const [recent, setRecent] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const runSearch = async (code: string) => {
    if (code.length !== 6) return;
    setResult({ status: 'loading' });
    try {
      const res = await apiService.locations.searchByPincode(code);
      if (res.success && res.data && res.data.length > 0) {
        setResult({ status: 'found', locations: res.data, pincode: code });
      } else if (res.success) {
        setResult({ status: 'not-found', pincode: code });
      } else {
        setResult({ status: 'error', pincode: code });
      }
    } catch {
      setResult({ status: 'error', pincode: code });
    }
    setRecent((prev) => {
      const next = [code, ...prev.filter((p) => p !== code)];
      return next.slice(0, RECENT_LIMIT);
    });
  };

  // Fire search automatically when 6 digits typed
  useEffect(() => {
    if (pincode.length === 6) {
      runSearch(pincode);
    } else if (pincode.length === 0) {
      setResult({ status: 'idle' });
    } else {
      setResult({ status: 'idle' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pincode]);

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
  };

  const handleRecentClick = (code: string) => {
    setPincode(code);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    setPincode('');
    setResult({ status: 'idle' });
    inputRef.current?.focus();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pincode Availability</h1>
          <p className="text-sm text-slate-500 font-medium">
            Enter a 6-digit pincode to check if we service that area
          </p>
        </div>
      </div>

      {/* Search card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Pincode
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={pincode}
            onChange={handlePincodeChange}
            placeholder="e.g. 560001"
            className="w-full pl-12 pr-12 py-4 text-2xl font-bold tracking-[0.3em] font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl placeholder:text-slate-300 placeholder:font-medium placeholder:tracking-normal placeholder:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {pincode && (
            <button
              onClick={handleClear}
              className="absolute inset-y-0 right-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="Clear"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <p className="text-[11px] text-slate-400 font-medium mt-2">
          {pincode.length}/6 digits
        </p>

        {/* Recent searches */}
        {recent.length > 0 && (
          <div className="mt-5 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">
              Recent
            </p>
            <div className="flex flex-wrap gap-2">
              {recent.map((code) => (
                <button
                  key={code}
                  onClick={() => handleRecentClick(code)}
                  className="px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-200 text-xs font-mono font-bold text-slate-600 hover:text-indigo-700 transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Result */}
      <ResultView result={result} />
    </div>
  );
};

// ── Result View ──────────────────────────────────────────────────────────────
const ResultView: React.FC<{ result: SearchState }> = ({ result }) => {
  if (result.status === 'idle') {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3">
          <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-400">
          Enter a pincode above to check availability.
        </p>
      </div>
    );
  }

  if (result.status === 'loading') {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex items-center gap-3 text-indigo-600">
          <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm font-bold">Checking…</span>
        </div>
      </div>
    );
  }

  if (result.status === 'found') {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center shadow-md shadow-emerald-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-black text-emerald-800">Service available</p>
            <p className="text-xs font-medium text-emerald-700">
              Pincode <span className="font-mono font-bold">{result.pincode}</span> is in our service area
            </p>
          </div>
        </div>
        <div className="space-y-2">
          {result.locations.map((loc) => (
            <div
              key={loc.id}
              className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-emerald-100"
            >
              <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 truncate">{loc.city}</p>
                <p className="text-xs font-medium text-slate-500">{loc.state}</p>
              </div>
              <span className="flex-shrink-0 text-xs font-mono font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                {loc.pincode}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (result.status === 'not-found') {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center shadow-md shadow-amber-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-amber-800">Not currently serviced</p>
            <p className="text-xs font-medium text-amber-700 mt-0.5">
              Pincode <span className="font-mono font-bold">{result.pincode}</span> is not in our service area yet. Try a nearby pincode.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // error
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-red-500 flex items-center justify-center shadow-md shadow-red-500/30">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="text-sm font-black text-red-800">Something went wrong</p>
          <p className="text-xs font-medium text-red-700 mt-0.5">
            We couldn't check pincode <span className="font-mono font-bold">{result.pincode}</span>. Please try again.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LocationsPage;
