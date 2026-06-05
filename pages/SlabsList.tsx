import React from 'react';
import { useSlabsList } from '../hooks/useSlabsList';
import { Icons } from '../constants';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-16"></div></td>
    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-12"></div></td>
    <td className="py-4 px-6 hidden md:table-cell"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
  </tr>
);

const TABLE_HEADERS = [
  { label: 'Classification', className: '' },
  { label: 'Min Qty (Cases)', className: '' },
  { label: 'Max Qty (Cases)', className: '' },
  { label: 'Rate / Case', className: '' },
  { label: 'Business ID', className: 'hidden md:table-cell' },
];

const SlabsList: React.FC = () => {
  const {
    slabs,
    isLoading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
  } = useSlabsList();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Slab Management</h2>
            {!isLoading && totalElements > 0 && (
              <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-200/50 uppercase tracking-tighter mt-1">
                {totalElements} Total
              </span>
            )}
          </div>
          <p className="text-slate-400 text-sm mt-0.5">Manage quantity-based payout rate classifications.</p>
        </div>
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
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {TABLE_HEADERS.map((h) => (
                <th key={h.label} className={`text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${h.className}`}>{h.label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading ? (
              [...Array(5)].map((_, i) => <SkeletonRow key={i} />)
            ) : slabs.length === 0 ? (
              <tr>
                <td colSpan={TABLE_HEADERS.length} className="py-12 text-center">
                  <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-400">
                    <Icons.Dashboard className="w-8 h-8" />
                  </div>
                  <p className="text-slate-500 font-medium">No slabs found</p>
                </td>
              </tr>
            ) : (
              slabs.map((slab) => (
                <tr key={slab.id} className="hover:bg-slate-50/20 transition-colors">
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                      slab.classification === 'PLATINUM' ? 'bg-purple-100 text-purple-700' :
                      slab.classification === 'DIAMOND'  ? 'bg-blue-100 text-blue-700' :
                      slab.classification === 'GOLD'     ? 'bg-amber-100 text-amber-700' :
                      slab.classification === 'SILVER'   ? 'bg-slate-100 text-slate-600' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {slab.classification}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-sm font-medium text-slate-700">{slab.minQuantity.toLocaleString()}</td>
                  <td className="py-4 px-6 text-sm font-medium text-slate-700">{slab.maxQuantity?.toLocaleString() ?? '∞'}</td>
                  <td className="py-4 px-6">
                    <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg">₹{slab.ratePerCase}/case</span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-400 hidden md:table-cell font-mono">{slab.businessId}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {!isLoading && slabs.length > 0 && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-600">
              Page {currentPage + 1} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white disabled:opacity-50 transition-all"
              >← Previous</button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white disabled:opacity-50 transition-all"
              >Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SlabsList;
