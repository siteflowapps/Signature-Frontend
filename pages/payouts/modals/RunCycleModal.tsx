import React from 'react';
import { Invoice, PayoutResult } from '../../../types';

interface RunCycleModalProps {
  isOpen: boolean;
  cycleRunning: boolean;
  cycleResults: PayoutResult[] | null;
  cycleError: string;
  financeApprovedCount: number;
  financeApprovedValue: number;
  onClose: () => void;
  onRunCycle: () => void;
  onViewPayouts: () => void;
}

export const RunCycleModal: React.FC<RunCycleModalProps> = ({
  isOpen, cycleRunning, cycleResults, cycleError, financeApprovedCount, financeApprovedValue,
  onClose, onRunCycle, onViewPayouts
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => !cycleRunning && onClose()}>
      <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl border border-slate-100 overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">Run Payout Cycle</h3>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mt-0.5">Monthly Settlement Processing</p>
              </div>
            </div>
            <button onClick={onClose} disabled={cycleRunning} className="w-8 h-8 flex items-center justify-center rounded-full bg-white hover:bg-slate-100 text-slate-400 transition-colors disabled:opacity-50">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
        <div className="p-6">
          {!cycleResults && !cycleError && (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-5">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                  <div>
                    <p className="text-sm font-black text-amber-800 mb-1">This action will process all finance-approved invoices</p>
                    <p className="text-xs font-bold text-amber-700">The system will calculate payout amounts based on configured slab percentages. This is typically run <strong>once per month</strong>.</p>
                  </div>
                </div>
              </div>
              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ready to Process</p>
                    <p className="text-2xl font-black text-slate-900">{financeApprovedCount} <span className="text-sm font-bold text-slate-500">invoice{financeApprovedCount !== 1 ? 's' : ''}</span></p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Value</p>
                    <p className="text-2xl font-black text-slate-900">₹{financeApprovedValue.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </>
          )}
          {cycleResults && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                </div>
                <p className="text-sm font-black text-emerald-800">Payout cycle completed! {cycleResults.length} payout{cycleResults.length !== 1 ? 's' : ''} created.</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 flex justify-between items-center">
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Total Calculated</span>
                <span className="text-xl font-black text-emerald-800">₹{cycleResults.reduce((s, r) => s + r.calculatedAmount, 0).toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-500 font-bold mt-3 text-center">Switch to the <strong>Payouts tab</strong> to review and mark them as paid.</p>
            </div>
          )}
          {cycleError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-5">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-sm font-bold text-red-700">{cycleError}</p>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          {!cycleResults ? (
            <>
              <button onClick={onClose} disabled={cycleRunning} className="flex-1 px-4 py-3 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all disabled:opacity-50">Cancel</button>
              <button onClick={onRunCycle} disabled={cycleRunning || financeApprovedCount === 0}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {cycleRunning ? (
                  <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...</>
                ) : (
                  <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>Confirm & Run Cycle</>
                )}
              </button>
            </>
          ) : (
            <button onClick={onViewPayouts} className="w-full px-4 py-3 rounded-xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all">
              View Payouts →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
