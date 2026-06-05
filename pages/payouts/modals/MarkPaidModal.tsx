import React from 'react';
import { PayoutResult } from '../../../types';

interface MarkPaidModalProps {
  isOpen: boolean;
  payout: PayoutResult | null;
  transactionId: string;
  setTransactionId: (id: string) => void;
  onClose: () => void;
  onConfirm: () => void;
  processing: boolean;
}

export const MarkPaidModal: React.FC<MarkPaidModalProps> = ({
  isOpen, payout, transactionId, setTransactionId, onClose, onConfirm, processing
}) => {
  if (!isOpen || !payout) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => !processing && onClose()}>
      <div className="bg-white rounded-[32px] w-full max-w-sm shadow-2xl border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 bg-teal-50/50">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-black text-teal-900 tracking-tight">Mark as Paid</h3>
            <button
              onClick={onClose}
              disabled={processing}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <p className="text-xs font-bold text-teal-600 mt-1">Payout • ₹{payout.calculatedAmount.toLocaleString()}</p>
        </div>
        
        <div className="p-6">
          <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Transaction ID</label>
          <input
            type="text"
            value={transactionId}
            onChange={e => setTransactionId(e.target.value)}
            placeholder="e.g. UTR-123456789"
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all"
            disabled={processing}
            autoFocus
          />
        </div>
        
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={processing || !transactionId.trim()}
            className="flex-1 px-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-teal-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? 'Saving...' : 'Confirm Paid'}
          </button>
        </div>
      </div>
    </div>
  );
};
