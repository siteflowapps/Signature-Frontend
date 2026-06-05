import React, { useState, useEffect } from 'react';
import { apiService } from '../../../network/apiService';
import { useToast } from '../../../context/ToastContext';
import { StockItem, StockReportLine } from '../../../types';
import { getErrorMessage } from '../../../utils/errorUtils';

interface SubmitStockPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SubmitStockPanel: React.FC<SubmitStockPanelProps> = ({ isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  
  const [items, setItems] = useState<StockItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [lines, setLines] = useState<Record<string, { closingCases: string; gitCases: string }>>({});

  // Date Logic: Always use the Saturday of the current week (Sunday to Saturday week)
  const getSaturdayOfCurrentWeek = () => {
    const d = new Date();
    const day = d.getDay(); // 0 is Sunday, 6 is Saturday
    const diff = d.getDate() + (6 - day);
    const saturday = new Date(d.setDate(diff));
    
    // Format as YYYY-MM-DD using local time, NOT UTC (toISOString uses UTC)
    const year = saturday.getFullYear();
    const month = String(saturday.getMonth() + 1).padStart(2, '0');
    const dayStr = String(saturday.getDate()).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  const saturdayDate = getSaturdayOfCurrentWeek();
  const reportWeek = saturdayDate;
  const closingAsOn = saturdayDate;
  const gitAsOn = saturdayDate;

  useEffect(() => {
    if (isOpen) {
      loadItems();
    }
  }, [isOpen]);

  const loadItems = async () => {
    try {
      setIsLoading(true);
      const res = await apiService.stock.getItems();
      if (res.success && res.data) {
        // Sort by displayOrder
        const sortedItems = res.data.sort((a, b) => a.displayOrder - b.displayOrder);
        setItems(sortedItems);
        
        // Initialize lines
        const initialLines: Record<string, { closingCases: string; gitCases: string }> = {};
        sortedItems.forEach(item => {
          initialLines[item.id] = { closingCases: '', gitCases: '' };
        });
        setLines(initialLines);
      }
    } catch (error) {
      showToast(getErrorMessage(error), 'error', 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLineChange = (id: string, field: 'closingCases' | 'gitCases', value: string) => {
    // Only allow non-negative integers
    const numericValue = value.replace(/\D/g, '');
    setLines(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: numericValue }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    let hasError = false;
    const submitLines: StockReportLine[] = items.map(item => {
      const line = lines[item.id];
      if (!line.closingCases) hasError = true;
      if (!line.gitCases) hasError = true;
      
      return {
        stockItemId: item.id,
        closingCases: parseInt(line.closingCases || '0', 10),
        gitCases: parseInt(line.gitCases || '0', 10),
      };
    });

    if (hasError) {
      showToast('Please fill out all fields before submitting.', 'error', 3000);
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        reportWeek,
        closingAsOn,
        gitAsOn,
        lines: submitLines
      };

      const res = await apiService.stock.submitReport(payload);
      if (res.success) {
        showToast('Stock report submitted successfully!', 'success', 3000);
        onSuccess();
        onClose();
      } else {
        showToast('Failed to submit report', 'error', 3000);
      }
    } catch (error) {
      showToast(getErrorMessage(error), 'error', 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />
      
      <div className="fixed inset-y-0 right-0 max-w-2xl w-full bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-slate-100">
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-white">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Submit Weekly Stock</h2>
            <p className="text-xs text-slate-500 font-medium mt-1">Record your closing and GIT stock for the week.</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-50 p-6 space-y-6">
          {/* Info Banner */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex gap-4">
            <div className="mt-0.5">
              <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-indigo-900">Submission Details</h4>
              <p className="text-xs text-indigo-700/80 mt-1 leading-relaxed">Dates are automatically calculated for the current week to ensure consistency. Please verify your physical stock matches these records.</p>
              
              <div className="flex flex-wrap gap-3 mt-3">
                <div className="bg-white/60 px-3 py-1.5 rounded-lg border border-indigo-200/50">
                  <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">Submission Date</span>
                  <span className="text-xs font-semibold text-indigo-900">{reportWeek}</span>
                </div>
              </div>
            </div>
          </div>

          <form id="stock-form" onSubmit={handleSubmit} className="bg-white border border-slate-100 shadow-sm rounded-2xl overflow-hidden">
            <div className="grid grid-cols-12 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider items-end">
              <div className="col-span-6 pb-1">Item</div>
              <div className="col-span-3 text-right leading-tight">Closing Floor Stock<br/><span className="text-[9px] text-slate-400 normal-case">(Physical Cases)</span></div>
              <div className="col-span-3 text-right leading-tight">GIT<br/><span className="text-[9px] text-slate-400 normal-case">(Physical Cases)</span></div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                <svg className="animate-spin h-8 w-8 mb-4 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-sm font-medium">Loading stock items...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">No items found to report.</div>
            ) : (
              <div className="divide-y divide-slate-50">
                {items.map(item => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 px-5 py-4 items-center hover:bg-slate-50/50 transition-colors">
                    <div className="col-span-6">
                      <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="text" 
                        inputMode="numeric"
                        required
                        placeholder="0"
                        value={lines[item.id]?.closingCases || ''}
                        onChange={(e) => handleLineChange(item.id, 'closingCases', e.target.value)}
                        className="w-full text-right px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-bold text-slate-900"
                      />
                    </div>
                    <div className="col-span-3">
                      <input 
                        type="text" 
                        inputMode="numeric"
                        required
                        placeholder="0"
                        value={lines[item.id]?.gitCases || ''}
                        onChange={(e) => handleLineChange(item.id, 'gitCases', e.target.value)}
                        className="w-full text-right px-3 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-bold text-slate-900"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </form>
        </div>

        <div className="px-6 py-5 bg-white border-t border-slate-100 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onClose}
            className="px-5 py-2.5 text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-50 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button 
            type="submit" 
            form="stock-form"
            disabled={isSubmitting || isLoading || items.length === 0}
            className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              'Submit Report'
            )}
          </button>
        </div>
      </div>
    </>
  );
};
