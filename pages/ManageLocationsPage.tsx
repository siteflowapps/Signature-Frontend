import React, { useEffect, useMemo, useRef, useState } from 'react';
import { apiService } from '../network/apiService';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorUtils';
import { Location, LocationBulkUploadResult } from '../types';

/**
 * Locations management for NHQ / Business Admins.
 * - View: paginated list of locations (pincode / city / state).
 * - Add: bulk upload via Excel/CSV (the backend has no single-create endpoint).
 */
const ManageLocationsPage: React.FC = () => {
  const { showToast } = useToast();

  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [lastResult, setLastResult] = useState<LocationBulkUploadResult | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadLocations = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.locations.getAll();
      if (res.success) {
        setLocations(res.data || []);
      } else {
        setError('Failed to load locations');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLocations();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return locations;
    return locations.filter(
      l =>
        l.pincode?.toLowerCase().includes(q) ||
        l.city?.toLowerCase().includes(q) ||
        l.state?.toLowerCase().includes(q),
    );
  }, [locations, query]);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Reset the input so selecting the same file again re-triggers onChange
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;

    setIsUploading(true);
    setLastResult(null);
    try {
      const res = await apiService.locations.bulkUpload(file);
      if (res.success && res.data) {
        const r = res.data;
        setLastResult(r);
        showToast(
          `Upload complete — ${r.created} added, ${r.updated} updated, ${r.skipped} skipped`,
          r.errors.length > 0 ? 'error' : 'success',
          4000,
        );
        await loadLocations();
      } else {
        showToast(res.error || 'Failed to upload locations', 'error', 4000);
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error', 4000);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Locations</h2>
          <p className="text-slate-400 text-sm mt-0.5">View serviceable locations and add new ones in bulk.</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileSelected}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/25 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isUploading ? (
              <>
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Uploading…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Add Locations
              </>
            )}
          </button>
        </div>
      </div>

      {/* Upload hint */}
      <p className="text-xs text-slate-400">
        Upload an Excel/CSV file with columns <span className="font-semibold text-slate-500">pincode</span>,{' '}
        <span className="font-semibold text-slate-500">city</span>, <span className="font-semibold text-slate-500">state</span>.
      </p>

      {/* Last upload summary */}
      {lastResult && (
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm">
          <p className="font-bold text-slate-700 mb-1">Last upload</p>
          <p className="text-slate-600">
            {lastResult.totalRows} rows · <span className="text-emerald-600 font-semibold">{lastResult.created} added</span> ·{' '}
            <span className="text-blue-600 font-semibold">{lastResult.updated} updated</span> ·{' '}
            <span className="text-slate-500 font-semibold">{lastResult.skipped} skipped</span>
          </p>
          {lastResult.errors.length > 0 && (
            <ul className="mt-2 space-y-1 text-xs text-red-600">
              {lastResult.errors.slice(0, 10).map((er, i) => (
                <li key={i}>Row {er.row}: {er.message}</li>
              ))}
              {lastResult.errors.length > 10 && <li>…and {lastResult.errors.length - 10} more</li>}
            </ul>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Search by pincode, city, or state…"
          className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            {loading ? 'Loading…' : `${filtered.length} location${filtered.length === 1 ? '' : 's'}`}
          </span>
        </div>

        {error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : loading ? (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-slate-100 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-400">
            {query ? 'No locations match your search.' : 'No locations yet. Use “Add Locations” to upload.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-3">Pincode</th>
                  <th className="px-5 py-3">City</th>
                  <th className="px-5 py-3">State</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(loc => (
                  <tr key={loc.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3 font-bold text-slate-900">{loc.pincode}</td>
                    <td className="px-5 py-3 text-slate-700">{loc.city}</td>
                    <td className="px-5 py-3 text-slate-700">{loc.state}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageLocationsPage;
