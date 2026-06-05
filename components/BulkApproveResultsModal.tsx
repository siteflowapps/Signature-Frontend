import React from 'react';
import { BulkApproveResponse } from '../types';

interface BulkApproveResultsModalProps {
  isOpen: boolean;
  results: BulkApproveResponse['data'] | null;
  onClose: () => void;
}

/**
 * Results modal shown after a bulk approval API call completes.
 * Displays success & failure counts and individual failure reasons.
 */
const BulkApproveResultsModal: React.FC<BulkApproveResultsModalProps> = ({
  isOpen,
  results,
  onClose,
}) => {
  if (!isOpen || !results) return null;

  const hasFailures = results.failureCount > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-slate-100 overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`p-6 border-b border-slate-100 ${hasFailures ? 'bg-amber-50/50' : 'bg-emerald-50/50'}`}>
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
              hasFailures
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20'
                : 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20'
            }`}>
              {hasFailures ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">
                {hasFailures ? 'Partially Completed' : 'All Approved'}
              </h3>
              <p className={`text-[10px] font-black uppercase tracking-widest mt-0.5 ${
                hasFailures ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                Bulk Approval Results
              </p>
            </div>
          </div>
        </div>

        {/* Results Body */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Requested</p>
              <p className="text-xl font-black text-slate-900">{results.totalRequested}</p>
            </div>
            <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Approved</p>
              <p className="text-xl font-black text-emerald-700">{results.successCount}</p>
            </div>
            <div className={`rounded-xl p-3 text-center border ${hasFailures ? 'bg-red-50 border-red-100' : 'bg-slate-50 border-slate-100'}`}>
              <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${hasFailures ? 'text-red-600' : 'text-slate-400'}`}>Failed</p>
              <p className={`text-xl font-black ${hasFailures ? 'text-red-700' : 'text-slate-300'}`}>{results.failureCount}</p>
            </div>
          </div>

          {/* Failure details */}
          {hasFailures && results.failures.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Failure Details</p>
              <div className="bg-red-50 rounded-xl border border-red-100 divide-y divide-red-100 max-h-40 overflow-y-auto">
                {results.failures.map((f, i) => (
                  <div key={i} className="px-4 py-2.5 flex items-start gap-2">
                    <svg className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <div>
                      <p className="text-[10px] font-mono font-bold text-red-700 truncate">{f.invoiceId.slice(0, 20)}...</p>
                      <p className="text-[11px] text-red-600 font-medium">{f.reason}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkApproveResultsModal;
