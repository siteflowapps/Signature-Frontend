import React from 'react';
import { Invoice } from '../../../types';

interface ApprovalDialogProps {
  isOpen: boolean;
  dialogAction: 'approve' | 'reject' | null;
  selectedInvoice: Invoice | null;
  remarks: string;
  setRemarks: (val: string) => void;
  processing: boolean;
  onClose: () => void;
  onSubmit: () => void;
}

export const ApprovalDialog: React.FC<ApprovalDialogProps> = ({
  isOpen, dialogAction, selectedInvoice, remarks, setRemarks, processing, onClose, onSubmit
}) => {
  if (!isOpen || !selectedInvoice || !dialogAction) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => !processing && onClose()}>
      <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className={`p-6 border-b border-slate-100 ${dialogAction === 'approve' ? 'bg-emerald-50/50' : 'bg-red-50/50'}`}>
          <div className="flex justify-between items-center">
            <h3 className={`text-xl font-black ${dialogAction === 'approve' ? 'text-emerald-900' : 'text-red-900'} tracking-tight capitalize`}>{dialogAction} Invoice</h3>
            <button onClick={onClose} disabled={processing} className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className={`text-xs font-bold mt-1 ${dialogAction === 'approve' ? 'text-emerald-600' : 'text-red-600'}`}>
            Invoice No: {selectedInvoice.invoiceNumber || selectedInvoice.invoiceNo} · Amount: ₹{(selectedInvoice.totalAmount || selectedInvoice.value || 0).toLocaleString()}
          </p>
        </div>
        <div className="p-6">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Remarks</label>
          <textarea value={remarks} onChange={e => setRemarks(e.target.value)} placeholder={dialogAction === 'approve' ? "Optional approval remarks..." : "Reason for rejection (Required)"}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none h-28"
            disabled={processing} autoFocus></textarea>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button onClick={onClose} disabled={processing} className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50">Cancel</button>
          <button onClick={onSubmit} disabled={processing || (dialogAction === 'reject' && !remarks.trim())}
            className={`flex-1 px-4 py-3 rounded-xl text-white text-xs font-black uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg ${dialogAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-red-600 hover:bg-red-700 shadow-red-600/20'}`}
          >{processing ? 'Processing...' : `Confirm ${dialogAction}`}</button>
        </div>
      </div>
    </div>
  );
};
