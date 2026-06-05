import React, { useState, useEffect, useMemo } from 'react';
import { Invoice, PayoutEstimate } from '../../types';
import { apiService } from '../../network/apiService';
import { getErrorMessage } from '../../utils/errorUtils';

const statusStyles: Record<string, string> = {
  SUBMITTED: 'bg-slate-50 text-slate-600 border-slate-200',
  ASE_APPROVED: 'bg-sky-50 text-sky-700 border-sky-200',
  ASM_APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FINANCE_APPROVED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  CALCULATED: 'bg-violet-50 text-violet-700 border-violet-200',
  PAID: 'bg-teal-50 text-teal-700 border-teal-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels: Record<string, string> = {
  SUBMITTED: 'Submitted',
  ASE_APPROVED: 'ASE Approved',
  ASM_APPROVED: 'ASM Approved',
  FINANCE_APPROVED: 'Finance Approved',
  CALCULATED: 'Calculated',
  PAID: 'Paid',
  REJECTED: 'Rejected',
};

const STATUSES = ['All', 'SUBMITTED', 'ASE_APPROVED', 'ASM_APPROVED', 'FINANCE_APPROVED', 'CALCULATED', 'PAID', 'REJECTED'];

const tierEmoji: Record<string, string> = {
  SILVER: '🥈', GOLD: '🥇', DIAMOND: '💎', PLATINUM: '🏆',
};
const tierColors: Record<string, { bg: string; text: string; bar: string }> = {
  SILVER:   { bg: 'bg-slate-100',   text: 'text-slate-700',   bar: 'bg-slate-400' },
  GOLD:     { bg: 'bg-amber-100',   text: 'text-amber-800',   bar: 'bg-amber-500' },
  DIAMOND:  { bg: 'bg-violet-100',  text: 'text-violet-800',  bar: 'bg-violet-500' },
  PLATINUM: { bg: 'bg-sky-100',     text: 'text-sky-800',     bar: 'bg-sky-500' },
};

// ─── Monthly Payout Card ────────────────────────────────────────────────────

interface MonthlyPayoutCardProps {
  invoiceId: string;
}

