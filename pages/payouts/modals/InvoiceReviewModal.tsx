import React, { useState, useEffect, useCallback } from 'react';
import { Invoice, InvoiceItem, PayoutEstimate } from '../../../types';
import { apiService } from '../../../network/apiService';
import { statusStyles, statusLabels, formatDate } from '../utils/constants';

interface InvoiceReviewModalProps {
  reviewingInvoice: Invoice | null;
  setReviewingInvoice: (invoice: Invoice | null) => void;
  filteredInvoices: Invoice[];
  onActionClick: (invoice: Invoice, action: 'approve' | 'reject') => void;
}

export const InvoiceReviewModal: React.FC<InvoiceReviewModalProps> = ({
  reviewingInvoice, setReviewingInvoice, filteredInvoices, onActionClick
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [payoutEstimate, setPayoutEstimate] = useState<PayoutEstimate | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [detailedInvoice, setDetailedInvoice] = useState<Invoice | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const reviewIdx = reviewingInvoice ? filteredInvoices.findIndex(i => i.id === reviewingInvoice.id) : -1;
  const hasPrev = reviewIdx > 0;
  const hasNext = reviewIdx >= 0 && reviewIdx < filteredInvoices.length - 1;

  const goToPrevInvoice = useCallback(() => {
    if (hasPrev) { setReviewingInvoice(filteredInvoices[reviewIdx - 1]); setZoomLevel(1); }
  }, [hasPrev, filteredInvoices, reviewIdx, setReviewingInvoice]);

  const goToNextInvoice = useCallback(() => {
    if (hasNext) { setReviewingInvoice(filteredInvoices[reviewIdx + 1]); setZoomLevel(1); }
  }, [hasNext, filteredInvoices, reviewIdx, setReviewingInvoice]);

  useEffect(() => {
    if (!reviewingInvoice) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevInvoice();
      else if (e.key === 'ArrowRight') goToNextInvoice();
      else if (e.key === 'Escape') { setReviewingInvoice(null); setZoomLevel(1); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [reviewingInvoice, goToPrevInvoice, goToNextInvoice, setReviewingInvoice]);

  useEffect(() => {
    if (!reviewingInvoice) { setPayoutEstimate(null); return; }
    let cancelled = false;
    setEstimateLoading(true);
    setPayoutEstimate(null);
    apiService.payouts.calculatePayout(reviewingInvoice.id)
      .then(res => { if (!cancelled && res.success) setPayoutEstimate(res.data); })
      .catch(() => { /* silently fail */ })
      .finally(() => { if (!cancelled) setEstimateLoading(false); });
    return () => { cancelled = true; };
  }, [reviewingInvoice]);

  useEffect(() => {
    if (!reviewingInvoice) { setDetailedInvoice(null); return; }
    let cancelled = false;
    setDetailLoading(true);
    setDetailedInvoice(null);
    apiService.invoices.getById(reviewingInvoice.id)
      .then(res => { if (!cancelled && res.success) setDetailedInvoice(res.data); })
      .catch(console.error)
      .finally(() => { if (!cancelled) setDetailLoading(false); });
    return () => { cancelled = true; };
  }, [reviewingInvoice]);

  if (!reviewingInvoice) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200" onClick={() => { setReviewingInvoice(null); setZoomLevel(1); }}>
      <div className="h-full flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-xl border-b border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={() => { setReviewingInvoice(null); setZoomLevel(1); }} className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Invoice Review</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{reviewingInvoice.invoiceNumber || reviewingInvoice.invoiceNo} · {reviewIdx + 1} of {filteredInvoices.length}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToPrevInvoice} disabled={!hasPrev} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Prev
            </button>
            <button onClick={goToNextInvoice} disabled={!hasNext} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              Next<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
          <div className="w-[55%] bg-slate-900 relative flex items-center justify-center overflow-hidden">
            {reviewingInvoice.photoUrl ? (
              <>
                <div className="absolute inset-0 overflow-auto flex items-center justify-center p-8">
                  <img src={reviewingInvoice.photoUrl} alt="Invoice" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl transition-transform duration-300" style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }} draggable={false} />
                </div>
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white/10 backdrop-blur-xl rounded-2xl p-1.5 border border-white/10">
                  <button onClick={() => setZoomLevel(z => Math.max(0.25, z - 0.25))} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white text-lg font-bold transition-colors">−</button>
                  <span className="text-white text-xs font-black px-3 tabular-nums min-w-[48px] text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button onClick={() => setZoomLevel(z => Math.min(4, z + 0.25))} className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white text-lg font-bold transition-colors">+</button>
                  <div className="w-px h-5 bg-white/20 mx-1"></div>
                  <button onClick={() => setZoomLevel(1)} className="px-3 h-9 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-wider transition-colors">Reset</button>
                </div>
              </>
            ) : (
              <div className="text-center">
                <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
                <p className="text-white/40 text-sm font-bold">No invoice photo available</p>
              </div>
            )}
          </div>

          <div className="w-[45%] bg-slate-50 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {reviewingInvoice.status === 'PAID' && (
                <div className="flex items-center gap-3 px-4 py-3 bg-teal-50 border border-teal-200 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-teal-500 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg></div>
                  <div><p className="text-xs font-black text-teal-800">Payment Settled</p><p className="text-[10px] text-teal-600 font-medium">This invoice has been fully paid out.</p></div>
                </div>
              )}
              {reviewingInvoice.status === 'CALCULATED' && (
                <div className="flex items-center gap-3 px-4 py-3 bg-violet-50 border border-violet-200 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
                  <div><p className="text-xs font-black text-violet-800">Payout Calculated</p><p className="text-[10px] text-violet-600 font-medium">Awaiting settlement — mark as paid to finalize.</p></div>
                </div>
              )}
              {reviewingInvoice.status === 'REJECTED' && (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl">
                  <div className="w-8 h-8 rounded-xl bg-red-500 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></div>
                  <div><p className="text-xs font-black text-red-800">Invoice Rejected</p><p className="text-[10px] text-red-600 font-medium">This invoice was rejected and no payout will be processed.</p></div>
                </div>
              )}

              <div className="bg-white rounded-2xl border border-slate-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${statusStyles[reviewingInvoice.status as string] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                    {statusLabels[reviewingInvoice.status as string] || reviewingInvoice.status}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">{reviewingInvoice.invoiceDate || reviewingInvoice.date}</span>
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight font-mono">{reviewingInvoice.invoiceNumber || reviewingInvoice.invoiceNo}</h4>
                {reviewingInvoice.uploadDate && (
                  <p className="text-[10px] font-bold text-slate-400 mt-1">Uploaded {formatDate(reviewingInvoice.uploadDate)}{reviewingInvoice.createdByName ? ` by ${reviewingInvoice.createdByName}` : ''}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Outlet</p>
                  <p className="text-sm font-black text-slate-900">{reviewingInvoice.outletName}</p>
                  {detailedInvoice?.createdByName && (
                    <p className="text-[10px] text-slate-400 font-medium mt-1.5">
                      By {detailedInvoice.createdByName}
                      {detailedInvoice.createdByRole && <span className="ml-1 px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-bold text-slate-500 uppercase">{detailedInvoice.createdByRole}</span>}
                    </p>
                  )}
                </div>
                <div className="bg-white rounded-2xl border border-slate-100 p-4">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Distributor</p>
                  <p className="text-sm font-black text-slate-900">{reviewingInvoice.distributorName || reviewingInvoice.distributor}</p>
                  {detailedInvoice?.digitalSignature != null && (
                    <p className={`text-[10px] font-bold mt-1.5 flex items-center gap-1 ${detailedInvoice.digitalSignature ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {detailedInvoice.digitalSignature ? '🔏 Digitally Signed' : '⚠️ No Digital Signature'}
                    </p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col mt-4">
                <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Payout Breakdown & SKUs</p>
                  <div className="flex gap-2 text-[10px] font-bold">
                    <span className="text-slate-400 uppercase tracking-wider">
                      {reviewingInvoice.status === 'PAID'
                        ? 'Final Total payout:'
                        : reviewingInvoice.status === 'CALCULATED'
                          ? 'Calculated Total payout:'
                          : 'Estimated Total payout:'}
                    </span>
                    <span className="text-emerald-600">
                      ₹{(detailedInvoice?.estimatedPayoutAmount || 0).toLocaleString()}
                    </span>
                  </div>
                </div>

                {detailedInvoice && (
                  <div className="px-5 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Invoice Amount</p><p className="text-sm font-black text-slate-900">₹{(detailedInvoice.totalAmount || 0).toLocaleString()}</p></div>
                      <div className="w-px h-8 bg-slate-100"></div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Cases</p>
                        <p className="text-sm font-black text-indigo-700">
                          {Math.round(detailedInvoice.items?.reduce((acc: number, item: InvoiceItem) => acc + (item.physicalCases ?? item.invoicedQuantity ?? 0), 0) ?? detailedInvoice.totalCases ?? 0)} cases
                        </p>
                      </div>
                      <div className="w-px h-8 bg-slate-100"></div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Payout/Case</p>
                        <p className="text-sm font-black text-emerald-700">
                          {payoutEstimate?.ratePerCase != null ? `₹${payoutEstimate.ratePerCase}/case` : '—'}
                        </p>
                      </div>
                    </div>
                    <div><p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Items</p><p className="text-sm font-black text-indigo-700">{detailedInvoice.items?.length || 0}</p></div>
                  </div>
                )}

                {detailLoading ? (
                  <div className="p-5 space-y-3 animate-pulse">
                    <div className="flex gap-4"><div className="h-10 bg-slate-100 rounded-lg flex-1" /><div className="h-10 bg-slate-100 rounded-lg flex-1" /><div className="h-10 bg-slate-50 rounded-lg flex-1" /></div>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <div className="w-6 h-4 bg-slate-100 rounded" />
                        <div className="h-4 bg-slate-100 rounded flex-[3]" />
                        <div className="h-4 bg-slate-50 rounded flex-1" />
                        <div className="h-4 bg-slate-100 rounded flex-1" />
                        <div className="h-4 bg-slate-50 rounded flex-1" />
                        <div className="h-4 bg-slate-100 rounded flex-1" />
                        <div className="h-4 bg-slate-100 rounded flex-1" />
                        <div className="h-4 bg-amber-50 rounded w-10" />
                        <div className="h-4 bg-emerald-50 rounded w-14" />
                      </div>
                    ))}
                    <div className="flex gap-3 pt-2 border-t border-slate-100"><div className="h-5 bg-slate-200 rounded flex-1" /><div className="h-5 bg-emerald-100 rounded w-20" /></div>
                  </div>
                ) : detailedInvoice?.items?.length > 0 ? (
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left border-collapse min-w-[800px]">
                      <thead>
                        <tr className="bg-slate-900 text-slate-300">
                          <th className="py-3 px-2 text-[10px] font-black uppercase tracking-widest border-r border-slate-800 text-center w-8">#</th>
                          <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest border-r border-slate-800 whitespace-nowrap">SKU</th>
                          <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-800 text-center whitespace-nowrap">Config</th>
                          <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-800 text-center whitespace-nowrap">Cases</th>
                          <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-800 text-right whitespace-nowrap text-emerald-400">Payout / Case</th>
                          <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-800 text-right whitespace-nowrap">MRP / Case</th>
                          <th className="py-3 px-3 text-[10px] font-black uppercase tracking-widest border-r border-slate-800 text-right whitespace-nowrap text-slate-400">MRP Total</th>
                          <th className="py-3 px-4 text-[10px] font-black uppercase tracking-widest bg-emerald-600 text-emerald-50 shadow-[inset_1px_0_0_rgba(255,255,255,0.1)] text-right whitespace-nowrap">Payout (₹)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {detailedInvoice.items.map((item: InvoiceItem, idx: number) => {
                          const conf = item.confidence;
                          const confColor = conf >= 90 ? 'bg-emerald-400' : conf >= 70 ? 'bg-amber-400' : 'bg-red-400';
                          return (
                          <tr key={idx} className={`hover:bg-slate-50/80 transition-colors ${idx % 2 === 1 ? 'bg-slate-50/40' : ''}`}>
                            <td className="py-3 px-2 border-r border-slate-100 text-center text-[10px] font-bold text-slate-400">{idx + 1}</td>
                            <td className="py-3 px-4 border-r border-slate-100">
                              <div className="flex items-center gap-2">
                                <p className="text-[11px] font-bold text-slate-800 leading-tight" title={item.skuName || item.matchedSkuName}>{item.skuName || item.matchedSkuName}</p>
                                {conf != null && <span title={`Match confidence: ${conf}%`} className={`w-2 h-2 rounded-full shrink-0 ${confColor}`}></span>}
                              </div>
                              {item.invoicedSkuName && item.invoicedSkuName !== (item.skuName || item.matchedSkuName) && (
                                <p className="text-[9px] text-slate-400 mt-1 leading-tight"><span className="font-bold text-slate-500">Invoice:</span> {item.invoicedSkuName}</p>
                              )}
                            </td>
                            <td className="py-3 px-3 border-r border-slate-100 text-center text-[11px] font-medium text-slate-500">{item.caseConfiguration}</td>
                            <td className="py-3 px-3 border-r border-slate-100 text-center">
                              <div className="text-[11px] font-bold text-indigo-700 whitespace-nowrap">{Math.round(item.physicalCases ?? item.invoicedQuantity ?? 0)} <span className="text-[9px] text-slate-400 font-normal">cases</span></div>
                              {item.physicalCases != null && item.invoicedQuantity !== Math.round(item.physicalCases) && <div className="text-[9px] text-slate-400 mt-0.5">(inv: {item.invoicedQuantity} {item.invoicedUnit?.toLowerCase()})</div>}
                            </td>
                            <td className="py-3 px-3 border-r border-slate-100 text-right text-[11px] font-black text-emerald-700 whitespace-nowrap">
                              {payoutEstimate?.ratePerCase != null ? `₹${payoutEstimate.ratePerCase}/case` : '—'}
                            </td>
                            <td className="py-3 px-3 border-r border-slate-100 text-right text-[11px] font-bold text-slate-700">₹{item.mrpPerCase}</td>
                            <td className="py-3 px-3 border-r border-slate-100 text-right text-[11px] font-medium text-slate-400">₹{item.mrpRevenue?.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right text-[11px] font-black text-emerald-800 bg-emerald-50/50">₹{item.payoutAmount?.toLocaleString()}</td>
                          </tr>
                          );
                        })}

                        <tr className="bg-slate-100 border-t border-slate-200">
                          <td colSpan={3} className="py-3 px-4 text-right text-[10px] font-black uppercase tracking-widest text-slate-500">Totals</td>
                          <td className="py-3 px-3 text-center border-r border-slate-200">
                            <div className="text-xs font-black text-indigo-700">{Math.round(detailedInvoice.items.reduce((acc: number, item: InvoiceItem) => acc + (item.physicalCases ?? item.invoicedQuantity ?? 0), 0))} cases</div>
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200 text-right text-[11px] font-black text-emerald-700">
                            {payoutEstimate?.ratePerCase != null ? `₹${payoutEstimate.ratePerCase}/case` : ''}
                          </td>
                          <td className="py-3 px-3 border-r border-slate-200"></td>
                          <td className="py-3 px-3 text-right text-xs font-medium text-slate-400 border-r border-slate-200">
                            ₹{detailedInvoice.totalMrpRevenue?.toLocaleString() || detailedInvoice.items.reduce((acc: number, item: InvoiceItem) => acc + (item.mrpRevenue || 0), 0).toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-right text-sm font-black text-white bg-emerald-600 shadow-inner">
                            ₹{detailedInvoice.estimatedPayoutAmount?.toLocaleString() || detailedInvoice.items.reduce((acc: number, item: InvoiceItem) => acc + (item.payoutAmount || 0), 0).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500 font-medium bg-white">No detailed payout items available for this invoice.</div>
                )}
              </div>

              {(estimateLoading || payoutEstimate) && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Slab & Compliance Details</p>
                  </div>
                  {estimateLoading ? (
                    <div className="animate-pulse space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="h-12 bg-slate-50 rounded-lg" />
                        <div className="h-12 bg-slate-50 rounded-lg" />
                      </div>
                    </div>
                  ) : payoutEstimate && (
                    <div className="space-y-3">
                      {/* Monthly Payout Hero */}
                      {(() => {
                        const monthlyCases = payoutEstimate.totalMonthlyVolumePc ?? payoutEstimate.totalCases;
                        const rate = payoutEstimate.ratePerCase;
                        const monthlyPayout = monthlyCases != null && rate != null ? monthlyCases * rate : null;
                        const tier = payoutEstimate.classification?.toUpperCase();
                        const tierEmoji: Record<string, string> = { SILVER: '🥈', GOLD: '🥇', DIAMOND: '💎', PLATINUM: '🏆' };
                        const tierBg: Record<string, string> = { SILVER: 'bg-slate-100 border-slate-200', GOLD: 'bg-amber-50 border-amber-200', DIAMOND: 'bg-violet-50 border-violet-200', PLATINUM: 'bg-sky-50 border-sky-200' };
                        return (
                          <div className={`rounded-2xl border p-4 ${tier ? (tierBg[tier] || 'bg-slate-50 border-slate-200') : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Monthly Payout Estimate</span>
                              {payoutEstimate.isEstimated && <span className="text-[8px] font-black bg-white/60 border border-slate-200 px-1.5 py-0.5 rounded-md text-slate-500">~ Estimated</span>}
                            </div>
                            <div className="flex items-end justify-between">
                              <div>
                                <p className="text-2xl font-black text-slate-900 tracking-tight">
                                  {monthlyPayout != null ? `₹${Math.round(monthlyPayout).toLocaleString('en-IN')}` : '—'}
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium mt-0.5">
                                  {monthlyCases != null && rate != null ? `${Math.round(monthlyCases)} monthly cases × ₹${rate}/case` : ''}
                                </p>
                              </div>
                              {tier && (
                                <span className="text-xl" title={payoutEstimate.classification}>{tierEmoji[tier] || ''} <span className="text-[10px] font-black text-slate-600">{payoutEstimate.classification?.charAt(0) + payoutEstimate.classification?.slice(1).toLowerCase()}</span></span>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      <div className="grid grid-cols-2 gap-3">
                        {/* Monthly Cases from API */}
                        <div className="bg-indigo-50 rounded-xl px-3 py-2 border border-indigo-100">
                          <p className="text-[9px] font-bold text-indigo-500 uppercase tracking-widest mb-0.5">Monthly Cases</p>
                          <p className="text-sm font-black text-indigo-800">
                            {payoutEstimate.totalMonthlyVolumePc != null
                              ? `${Math.round(payoutEstimate.totalMonthlyVolumePc)} cases`
                              : payoutEstimate.totalCases != null ? `${payoutEstimate.totalCases} cases` : '—'}
                          </p>
                        </div>
                        <div className="bg-emerald-50 rounded-xl px-3 py-2 border border-emerald-100">
                          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Rate / Case</p>
                          <p className="text-sm font-black text-emerald-800">
                            {payoutEstimate.ratePerCase != null ? `₹${payoutEstimate.ratePerCase}/case` : '—'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Slab</p>
                          <p className="text-sm font-black text-slate-800">{payoutEstimate.classification}</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Compliance</p>
                          <p className="text-sm font-black text-slate-800">{payoutEstimate.complianceState?.replace('_', ' ')}</p>
                        </div>
                      </div>

                      {payoutEstimate.minQuantity != null && (
                        <div className="bg-slate-50 rounded-xl px-3 py-2 border border-slate-100">
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Slab Range</p>
                          <p className="text-sm font-black text-slate-800">{payoutEstimate.minQuantity.toLocaleString()}{payoutEstimate.maxQuantity ? ` – ${payoutEstimate.maxQuantity.toLocaleString()}` : '+'} cases</p>
                        </div>
                      )}

                      <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3 border border-amber-100">
                        <svg className="w-3 h-3 text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                        <p className="text-[9px] font-medium text-amber-800 leading-relaxed">Payout is based on total monthly cases across <strong>all invoices</strong> — not just this one.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {reviewingInvoice.status === 'ASM_APPROVED' && (
              <div className="p-5 border-t border-slate-200 bg-white flex gap-3">
                <button onClick={() => onActionClick(reviewingInvoice, 'reject')} className="flex-1 px-4 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200 text-xs font-black uppercase tracking-widest hover:bg-red-100 transition-all">Reject</button>
                <button onClick={() => onActionClick(reviewingInvoice, 'approve')} className="flex-1 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">Approve Invoice</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
