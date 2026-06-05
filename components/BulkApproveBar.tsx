import React from 'react';

interface BulkApproveBarProps {
  selectedCount: number;
  totalAmount: number;
  onBulkApprove: () => void;
  onClearSelection: () => void;
}

/**
 * Floating action bar shown when invoices are selected for bulk approval.
 * Single Responsibility: Only handles the visual display and user triggers.
 */
const BulkApproveBar: React.FC<BulkApproveBarProps> = ({
  selectedCount,
  totalAmount,
  onBulkApprove,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300">
      <div className="bg-slate-900 text-white rounded-2xl shadow-2xl shadow-slate-900/30 px-6 py-4 flex items-center gap-6 border border-slate-700">
        {/* Selected count */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-lg font-black shadow-lg shadow-indigo-500/30">
            {selectedCount}
          </div>
          <div>
            <p className="text-sm font-bold leading-tight">Invoice{selectedCount !== 1 ? 's' : ''} Selected</p>
            <p className="text-[11px] text-slate-400 font-semibold">₹{totalAmount.toLocaleString()} total</p>
          </div>
        </div>

        <div className="h-8 w-px bg-slate-700" />

        {/* Actions */}
        <button
          onClick={onClearSelection}
          className="text-xs font-bold text-slate-400 hover:text-white uppercase tracking-wider transition-colors"
        >
          Clear
        </button>

        <button
          onClick={onBulkApprove}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Bulk Approve
        </button>
      </div>
    </div>
  );
};

export default BulkApproveBar;
