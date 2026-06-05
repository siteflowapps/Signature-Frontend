
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole, DashboardStats } from '../types';
import { useDashboardQuery } from '../hooks/queries/useDashboardQuery';
import DistributorDashboard from './distributor/DistributorDashboard';

// ─── Shared Helpers ───────────────────────────────────────────────────────────
const fmt = (n: number) => n.toLocaleString('en-IN');

// ─── Sub-components ───────────────────────────────────────────────────────────
const KpiCard: React.FC<{
  label: string; value: string | number; sub?: string;
  badge?: string; badgeColor?: string; iconColor?: string;
  icon: React.ReactNode; loading?: boolean; to?: string;
}> = ({ label, value, sub, badge, badgeColor = 'bg-indigo-50 text-indigo-600', iconColor = 'bg-indigo-50 text-indigo-600', icon, loading, to }) => {
  const body = (
    <>
      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-[40px] -mr-12 -mt-12 opacity-30 bg-indigo-100" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconColor}`}>{icon}</div>
        {badge && <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg ${badgeColor}`}>{badge}</span>}
      </div>
      {loading ? (
        <div className="animate-pulse space-y-2">
          <div className="h-8 bg-slate-200 rounded w-20" />
          <div className="h-3 bg-slate-100 rounded w-32" />
        </div>
      ) : (
        <>
          <p className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none relative z-10">{value}</p>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1.5 relative z-10">{label}</p>
          {sub && <p className="text-[10px] text-slate-300 mt-0.5 relative z-10">{sub}</p>}
        </>
      )}
    </>
  );
  const baseClasses = 'bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 relative overflow-hidden block';
  if (to && !loading) {
    return (
      <Link to={to} className={`${baseClasses} hover:border-indigo-200 group cursor-pointer`} aria-label={`View ${label}`}>
        {body}
      </Link>
    );
  }
  return <div className={baseClasses}>{body}</div>;
};

const SectionHeader: React.FC<{ title: string; sub?: string; action?: React.ReactNode }> = ({ title, sub, action }) => (
  <div className="flex items-center justify-between mb-4">
    <div>
      <h3 className="text-base font-black text-slate-900 tracking-tight">{title}</h3>
      {sub && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

// ─── Shared Icons ──────────────────────────────────────────────────────────────
const Icons = {
  outlet: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>,
  users: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>,
  invoice: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  check: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  clock: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  business: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/></svg>,
  distributor: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>,
  payout: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  eye: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>,
  rejected: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
  bolt: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>,
  plus: <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4"/></svg>,
  alert: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>,
};

// ─── Shared hook (React Query powered) ────────────────────────────────────────
const useDashboardStats = () => {
  const { data, isLoading, isError } = useDashboardQuery();

  // Provide default zeros for ALL possible fields
  const s: DashboardStats = data || {};

  return { stats: s, loading: isLoading, error: isError };
};

// ─── Invoice Pipeline Widget ──────────────────────────────────────────────────
const InvoicePipeline: React.FC<{ stats: DashboardStats; loading: boolean }> = ({ stats, loading }) => {
  const stages = [
    { label: 'Submitted', value: stats.submittedInvoices || 0, color: 'bg-slate-400' },
    { label: 'ASE Approved', value: stats.aseApprovedInvoices || 0, color: 'bg-sky-500' },
    { label: 'ASM Approved', value: stats.asmApprovedInvoices || 0, color: 'bg-emerald-500' },
    { label: 'Finance Approved', value: stats.financeApprovedInvoices || 0, color: 'bg-indigo-500' },
    { label: 'Paid', value: stats.paidInvoices || 0, color: 'bg-teal-500' },
    { label: 'Rejected', value: stats.rejectedInvoices || 0, color: 'bg-red-400' },
  ];
  const total = stats.totalInvoices || 1;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
      <SectionHeader title="Invoice Pipeline" sub="Distribution across approval stages" />
      {loading ? (
        <div className="animate-pulse space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-6 bg-slate-100 rounded" />)}</div>
      ) : (
        <div className="space-y-3">
          {stages.map(s => (
            <div key={s.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-bold text-slate-700">{s.label}</span>
                <span className="font-black text-slate-900">{s.value}</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full">
                <div className={`h-full rounded-full ${s.color} transition-all duration-500`} style={{ width: `${Math.round((s.value / total) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── ROLE: ADMIN / SUPER ADMIN ────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const { stats, loading } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Platform Overview</h2>
          <p className="text-slate-400 text-sm mt-0.5">Full system visibility · SiteFlow CDO</p>
        </div>
        <div className="flex gap-2">
          <Link to="/businesses/add" className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all">
            {Icons.plus}Business
          </Link>
          <Link to="/add-user" className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all">
            {Icons.plus}User
          </Link>
          <Link to="/distributors/add" className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all">
            {Icons.plus}Distributor
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard loading={loading} to="/outlets" label="Total Outlets" value={fmt(stats.totalOutlets || 0)} badge="Live" badgeColor="bg-emerald-50 text-emerald-600" icon={Icons.outlet} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard loading={loading} to="/outlets" label="Active Outlets" value={fmt(stats.activeOutlets || 0)} sub={`${stats.inProgressOutlets || 0} in progress`} icon={Icons.check} iconColor="bg-teal-50 text-teal-600" />
        <KpiCard loading={loading} to="/users" label="Total Users" value={fmt(stats.totalUsers || 0)} icon={Icons.users} iconColor="bg-sky-50 text-sky-600" />
        <KpiCard loading={loading} label="Total Invoices" value={fmt(stats.totalInvoices || 0)} badge={`${stats.paidInvoices || 0} Paid`} badgeColor="bg-teal-50 text-teal-600" icon={Icons.invoice} iconColor="bg-violet-50 text-violet-600" />
      </div>

      {/* Invoice Pipeline */}
      <InvoicePipeline stats={stats} loading={loading} />

      {/* Quick Nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Manage Outlets', to: '/outlets', color: 'from-indigo-500 to-indigo-700', icon: '🏪' },
          { label: 'Manage Users', to: '/users', color: 'from-sky-500 to-sky-700', icon: '👥' },
          { label: 'Payouts', to: '/payouts', color: 'from-amber-500 to-orange-600', icon: '💰' },
          { label: 'Businesses', to: '/businesses', color: 'from-violet-500 to-violet-700', icon: '🏢' },
        ].map(q => (
          <Link key={q.to} to={q.to} className={`bg-gradient-to-br ${q.color} text-white rounded-2xl p-5 shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all`}>
            <p className="text-2xl mb-2">{q.icon}</p>
            <p className="text-xs font-black uppercase tracking-widest">{q.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ─── ROLE: BUSINESS ADMIN ─────────────────────────────────────────────────────
const BusinessAdminDashboard: React.FC = () => {
  const { stats, loading } = useDashboardStats();
  const pendingInvoices = (stats.submittedInvoices || 0) + (stats.aseApprovedInvoices || 0) + (stats.asmApprovedInvoices || 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">CDO Program Dashboard</h2>
          <p className="text-slate-400 text-sm mt-0.5">Campa Destination Outlet Program</p>
        </div>
        <div className="flex gap-2">
          <Link to="/add-user" className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-sm shadow-indigo-600/20">
            {Icons.plus}Add User
          </Link>
          <Link to="/distributors/add" className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-800 transition-all">
            {Icons.plus}Add Distributor
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard loading={loading} to="/outlets" label="Total Outlets" value={fmt(stats.totalOutlets || 0)} badge="Live" badgeColor="bg-emerald-50 text-emerald-600" icon={Icons.outlet} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard loading={loading} to="/outlets" label="Active Outlets" value={fmt(stats.activeOutlets || 0)} sub={`${stats.inProgressOutlets || 0} in progress`} icon={Icons.check} iconColor="bg-teal-50 text-teal-600" />
        <KpiCard loading={loading} label="Invoices Pending" value={pendingInvoices}
          badge={pendingInvoices > 0 ? 'Action Req' : 'Clear'} badgeColor={pendingInvoices > 0 ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'}
          icon={Icons.clock} iconColor="bg-orange-50 text-orange-600" />
        <KpiCard loading={loading} label="Paid Invoices" value={fmt(stats.paidInvoices || 0)} icon={Icons.check} iconColor="bg-teal-50 text-teal-600" />
      </div>

      {/* Row 2: Users + Invoice volume */}
      <div className="grid grid-cols-2 gap-4">
        <KpiCard loading={loading} to="/users" label="Total Users" value={fmt(stats.totalUsers || 0)} icon={Icons.users} iconColor="bg-sky-50 text-sky-600" />
        <KpiCard loading={loading} label="Total Invoices" value={fmt(stats.totalInvoices || 0)} icon={Icons.invoice} iconColor="bg-violet-50 text-violet-600" />
      </div>

      {/* Invoice Pipeline */}
      <InvoicePipeline stats={stats} loading={loading} />

      {/* Quick Nav */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'View Outlets', to: '/outlets', color: 'from-indigo-500 to-indigo-700', icon: '🏪' },
          { label: 'Manage Users', to: '/users', color: 'from-sky-500 to-sky-700', icon: '👥' },
          { label: 'Distributors', to: '/distributors', color: 'from-violet-500 to-violet-700', icon: '🚚' },
          { label: 'Map Distributors', to: '/dm-lookup', color: 'from-rose-500 to-rose-700', icon: '🔗' },
        ].map(q => (
          <Link key={q.to} to={q.to} className={`bg-gradient-to-br ${q.color} text-white rounded-2xl p-5 shadow-lg hover:-translate-y-0.5 hover:shadow-xl transition-all`}>
            <p className="text-2xl mb-2">{q.icon}</p>
            <p className="text-xs font-black uppercase tracking-widest">{q.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ─── ROLE: FINANCE ADMIN ──────────────────────────────────────────────────────
const FinanceDashboard: React.FC = () => {
  const { stats, loading } = useDashboardStats();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Finance Dashboard</h2>
          <p className="text-slate-400 text-sm mt-0.5">Invoice verification & payout settlement</p>
        </div>
        <Link to="/payouts" className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-600 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:-translate-y-0.5 transition-all">
          {Icons.bolt}
          Go to Payouts
        </Link>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard loading={loading} label="Review Queue" value={stats.asmApprovedInvoices || 0}
          badge={(stats.asmApprovedInvoices || 0) > 0 ? 'Action Req' : 'Clear'}
          badgeColor={(stats.asmApprovedInvoices || 0) > 0 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}
          sub={(stats.asmApprovedInvoices || 0) > 0 ? 'Awaiting finance sign-off' : 'Nothing to review'}
          icon={Icons.eye} iconColor="bg-red-50 text-red-500" />

        <KpiCard loading={loading} label="Finance Approved" value={fmt(stats.financeApprovedInvoices || 0)}
          sub="Ready for settlement"
          icon={Icons.check} iconColor="bg-indigo-50 text-indigo-600" />

        <KpiCard loading={loading} label="Pending Payouts" value={fmt(stats.pendingPayouts || 0)}
          badge="CALCULATED" badgeColor="bg-violet-50 text-violet-600"
          icon={Icons.payout} iconColor="bg-violet-50 text-violet-600" />

        <div className="bg-slate-900 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/20 rounded-full blur-[40px] -mr-12 -mt-12" />
          <p className="text-[10px] font-black text-teal-400 uppercase tracking-widest mb-1 relative z-10">Paid Invoices</p>
          {loading ? <div className="h-8 bg-white/10 rounded animate-pulse" /> : <p className="text-3xl font-extrabold text-white tracking-tight relative z-10">{fmt(stats.paidInvoices || 0)}</p>}
          <p className="text-[10px] text-slate-500 mt-1 relative z-10">Successfully settled</p>
        </div>
      </div>

      {/* Second Row: More context */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard loading={loading} label="Total Invoices" value={fmt(stats.totalInvoices || 0)} icon={Icons.invoice} iconColor="bg-violet-50 text-violet-600" />
        <KpiCard loading={loading} label="Rejected Invoices" value={fmt(stats.rejectedInvoices || 0)} icon={Icons.rejected} iconColor="bg-red-50 text-red-600" />
        <KpiCard loading={loading} label="Total Payouts" value={fmt(stats.totalPayouts || 0)} sub={`${stats.paidPayouts || 0} paid`} icon={Icons.payout} iconColor="bg-amber-50 text-amber-600" />
      </div>

      {/* Invoice Pipeline */}
      <InvoicePipeline stats={stats} loading={loading} />
    </div>
  );
};

// ─── ROLE: RBL / SM / BUSINESS_USER ──────────────────────────────────────────
const FieldManagerDashboard: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;
  const isRBL = role === UserRole.RBL;
  const isSM  = role === UserRole.SM;

  const { stats, loading } = useDashboardStats();

  const titles: Record<string, { title: string; sub: string }> = {
    RBL:           { title: 'Regional Business Overview',  sub: 'Region-level performance · RBL' },
    SM:            { title: 'Sales Manager Dashboard',     sub: 'Territory monitoring · SM' },
    BUSINESS_USER: { title: 'Business Operations Overview', sub: 'Operations · Field activity' },
    TRADE_MARKETING: { title: 'Trade Marketing Dashboard', sub: 'CDO program activity' },
    CSO:           { title: 'CSO Dashboard',               sub: 'Sales operations overview' },
    FINANCE:       { title: 'Finance Overview',            sub: 'Financial activity summary' },
  };
  const t = titles[role || ''] || { title: 'Operations Overview', sub: 'Territory monitoring' };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{t.title}</h2>
        <p className="text-slate-400 text-sm mt-0.5">{t.sub}</p>
      </div>

      {/* KPIs — Row 1: Outlet stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard loading={loading} to="/outlets" label="Total Outlets" value={fmt(stats.totalOutlets || 0)} badge="Live" badgeColor="bg-emerald-50 text-emerald-600" icon={Icons.outlet} iconColor="bg-emerald-50 text-emerald-600" />
        <KpiCard loading={loading} to="/outlets" label="Active Outlets" value={fmt(stats.activeOutlets || 0)} icon={Icons.check} iconColor="bg-teal-50 text-teal-600" />
        <KpiCard loading={loading} to="/outlets" label="In Progress" value={fmt(stats.inProgressOutlets || 0)} sub="Onboarding pipeline" icon={Icons.clock} iconColor="bg-orange-50 text-orange-600" />
        <KpiCard loading={loading} label="Distributors" value={fmt(stats.totalDistributors || 0)} icon={Icons.distributor} iconColor="bg-violet-50 text-violet-600" />
      </div>

      {/* KPIs — Row 2: Team + Invoice stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {isRBL && <KpiCard loading={loading} label="Sales Managers" value={fmt(stats.totalSm || 0)} icon={Icons.users} iconColor="bg-sky-50 text-sky-600" />}
        {(isRBL || isSM) && <KpiCard loading={loading} label="ASM Count" value={fmt(stats.totalAsm || 0)} icon={Icons.users} iconColor="bg-indigo-50 text-indigo-600" />}
        <KpiCard loading={loading} label="ASE Count" value={fmt(stats.totalAse || 0)} icon={Icons.users} iconColor="bg-sky-50 text-sky-600" />
        {isSM && <KpiCard loading={loading} to="/outlets" label="ASM Pending Outlets" value={fmt(stats.asmPendingOutlets || 0)} badge={(stats.asmPendingOutlets || 0) > 0 ? 'Needs Attention' : 'Clear'} badgeColor={(stats.asmPendingOutlets || 0) > 0 ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600'} icon={Icons.alert} iconColor="bg-orange-50 text-orange-600" />}
      </div>

      {/* Quick Navigation */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'View Outlets',  to: '/outlets',      color: 'from-indigo-500 to-indigo-700', icon: '🏪' },
          { label: 'Distributors',  to: '/distributors', color: 'from-amber-500 to-orange-600',  icon: '🚚' },
          { label: 'Slabs',         to: '/slabs',        color: 'from-slate-700 to-slate-900',   icon: '📊' },
        ].map(q => (
          <Link key={q.to} to={q.to} className={`bg-gradient-to-br ${q.color} text-white rounded-2xl p-5 shadow-lg hover:-translate-y-0.5 transition-all`}>
            <p className="text-2xl mb-2">{q.icon}</p>
            <p className="text-xs font-black uppercase tracking-widest">{q.label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ─── ROOT DASHBOARD ───────────────────────────────────────────────────────────
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role;

  const isAdmin = role === UserRole.SUPER_ADMIN;
  const isBusinessAdmin = role === UserRole.BUSINESS_ADMIN;
  const isFinanceAdmin = role === UserRole.FINANCE_ADMIN;
  const isDistributor = role === UserRole.DISTRIBUTOR || role === UserRole.DISTRIBUTOR_MANAGER;

  if (isAdmin) return <AdminDashboard />;
  if (isBusinessAdmin) return <BusinessAdminDashboard />;
  if (isFinanceAdmin) return <FinanceDashboard />;
  if (isDistributor) return <DistributorDashboard />;
  return <FieldManagerDashboard />;
};

export default Dashboard;
