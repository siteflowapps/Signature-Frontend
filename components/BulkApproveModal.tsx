import React, { useState } from 'react';
import { Invoice } from '../types';

interface BulkApproveModalProps {
  isOpen: boolean;
  invoices: Invoice[];
  totalAmount: number;
  isProcessing: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (remarks: string) => void;
}

/**
 * Confirmation modal for bulk invoice approval.
 * Collects remarks and shows a summary before submitting.
 */
const BulkApproveModal: React.FC<BulkApproveModalProps> = ({
  isOpen,
  invoices,
  totalAmount,
  isProcessing,
  error,
  onClose,
  onSubmit,
}) => {
  const [remarks, setRemarks] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    if (remarks.trim()) onSubmit(remarks.trim());
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={() => !isProcessing && onClose()}
    >
      <div
        className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Approve {invoices.length} Invoice{invoices.length !== 1 ? 's' : ''}</h3>
                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-0.5">Bulk Finance Approval</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary */}
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Invoices</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">{invoices.length}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Amount</p>
                <p className="text-2xl font-black text-slate-900 tracking-tighter">₹{totalAmount.toLocaleString()}</p>
              </div>
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">
              Approval Remarks <span className="text-red-500">*</span>
            </label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              placeholder="Enter your approval remarks (e.g., verified against purchase orders)..."
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none h-28"
              disabled={isProcessing}
              autoFocus
            />
            {!remarks.trim() && (
              <p className="text-[10px] font-bold text-slate-400 mt-1.5 ml-1">Remarks are required before approving</p>
            )}
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isProcessing || !remarks.trim()}
            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Approving {invoices.length}...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Approve All
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkApproveModal;
