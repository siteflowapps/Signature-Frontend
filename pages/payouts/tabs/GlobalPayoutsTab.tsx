import React, { useMemo } from 'react';
import { Invoice, PayoutResult } from '../../../types';
import { statusStyles, statusLabels, formatDate } from '../utils/constants';

interface GlobalPayoutsTabProps {
  payouts: PayoutResult[];
  filteredPayouts: PayoutResult[];
  invoices: Invoice[];
  payLoading: boolean;
  payError: string;
  payPage: number;
  payTotalPages: number;
  payTotalElements: number;
  payStatusFilter: string;
  setPayStatusFilter: (val: string) => void;
  setPayPage: React.Dispatch<React.SetStateAction<number>>;
  payKpis: Record<string, number>;
  handleExportPayouts: () => void;
  openMarkPaidModal: (p: PayoutResult) => void;
  markingPaidId: string | null;
  PAYOUT_STATUSES: string[];
}

const SkeletonRow: React.FC<{ cols?: number }> = ({ cols = 7 }) => (
  <tr className="animate-pulse">
    {[...Array(cols)].map((_, i) => (
      <td key={i} className="px-6 py-4"><div className={`h-4 bg-slate-${i % 2 === 0 ? '200' : '100'} rounded w-${[32, 24, 28, 40, 20, 24, 20][i % 7]}`}></div></td>
    ))}
  </tr>
);

