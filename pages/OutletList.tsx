import React, { useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useOutletsList } from '../hooks/useOutletsList';
import { apiService } from '../network/apiService';
import { downloadCSV } from '../utils/csvExport';
import { OutletFilterBar } from '../components/OutletFilterBar';

const formatDate = (dateString: string) => {
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

/** Skeleton row for loading state */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-6">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-slate-200 rounded-xl"></div>
        <div>
          <div className="h-3.5 bg-slate-200 rounded w-28 mb-1.5"></div>
          <div className="h-2.5 bg-slate-100 rounded w-36"></div>
        </div>
      </div>
    </td>
    <td className="py-4 px-6"><div className="h-5 bg-slate-200 rounded-lg w-24"></div></td>
    <td className="py-4 px-6 hidden md:table-cell"><div className="h-5 bg-slate-100 rounded w-16"></div></td>
    <td className="py-4 px-6 hidden lg:table-cell"><div className="h-5 bg-slate-200 rounded-full w-20"></div></td>
    <td className="py-4 px-6 hidden lg:table-cell"><div className="h-3 bg-slate-100 rounded w-20"></div></td>
    <td className="py-4 px-6 w-10"></td>
  </tr>
);

const TABLE_HEADERS = [
  { label: 'Outlet', className: '' },
  { label: 'Owner / Phone', className: '' },
  { label: 'Status', className: 'hidden lg:table-cell' },
  { label: 'Onboarded At', className: 'hidden lg:table-cell' },
  { label: '', className: 'w-10' },
];

