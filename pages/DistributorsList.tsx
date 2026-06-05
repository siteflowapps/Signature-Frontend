import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDistributorsList } from '../hooks/useDistributorsList';
import { apiService } from '../network/apiService';
import { Icons } from '../constants';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole, Distributor } from '../types';
import { downloadCSV } from '../utils/csvExport';
import { getErrorMessage } from '../utils/errorUtils';
import { EditDistributorPanel } from '../components/EditDistributorPanel';

const formatDate = (dateString: string | undefined) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return '-';
  }
};

const getInitials = (name: string | undefined) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const getSafeEmail = (obj: any) => obj.email || obj.emailId || obj.emailAddress || obj.contactEmail || obj.Email;

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
        <div>
          <div className="h-3.5 bg-slate-200 rounded w-28 mb-1.5"></div>
          <div className="h-2.5 bg-slate-100 rounded w-36"></div>
        </div>
      </div>
    </td>
    <td className="py-4 px-6 hidden sm:table-cell"><div className="h-5 bg-slate-100 rounded w-20"></div></td>
    <td className="py-4 px-6 hidden sm:table-cell"><div className="h-5 bg-slate-100 rounded w-24"></div></td>
    <td className="py-4 px-6 hidden md:table-cell"><div className="h-5 bg-slate-200 rounded-lg w-32"></div></td>
    <td className="py-4 px-6 hidden lg:table-cell"><div className="h-5 bg-slate-100 rounded w-24"></div></td>
  </tr>
);

const BASE_TABLE_HEADERS = [
  { label: 'Distributor', className: '' },
  { label: 'DMS ID', className: 'hidden sm:table-cell' },
  { label: 'Contact', className: 'hidden sm:table-cell' },
  { label: 'Address', className: 'hidden md:table-cell' },
  { label: 'GST Number', className: 'hidden lg:table-cell' },
];
const ACTIONS_HEADER = { label: 'Actions', className: 'text-right' };

