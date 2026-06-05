import React from 'react';
import { Invoice, Outlet } from '../../../types';
import { useBulkInvoiceApprove } from '../../../hooks/useBulkInvoiceApprove';
import { statusStyles, statusLabels, STATUSES, formatDate } from '../utils/constants';

interface GlobalInvoicesTabProps {
  invoices: Invoice[];
  filteredInvoices: Invoice[];
  invLoading: boolean;
  invPage: number;
  invTotalPages: number;
  invTotalElements: number;
  setInvPage: React.Dispatch<React.SetStateAction<number>>;
  outlets: Outlet[];
  selectedOutletId: string;
  setSelectedOutletId: (val: string) => void;
  loadingOutlets: boolean;
  invSearch: string;
  setInvSearch: (val: string) => void;
  invStatusFilter: string;
  setInvStatusFilter: (val: string) => void;
  invKpis: Record<string, number>;
  handleExportInvoices: () => void;
  bulk: ReturnType<typeof useBulkInvoiceApprove>; // the return value of useBulkInvoiceApprove
  setReviewingInvoice: (inv: Invoice) => void;
  hideBulkActions?: boolean;
}

const SkeletonRow: React.FC<{ cols?: number; hideBulkActions?: boolean }> = ({ cols = 7, hideBulkActions }) => (
  <tr className="animate-pulse">
    {!hideBulkActions && <td className="px-6 py-4"><div className="w-4 h-4 bg-slate-200 rounded"></div></td>}
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="px-6 py-4"><div className={`h-4 bg-slate-${i % 2 === 0 ? '200' : '100'} rounded w-${[32, 24, 28, 40, 20, 24, 20][i % 7]}`}></div></td>
    ))}
  </tr>
);

