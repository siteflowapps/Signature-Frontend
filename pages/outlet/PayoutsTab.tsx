import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OutletPayout, PFPSlab } from '../../types';
import { PFP_SLABS } from '../../data/outletMockData';

interface PayoutsTabProps {
  isCompleted: boolean;
  outletPayouts: OutletPayout[];
  totalPaid: number;
  outletInfo: { name: string; classification: string };
  outletName: string;
  outletId: string;
  formatCurrency: (v: number) => string;
}

const PayoutsTab: React.FC<PayoutsTabProps> = ({
  isCompleted,
  outletPayouts,
  totalPaid,
  outletInfo,
  outletName,
  outletId,
  formatCurrency,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const navigate = useNavigate();

  // Extract unique month-year options from payouts
  const monthOptions = outletPayouts.map(p => `${p.month} ${p.year}`);
  const uniqueMonths: string[] = Array.from(new Set(monthOptions));

  // Filter payouts based on selected month
  const filteredPayouts = selectedMonth === 'all'
    ? outletPayouts
    : outletPayouts.filter(p => `${p.month} ${p.year}` === selectedMonth);

  const filteredTotalPaid = filteredPayouts
    .filter(p => p.status === 'Paid')
    .reduce((sum, p) => sum + p.payoutAmount, 0);

  // Download receipt as print-to-PDF
  const handleDownloadReceipt = (payout: OutletPayout) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return;

    const achievement = payout.forecastQty > 0
      ? Math.round((payout.actualQty / payout.forecastQty) * 100)
      : 0;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payout Receipt — ${payout.month} ${payout.year}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1e293b; padding: 40px; background: #fff; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 3px solid #0f172a; }
          .company-name { font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
          .company-sub { font-size: 11px; color: #64748b; margin-top: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }
          .receipt-title { text-align: right; }
          .receipt-title h2 { font-size: 28px; font-weight: 900; color: #0f172a; letter-spacing: -1px; }
          .receipt-ref { font-size: 13px; font-weight: 700; color: #3b82f6; margin-top: 4px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 36px; }
          .meta-section { }
          .meta-label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
          .meta-value { font-size: 14px; font-weight: 700; color: #1e293b; line-height: 1.5; }
          .metrics { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 16px; margin-bottom: 32px; }
          .metric-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center; }
          .metric-label { font-size: 9px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
          .metric-value { font-size: 24px; font-weight: 900; color: #0f172a; }
          .metric-value.green { color: #059669; }
          .metric-value.amber { color: #d97706; }
          .payout-box { background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 32px; }
          .payout-label { font-size: 10px; font-weight: 800; color: #16a34a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
          .payout-amount { font-size: 36px; font-weight: 900; color: #15803d; letter-spacing: -1px; }
          .status-bar { display: flex; align-items: center; gap: 12px; padding: 16px 20px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; margin-bottom: 16px; }
          .status-dot { width: 10px; height: 10px; border-radius: 50%; background: #059669; }
          .status-text { font-size: 12px; font-weight: 700; color: #059669; }
          .status-ref { font-size: 12px; font-weight: 600; color: #64748b; margin-left: auto; }
          .footer { margin-top: 48px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 10px; color: #94a3b8; font-weight: 600; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="company-name">Signature Outlets</div>
            <div class="company-sub">Enterprise Retail Execution Platform</div>
          </div>
          <div class="receipt-title">
            <h2>PAYOUT RECEIPT</h2>
            <div class="receipt-ref">${payout.transactionRef || 'Processing'}</div>
          </div>
        </div>

        <div class="meta-grid">
          <div class="meta-section">
            <div class="meta-label">Outlet</div>
            <div class="meta-value">${outletName}</div>
          </div>
          <div class="meta-section">
            <div class="meta-label">Period</div>
            <div class="meta-value">${payout.month} ${payout.year}</div>
          </div>
          <div class="meta-section">
            <div class="meta-label">Paid On</div>
            <div class="meta-value">${payout.paidDate || '—'}</div>
          </div>
        </div>

        <div class="metrics">
          <div class="metric-card">
            <div class="metric-label">Forecast</div>
            <div class="metric-value">${payout.forecastQty} cs</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Actual Sales</div>
            <div class="metric-value ${payout.actualQty >= payout.forecastQty ? 'green' : 'amber'}">${payout.actualQty} cs</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Achievement</div>
            <div class="metric-value ${achievement >= 100 ? 'green' : 'amber'}">${achievement}%</div>
          </div>
          <div class="metric-card">
            <div class="metric-label">Eligibility</div>
            <div class="metric-value ${payout.eligibility === 'Eligible' ? 'green' : ''}" style="${payout.eligibility !== 'Eligible' ? 'color:#dc2626;font-size:16px;' : ''}">${payout.eligibility}</div>
          </div>
        </div>

        <div class="payout-box">
          <div class="payout-label">Net Payout Amount</div>
          <div class="payout-amount">₹${payout.payoutAmount.toLocaleString('en-IN')}</div>
        </div>

        <div class="status-bar">
          <div class="status-dot"></div>
          <span class="status-text">Status: ${payout.status}</span>
          ${payout.transactionRef ? `<span class="status-ref">Transaction ID: ${payout.transactionRef}</span>` : ''}
        </div>

        <div class="footer">
          Generated from Signature Outlets Platform · ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => { printWindow.print(); }, 400);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* PFP Agreement Summary */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-8 py-5 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">PFP Agreement — Classification Slabs</p>
            <p className="text-xs font-bold text-slate-500">Exclusive Outlet with Pay for Performance (PFP)</p>
          </div>
          <span className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-widest">Incentive: Up to 2% of GR Value</span>
        </div>
        <div className="p-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest pb-3">S.No.</th>
                <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest pb-3">Classification</th>
                <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest pb-3">Monthly VPO</th>
                <th className="text-left text-[9px] font-black text-slate-400 uppercase tracking-widest pb-3">Model</th>
              </tr>
            </thead>
            <tbody>
              {PFP_SLABS.map((slab, idx) => (
                <tr key={idx} className={`border-b border-slate-50 last:border-0 ${slab.classification === outletInfo.classification ? 'bg-indigo-50/50' : ''}`}>
                  <td className="py-3 text-sm font-bold text-slate-500">{idx + 1}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-black text-slate-800">{slab.classification}</span>
                      {slab.classification === outletInfo.classification && (
                        <span className="text-[8px] font-black text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded-md uppercase tracking-wider">This Outlet</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 text-sm font-bold text-slate-600">{slab.monthlyVPO}</td>
                  <td className="py-3 text-sm font-bold text-slate-600">{slab.model}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payout History */}
      {isCompleted && outletPayouts.length > 0 ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Payout History</h3>
              <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100 uppercase tracking-widest">
                {formatCurrency(selectedMonth === 'all' ? totalPaid : filteredTotalPaid)} Paid
              </span>
            </div>
          </div>

          {/* Month Filter Pills */}
          {uniqueMonths.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">Filter:</span>
              <button
                onClick={() => setSelectedMonth('all')}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-200 ${
                  selectedMonth === 'all'
                    ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                    : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                All
              </button>
              {uniqueMonths.map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMonth(m)}
                  className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-200 ${
                    selectedMonth === m
                      ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                      : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  {m.split(' ')[0].slice(0, 3)} {m.split(' ')[1]}
                </button>
              ))}
            </div>
          )}

          {filteredPayouts.length === 0 ? (
            <div className="bg-white rounded-[28px] border border-slate-100 p-12 text-center">
              <p className="text-sm font-bold text-slate-400">No payouts found for the selected period.</p>
            </div>
          ) : (
            [...filteredPayouts].reverse().map((payout) => (
              <div key={payout.id} className="bg-white rounded-[28px] border border-slate-100 shadow-sm p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-4">
                    <div className="bg-slate-900 text-white text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider">
                      {payout.month.slice(0, 3)} {payout.year}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Monthly Payout</p>
                      <p className="text-[10px] font-bold text-slate-400">Based on PFP Agreement</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Download Receipt Button */}
                    {payout.status === 'Paid' ? (
                      <button
                        onClick={() => handleDownloadReceipt(payout)}
                        className="group flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200 transition-all duration-200 hover:shadow-md hover:shadow-emerald-100"
                        title="Download Payout Receipt"
                      >
                        <svg className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Receipt
                      </button>
                    ) : payout.status === 'Processing' ? (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-indigo-50 text-indigo-400 border border-indigo-100 opacity-60 cursor-not-allowed">
                        <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processing
                      </span>
                    ) : null}
                    <span
                      className={`text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${
                        payout.status === 'Paid'
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                          : payout.status === 'Processing'
                          ? 'bg-indigo-50 text-indigo-600 border-indigo-100'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      {payout.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Forecast</p>
                    <p className="text-lg font-black text-slate-700">{payout.forecastQty} cs</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Actual</p>
                    <p className={`text-lg font-black ${payout.actualQty >= payout.forecastQty ? 'text-emerald-600' : 'text-orange-600'}`}>{payout.actualQty} cs</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Achievement</p>
                    <p
                      className={`text-lg font-black ${
                        payout.forecastQty > 0 && payout.actualQty / payout.forecastQty >= 1
                          ? 'text-emerald-600'
                          : payout.actualQty > 0
                          ? 'text-orange-600'
                          : 'text-slate-400'
                      }`}
                    >
                      {payout.forecastQty > 0 ? `${Math.round((payout.actualQty / payout.forecastQty) * 100)}%` : '—'}
                    </p>
                  </div>
                  <div className={`rounded-2xl p-4 ${payout.eligibility === 'Eligible' ? 'bg-emerald-50' : 'bg-red-50'}`}>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Payout</p>
                    <p className={`text-lg font-black ${payout.eligibility === 'Eligible' ? 'text-emerald-700' : 'text-red-600'}`}>
                      {payout.payoutAmount > 0 ? formatCurrency(payout.payoutAmount) : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-2">
                    {payout.eligibility === 'Eligible' ? (
                      <>
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[10px] font-bold text-emerald-700">Eligible for payout</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-[10px] font-bold text-red-600">Not Eligible — {payout.reason}</span>
                      </>
                    )}
                  </div>
                  {payout.status === 'Paid' && payout.transactionRef && (
                    <div className="text-right">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Settled on {payout.paidDate}</p>
                      <button
                        onClick={() => navigate(`/payouts/settlement/${outletId}/${payout.month.toLowerCase()}`)}
                        className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors cursor-pointer font-mono"
                      >
                        {payout.transactionRef} →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="bg-white rounded-[32px] border border-slate-100 p-16 text-center">
          <div className="text-5xl mb-4">💰</div>
          <h3 className="text-xl font-black text-slate-900 mb-2">No Payouts Yet</h3>
          <p className="text-sm font-bold text-slate-400 max-w-md mx-auto">
            {isCompleted ? 'Payouts will appear after invoices are verified.' : 'Payouts will appear after onboarding is complete and invoices are processed.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default PayoutsTab;