const DistributorsList: React.FC = () => {
  const {
    distributors,
    isLoading,
    isSearchMode,
    error,
    searchQuery,
    setSearchQuery,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
    refresh,
  } = useDistributorsList();

  const { user } = useAuth();
  const { showToast } = useToast();
  const isViewOnly = user?.role === UserRole.FINANCE_ADMIN || user?.role === UserRole.BUSINESS_USER || user?.role === UserRole.RBL || user?.role === UserRole.SM;
  const canDeactivateDistributors = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.BUSINESS_ADMIN;

  const tableHeaders = canDeactivateDistributors ? [...BASE_TABLE_HEADERS, ACTIONS_HEADER] : BASE_TABLE_HEADERS;

  // Local status overrides for instant UI feedback after successful deactivation.
  const [statusOverrides, setStatusOverrides] = useState<Record<string, string>>({});
  const getEffectiveStatus = (d: Distributor) => statusOverrides[d.id] ?? d.status ?? 'ACTIVE';

  const [pendingDeactivate, setPendingDeactivate] = useState<Distributor | null>(null);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);
  const [editingDistributor, setEditingDistributor] = useState<Distributor | null>(null);
  const [edits, setEdits] = useState<Record<string, Partial<Distributor>>>({});
  const applyEdits = (d: Distributor): Distributor => ({ ...d, ...edits[d.id] });

  const handleEditSuccess = (updated: Distributor) => {
    setEdits(prev => ({ ...prev, [updated.id]: { name: updated.name, address: updated.address, gstNumber: updated.gstNumber } }));
    refresh();
  };

  const handleConfirmDeactivate = async () => {
    if (!pendingDeactivate) return;
    setIsDeactivating(true);
    setDeactivateError(null);
    try {
      const res = await apiService.distributors.deactivate(pendingDeactivate.id);
      if (res.success) {
        setStatusOverrides((prev) => ({ ...prev, [pendingDeactivate.id]: 'INACTIVE' }));
        showToast(`${pendingDeactivate.name || 'Distributor'} deactivated`, 'success');
        setPendingDeactivate(null);
        refresh();
      } else {
        setDeactivateError(res.error || 'Failed to deactivate distributor.');
      }
    } catch (err) {
      setDeactivateError(getErrorMessage(err));
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleExportDistributors = async () => {
    if (totalElements === 0) return;
    try {
      showToast('Preparing export...', 'info', 2000);
      const response = await apiService.distributors.getAll(0, 5000);
      if (response.success && response.data?.content) {
        const fullData = response.data.content;
        downloadCSV({
          filename: 'distributors_export_full',
          headers: ['Name', 'DMS ID', 'Email', 'Phone', 'Address', 'GST Number', 'Created At'],
          rows: fullData.map(d => [
            d.name || '—', d.dmsId || '—', getSafeEmail(d) || '—', d.phone || '—', d.address || '—',
            d.gstNumber || '—', d.createdAt ? formatDate(d.createdAt) : '—',
          ]),
        });
        showToast('Export successful!', 'success', 2000);
      } else {
        showToast('Export failed to load data.', 'error', 3000);
      }
    } catch (err: unknown) {
      showToast('Export error: ' + getErrorMessage(err), 'error', 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Distributors</h2>
            {!isLoading && totalElements > 0 && (
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200/50 uppercase tracking-tighter mt-1">
                {totalElements} Total
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-0.5">Manage your distribution network and partners.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportDistributors}
            disabled={isLoading || distributors.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-fit"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export Excel
          </button>
          {!isViewOnly && (
            <Link
              to="/distributors/add"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-[0.98] w-fit"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Distributor
            </Link>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          {isLoading && searchQuery ? (
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
          <input
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search distributors by name, address, or GST…"
            className="w-full pl-10 pr-10 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        {isSearchMode && !isLoading && (
          <div className="flex-shrink-0 self-center text-xs font-semibold text-slate-400 whitespace-nowrap">
            {totalElements} match{totalElements !== 1 ? 'es' : ''}
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 flex items-center justify-between gap-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="text-[10px] font-bold uppercase tracking-widest bg-white border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {isLoading && (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {tableHeaders.map((h) => (
                  <th key={h.label} className={`text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${h.className}`}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        )}

        {!isLoading && distributors.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.Distributors />
              </div>
              <p className="text-slate-500 font-medium mb-2">
                {searchQuery ? 'No matching distributors' : 'No distributors found'}
              </p>
              <p className="text-slate-400 text-sm">
                {searchQuery ? 'Try adjusting your search.' : 'Add distributors to see them listed here.'}
              </p>
            </div>
          </div>
        )}

        {!isLoading && distributors.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {tableHeaders.map((h) => (
                      <th key={h.label} className={`text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${h.className}`}>{h.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {distributors.map((raw) => {
                    const dist = applyEdits(raw);
                    return (
                    <tr key={dist.id} className="hover:bg-slate-50/20 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 bg-indigo-100 text-indigo-700">
                            {getInitials(dist.name)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-bold text-slate-900 truncate">{dist.name}</div>
                            {getSafeEmail(dist) && <div className="text-xs text-slate-400 truncate">{getSafeEmail(dist)}</div>}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 hidden sm:table-cell">
                        <span className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold text-slate-700 font-mono tracking-tight uppercase">
                          {dist.dmsId || '-'}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 hidden sm:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm text-slate-600 font-medium">{dist.phone || '-'}</span>
                          {dist.phone && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigator.clipboard.writeText(dist.phone || '');
                                showToast('Phone number copied!', 'success', 2000);
                              }}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors relative z-10 cursor-pointer"
                              title="Copy phone number"
                            >
                              <svg className="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 hidden md:table-cell">
                        <div className="text-sm text-slate-600 max-w-xs truncate" title={dist.address}>{dist.address || '-'}</div>
                      </td>
                      <td className="py-3.5 px-6 hidden lg:table-cell">
                        <div className="flex items-center gap-1.5">
                          <span className="bg-slate-50 border border-slate-200 px-2 py-1 rounded text-[10px] font-bold text-slate-700 font-mono tracking-tight uppercase">
                            {dist.gstNumber || '-'}
                          </span>
                          {dist.gstNumber && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                navigator.clipboard.writeText(dist.gstNumber || '');
                                showToast('GST number copied!', 'success', 2000);
                              }}
                              className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors relative z-10 cursor-pointer"
                              title="Copy GST number"
                            >
                              <svg className="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </td>
                      {canDeactivateDistributors && (
                        <td className="py-3.5 px-6 text-right">
                          {(() => {
                            const eff = getEffectiveStatus(dist);
                            if (eff !== 'ACTIVE') {
                              return (
                                <div className="inline-flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setEditingDistributor(dist)}
                                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 transition-colors"
                                    title={`Edit ${dist.name || 'distributor'}`}
                                  >
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Edit
                                  </button>
                                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border bg-slate-50 text-slate-500 border-slate-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                    {eff}
                                  </span>
                                </div>
                              );
                            }
                            return (
                              <div className="inline-flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setEditingDistributor(dist)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 transition-colors"
                                  title={`Edit ${dist.name || 'distributor'}`}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { setPendingDeactivate(dist); setDeactivateError(null); }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-[11px] font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 transition-colors"
                                  title={`Deactivate ${dist.name || 'distributor'}`}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                  </svg>
                                  Deactivate
                                </button>
                              </div>
                            );
                          })()}
                        </td>
                      )}
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-600">
                <span>Page {currentPage + 1} of {Math.max(totalPages, 1)}</span>
                <span className="ml-2">•</span>
                <span className="ml-2">{distributors.length} of {totalElements} distributors</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0 || isLoading}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >← Previous</button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1 || isLoading}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >Next →</button>
              </div>
            </div>
          </>
        )}
      </div>

      <EditDistributorPanel
        isOpen={Boolean(editingDistributor)}
        distributor={editingDistributor}
        onClose={() => setEditingDistributor(null)}
        onSuccess={handleEditSuccess}
      />

      {/* Deactivate Distributor Confirmation Modal */}
      {pendingDeactivate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="px-6 pt-6 pb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <h2 className="text-base font-black text-slate-900 mb-2">Deactivate this distributor?</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700">{pendingDeactivate.name || 'This distributor'}</span> will be marked
                <span className="font-bold text-slate-700"> INACTIVE</span>. Any mappings (e.g. ASE links) and historical
                data are preserved.
              </p>
              {deactivateError && (
                <p className="mt-3 text-xs font-medium text-red-500">{deactivateError}</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setPendingDeactivate(null); setDeactivateError(null); }}
                disabled={isDeactivating}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDeactivate}
                disabled={isDeactivating}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm shadow-red-500/25 transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {isDeactivating && (
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {isDeactivating ? 'Deactivating…' : 'Deactivate Distributor'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DistributorsList;
