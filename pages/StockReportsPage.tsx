import React, { useState, useEffect } from 'react';
import { apiService } from '../network/apiService';
import { StockReport, SystemUser, Location, UserRole, StockDashboardData, StockPendingDistributor } from '../types';
import { getErrorMessage } from '../utils/errorUtils';
import { ViewStockReportPanel } from './distributor/components/ViewStockReportPanel';
import { WeekExportDropdown } from '../components/WeekExportDropdown';

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

const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-6"><div className="h-4 bg-slate-200 rounded w-32"></div></td>
    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-24"></div></td>
    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-16"></div></td>
    <td className="py-4 px-6"><div className="h-4 bg-slate-100 rounded w-32"></div></td>
    <td className="py-4 px-4 w-20"></td>
  </tr>
);

export const StockReportsPage: React.FC = () => {
  const [reports, setReports] = useState<StockReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  const [selectedReport, setSelectedReport] = useState<StockReport | null>(null);

  // Filter State
  const [selectedDmId, setSelectedDmId] = useState('');
  const [selectedAseId, setSelectedAseId] = useState('');
  const [selectedAsmId, setSelectedAsmId] = useState('');
  const [selectedSmId, setSelectedSmId] = useState('');
  const [selectedLocationId, setSelectedLocationId] = useState('');
  
  // Set default selected week to current week's Sunday
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeekDate);

  // Dashboard State
  const [dashboardData, setDashboardData] = useState<StockDashboardData | null>(null);
  const [pendingList, setPendingList] = useState<StockPendingDistributor[]>([]);
  const [isPendingOpen, setIsPendingOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Dropdown Options State
  const [dms, setDms] = useState<SystemUser[]>([]);
  const [ases, setAses] = useState<SystemUser[]>([]);
  const [asms, setAsms] = useState<SystemUser[]>([]);
  const [sms, setSms] = useState<SystemUser[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [dmsRes, asesRes, asmsRes, smsRes, locsRes] = await Promise.all([
          apiService.users.getByRole(UserRole.DISTRIBUTOR_MANAGER),
          apiService.users.getByRole(UserRole.ASE),
          apiService.users.getByRole(UserRole.ASM),
          apiService.users.getByRole(UserRole.RSM),
          apiService.locations.getAll()
        ]);
        if (dmsRes.success) setDms(dmsRes.data);
        if (asesRes.success) setAses(asesRes.data);
        if (asmsRes.success) setAsms(asmsRes.data);
        if (smsRes.success) setSms(smsRes.data);
        if (locsRes.success) setLocations(locsRes.data);
      } catch (err) {
        console.error("Failed to load filter options", err);
      }
    };
    fetchOptions();
  }, []);

  const loadReports = async (page = 0) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await apiService.stock.getAllReports({ 
        page, 
        size: 20,
        dmId: selectedDmId || undefined,
        aseId: selectedAseId || undefined,
        asmId: selectedAsmId || undefined,
        smId: selectedSmId || undefined,
        locationId: selectedLocationId || undefined,
        week: selectedWeek || undefined
      });
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

  const loadDashboard = async () => {
    try {
      const res = await apiService.stock.getDashboard({
        week: selectedWeek || undefined,
        locationId: selectedLocationId || undefined,
        dmId: selectedDmId || undefined,
        asmId: selectedAsmId || undefined,
      });
      if (res.success) {
        setDashboardData(res.data);
      }
      
      const pendingRes = await apiService.stock.getPending({
        dmId: selectedDmId || undefined,
        asmId: selectedAsmId || undefined,
      });
      if (pendingRes.success) {
        setPendingList(pendingRes.data);
      }
    } catch (err) {
      console.error("Failed to load dashboard data", err);
    }
  };

  useEffect(() => {
    loadReports(currentPage);
    if (currentPage === 0) {
      loadDashboard();
    }
  }, [currentPage, selectedDmId, selectedAseId, selectedAsmId, selectedSmId, selectedLocationId, selectedWeek]);

  const handleExport = async (date?: string) => {
    try {
      setIsExporting(true);
      const blob = await apiService.stock.export({ dmId: selectedDmId || undefined, date });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `stock-reports-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Export failed", err);
      setError("Failed to export stock reports.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Stock Reports Overview</h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Monitor weekly stock submissions across all distributors.
          </p>
        </div>
        <div>
          <WeekExportDropdown onExport={handleExport} isExporting={isExporting} />
        </div>
      </div>

      {/* KPIs Widget */}
      {dashboardData && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total Distributors</p>
            <p className="text-3xl font-extrabold text-slate-900">{dashboardData.totalDistributors}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Reported</p>
            <p className="text-3xl font-extrabold text-emerald-600">{dashboardData.reported}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm relative overflow-hidden group">
            <p className="text-[11px] font-bold text-rose-500 uppercase tracking-wider mb-1">Pending</p>
            <p className="text-3xl font-extrabold text-rose-600">{dashboardData.pending}</p>
            {dashboardData.pending > 0 && (
              <button 
                onClick={() => setIsPendingOpen(true)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                View List
              </button>
            )}
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Compliance</p>
            <p className="text-3xl font-extrabold text-slate-900">{dashboardData.reportingRatePct}%</p>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex flex-wrap items-center gap-3">
        <select
          value={selectedDmId}
          onChange={(e) => { setSelectedDmId(e.target.value); setCurrentPage(0); }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All DMs</option>
          {dms.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <select
          value={selectedAseId}
          onChange={(e) => { setSelectedAseId(e.target.value); setCurrentPage(0); }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All ASEs</option>
          {ases.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <select
          value={selectedAsmId}
          onChange={(e) => { setSelectedAsmId(e.target.value); setCurrentPage(0); }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All ASMs</option>
          {asms.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <select
          value={selectedSmId}
          onChange={(e) => { setSelectedSmId(e.target.value); setCurrentPage(0); }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All RSMs</option>
          {sms.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>

        <select
          value={selectedLocationId}
          onChange={(e) => { setSelectedLocationId(e.target.value); setCurrentPage(0); }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="">All Locations</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.city}, {l.state}</option>)}
        </select>

        <input
          type="date"
          value={selectedWeek}
          onChange={(e) => { setSelectedWeek(e.target.value); setCurrentPage(0); }}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          title="Filter by Week (Select any date in the week)"
        />

        {(selectedDmId || selectedAseId || selectedAsmId || selectedSmId || selectedLocationId || selectedWeek !== getCurrentWeekDate()) && (
          <button
            onClick={() => {
              setSelectedDmId('');
              setSelectedAseId('');
              setSelectedAsmId('');
              setSelectedSmId('');
              setSelectedLocationId('');
              setSelectedWeek(getCurrentWeekDate());
              setCurrentPage(0);
            }}
            className="ml-auto px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 text-sm font-semibold text-red-600 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-3">
          <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {error}
        </div>
      )}

      {/* Data Grid */}
      <div className="bg-white rounded-3xl border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Distributor</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Report Week</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Closing Date</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Items</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Submitted At</th>
                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100/80">
              {isLoading ? (
                [...Array(10)].map((_, i) => <SkeletonRow key={i} />)
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 mb-4">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                    </div>
                    <p className="text-sm font-bold text-slate-900">No reports found</p>
                    <p className="text-xs font-medium text-slate-400 mt-1">There are no submitted stock reports yet.</p>
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr 
                    key={report.reportId}
                    onClick={() => setSelectedReport(report)}
                    className="group hover:bg-slate-50/80 transition-colors cursor-pointer"
                  >
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {report.distributorName || 'Unknown Distributor'}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm font-semibold text-slate-600">
                      {formatDate(report.reportWeek)}
                    </td>
                    <td className="py-4 px-6 text-sm font-medium text-slate-500">
                      {formatDate(report.closingAsOn)}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {report.lines?.length || 0}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs font-medium text-slate-400">
                      {formatDate(report.submittedAt)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 group-hover:text-indigo-800 transition-colors">
                        View
                        <svg className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Page <span className="text-slate-900">{currentPage + 1}</span> of <span className="text-slate-900">{totalPages}</span>
              <span className="mx-2 text-slate-300">|</span>
              Total <span className="text-slate-900">{totalElements}</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      <ViewStockReportPanel
        isOpen={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
      />

      {/* Pending Slide-over */}
      {isPendingOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm" onClick={() => setIsPendingOpen(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-left">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Pending Submissions</h3>
                <p className="text-sm text-slate-500 mt-1">{pendingList.length} distributors haven't reported</p>
              </div>
              <button onClick={() => setIsPendingOpen(false)} className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-3">
              {pendingList.map(p => (
                <div key={p.distributorId} className="flex items-center justify-between p-4 rounded-xl border border-slate-100 bg-slate-50">
                  <div>
                    <p className="font-bold text-slate-900">{p.distributorName}</p>
                    {p.phone && <p className="text-xs font-medium text-slate-500 mt-0.5">{p.phone}</p>}
                  </div>
                  <a href={`tel:${p.phone}`} className="p-2 bg-white text-indigo-600 rounded-lg shadow-sm border border-slate-200 hover:border-indigo-200 transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  </a>
                </div>
              ))}
              {pendingList.length === 0 && (
                <div className="text-center py-12 text-slate-400">All caught up!</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockReportsPage;
