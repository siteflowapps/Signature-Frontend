import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../../network/apiService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import { SlideOverPanel } from '../../components/SlideOverPanel';
import { AssetRequest, AssetRequestStatus } from '../../types';
import { STATUS_META, statusBadge, statusLabel, coolerSizeLabel, formatDate, isOverdue } from './coolerMeta';

const TABS: { key: AssetRequestStatus | 'ALL'; label: string }[] = [
  { key: 'ALL', label: 'All' },
  { key: 'ASM_APPROVED', label: 'To Deploy' },
  { key: 'EXECUTED', label: 'Awaiting Photo' },
  { key: 'COMPLIANCE_OVERDUE', label: 'Overdue' },
  { key: 'COMPLIANCE_SUBMITTED', label: 'To Review' },
  { key: 'COMPLIANT', label: 'Compliant' },
];

const PAGE_SIZE = 20;

// ── Detail row (label/value) ───────────────────────────────────────────────────
const DetailRow: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
  <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider shrink-0">{label}</span>
    <span className="text-sm font-medium text-slate-800 text-right">{value}</span>
  </div>
);

// ── Contextual action / detail slide-over ──────────────────────────────────────
const RequestDetailPanel: React.FC<{
  request: AssetRequest;
  onClose: () => void;
  onUpdated: (updated: AssetRequest | null) => void | Promise<void>;
}> = ({ request, onClose, onUpdated }) => {
  const { showToast } = useToast();
  const [verdict, setVerdict] = useState<'COMPLIANT' | 'NON_COMPLIANT'>('COMPLIANT');
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState<null | 'execute' | 'review'>(null);

  const overdue = request.status === 'EXECUTED' && isOverdue(request.complianceDueDate);

  const handleExecute = async () => {
    setBusy('execute');
    try {
      const res = await apiService.assetRequests.execute(request.id);
      if (res.success) { showToast('Cooler marked as installed.', 'success'); await onUpdated(res.data ?? null); }
      else showToast(res.error || 'Failed to mark installed.', 'error');
    } catch (err) { showToast(getErrorMessage(err), 'error'); }
    finally { setBusy(null); }
  };

  const handleReview = async () => {
    if (verdict === 'NON_COMPLIANT' && !remarks.trim()) { showToast('Remarks are required to reject.', 'error'); return; }
    setBusy('review');
    try {
      const res = await apiService.assetRequests.reviewCompliance(request.id, { verdict, remarks: remarks.trim() || undefined });
      if (res.success) { showToast(`Marked ${verdict === 'COMPLIANT' ? 'compliant' : 'non-compliant'}.`, 'success'); await onUpdated(res.data ?? null); }
      else showToast(res.error || 'Failed to submit review.', 'error');
    } catch (err) { showToast(getErrorMessage(err), 'error'); }
    finally { setBusy(null); }
  };

  return (
    <SlideOverPanel
      isOpen
      onClose={onClose}
      title={request.outletName || 'Cooler Request'}
      subtitle="Cooler Request"
      statusBadge={<span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${statusBadge(request.status)}`}>{statusLabel(request.status)}</span>}
    >
      <div className="p-8 space-y-6">
        {/* Summary */}
        <div>
          <DetailRow label="Cooler size" value={coolerSizeLabel(request.coolerSize)} />
          <DetailRow label="Quantity" value={request.quantity ?? '—'} />
          {request.details && <DetailRow label="Details" value={request.details} />}
          <DetailRow label="Raised by" value={request.raisedByName || '—'} />
          <DetailRow label="ASE approved" value={formatDate(request.aseApprovedAt)} />
          <DetailRow label="ASM approved" value={formatDate(request.asmApprovedAt)} />
          {request.assignedAgent && <DetailRow label="Assigned agent" value={request.assignedAgent} />}
          {request.scheduledDeploymentDate && <DetailRow label="Scheduled" value={formatDate(request.scheduledDeploymentDate)} />}
          {request.executedAt && <DetailRow label="Installed on" value={formatDate(request.executedAt)} />}
          {request.complianceDueDate && <DetailRow label="Compliance due" value={formatDate(request.complianceDueDate)} />}
        </div>

        {/* Contextual action */}
        {request.status === 'ASM_APPROVED' && (
          <button onClick={handleExecute} disabled={busy !== null}
            className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/25 transition-colors disabled:opacity-50">
            {busy === 'execute' ? 'Marking…' : 'Mark as Installed'}
          </button>
        )}

        {(request.status === 'EXECUTED' || request.status === 'COMPLIANCE_OVERDUE') && (
          <div className={`p-4 rounded-xl border ${overdue || request.status === 'COMPLIANCE_OVERDUE' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
            <p className={`text-sm font-bold ${overdue || request.status === 'COMPLIANCE_OVERDUE' ? 'text-red-700' : 'text-amber-700'}`}>
              {overdue || request.status === 'COMPLIANCE_OVERDUE' ? 'Compliance overdue' : 'Awaiting compliance photo'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              The field team (CSO/ASE) must upload the installation photo{request.complianceDueDate ? ` by ${formatDate(request.complianceDueDate)}` : ''}. You can review it once submitted.
            </p>
          </div>
        )}

        {request.status === 'COMPLIANCE_SUBMITTED' && (
          <div className="space-y-4">
            {request.compliancePhotoUrl ? (
              <a href={request.compliancePhotoUrl} target="_blank" rel="noreferrer" className="block rounded-xl overflow-hidden border border-slate-200">
                <img src={request.compliancePhotoUrl} alt="Compliance" className="w-full max-h-72 object-cover" />
              </a>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-500">Photo submitted (no preview URL).</div>
            )}
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Review compliance</h4>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setVerdict('COMPLIANT')}
                  className={`py-2.5 text-sm font-bold rounded-xl border transition-all ${verdict === 'COMPLIANT' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}>Compliant</button>
                <button onClick={() => setVerdict('NON_COMPLIANT')}
                  className={`py-2.5 text-sm font-bold rounded-xl border transition-all ${verdict === 'NON_COMPLIANT' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200'}`}>Non-compliant</button>
              </div>
              <textarea value={remarks} onChange={e => setRemarks(e.target.value)} rows={3}
                placeholder={verdict === 'NON_COMPLIANT' ? 'Remarks (required)…' : 'Remarks (optional)…'}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none resize-none" />
              <button onClick={handleReview} disabled={busy !== null}
                className="w-full py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/25 transition-colors disabled:opacity-50">
                {busy === 'review' ? 'Submitting…' : 'Submit review'}
              </button>
            </div>
          </div>
        )}

        {(request.status === 'COMPLIANT' || request.status === 'NON_COMPLIANT') && (
          <div className={`p-4 rounded-xl border ${request.status === 'COMPLIANT' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
            <p className={`text-sm font-bold ${request.status === 'COMPLIANT' ? 'text-emerald-700' : 'text-red-700'}`}>{statusLabel(request.status)}</p>
            {request.complianceReviewedAt && <p className="text-xs text-slate-500 mt-1">Reviewed {formatDate(request.complianceReviewedAt)}</p>}
            {request.complianceReviewRemarks && <p className="text-xs text-slate-600 mt-2 italic">“{request.complianceReviewRemarks}”</p>}
          </div>
        )}

        {(request.status === 'REQUESTED' || request.status === 'ASE_APPROVED') && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-sm text-slate-500">
            This request is still moving through approvals. It will appear in <strong>To Deploy</strong> once ASM-approved.
          </div>
        )}
      </div>
    </SlideOverPanel>
  );
};

const CoolerRequestsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const initialStatus = (searchParams.get('status') as AssetRequestStatus | null) || 'ALL';
  const [activeTab, setActiveTab] = useState<AssetRequestStatus | 'ALL'>(
    TABS.some(t => t.key === initialStatus) ? initialStatus : 'ALL',
  );

  const [rows, setRows] = useState<AssetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<AssetRequest | null>(null);

  const loadList = useCallback(async (tab: AssetRequestStatus | 'ALL', pageNum: number) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiService.assetRequests.list({
        kind: 'COOLER',
        status: tab === 'ALL' ? undefined : tab,
        page: pageNum,
        size: PAGE_SIZE,
      });
      if (res.success && res.data) {
        setRows(res.data.content || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalElements(res.data.totalElements || 0);
      } else {
        setError(res.error || 'Failed to load cooler requests.');
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadCounts = useCallback(async () => {
    const statusTabs = TABS.filter(t => t.key !== 'ALL') as { key: AssetRequestStatus }[];
    const results = await Promise.all(
      statusTabs.map(t =>
        apiService.assetRequests.list({ kind: 'COOLER', status: t.key, page: 0, size: 1 })
          .then(r => ({ key: t.key, count: r.success && r.data ? r.data.totalElements : 0 }))
          .catch(() => ({ key: t.key, count: 0 })),
      ),
    );
    setCounts(Object.fromEntries(results.map(r => [r.key, r.count])));
  }, []);

  useEffect(() => { loadList(activeTab, page); }, [activeTab, page, loadList]);
  useEffect(() => { loadCounts(); }, [loadCounts]);

  const selectTab = (key: AssetRequestStatus | 'ALL') => {
    setActiveTab(key);
    setPage(0);
    if (key === 'ALL') setSearchParams({});
    else setSearchParams({ status: key });
  };

  // Called after an action mutates a request — refresh list, counts, and the open panel.
  const refreshAfterAction = useCallback(async (updated: AssetRequest | null) => {
    await Promise.all([loadList(activeTab, page), loadCounts()]);
    if (updated) {
      // If the request moved out of the current tab, close the panel; else refresh it.
      if (activeTab !== 'ALL' && updated.status !== activeTab) setSelected(null);
      else setSelected(updated);
    }
  }, [activeTab, page, loadList, loadCounts]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Cooler Requests</h1>
          <p className="text-slate-400 text-sm mt-0.5">Deploy approved coolers and review installation compliance.</p>
        </div>
      </div>

      {/* Queue tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {TABS.map(t => {
          const active = activeTab === t.key;
          const count = t.key === 'ALL' ? undefined : counts[t.key];
          return (
            <button
              key={t.key}
              onClick={() => selectTab(t.key)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${
                active ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/25' : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-200'
              }`}
            >
              {t.label}
              {count !== undefined && count > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                  active ? 'bg-white/20 text-white' : t.key === 'COMPLIANCE_OVERDUE' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-500'
                }`}>{count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <span className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
            {loading ? 'Loading…' : `${totalElements} request${totalElements === 1 ? '' : 's'}`}
          </span>
        </div>

        {error ? (
          <div className="p-8 text-center text-sm text-red-600">{error}</div>
        ) : loading ? (
          <div className="p-4 space-y-2">
            {[...Array(6)].map((_, i) => <div key={i} className="h-12 rounded-lg bg-slate-100 animate-pulse" />)}
          </div>
        ) : rows.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <p className="text-sm font-bold text-slate-600">Nothing here</p>
            <p className="text-xs text-slate-400 mt-1">No cooler requests in this queue right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  <th className="px-5 py-3">Outlet</th>
                  <th className="px-5 py-3">Size</th>
                  <th className="px-5 py-3">Qty</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Schedule / Due</th>
                  <th className="px-5 py-3">Raised by</th>
                  <th className="px-5 py-3 w-8"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map(r => {
                  const overdue = r.status === 'EXECUTED' && isOverdue(r.complianceDueDate);
                  return (
                    <tr key={r.id} onClick={() => setSelected(r)} className="hover:bg-slate-50/70 cursor-pointer transition-colors">
                      <td className="px-5 py-3 font-bold text-slate-900">{r.outletName || '—'}</td>
                      <td className="px-5 py-3">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-700 text-[11px] font-bold">{coolerSizeLabel(r.coolerSize)}</span>
                      </td>
                      <td className="px-5 py-3 text-slate-600">{r.quantity ?? '—'}</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold ${statusBadge(r.status)}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${STATUS_META[r.status]?.dot || 'bg-slate-400'}`} />
                          {statusLabel(r.status)}
                        </span>
                      </td>
                      <td className={`px-5 py-3 ${overdue ? 'text-red-600 font-semibold' : 'text-slate-600'}`}>
                        {r.status === 'ASM_APPROVED'
                          ? (r.scheduledDeploymentDate ? `📅 ${formatDate(r.scheduledDeploymentDate)}` : '—')
                          : (r.complianceDueDate ? `Due ${formatDate(r.complianceDueDate)}` : '—')}
                      </td>
                      <td className="px-5 py-3 text-slate-500">{r.raisedByName || '—'}</td>
                      <td className="px-5 py-3 text-slate-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalElements > 0 && (
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
            <div className="text-xs font-semibold text-slate-500">
              Showing <span className="text-slate-700">{page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, totalElements)}</span> of <span className="text-slate-700">{totalElements}</span> requests
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => setPage(prev => Math.max(prev - 1, 0))} disabled={page === 0 || loading}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Previous</button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum: number;
                if (totalPages <= 5) pageNum = i;
                else if (page < 3) pageNum = i;
                else if (page > totalPages - 4) pageNum = totalPages - 5 + i;
                else pageNum = page - 2 + i;
                return (
                  <button key={pageNum} onClick={() => setPage(pageNum)} disabled={loading}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${pageNum === page ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}>{pageNum + 1}</button>
                );
              })}
              <button onClick={() => setPage(prev => Math.min(prev + 1, totalPages - 1))} disabled={page >= totalPages - 1 || loading}
                className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 disabled:opacity-40 disabled:cursor-not-allowed transition-all">Next</button>
            </div>
          </div>
        )}
      </div>

      {selected && (
        <RequestDetailPanel
          key={selected.id}
          request={selected}
          onClose={() => setSelected(null)}
          onUpdated={refreshAfterAction}
        />
      )}
    </div>
  );
};

export default CoolerRequestsPage;
