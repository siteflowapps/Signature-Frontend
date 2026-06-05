import React, { useState, useRef, useEffect } from 'react';
import { Icons } from '../constants';

interface WeekExportDropdownProps {
  onExport: (date?: string) => void;
  isExporting: boolean;
}

const generateRecentWeeks = () => {
  const weeks = [];
  const now = new Date();
  
  // Find most recent Sunday
  const currentSunday = new Date(now);
  currentSunday.setDate(now.getDate() - now.getDay());
  
  for (let i = 0; i < 4; i++) {
    const sunday = new Date(currentSunday);
    sunday.setDate(currentSunday.getDate() - (i * 7));
    
    const saturday = new Date(sunday);
    saturday.setDate(sunday.getDate() + 6);
    
    const formatDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    
    let label = '';
    if (i === 0) label = `Current Week (${formatDate(sunday)} - ${formatDate(saturday)})`;
    else if (i === 1) label = `Last Week (${formatDate(sunday)} - ${formatDate(saturday)})`;
    else label = `${i} Weeks Ago (${formatDate(sunday)} - ${formatDate(saturday)})`;
    
    // Get YYYY-MM-DD
    // Using simple approach to avoid timezone shifting issues
    const year = sunday.getFullYear();
    const month = String(sunday.getMonth() + 1).padStart(2, '0');
    const day = String(sunday.getDate()).padStart(2, '0');
    const value = `${year}-${month}-${day}`;
    
    weeks.push({ label, value });
  }
  return weeks;
};

export const WeekExportDropdown: React.FC<WeekExportDropdownProps> = ({ onExport, isExporting }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const weeks = generateRecentWeeks();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (value: string | undefined) => {
    setIsOpen(false);
    onExport(value);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div className="flex rounded-xl shadow-sm">
        <button
          onClick={() => handleSelect(undefined)}
          disabled={isExporting}
          className="relative inline-flex items-center gap-2 px-4 py-2 rounded-l-xl border border-r-0 border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all"
        >
          {isExporting ? (
            <svg className="w-4 h-4 animate-spin text-slate-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <Icons.Reports className="w-4 h-4 text-slate-400" />
          )}
          Download Report
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isExporting}
          className="relative inline-flex items-center px-2 py-2 rounded-r-xl border border-slate-200 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 focus:z-10 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-all"
        >
          <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-2 w-72 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black/5 focus:outline-none animate-fade-in overflow-hidden">
          <div className="py-1">
            <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
              Download Historic Report
            </div>
            {weeks.map((week, idx) => (
              <button
                key={idx}
                onClick={() => handleSelect(week.value)}
                className="w-full text-left block px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
              >
                {week.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