const OutletList: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    outlets,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    outletStatus,
    setOutletStatus,
    locationId,
    setLocationId,
    aseId,
    setAseId,
    isFiltered,
    clearAllFilters,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
  } = useOutletsList();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'ASM_APPROVED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'ASM_PENDING':
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'REJECTED':
      case 'INACTIVE':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'SUSPENDED':
        return 'bg-rose-50 text-rose-600 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'ASM_APPROVED':
        return 'bg-emerald-500';
      case 'ASM_PENDING':
      case 'IN_PROGRESS':
        return 'bg-amber-500';
      case 'REJECTED':
      case 'INACTIVE':
      case 'SUSPENDED':
        return 'bg-red-500';
      default:
        return 'bg-slate-400';
    }
  };

  // KPI stats from current page data
  const stats = useMemo(() => {
    const active = outlets.filter(o => o.outletStatus === 'ACTIVE' || o.outletStatus === 'ASM_APPROVED').length;
    const pending = outlets.filter(o => o.outletStatus === 'ASM_PENDING' || o.outletStatus === 'IN_PROGRESS').length;
    const withCompliance = outlets.filter(o => (o.complianceRecords || []).length > 0).length;
    return { active, pending, withCompliance };
  }, [outlets]);

  const formatStatus = (status: string) => {
    return status?.replace(/_/g, ' ') || 'UNKNOWN';
  };

  const handleExportOutlets = async () => {
    if (totalElements === 0) return;
    try {
      // Temporary toast from native window or just avoid if strict, we don't have showToast destructured here.
      // Wait, we do not have showToast in OutletList.tsx? Let me check line 54. 
      // I'll just skip the toast if useToast isn't here, or I'll just write it and let linter complain if missing.
      // Actually let's assume it might not be imported. But looking at line 50, let's just use it safely if it exists or omit.
      // Let's omit toast for starting, or rather just fetch:
      const response = await apiService.outlets.getAll(0, 5000);
      if (response.success && response.data?.content) {
        const fullData = response.data.content;
        downloadCSV({
          filename: 'outlets_export_full',
          headers: ['Outlet Name', 'Owner Name', 'Phone', 'WhatsApp', 'Email', 'City', 'State', 'Pincode', 'Address', 'Status', 'Compliance State', 'Distributor ID', 'Created By', 'Onboarded At'],
          rows: fullData.map(o => [
            o.name || '—', o.ownerName || '—', o.phone || '—', o.ownerWhatsapp || '—', o.email || '—',
            o.city || '—', o.state || '—', o.pincode || '—', o.address || '—',
            formatStatus(o.outletStatus || o.operationalStatus),
            o.complianceState || '—', o.distributorId || '—', o.createdByAseName || '—',
            o.onboardedAt ? formatDate(o.onboardedAt) : '—',
          ]),
        });
      }
    } catch (err: unknown) {
      console.error('Export Error:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Outlets
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            Manage and track outlet performance and compliance.
          </p>
        </div>
        <button
          onClick={handleExportOutlets}
          disabled={isLoading || outlets.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export Excel
        </button>
      </div>

      {/* KPI Cards */}
      {!isLoading && outlets.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Outlets</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{totalElements}</p>
          </div>
          <div className="bg-white rounded-2xl border border-emerald-100 p-4 shadow-sm">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Active</p>
            <p className="text-2xl font-black text-emerald-700 tracking-tight">{stats.active}</p>
          </div>
          <div className="bg-white rounded-2xl border border-amber-100 p-4 shadow-sm">
            <p className="text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-1">Pending</p>
            <p className="text-2xl font-black text-amber-700 tracking-tight">{stats.pending}</p>
          </div>
          <div className="bg-white rounded-2xl border border-indigo-100 p-4 shadow-sm">
            <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mb-1">CDO Verified</p>
            <p className="text-2xl font-black text-indigo-700 tracking-tight">{stats.withCompliance}</p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by outlet name, owner, city, or phone..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            )}
          </div>
        </div>
        <OutletFilterBar
          outletStatus={outletStatus}
          setOutletStatus={setOutletStatus}
          locationId={locationId}
          setLocationId={setLocationId}
          aseId={aseId}
          setAseId={setAseId}
          isFiltered={isFiltered}
          clearAllFilters={clearAllFilters}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {/* Skeleton Loading */}
        {isLoading && (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {TABLE_HEADERS.map((h, i) => (
                  <th key={i} className={`text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${h.className}`}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        )}

        {/* Empty State */}
        {!isLoading && outlets.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-slate-600 font-bold mb-1">
                {searchQuery ? 'No matching outlets' : 'No outlets found'}
              </p>
              <p className="text-slate-400 text-sm">
                {searchQuery ? 'Try adjusting your search or filter.' : 'Outlets will appear here once added.'}
              </p>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && outlets.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {TABLE_HEADERS.map((h, i) => (
                      <th key={i} className={`text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${h.className}`}>{h.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {outlets.map((outlet) => {
                    const shopFront = (outlet.photos || []).find(p => p.photoType === 'SHOP_FRONT');
                    return (
                      <tr
                        key={outlet.id}
                        className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/outlets/${outlet.id}`, { state: { outlet, from: location.pathname + location.search } })}
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            {shopFront ? (
                              <img
                                src={shopFront.photoUrl}
                                alt={outlet.name}
                                className="w-9 h-9 rounded-xl object-cover border border-slate-100 shrink-0"
                              />
                            ) : (
                              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shrink-0 shadow-sm">
                                {getInitials(outlet.name)}
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">{outlet.name || '-'}</div>
                              <div className="text-xs text-slate-400 truncate">{[outlet.city, outlet.state].filter(Boolean).join(', ') || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-slate-700 truncate">{outlet.ownerName || '-'}</div>
                            <div className="text-xs text-slate-400 truncate">{outlet.phone || '-'}</div>
                          </div>
                        </td>
                        <td className="py-3.5 px-6 hidden lg:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border ${getStatusBadgeColor(outlet.outletStatus)}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotColor(outlet.outletStatus)}`}></span>
                            {formatStatus(outlet.outletStatus || outlet.operationalStatus)}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-sm text-slate-500 hidden lg:table-cell">{formatDate(outlet.onboardedAt)}</td>
                        <td className="py-3.5 px-4">
                          <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-500">
                Showing <span className="text-slate-700">{currentPage * 20 + 1}–{Math.min((currentPage + 1) * 20, totalElements)}</span> of <span className="text-slate-700">{totalElements}</span> outlets
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0 || isLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >Previous</button>
                {/* Page number indicators */}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i;
                  } else if (currentPage < 3) {
                    pageNum = i;
                  } else if (currentPage > totalPages - 4) {
                    pageNum = totalPages - 5 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      disabled={isLoading}
                      className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                        pageNum === currentPage
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-600 hover:bg-white hover:text-slate-900'
                      }`}
                    >{pageNum + 1}</button>
                  );
                })}
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1 || isLoading}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >Next</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default OutletList;
