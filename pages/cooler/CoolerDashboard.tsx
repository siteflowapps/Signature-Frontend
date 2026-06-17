import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../../network/apiService';
import { useAuth } from '../../context/AuthContext';
import { AssetRequest, AssetRequestStatus } from '../../types';
import { statusBadge, statusLabel, coolerSizeLabel, formatDate, isOverdue } from './coolerMeta';

interface Kpi {
  status: AssetRequestStatus;
  label: string;
  hint: string;
  accent: string;   // text + icon color
  ring: string;     // border accent on hover
}

// Ordered as the cooler workflow flows: deploy → install → review → done.
const KPIS: Kpi[] = [
  { status: 'ASM_APPROVED',         label: 'To Deploy',      hint: 'Approved, ready to install', accent: 'text-indigo-600 bg-indigo-50', ring: 'hover:border-indigo-200' },
  { status: 'EXECUTED',             label: 'Awaiting Photo', hint: 'Installed, photo pending',   accent: 'text-amber-600 bg-amber-50',   ring: 'hover:border-amber-200' },
  { status: 'COMPLIANCE_OVERDUE',   label: 'Overdue',        hint: 'Compliance window passed',   accent: 'text-red-600 bg-red-50',       ring: 'hover:border-red-200' },
  { status: 'COMPLIANCE_SUBMITTED', label: 'To Review',      hint: 'Photo awaiting your review',  accent: 'text-fuchsia-600 bg-fuchsia-50', ring: 'hover:border-fuchsia-200' },
  { status: 'COMPLIANT',            label: 'Compliant',      hint: 'Verified installations',     accent: 'text-emerald-600 bg-emerald-50', ring: 'hover:border-emerald-200' },
  { status: 'NON_COMPLIANT',        label: 'Non-compliant',  hint: 'Failed review',              accent: 'text-rose-600 bg-rose-50',     ring: 'hover:border-rose-200' },
];

const CoolerIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="6" y="3" width="12" height="18" rx="2" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 11h12M10 6.5v2M10 14.5v2" />
  </svg>
);

const CoolerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [attention, setAttention] = useState<AssetRequest[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      // Counts per status (cheap: size=1 reads totalElements)
      const countResults = await Promise.all(
        KPIS.map(k =>
          apiService.assetRequests.list({ kind: 'COOLER', status: k.status, page: 0, size: 1 })
            .then(r => ({ status: k.status, count: r.success && r.data ? r.data.totalElements : 0 }))
            .catch(() => ({ status: k.status, count: 0 })),
        ),
      );
      // "Needs attention" = the two actionable queues (to deploy + to review), top few
      const [deploy, review] = await Promise.all([
        apiService.assetRequests.list({ kind: 'COOLER', status: 'ASM_APPROVED', page: 0, size: 5 }).catch(() => null),
        apiService.assetRequests.list({ kind: 'COOLER', status: 'COMPLIANCE_SUBMITTED', page: 0, size: 5 }).catch(() => null),
      ]);
      if (cancelled) return;
      setCounts(Object.fromEntries(countResults.map(c => [c.status, c.count])));
      const items = [
        ...(deploy?.success && deploy.data ? deploy.data.content : []),
        ...(review?.success && review.data ? review.data.content : []),
      ].slice(0, 6);
      setAttention(items);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const totalActive = (counts['ASM_APPROVED'] || 0) + (counts['EXECUTED'] || 0) + (counts['COMPLIANCE_OVERDUE'] || 0) + (counts['COMPLIANCE_SUBMITTED'] || 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-indigo-500/20">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center"><CoolerIcon /></div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Cooler Team{user?.name ? ` · ${user.name}` : ''}</h1>
            <p className="text-indigo-100 text-sm mt-0.5">
              {loading ? 'Loading your deployment queue…' : `${totalActive} active request${totalActive === 1 ? '' : 's'} in your pipeline`}
            </p>
          </div>
          <Link to="/cooler-requests" className="ml-auto px-4 py-2.5 bg-white text-indigo-700 rounded-xl text-sm font-bold hover:bg-indigo-50 transition-colors">
            Open Workspace
          </Link>
        </div>
      </div>

      {/* KPI pipeline */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {KPIS.map(k => (
          <button
            key={k.status}
            onClick={() => navigate(`/cooler-requests?status=${k.status}`)}
            className={`text-left bg-white rounded-2xl border border-slate-100 p-5 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5 ${k.ring}`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${k.accent}`}><CoolerIcon /></div>
            {loading ? (
              <div className="h-8 w-12 bg-slate-100 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none">{counts[k.status] ?? 0}</p>
            )}
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mt-1.5">{k.label}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">{k.hint}</p>
          </button>
        ))}
      </div>

      {/* Needs attention */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-black text-slate-800 tracking-tight">Needs your attention</h2>
          <Link to="/cooler-requests" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">View all →</Link>
        </div>
        {loading ? (
          <div className="p-4 space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />)}</div>
        ) : attention.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-sm font-bold text-slate-600">You're all caught up 🎉</p>
            <p className="text-xs text-slate-400 mt-1">No coolers waiting to deploy or review.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {attention.map(r => {
              const overdue = r.status === 'EXECUTED' && isOverdue(r.complianceDueDate);
              return (
                <Link
                  key={r.id}
                  to={`/cooler-requests?status=${r.status}`}
                  className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/70 transition-colors"
                >
                  <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center"><CoolerIcon /></div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-800 truncate">{r.outletName || '—'}</p>
                    <p className="text-xs text-slate-400">{coolerSizeLabel(r.coolerSize)} · Qty {r.quantity ?? '—'}{r.raisedByName ? ` · ${r.raisedByName}` : ''}</p>
                  </div>
                  <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-bold ${overdue ? 'bg-red-100 text-red-700' : statusBadge(r.status)}`}>
                    {overdue ? 'Overdue' : r.status === 'ASM_APPROVED' ? 'Deploy' : statusLabel(r.status)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CoolerDashboard;
