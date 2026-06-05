import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../network/apiService';
import { StockReport, UserRole, StockDashboardData, StockPendingDistributor } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import { SubmitStockPanel } from './components/SubmitStockPanel';
import { ViewStockReportPanel } from './components/ViewStockReportPanel';
import { WeekExportDropdown } from '../../components/WeekExportDropdown';

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

const getCurrentWeekDate = () => {
  const now = new Date();
  const currentSunday = new Date(now);
  currentSunday.setDate(now.getDate() - now.getDay());
  const year = currentSunday.getFullYear();
  const month = String(currentSunday.getMonth() + 1).padStart(2, '0');
  const day = String(currentSunday.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/** Skeleton row for loading state */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-24"></div></td>
    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-20"></div></td>
    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
    <td className="py-4 px-4 w-20"></td>
  </tr>
);

export const DistributorDashboard: React.FC = () => {
  const { user } = useAuth();
  const isDM = user?.role === UserRole.DISTRIBUTOR_MANAGER;
  const { showToast } = useToast();
  const [reports, setReports] = useState<StockReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitPanelOpen, setIsSubmitPanelOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<StockReport | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekDate);

  // DM Specific State
  const [distributors, setDistributors] = useState<{id: string, name: string}[]>([]);
  const [selectedDistributorId, setSelectedDistributorId] = useState<string | null>(null);
  const [dmsLoading, setDmsLoading] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // DM Territory Dashboard State
  const [dashboardData, setDashboardData] = useState<StockDashboardData | null>(null);
  const [pendingList, setPendingList] = useState<StockPendingDistributor[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredDistributors = distributors.filter(d => 
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    if (!isDM) return;
    const loadDms = async () => {
      try {
        setDmsLoading(true);
        const res = await apiService.dm.getMyDistributors();
        if (res.success && res.data) {
          setDistributors(res.data);
        }
      } catch (err) {
        console.error('Failed to load DM distributors', err);
      } finally {
        setDmsLoading(false);
      }
    };

    const loadDmDashboard = async () => {
      try {
        const [dashRes, pendRes] = await Promise.all([
          apiService.stock.getDashboard(),
          apiService.stock.getPending()
        ]);
        if (dashRes.success) setDashboardData(dashRes.data);
        if (pendRes.success) setPendingList(pendRes.data);
      } catch (err) {
        console.error("Failed to load DM dashboard", err);
      }
    };

    loadDms();
    loadDmDashboard();
  }, [isDM]);

  const loadReports = async (page = 0, overrideDistId?: string | null) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const targetDistId = overrideDistId !== undefined ? overrideDistId : selectedDistributorId;

      const res = isDM 
        ? (targetDistId ? await apiService.stock.getReportsByDistributor(targetDistId, page, 20, selectedWeek || undefined) : await apiService.stock.getAllReports({ page, size: 20, week: selectedWeek || undefined }))
        : await apiService.stock.getMyReports(page, 20, selectedWeek || undefined);

      if (res.success && res.data) {
        setReports(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      } else {
        setError('Failed to load stock reports');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports(currentPage, selectedDistributorId);
  }, [currentPage, selectedDistributorId, isDM, selectedWeek]);

  const handleSuccess = () => {
    loadReports(0); // Refresh list
    setCurrentPage(0);
  };

  // Check if submitted this week
  const getToday = () => new Date().toISOString().split('T')[0];
  const submittedThisWeek = reports.some(r => r.reportWeek === getToday() || r.closingAsOn === getToday());

  const handleExport = async (date?: string) => {
    try {
      setIsExporting(true);
      const blob = await apiService.stock.export({ date }); // API will derive dmId from token
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `territory-stock-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed", err);
      showToast("error", "Failed to export stock reports.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── DM Territory Dashboard ── */}
      {isDM && dashboardData && (
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">My Territory Overview</h2>
            <WeekExportDropdown onExport={handleExport} isExporting={isExporting} />
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Distributors</p>
              <p className="text-3xl font-extrabold text-slate-900">{dashboardData.totalDistributors}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Reported</p>
              <p className="text-3xl font-extrabold text-emerald-600">{dashboardData.reported}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-1">Pending</p>
              <p className="text-3xl font-extrabold text-rose-600">{dashboardData.pending}</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Compliance</p>
              <p className="text-3xl font-extrabold text-slate-900">{dashboardData.reportingRatePct}%</p>
            </div>
          </div>
          
          {pendingList.length > 0 && (
            <div className="bg-rose-50 rounded-2xl border border-rose-100 p-4">
              <h3 className="text-sm font-bold text-rose-900 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Action Required: Pending Submissions
              </h3>
              <div className="flex flex-wrap gap-2">
                {pendingList.map(p => (
                  <div key={p.distributorId} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-rose-100 text-xs shadow-sm">
                    <span className="font-bold text-slate-800">{p.distributorName}</span>
                    {p.phone && (
                      <a href={`tel:${p.phone}`} className="text-rose-600 hover:text-rose-800 font-bold ml-1 flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        {p.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Header & Actions ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Stock Hub</h2>
          <p className="text-slate-500 text-sm mt-1">
            {isDM ? 'View weekly stock reports from your distributors.' : 'Manage and submit your weekly stock reports.'}
          </p>
        </div>
        {!isDM && (
          <button
            onClick={() => setIsSubmitPanelOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Submit Weekly Stock
          </button>
        )}
      </div>

      {/* ── Context Switcher & Filters ── */}
      <div className="flex flex-wrap items-center gap-3 relative z-10 w-full mb-6">
        {isDM && distributors.length > 0 && (
          <div className="relative w-full sm:w-[320px]" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm font-bold text-slate-800"
            >
              <span className="truncate">
                {selectedDistributorId ? distributors.find(d => d.id === selectedDistributorId)?.name || 'Unknown Distributor' : 'All Distributors'}
              </span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
  
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white border border-slate-100 rounded-xl shadow-xl max-h-[300px] overflow-hidden flex flex-col">
                <div className="p-3 border-b border-slate-50 bg-slate-50/50">
                  <div className="relative">
                    <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input 
                      type="text" 
                      placeholder="Search distributors..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 font-medium"
                    />
                  </div>
                </div>
                <div className="overflow-y-auto flex-1">
                  <button
                    onClick={() => { setSelectedDistributorId(null); setIsDropdownOpen(false); setSearchQuery(''); setCurrentPage(0); }}
                    className={`w-full text-left px-4 py-3 text-sm font-bold transition-colors border-b border-slate-50 last:border-0 ${!selectedDistributorId ? 'bg-indigo-50/80 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
                  >
                    All Distributors
                  </button>
                  {filteredDistributors.length === 0 ? (
                    <div className="px-4 py-6 text-center text-sm font-medium text-slate-400">
                      No distributors found
                    </div>
                  ) : (
                    filteredDistributors.map(d => (
                      <button
                        key={d.id}
                        onClick={() => { setSelectedDistributorId(d.id); setIsDropdownOpen(false); setSearchQuery(''); setCurrentPage(0); }}
                        className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors border-b border-slate-50 last:border-0 truncate ${selectedDistributorId === d.id ? 'bg-indigo-50/80 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-50'}`}
                      >
                        {d.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        <input
          type="date"
          value={selectedWeek}
          onChange={(e) => { setSelectedWeek(e.target.value); setCurrentPage(0); }}
          className="px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-sm transition-all"
          title="Filter by Week (Select any date in the week)"
        />

        {(selectedDistributorId || selectedWeek !== getCurrentWeekDate()) && (
          <button
            onClick={() => {
              setSelectedDistributorId(null);
              setSelectedWeek(getCurrentWeekDate());
              setCurrentPage(0);
            }}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* ── Table Content ── */}
      {isDM && distributors.length === 0 && !dmsLoading && (
        <div className="p-4 text-sm text-amber-600 bg-amber-50 rounded-xl border border-amber-100 font-medium flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          You don't have any mapped distributors yet. Please contact the administrator.
        </div>
      )}

      {/* ── Error State ── */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>
      )}

      {/* ── Content Area ── */}
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {isLoading ? (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Report Week</th>
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Closing As On</th>
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Items Reported</th>
                <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Submitted At</th>
                <th className="text-right py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        ) : reports.length === 0 ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium mb-2">No stock reports submitted yet.</p>
              {!isDM && <p className="text-slate-400 text-sm">Click "Submit Weekly Stock" to record your first report.</p>}
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Report Week</th>
                    <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Closing As On</th>
                    <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Items Reported</th>
                    <th className="text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Submitted At</th>
                    <th className="text-right py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {reports.map((report) => (
                    <tr 
                      key={report.reportId} 
                      onClick={() => setSelectedReport(report)}
                      className="hover:bg-indigo-50/30 transition-colors cursor-pointer"
                    >
                      <td className="py-4 px-6">
                        <span className="font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">{formatDate(report.reportWeek)}</span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-600">{formatDate(report.closingAsOn)}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
                          {report.lines?.length || 0} items
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-slate-500">{formatDate(report.submittedAt)}</td>
                      <td className="py-4 px-6 text-right">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                          View
                          <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
                <div className="text-xs font-semibold text-slate-600">
                  <span>Page {currentPage + 1} of {totalPages}</span>
                  <span className="ml-2">•</span>
                  <span className="ml-2">{reports.length} of {totalElements} reports</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                    disabled={currentPage === 0}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                    disabled={currentPage >= totalPages - 1}
                    className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <SubmitStockPanel 
        isOpen={isSubmitPanelOpen} 
        onClose={() => setIsSubmitPanelOpen(false)}
        onSuccess={handleSuccess}
      />
      
      <ViewStockReportPanel
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />
    </div>
  );
};

export default DistributorDashboard;