export const GlobalInvoicesTab: React.FC<GlobalInvoicesTabProps> = ({
  invoices, filteredInvoices, invLoading, invPage, invTotalPages, invTotalElements, setInvPage,
  outlets, selectedOutletId, setSelectedOutletId, loadingOutlets,
  invSearch, setInvSearch, invStatusFilter, setInvStatusFilter,
  invKpis, handleExportInvoices, bulk, setReviewingInvoice, hideBulkActions
}) => {
  // Pre-compute counts from the full invoice list for status pill badges
  const statusCounts = invoices.reduce<Record<string, number>>((acc, inv) => {
    acc[inv.status] = (acc[inv.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-[40px] -mr-12 -mt-12 opacity-50"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 relative z-10">Pending Approval</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter relative z-10">{invKpis.pendingApproval} <span className="text-base font-bold text-slate-400">invoice{invKpis.pendingApproval !== 1 ? 's' : ''}</span></p>
          <div className="mt-3 text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-100 w-fit px-2.5 py-1 rounded-lg relative z-10">₹{invKpis.pendingAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full blur-[40px] -mr-12 -mt-12 opacity-50"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 relative z-10">Finance Approved</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter relative z-10">{invKpis.approvedCount} <span className="text-base font-bold text-slate-400">approved</span></p>
          <div className="mt-3 text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 w-fit px-2.5 py-1 rounded-lg relative z-10">₹{invKpis.approvedAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full blur-[40px] -mr-12 -mt-12 opacity-50"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 relative z-10">Total Paid</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter relative z-10">{invKpis.paidCount} <span className="text-base font-bold text-slate-400">settled</span></p>
          <div className="mt-3 text-[10px] font-black text-teal-600 bg-teal-50 border border-teal-100 w-fit px-2.5 py-1 rounded-lg relative z-10">₹{invKpis.paidAmount.toLocaleString()}</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg shadow-slate-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/20 rounded-full blur-[40px] -mr-12 -mt-12"></div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-1.5 relative z-10">Total Invoices</p>
          <p className="text-2xl font-black text-white tracking-tighter relative z-10">{invKpis.totalCount} <span className="text-base font-bold text-indigo-300">invoices</span></p>
          <div className="mt-3 text-[10px] font-black text-indigo-400 bg-white/5 border border-white/10 w-fit px-2.5 py-1 rounded-lg relative z-10 uppercase tracking-widest">₹{invKpis.totalAmount.toLocaleString()}</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={selectedOutletId}
          onChange={e => setSelectedOutletId(e.target.value)}
          disabled={loadingOutlets}
          className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all min-w-[220px] cursor-pointer"
        >
          <option value="">All Outlets</option>
          {outlets.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
        </select>
        <div className="relative flex-1">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text" value={invSearch} onChange={e => setInvSearch(e.target.value)}
            placeholder="Search invoice, distributor, SKU..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
          />
          {invSearch && (
            <button onClick={() => setInvSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            {STATUSES.map(s => {
              const count = s === 'All' ? invoices.length : (statusCounts[s] || 0);
              return (
                <button key={s} onClick={() => setInvStatusFilter(s)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${invStatusFilter === s ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {s === 'All' ? 'All' : statusLabels[s] || s}
                  {count > 0 && (
                    <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black ${
                      invStatusFilter === s ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>{count}</span>
                  )}
                </button>
              );
            })}
          </div>
          <button
            onClick={handleExportInvoices}
            disabled={filteredInvoices.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
            title="Download invoices as Excel (.csv)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export Excel
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {invLoading && (
          <table className="w-full"><thead><tr className="bg-slate-50 border-b border-slate-100">
            {!hideBulkActions && <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-12"></th>}
            {['Invoice', 'Retailer', 'Distributor', 'Date', 'Cases', 'Total Amount', 'Status', 'Review'].map(h => (
              <th key={h} className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
            ))}
          </tr></thead><tbody className="divide-y divide-slate-50">{[...Array(10)].map((_, i) => <SkeletonRow key={i} hideBulkActions={hideBulkActions} />)}</tbody></table>
        )}
        {!invLoading && filteredInvoices.length === 0 && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-slate-500 font-medium mb-1">{invSearch || invStatusFilter !== 'All' || selectedOutletId ? 'No invoices match your filters' : 'No invoices received yet'}</p>
              {(invSearch || invStatusFilter !== 'All' || selectedOutletId) && (
                <button onClick={() => { setInvSearch(''); setInvStatusFilter('All'); setSelectedOutletId(''); }} className="text-indigo-600 font-bold hover:text-indigo-800 text-sm transition-colors mt-2">Clear all filters</button>
              )}
            </div>
          </div>
        )}

        {!invLoading && filteredInvoices.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {!hideBulkActions && (
                      <th className="py-4 px-4 w-12 text-center">
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={bulk.selectedIds.size === filteredInvoices.filter(i => i.status === 'ASM_APPROVED').length && filteredInvoices.filter(i => i.status === 'ASM_APPROVED').length > 0}
                            onChange={bulk.toggleSelectAll}
                            disabled={filteredInvoices.filter(i => i.status === 'ASM_APPROVED').length === 0}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer disabled:opacity-50"
                          />
                        </div>
                      </th>
                    )}
                    {['Invoice', 'Retailer', 'Distributor', 'Date', 'Cases', 'Total Amount', 'Status', 'Review'].map(h => (
                      <th key={h} className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredInvoices.map(inv => (
                    <tr key={inv.id} className={`hover:bg-slate-50/50 transition-colors ${!hideBulkActions && bulk.selectedIds.has(inv.id) ? 'bg-indigo-50/30' : ''}`}>
                      {!hideBulkActions && (
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center">
                            {inv.status === 'ASM_APPROVED' ? (
                              <input
                                type="checkbox"
                                checked={bulk.selectedIds.has(inv.id)}
                                onChange={() => bulk.toggleSelect(inv.id)}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 cursor-pointer hover:border-indigo-400 transition-colors"
                              />
                            ) : (
                              <div className="w-4 h-4 rounded border border-slate-200 bg-slate-50" title={`Cannot select invoice in ${inv.status} state`} />
                            )}
                          </div>
                        </td>
                      )}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${!hideBulkActions && bulk.selectedIds.has(inv.id) ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                            <svg className={`w-5 h-5 ${!hideBulkActions && bulk.selectedIds.has(inv.id) ? 'text-indigo-600' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                          </div>
                          <div>
                            <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">{inv.invoiceNumber || inv.invoiceNo}</p>
                            {(inv.items?.length ?? 0) > 0 && (
                              <span className="inline-flex items-center gap-0.5 mt-1 px-1.5 py-0.5 bg-slate-100 text-slate-500 text-[9px] font-black rounded-md uppercase tracking-wider">
                                +{inv.items!.length} SKUs
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-6"><div className="text-xs font-bold text-slate-700">{inv.outletName}</div></td>
                      <td className="py-3.5 px-6"><div className="text-xs font-bold text-slate-700">{inv.distributorName || inv.distributor}</div></td>
                      <td className="py-3.5 px-6"><div className="text-xs font-medium text-slate-600">{formatDate(inv.invoiceDate || inv.date)}</div></td>
                      <td className="py-3.5 px-6"><div className="text-sm font-black text-indigo-700">{inv.items?.length ? Math.round(inv.items.reduce((acc, item) => acc + (item.physicalCases ?? item.invoicedQuantity ?? 0), 0)) : '—'} <span className="text-[10px] font-bold text-slate-400 uppercase">cases</span></div></td>
                      <td className="py-3.5 px-6"><div className="text-sm font-black text-slate-900 border-l border-slate-200 pl-4 py-1">₹{(inv.totalAmount ?? inv.value ?? 0).toLocaleString()}</div></td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusStyles[inv.status as string] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                          {statusLabels[inv.status as string] || inv.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-6">
                        {(() => {
                          const isReadOnly = inv.status === 'PAID' || inv.status === 'CALCULATED' || inv.status === 'REJECTED';
                          return (
                            <button
                              onClick={() => setReviewingInvoice(inv)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors group whitespace-nowrap ${
                                isReadOnly
                                  ? 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'
                                  : 'bg-indigo-50 text-indigo-600 border border-indigo-200 hover:bg-indigo-100'
                              }`}
                            >
                              <svg className={`w-3 h-3 ${!isReadOnly ? 'group-hover:scale-110 transition-transform' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              {hideBulkActions ? 'Fix' : (isReadOnly ? 'View' : 'Review')}
                            </button>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Pagination Controls */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-600">
                Page {invPage + 1} of {Math.max(invTotalPages, 1)} • {filteredInvoices.length} of {invTotalElements} invoices
              </div>
              <div className="flex gap-2">
                <button onClick={() => setInvPage(p => Math.max(p - 1, 0))} disabled={invPage === 0 || invLoading}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all">← Previous</button>
                <button onClick={() => setInvPage(p => Math.min(p + 1, invTotalPages - 1))} disabled={invPage >= invTotalPages - 1 || invLoading}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all">Next →</button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Sticky Bulk Action Bar — slides up when invoices are selected */}
      {!hideBulkActions && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-40 transition-all duration-300 ease-out ${
            bulk.selectedIds.size > 0
              ? 'translate-y-0 opacity-100'
              : 'translate-y-full opacity-0 pointer-events-none'
          }`}
        >
        <div className="max-w-screen-2xl mx-auto px-6 pb-5">
          <div className="bg-slate-900 rounded-2xl shadow-2xl shadow-slate-900/40 border border-white/10 px-5 py-4 flex items-center justify-between gap-4">
            {/* Left: selection summary */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <div>
                <p className="text-white font-black text-sm">
                  {bulk.selectedIds.size} invoice{bulk.selectedIds.size !== 1 ? 's' : ''} selected
                </p>
                <p className="text-slate-400 text-[10px] font-semibold mt-0.5">
                  Total value: ₹{bulk.selectedTotalAmount.toLocaleString()}
                </p>
              </div>
              <div className="w-px h-8 bg-white/10 hidden sm:block" />
              <p className="text-slate-500 text-[11px] font-medium hidden sm:block">
                Only ASM-approved invoices are eligible
              </p>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={bulk.clearSelection}
                className="px-4 py-2 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 transition-all"
              >
                Clear
              </button>
              <button
                onClick={bulk.openConfirmModal}
                disabled={bulk.isProcessing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {bulk.isProcessing ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                Approve {bulk.selectedIds.size > 1 ? `${bulk.selectedIds.size} Invoices` : 'Invoice'}
              </button>
            </div>
          </div>
        </div>
        </div>
      )}
    </>
  );
};
