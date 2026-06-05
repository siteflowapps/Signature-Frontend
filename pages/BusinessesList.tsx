import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Business } from '../types';
import { useBusinessesQuery } from '../hooks/queries/useBusinessesQuery';
const BusinessesList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 20;

  const { data, isLoading, error: queryError } = useBusinessesQuery(currentPage, pageSize);

  const businesses: Business[] = data?.content || [];
  const totalPages = data?.totalPages || 1;
  const totalElements = data?.totalElements || 0;
  const error = queryError ? (queryError as Error).message : '';

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700';
      case 'INACTIVE':
        return 'bg-red-50 text-red-600';
      case 'PENDING':
        return 'bg-orange-50 text-orange-600';
      default:
        return 'bg-slate-100 text-slate-600';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Businesses</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage all onboarded business entities</p>
        </div>
        <Link
          to="/businesses/add"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-[0.98] w-fit"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add New Business
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-slate-500 font-medium">Loading businesses...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && businesses.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium mb-2">No businesses found</p>
              <p className="text-slate-400 text-sm mb-6">Get started by creating your first business</p>
              <Link
                to="/businesses/add"
                className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Add New Business
              </Link>
            </div>
          </div>
        )}

        {/* Table */}
        {!isLoading && businesses.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    <th className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-6 py-4">#</th>
                    <th className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-6 py-4">Business Name</th>
                    <th className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-6 py-4">Phone</th>
                    <th className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-6 py-4">Address</th>
                    <th className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-6 py-4">Status</th>
                    <th className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-6 py-4">Created At</th>
                    <th className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {businesses.map((business, index) => (
                    <tr key={business.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                        {currentPage * pageSize + index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-slate-900">{business.name}</p>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{business.phone}</td>
                      <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{business.address}</td>
                      <td className="px-6 py-4">
                        <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${getStatusBadgeColor(business.status)}`}>
                          {business.status || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">{formatDate(business.createdAt)}</td>
                      <td className="px-6 py-4">
                        <Link
                          to={`/businesses/${business.id}`}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 hover:text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-600">
                <span>Page {currentPage + 1} of {Math.max(totalPages, 1)}</span>
                <span className="ml-2">•</span>
                <span className="ml-2">Total: {totalElements} businesses</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0 || isLoading}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1 || isLoading}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Next →
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BusinessesList;
