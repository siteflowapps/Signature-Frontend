import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../network/apiService';
import { Location } from '../types';

interface LocationPincodeSelectProps {
  value: string;
  onChange: (id: string, location: Location | null) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  initialLocation?: Location | null;
  placeholder?: string;
}

export const LocationPincodeSelect: React.FC<LocationPincodeSelectProps> = ({
  value,
  onChange,
  label = 'Location',
  required = false,
  disabled = false,
  initialLocation = null,
  placeholder = 'Search by pincode…',
}) => {
  const [pincode, setPincode] = useState('');
  const [options, setOptions] = useState<Location[]>([]);
  const [selected, setSelected] = useState<Location | null>(initialLocation);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset selected if value was cleared by parent (e.g. after submit)
  useEffect(() => {
    if (!value && selected) {
      setSelected(null);
      setPincode('');
    }
  }, [value, selected]);

  // Search only on full 6-digit pincode (backend requires exact match)
  useEffect(() => {
    if (pincode.length !== 6) {
      setOptions([]);
      setError(null);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await apiService.locations.searchByPincode(pincode);
        if (cancelled) return;
        if (res.success) {
          setOptions(res.data ?? []);
        } else {
          setOptions([]);
          setError('Search failed. Try again.');
        }
      } catch {
        if (cancelled) return;
        setOptions([]);
        setError('Search failed. Try again.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [pincode]);

  const handleSelect = (loc: Location) => {
    setSelected(loc);
    onChange(loc.id, loc);
    setPincode('');
    setOptions([]);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelected(null);
    onChange('', null);
    setPincode('');
    setOptions([]);
  };

  const handlePincodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPincode(next);
    setIsOpen(true);
  };

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
        {label}
        {required && ' *'}
      </label>

      {selected ? (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-100 rounded-xl">
          <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-slate-800 truncate">
              {selected.city}, {selected.state}
            </p>
            <p className="text-xs font-medium text-slate-500 font-mono">{selected.pincode}</p>
          </div>
          {!disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              aria-label="Clear location"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      ) : (
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            value={pincode}
            onChange={handlePincodeChange}
            onFocus={() => setIsOpen(true)}
            disabled={disabled}
            placeholder={placeholder}
            className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all disabled:opacity-50"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
            {isLoading && (
              <svg className="animate-spin w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            )}
          </div>

          {isOpen && pincode.length === 6 && (
            <div className="absolute z-20 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-sm text-slate-500 font-medium">Searching…</div>
              ) : error ? (
                <div className="p-4 text-center text-sm text-red-500 font-medium">{error}</div>
              ) : options.length > 0 ? (
                <ul className="py-1">
                  {options.map((loc) => (
                    <li key={loc.id}>
                      <button
                        type="button"
                        onClick={() => handleSelect(loc)}
                        className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 transition-colors flex items-center gap-3"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-800 truncate">
                            {loc.city}, {loc.state}
                          </p>
                          <p className="text-[11px] text-slate-400 font-mono">{loc.pincode}</p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-4 text-center text-sm text-slate-500 font-medium">
                  No locations found for "{pincode}".
                </div>
              )}
            </div>
          )}
          {pincode.length > 0 && pincode.length < 6 && (
            <p className="text-[11px] text-slate-400 font-medium mt-1 pl-1">
              Enter full 6-digit pincode to search ({pincode.length}/6).
            </p>
          )}
        </div>
      )}
    </div>
  );
};
