import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PAYOUT_RECORDS, OUTLET_BANK_DETAILS } from '../../data/payoutMockData';
import { OUTLET_INFO } from '../../data/outletMockData';
import { apiService } from '../../network/apiService';
import { Invoice } from '../../types';
import { getErrorMessage } from '../../utils/errorUtils';

const SettlementDetail: React.FC = () => {
  const { outletId, month } = useParams<{ outletId: string; month: string }>();
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [invoiceError, setInvoiceError] = useState('');

  // Dialog State
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);

  const fetchInvoices = useCallback(async () => {
    if (!outletId) return;
    setLoadingInvoices(true);
    setInvoiceError('');
    try {
      const res = await apiService.invoices.getByOutlet(outletId, 0, 100);
      if (res.success) {
        setInvoices(res.data.content);
      } else {
        setInvoiceError(res.error || 'Failed to fetch invoices');
      }
    } catch (err: unknown) {
      setInvoiceError(getErrorMessage(err));
    } finally {
      setLoadingInvoices(false);
    }
  }, [outletId]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleActionClick = (invoice: Invoice, action: 'approve' | 'reject') => {
    setSelectedInvoice(invoice);
    setDialogAction(action);
    setRemarks('');
    setShowDialog(true);
  };

  const handleDialogSubmit = async () => {
    if (!selectedInvoice || !dialogAction) return;
    setProcessing(true);
    try {
      let res;
      if (dialogAction === 'approve') {
        res = await apiService.invoices.approve(selectedInvoice.id, remarks);
      } else {
        res = await apiService.invoices.reject(selectedInvoice.id, remarks);
      }
      
      if (res.success) {
        setShowDialog(false);
        fetchInvoices(); // Refresh list to update status
      } else {
        alert(res.error || `Failed to ${dialogAction} invoice`);
      }
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setProcessing(false);
    }
  };

  // Find the payout record for this outlet + month
  const record = PAYOUT_RECORDS.find(
    r => r.outletId === outletId && r.month.toLowerCase() === month?.toLowerCase()
  );

  const outletInfo = outletId ? OUTLET_INFO[outletId] : null;
  const bankDetails = outletId ? OUTLET_BANK_DETAILS[outletId] : null;

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 100 20 10 10 0 000-20z" /></svg>
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-2">Settlement Not Found</h3>
        <p className="text-slate-500 font-bold text-sm mb-6">No payout record found for this outlet and month.</p>
        <button
          onClick={() => navigate('/payouts')}
          className="px-6 py-3 bg-indigo-600 text-white rounded-2xl text-xs font-black uppercase tracking-[0.15em] hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
        >
          Back to Payouts
        </button>
      </div>
    );
  }

  const statusStyles: Record<string, { bg: string; text: string; border: string }> = {
    Eligible: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
    Pending: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
    Settled: { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
    'On Hold': { bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-200' },
  };
  const sty = statusStyles[record.status] || statusStyles.Eligible;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 max-w-[1100px] mx-auto">
      {/* Back Button */}
      <button
        onClick={() => navigate('/payouts')}
        className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors mb-2 group"
      >
        <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Payouts
      </button>

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Settlement Detail</h2>
            <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border ${sty.bg} ${sty.text} ${sty.border}`}>
              {record.status}
            </span>
          </div>
          <p className="text-slate-500 font-bold text-sm">{record.outletName} · {record.month} {record.year}</p>
        </div>

        <div className="bg-slate-900 text-white px-8 py-5 rounded-[24px] text-center shadow-2xl shadow-slate-900/20">
          <p className="text-[9px] font-black text-indigo-300 uppercase tracking-[0.25em] mb-1">Payout Amount</p>
          <p className="text-3xl font-black tracking-tighter">₹{record.payoutAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* ── Info Grid ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Outlet Info */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5">Outlet Information</h4>
          <div className="space-y-4">
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Name</p>
              <p className="text-sm font-black text-slate-800">{record.outletName}</p>
            </div>
            {outletInfo && (
              <>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Code</p>
                  <p className="text-sm font-bold text-slate-600 font-mono">{outletInfo.code}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Address</p>
                  <p className="text-sm font-bold text-slate-600">{outletInfo.address}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Owner</p>
                  <p className="text-sm font-bold text-slate-600">{outletInfo.owner}</p>
                </div>
              </>
            )}
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Classification</p>
              <span className="px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest bg-violet-50 text-violet-700 border border-violet-200">{record.classification}</span>
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] p-8">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-5">Bank Details</h4>
          {bankDetails ? (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Beneficiary</p>
                <p className="text-sm font-black text-slate-800">{bankDetails.beneficiaryName}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Account Number</p>
                <p className="text-sm font-bold text-slate-600 font-mono">{bankDetails.accountNo}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">IFSC Code</p>
                <p className="text-sm font-bold text-slate-600 font-mono">{bankDetails.ifsc}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Bank</p>
                <p className="text-sm font-bold text-slate-600">{bankDetails.bankName}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400 font-bold">Bank details not available.</p>
          )}
        </div>
      </div>

      {/* ── Invoices Table ── */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden">
        <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center">
          <h4 className="font-black text-slate-900 tracking-tight">Outlet Invoices</h4>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">
            {invoices.length} {invoices.length === 1 ? 'Invoice' : 'Invoices'}
          </span>
        </div>
        
        {loadingInvoices ? (
          <div className="px-6 py-12 text-center text-slate-400 font-bold text-sm">Loading invoices...</div>
        ) : invoiceError ? (
          <div className="px-6 py-12 text-center text-red-500 font-bold text-sm">{invoiceError}</div>
        ) : invoices.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 font-bold text-sm">No invoices found for this outlet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/40">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Invoice No.</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Date</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SKUs</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Amount</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-700 font-mono">{inv.invoiceNumber || inv.invoiceNo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-bold text-slate-600">{inv.invoiceDate || inv.date}</p>
                      {inv.uploadDate && <p className="text-[9px] text-slate-400 uppercase mt-0.5">Uploaded {new Date(inv.uploadDate).toLocaleDateString()}</p>}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-bold text-slate-600 max-w-[200px] truncate" title={inv.skus}>{inv.skus}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-black text-slate-900">₹{(inv.totalAmount || inv.value || 0).toLocaleString()}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                        inv.status === 'FINANCE_APPROVED' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                        inv.status === 'ASM_APPROVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        inv.status === 'REJECTED' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-slate-50 text-slate-500 border-slate-200'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {inv.status === 'ASM_APPROVED' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleActionClick(inv, 'approve')}
                            className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-colors border border-emerald-200"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleActionClick(inv, 'reject')}
                            className="bg-red-50 text-red-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-100 transition-colors border border-red-200"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                      {inv.status !== 'ASM_APPROVED' && (
                        <span className="text-[10px] font-bold text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {invoices.length > 0 && (
          <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/30 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Calculated Total</span>
            <span className="text-lg font-black text-slate-900">
              ₹{invoices.reduce((sum, inv) => sum + (inv.totalAmount || inv.value || 0), 0).toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* ── Settlement Info (if Settled) ── */}
      {record.status === 'Settled' && (
        <div className="bg-gradient-to-br from-indigo-50 to-indigo-50 rounded-[32px] border border-indigo-100 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <h4 className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] mb-5">Settlement Information</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Transaction ID</p>
              <p className="text-sm font-black text-indigo-800 font-mono">{record.transactionId}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Settled Date</p>
              <p className="text-sm font-bold text-indigo-800">{record.settledDate}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Payout Amount</p>
              <p className="text-sm font-black text-indigo-800">₹{record.payoutAmount.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Linked By</p>
              <p className="text-sm font-bold text-indigo-800">{record.linkedBy}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Pending/Eligible Notice ── */}
      {(record.status === 'Pending' || record.status === 'Eligible') && (
        <div className="bg-orange-50 rounded-[32px] border border-orange-200 p-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center mt-1">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <div>
            <p className="text-sm font-black text-orange-800 mb-1">Awaiting Settlement</p>
            <p className="text-sm font-bold text-orange-700">This payout is {record.status.toLowerCase()}. Link the Transaction ID from the bank to mark it as settled.</p>
            {record.remarks && (
              <p className="text-xs font-bold text-orange-600 mt-2 bg-orange-100/50 px-3 py-1.5 rounded-lg inline-block">{record.remarks}</p>
            )}
          </div>
        </div>
      )}

      {/* ── On Hold Notice ── */}
      {record.status === 'On Hold' && (
        <div className="bg-slate-50 rounded-[32px] border border-slate-200 p-8 flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-slate-200 flex items-center justify-center mt-1">
            <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
          </div>
          <div>
            <p className="text-sm font-black text-slate-800 mb-1">On Hold</p>
            <p className="text-sm font-bold text-slate-600">{record.remarks || 'This payout is currently on hold.'}</p>
          </div>
        </div>
      )}

      {/* ── Approval/Rejection Dialog ── */}
      {showDialog && selectedInvoice && dialogAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => !processing && setShowDialog(false)}>
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className={`p-6 border-b border-slate-100 ${dialogAction === 'approve' ? 'bg-emerald-50/50' : 'bg-red-50/50'}`}>
              <div className="flex justify-between items-center">
                <h3 className={`text-xl font-black ${dialogAction === 'approve' ? 'text-emerald-900' : 'text-red-900'} tracking-tight capitalize`}>
                  {dialogAction} Invoice
                </h3>
                <button
                  onClick={() => setShowDialog(false)}
                  disabled={processing}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-50"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <p className={`text-xs font-bold mt-1 ${dialogAction === 'approve' ? 'text-emerald-600' : 'text-red-600'}`}>
                {selectedInvoice.invoiceNumber || selectedInvoice.invoiceNo} · ₹{(selectedInvoice.totalAmount || selectedInvoice.value || 0).toLocaleString()}
              </p>
            </div>
            
            <div className="p-6">
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Remarks</label>
              <textarea
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder={dialogAction === 'approve' ? "Optional approval remarks..." : "Reason for rejection (Required)"}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none h-28"
                disabled={processing}
                autoFocus
              ></textarea>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
              <button
                onClick={() => setShowDialog(false)}
                disabled={processing}
                className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDialogSubmit}
                disabled={processing || (dialogAction === 'reject' && !remarks.trim())}
                className={`flex-1 px-4 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${
                  dialogAction === 'approve'
                    ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                    : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'
                }`}
              >
                {processing ? 'Processing...' : `Confirm ${dialogAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettlementDetail;