export const GlobalPayoutsTab: React.FC<GlobalPayoutsTabProps> = ({
  payouts, filteredPayouts, invoices, payLoading, payError, payPage, payTotalPages, payTotalElements,
  payStatusFilter, setPayStatusFilter, setPayPage, payKpis,
  handleExportPayouts, openMarkPaidModal, markingPaidId, PAYOUT_STATUSES
}) => {
  // Build invoice lookup map for enrichment — zero extra API calls
  const invoiceMap = useMemo(
    () => new Map<string, Invoice>(invoices.map(inv => [inv.id, inv])),
    [invoices]
  );

  // Per-status counts for filter pills
  const statusCounts = useMemo(() =>
    payouts.reduce<Record<string, number>>((acc, p) => {
      acc[p.status] = (acc[p.status] || 0) + 1;
      return acc;
    }, {}),
    [payouts]
  );

  // Settlement rate
  const settlementRate = payKpis.totalCount > 0
    ? Math.round((payKpis.paidCount / payKpis.totalCount) * 100)
    : 0;

  const COLS = ['Invoice', 'Cases', 'Payout/Case', 'Payout Amount', 'Status', 'Calculated At', 'Paid At', 'Action'];

  return (
    <>
      {/* Payout KPIs — count-first */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-50 rounded-full blur-[40px] -mr-12 -mt-12 opacity-50"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 relative z-10">Pending Payment</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter relative z-10">{payKpis.calculatedCount} <span className="text-base font-bold text-slate-400">payout{payKpis.calculatedCount !== 1 ? 's' : ''}</span></p>
          <div className="mt-3 text-[10px] font-black text-violet-600 bg-violet-50 border border-violet-100 w-fit px-2.5 py-1 rounded-lg relative z-10">₹{payKpis.calculatedAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-50 rounded-full blur-[40px] -mr-12 -mt-12 opacity-50"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 relative z-10">Total Paid</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter relative z-10">{payKpis.paidCount} <span className="text-base font-bold text-slate-400">settled</span></p>
          <div className="mt-3 text-[10px] font-black text-teal-600 bg-teal-50 border border-teal-100 w-fit px-2.5 py-1 rounded-lg relative z-10">₹{payKpis.paidAmount.toLocaleString()}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-[40px] -mr-12 -mt-12 opacity-50"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5 relative z-10">Settlement Rate</p>
          <p className="text-2xl font-black text-slate-900 tracking-tighter relative z-10">{settlementRate}<span className="text-base font-bold text-slate-400">%</span></p>
          <div className="mt-3 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 w-fit px-2.5 py-1 rounded-lg relative z-10">{payKpis.paidCount} of {payKpis.totalCount} settled</div>
        </div>
        <div className="bg-slate-900 p-6 rounded-2xl shadow-lg shadow-slate-900/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/20 rounded-full blur-[40px] -mr-12 -mt-12"></div>
          <p className="text-[10px] font-black text-violet-400 uppercase tracking-[0.2em] mb-1.5 relative z-10">Total Payouts</p>
          <p className="text-2xl font-black text-white tracking-tighter relative z-10">{payKpis.totalCount} <span className="text-base font-bold text-violet-300">payouts</span></p>
          <div className="mt-3 text-[10px] font-black text-violet-400 bg-white/5 border border-white/10 w-fit px-2.5 py-1 rounded-lg relative z-10 uppercase tracking-widest">
            {payKpis.calculatedCount > 0 ? `${payKpis.calculatedCount} pending` : 'All settled'}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide flex-1">
          {PAYOUT_STATUSES.map(s => {
            const count = s === 'All' ? payouts.length : (statusCounts[s] || 0);
            return (
              <button key={s} onClick={() => setPayStatusFilter(s)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${payStatusFilter === s ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
              >
                {s === 'All' ? 'All' : statusLabels[s] || s}
                {count > 0 && (
                  <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[9px] font-black ${
                    payStatusFilter === s ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>{count}</span>
                )}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleExportPayouts}
          disabled={payouts.filter(p => p.status === 'CALCULATED' || p.status === 'PAID').length === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-500/20 disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
          title="Download all calculated payouts as Excel (.csv)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Export Excel
        </button>
      </div>

      {payError && <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{payError}</div>}

      {/* Payout Table */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {payLoading && (
          <table className="w-full"><thead><tr className="bg-slate-50 border-b border-slate-100">
            {COLS.map(h => (
              <th key={h} className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
            ))}
          </tr></thead><tbody className="divide-y divide-slate-50">{[...Array(5)].map((_, i) => <SkeletonRow key={i} cols={COLS.length} />)}</tbody></table>
        )}

        {!payLoading && filteredPayouts.length === 0 && (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <p className="text-slate-500 font-medium mb-2">{payStatusFilter !== 'All' ? 'No matching payouts' : 'No payouts yet'}</p>
              <p className="text-slate-400 text-sm">Run the payout cycle to generate payouts from approved invoices.</p>
            </div>
          </div>
        )}

        {!payLoading && filteredPayouts.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead><tr className="bg-slate-50 border-b border-slate-100">
                  {COLS.map(h => (
                    <th key={h} className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                  ))}
                </tr></thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredPayouts.map(p => {
                    const inv = invoiceMap.get(p.invoiceId);
                    const totalCases = inv?.items?.length
                      ? Math.round(inv.items.reduce((acc, item) => acc + (item.physicalCases ?? item.invoicedQuantity ?? 0), 0))
                      : null;
                    const isCalculated = p.status === 'CALCULATED';

                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/50 transition-colors ${isCalculated ? 'border-l-2 border-l-amber-400' : ''}`}>
                        {/* Invoice — enriched with invoice number + outlet name */}
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isCalculated ? 'bg-amber-50' : 'bg-violet-50'}`}>
                              <svg className={`w-4 h-4 ${isCalculated ? 'text-amber-500' : 'text-violet-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 font-mono tracking-tight">
                                {inv?.invoiceNumber || inv?.invoiceNo || <span className="text-slate-400 text-xs" title={p.invoiceId}>{p.invoiceId.slice(0, 12)}…</span>}
                              </p>
                              {inv?.outletName && <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate max-w-[160px]">{inv.outletName}</p>}
                            </div>
                          </div>
                        </td>

                        {/* Cases */}
                        <td className="py-3.5 px-6">
                          <div className="text-sm font-black text-indigo-700">
                            {totalCases != null ? totalCases : '—'}
                            {totalCases != null && <span className="text-[10px] font-bold text-slate-400 ml-1">cases</span>}
                          </div>
                        </td>

                        {/* Payout/Case */}
                        <td className="py-3.5 px-6">
                          <div className="text-sm font-black text-slate-900">
                            {p.ratePerCase != null ? `₹${p.ratePerCase}/case` : p.slabPercentage != null ? `${p.slabPercentage}%` : '—'}
                          </div>
                          {/* Formula sub-line */}
                          {totalCases != null && p.ratePerCase != null && (
                            <p className="text-[9px] text-slate-400 font-medium mt-0.5 whitespace-nowrap">
                              {totalCases} × ₹{p.ratePerCase} = ₹{p.calculatedAmount.toLocaleString()}
                            </p>
                          )}
                        </td>

                        {/* Payout Amount */}
                        <td className="py-3.5 px-6">
                          <div className="text-sm font-black text-emerald-700">₹{p.calculatedAmount.toLocaleString()}</div>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border ${statusStyles[p.status] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            {statusLabels[p.status] || p.status}
                          </span>
                        </td>

                        {/* Calculated At */}
                        <td className="py-3.5 px-6"><div className="text-xs font-medium text-slate-600">{formatDate(p.calculatedAt)}</div></td>

                        {/* Paid At */}
                        <td className="py-3.5 px-6"><div className="text-xs font-medium text-slate-600">{p.paidAt ? formatDate(p.paidAt) : '—'}</div></td>

                        {/* Action */}
                        <td className="py-3.5 px-6">
                          {p.status === 'CALCULATED' ? (
                            <button
                              onClick={() => openMarkPaidModal(p)}
                              disabled={markingPaidId === p.id}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors disabled:opacity-50"
                            >
                              {markingPaidId === p.id ? (
                                <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                              ) : (
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                              )}
                              Mark Paid
                            </button>
                          ) : p.status === 'PAID' ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-teal-50 text-teal-700 border border-teal-200">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                              Paid
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-600">
                Page {payPage + 1} of {Math.max(payTotalPages, 1)} • {filteredPayouts.length} of {payTotalElements} payouts
              </div>
              <div className="flex gap-2">
                <button onClick={() => setPayPage(p => Math.max(p - 1, 0))} disabled={payPage === 0 || payLoading}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all">← Previous</button>
                <button onClick={() => setPayPage(p => Math.min(p + 1, payTotalPages - 1))} disabled={payPage >= payTotalPages - 1 || payLoading}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all">Next →</button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};
