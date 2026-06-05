import React from 'react';
import { StockReport } from '../../../types';
import { SlideOverPanel } from '../../../components/SlideOverPanel';

interface ViewStockReportPanelProps {
  isOpen: boolean;
  onClose: () => void;
  report: StockReport | null;
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return '-';
  }
};

export const ViewStockReportPanel: React.FC<ViewStockReportPanelProps> = ({ isOpen, onClose, report }) => {
  if (!report) return null;

  return (
    <SlideOverPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Stock Report Details"
      subtitle={`Submitted on ${formatDate(report.submittedAt)}`}
      statusBadge={
        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest">
          Submitted
        </span>
      }
    >
      <div className="py-5 border-b border-slate-50">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Report Week</p>
        <p className="text-sm font-bold leading-relaxed text-slate-800">{formatDate(report.reportWeek)}</p>
      </div>
      <div className="py-5 border-b border-slate-50">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Closing As On</p>
        <p className="text-sm font-bold leading-relaxed text-slate-800">{formatDate(report.closingAsOn)}</p>
      </div>
      <div className="py-5 border-b border-slate-50">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Total Items Reported</p>
        <p className="text-sm font-bold leading-relaxed text-slate-800">{report.lines?.length || 0} items</p>
      </div>

      <div className="mt-8">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
          Reported Stock Lines
          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[9px]">{report.lines?.length || 0}</span>
        </p>

        {(!report.lines || report.lines.length === 0) ? (
          <div className="py-8 text-center text-slate-500 text-sm italic">No items found in this report.</div>
        ) : (
          <div className="space-y-4">
            {report.lines.map((line, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                <p className="text-sm font-bold text-slate-900 mb-3">{line.label || 'Unknown Item'}</p>
                <div className="flex gap-4">
                  <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Closing Cases</p>
                    <p className="text-base font-black text-indigo-700">{line.closingCases}</p>
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">GIT Cases</p>
                    <p className="text-base font-black text-indigo-700">{line.gitCases}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </SlideOverPanel>
  );
};
