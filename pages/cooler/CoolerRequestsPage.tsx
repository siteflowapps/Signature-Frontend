import React, { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { apiService } from '../../network/apiService';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import { SlideOverPanel } from '../../components/SlideOverPanel';
import { AssetRequest, AssetRequestStatus } from '../../types';
import { STATUS_META, statusBadge, statusLabel, coolerSizeLabel, formatDate, isOverdue } from './coolerMeta';

const TABS: { key: AssetRequestStatus | 'ALL'; label: string }[] = [
  { key: 'ASM_APPROVED', label: 'To Deploy' },
  { key: 'EXECUTED', label: 'Awaiting Photo' },
  { key: 'COMPLIANCE_OVERDUE', label: 'Overdue' },
  { key: 'COMPLIANCE_SUBMITTED', label: 'To Review' },
  { key: 'COMPLIANT', label: 'Compliant' },
  { key: 'ALL', label: 'All' },
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
  const [agent, setAgent] = useState(request.assignedAgent || '');
  const [schedule, setSchedule] = useState(request.scheduledDeploymentDate || '');
  const [verdict, setVerdict] = useState<'COMPLIANT' | 'NON_COMPLIANT'>('COMPLIANT');
  const [remarks, setRemarks] = useState('');
  const [busy, setBusy] = useState<null | 'assign' | 'execute' | 'review'>(null);

  const overdue = request.status === 'EXECUTED' && isOverdue(request.complianceDueDate);

  const handleAssign = async () => {
    if (!agent.trim() || !schedule) { showToast('Enter an agent and a deployment date.', 'error'); return; }
    setBusy('assign');
    try {
      const res = await apiService.assetRequests.assign(request.id, { assignedAgent: agent.trim(), scheduledDeploymentDate: schedule });
      if (res.success) { showToast('Installation assigned.', 'success'); await onUpdated(res.data ?? null); }
      else showToast(res.error || 'Failed to assign.', 'error');
    } catch (err) { showToast(getErrorMessage(err), 'error'); }
    finally { setBusy(null); }
  };

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
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 space-y-3">
              <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider">Assign installation</h4>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500">Installation agent</label>
                <input value={agent} onChange={e => setAgent(e.target.value)} placeholder="Agent name"
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none" />
              </div>
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-500">Scheduled deployment date</label>
                <input type="date" value={schedule} onChange={e => setSchedule(e.target.value)}
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none" />
              </div>
              <button onClick={handleAssign} disabled={busy !== null}
                className="w-full py-2.5 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors disabled:opacity-50">
                {busy === 'assign' ? 'Saving…' : 'Save assignment'}
              </button>
            </div>
            <button onClick={handleExecute} disabled={busy !== null}
              className="w-full py-3 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/25 transition-colors disabled:opacity-50">
              {busy === 'execute' ? 'Marking…' : 'Mark as Installed'}
            </button>
            {!request.assignedAgent && <p className="text-[11px] text-slate-400 text-center">Tip: assign an agent before marking installed.</p>}
          </div>
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

  const initialStatus = (searchParams.get('status') as AssetRequestStatus | null) || 'ASM_APPROVED';
  const [activeTab, setActiveTab] = useState<AssetRequestStatus | 'ALL'>(
    TABS.some(t => t.key === initialStatus) ? initialStatus : 'ASM_APPROVED',
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
                          ? (r.scheduledDeploymentDate ? `📅 ${formatDate(r.scheduledDeploymentDate)}` : 'Not scheduled')
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
        {totalPages > 1 && !loading && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Page {page + 1} of {totalPages}</span>
            <div className="flex items-center gap-2">
              <button disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50">Prev</button>
              <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-600 disabled:opacity-40 hover:bg-slate-50">Next</button>
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