const MonthlyPayoutCard: React.FC<MonthlyPayoutCardProps> = ({ invoiceId }) => {
  const [payout, setPayout] = useState<PayoutEstimate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.payouts.calculatePayout(invoiceId);
        if (!cancelled && res.success) setPayout(res.data);
        else if (!cancelled) setError('Could not load payout estimate');
      } catch (e) {
        if (!cancelled) setError(getErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [invoiceId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-5 flex items-center gap-3 shadow-sm">
        <div className="w-5 h-5 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin flex-shrink-0" />
        <p className="text-xs font-bold text-slate-400">Calculating monthly payout…</p>
      </div>
    );
  }

  if (error || !payout) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-xs font-bold text-red-500">
        {error || 'No payout data available'}
      </div>
    );
  }

  const tier = payout.classification?.toUpperCase() || '';
  const colors = tierColors[tier] || tierColors['SILVER'];
  const monthlyCases = payout.totalMonthlyVolumePc ?? payout.totalCases;
  const rate = payout.ratePerCase ?? 0;
  const monthlyPayout = monthlyCases * rate;
  const isEligible = payout.belowMinimumThreshold === false || monthlyCases >= 40;

  const min = payout.minQuantity ?? 40;
  const max = payout.maxQuantity ?? 300;
  const progress = Math.min(100, Math.max(0, ((monthlyCases - min) / (max - min)) * 100));

  const nextTierLabel = {
    SILVER: `Gold at ${Math.round(max)}+ cases`,
    GOLD: `Diamond at ${Math.round(max)}+ cases`,
    DIAMOND: `Platinum at ${Math.round(max)}+ cases`,
    PLATINUM: 'Max tier 🏆',
  }[tier] ?? '';

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
      {/* ── Dark gradient header ── */}
      <div
        className="px-5 py-5"
        style={{ background: isEligible ? 'linear-gradient(135deg, #064E3B, #065F46, #047857)' : 'linear-gradient(135deg, #374151, #4B5563)' }}
      >
        {/* Label row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-white/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="text-[10px] font-black text-white/70 uppercase tracking-widest">Monthly Payout Estimate</span>
          </div>
          {payout.isEstimated && (
            <span className="text-[9px] font-black text-white/70 bg-white/15 px-2 py-1 rounded-lg">~ Estimated</span>
          )}
        </div>

        {/* Amount + tier badge */}
        <div className="flex items-end justify-between">
          <div>
            {isEligible ? (
              <>
                <p className="text-3xl font-black text-white tracking-tight">
                  ₹{Math.round(monthlyPayout).toLocaleString('en-IN')}
                </p>
                <p className="text-[10px] text-white/60 font-medium mt-0.5">
                  {Math.round(monthlyCases)} cases × ₹{rate}/case
                </p>
              </>
            ) : (
              <>
                <p className="text-2xl font-black text-white">Not Eligible</p>
                <p className="text-[10px] text-white/60 font-medium mt-0.5">Minimum 40 cases required</p>
              </>
            )}
          </div>
          {isEligible && tier && (
            <div className={`${colors.bg} rounded-xl px-3 py-2 text-center`}>
              <p className="text-xl">{tierEmoji[tier] ?? '⭐'}</p>
              <p className={`text-[9px] font-black uppercase ${colors.text}`}>
                {payout.classification ? payout.classification.charAt(0) + payout.classification.slice(1).toLowerCase() : ''}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="bg-white px-5 py-4 space-y-4">
        {/* Stats pills */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-emerald-700">{Math.round(monthlyCases)}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">Monthly Cases</p>
          </div>
          <div className="bg-blue-50 rounded-xl p-3 text-center">
            <p className="text-lg font-black text-blue-700">₹{rate}</p>
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">Rate / Case</p>
          </div>
          {(payout.waterVolumePc ?? 0) > 0 && (
            <div className="bg-sky-50 rounded-xl p-3 text-center col-span-2">
              <p className="text-base font-black text-sky-700">{Math.round(payout.waterVolumePc ?? 0)} cases</p>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide mt-0.5">Water Cases (tracked separately)</p>
            </div>
          )}
        </div>

        {/* Slab Progress */}
        {isEligible && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Slab Progress</span>
              <span className={`text-[9px] font-black ${colors.text}`}>
                {Math.round(monthlyCases)} / {Math.round(max)} cases
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${colors.bar}`}
                style={{ width: `${progress}%` }}
              />
            </div>
            {nextTierLabel && (
              <p className="text-[9px] text-slate-400 mt-1">{nextTierLabel}</p>
            )}
          </div>
        )}

        {/* Context note */}
        <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3">
          <svg className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p className="text-[9px] font-medium text-amber-800 leading-relaxed">
            Payout is based on total monthly cases across <strong>all invoices</strong> — not just this one.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── Main InvoicesTab ───────────────────────────────────────────────────────

interface InvoicesTabProps {
  outletId: string;
}

const InvoicesTab: React.FC<InvoicesTabProps> = ({ outletId }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [statusFilter, setStatusFilter] = useState('All');
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await apiService.invoices.getByOutlet(outletId, 0, 50);
        if (res.success) {
          setInvoices(res.data.content);
          setTotalPages(res.data.totalPages);
          setTotalElements(res.data.totalElements);
        } else {
          setError(res.error || 'Failed to load invoices');
        }
      } catch (err: unknown) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    if (outletId) load();
  }, [outletId]);

  const filtered = useMemo(() => {
    return invoices.filter(inv => {
      if (statusFilter !== 'All' && inv.status !== statusFilter) return false;
      return true;
    });
  }, [invoices, statusFilter]);

  const kpis = useMemo(() => {
    const paid = filtered.filter(i => i.status === 'PAID');
    const pending = filtered.filter(i => !['PAID', 'REJECTED'].includes(i.status as string));
    return {
      totalCount: filtered.length,
      totalAmount: filtered.reduce((s, i) => s + (i.totalAmount || 0), 0),
      paidCount: paid.length,
      paidAmount: paid.reduce((s, i) => s + (i.totalAmount || 0), 0),
      pendingCount: pending.length,
      pendingAmount: pending.reduce((s, i) => s + (i.totalAmount || 0), 0),
    };
  }, [filtered]);

  const formatDate = (d: string) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-50 rounded-full blur-[30px] -mr-10 -mt-10 opacity-50"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">Total Invoices</p>
          <p className="text-xl font-black text-slate-900 relative z-10">{kpis.totalCount}</p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 relative z-10">₹{kpis.totalAmount.toLocaleString()}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-teal-50 rounded-full blur-[30px] -mr-10 -mt-10 opacity-50"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">Paid</p>
          <p className="text-xl font-black text-teal-700 relative z-10">₹{kpis.paidAmount.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-teal-600 mt-1 relative z-10">{kpis.paidCount} invoice{kpis.paidCount !== 1 ? 's' : ''}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-50 rounded-full blur-[30px] -mr-10 -mt-10 opacity-50"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 relative z-10">In Progress</p>
          <p className="text-xl font-black text-amber-700 relative z-10">₹{kpis.pendingAmount.toLocaleString()}</p>
          <p className="text-[10px] font-bold text-amber-600 mt-1 relative z-10">{kpis.pendingCount} invoice{kpis.pendingCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Status Filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        {STATUSES.map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${statusFilter === s ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
          >{s === 'All' ? 'All' : statusLabels[s] || s}</button>
        ))}
      </div>

      {error && <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>}

      {/* Two-column layout when invoice selected */}
      <div className={`${selectedInvoice ? 'grid grid-cols-1 lg:grid-cols-5 gap-5' : ''}`}>

        {/* Table */}
        <div className={selectedInvoice ? 'lg:col-span-3' : ''}>
          <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
            {loading && (
              <div className="p-12 text-center">
                <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-sm text-slate-400 font-bold mt-4">Loading invoices...</p>
              </div>
            )}

            {!loading && filtered.length === 0 && (
              <div className="flex items-center justify-center py-16">
                <div className="text-center">
                  <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  </div>
                  <p className="text-slate-500 font-medium mb-1">{statusFilter !== 'All' ? 'No matching invoices' : 'No invoices yet'}</p>
                  <p className="text-slate-400 text-xs">Invoices will appear here once uploaded from the mobile app.</p>
                </div>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      {['Invoice', 'Date', 'Distributor', 'SKUs', 'Qty', 'Amount', 'Status', 'Photo'].map(h => (
                        <th key={h} className="text-left py-3.5 px-5 text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filtered.map(inv => {
                      const isSelected = selectedInvoice?.id === inv.id;
                      return (
                        <tr
                          key={inv.id}
                          onClick={() => setSelectedInvoice(isSelected ? null : inv)}
                          className={`transition-colors cursor-pointer ${isSelected ? 'bg-emerald-50/60 border-l-2 border-l-emerald-500' : 'hover:bg-slate-50/50'}`}
                        >
                          <td className="py-3 px-5">
                            <div className="text-xs font-bold text-slate-900 font-mono">{inv.invoiceNumber || inv.invoiceNo}</div>
                          </td>
                          <td className="py-3 px-5">
                            <div className="text-xs font-medium text-slate-600">{formatDate(inv.invoiceDate || inv.date || '')}</div>
                          </td>
                          <td className="py-3 px-5">
                            <div className="text-xs font-bold text-slate-700 max-w-[120px] truncate">{inv.distributorName || inv.distributor}</div>
                          </td>
                          <td className="py-3 px-5">
                            <div className="text-[11px] font-medium text-slate-600 max-w-[120px] truncate" title={inv.skus}>{inv.skus || '—'}</div>
                          </td>
                          <td className="py-3 px-5">
                            <div className="text-xs font-bold text-slate-700">{inv.quantity ?? inv.totalQuantity ?? inv.qty ?? '—'}</div>
                          </td>
                          <td className="py-3 px-5">
                            <div className="text-sm font-black text-slate-900">₹{(inv.totalAmount || inv.value || 0).toLocaleString()}</div>
                          </td>
                          <td className="py-3 px-5">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${statusStyles[inv.status as string] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                              {statusLabels[inv.status as string] || inv.status}
                            </span>
                          </td>
                          <td className="py-3 px-5">
                            {inv.photoUrl ? (
                              <button
                                onClick={e => { e.stopPropagation(); setLightboxUrl(inv.photoUrl!); }}
                                className="text-[10px] text-indigo-500 hover:text-indigo-700 font-bold hover:underline transition-colors"
                              >
                                View
                              </button>
                            ) : <span className="text-[10px] text-slate-300">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  Showing {filtered.length} of {totalElements} invoices{selectedInvoice ? ' · Click a row to view payout' : ' · Click a row for monthly payout'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Monthly Payout Panel */}
        {selectedInvoice && (
          <div className="lg:col-span-2 space-y-3">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-black text-slate-700">Monthly Payout</p>
                <p className="text-[10px] text-slate-400 font-mono">{selectedInvoice.invoiceNumber || selectedInvoice.invoiceNo}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Invoice meta */}
            <div className="bg-white rounded-xl border border-slate-100 p-4 grid grid-cols-2 gap-3 shadow-sm">
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Invoice Date</p>
                <p className="text-xs font-bold text-slate-700">{formatDate(selectedInvoice.invoiceDate || selectedInvoice.date || '')}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Amount</p>
                <p className="text-xs font-black text-slate-900">₹{(selectedInvoice.totalAmount || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${statusStyles[selectedInvoice.status as string] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                  {statusLabels[selectedInvoice.status as string] || selectedInvoice.status}
                </span>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Distributor</p>
                <p className="text-xs font-bold text-slate-700 truncate">{selectedInvoice.distributorName || selectedInvoice.distributor || '—'}</p>
              </div>
            </div>

            {/* Monthly payout card */}
            <MonthlyPayoutCard invoiceId={selectedInvoice.id} />
          </div>
        )}
      </div>

      {/* Photo Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl flex items-center justify-center animate-in fade-in duration-200" onClick={() => setLightboxUrl(null)}>
          <button onClick={() => setLightboxUrl(null)} className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={lightboxUrl} alt="Invoice" className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl" onClick={e => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
};

export default InvoicesTab;
