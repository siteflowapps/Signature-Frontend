
import React, { useEffect, useState, useMemo } from 'react';
import { apiService } from '../network/apiService';
import { SupportTicket, SupportTicketStatus } from '../types';
import { useToast } from '../context/ToastContext';

// ── Helpers ───────────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<SupportTicketStatus, { label: string; cls: string }> = {
  OPEN:        { label: 'Open',        cls: 'bg-red-50 text-red-600 border-red-200' },
  IN_PROGRESS: { label: 'In Progress', cls: 'bg-amber-50 text-amber-600 border-amber-200' },
  RESOLVED:    { label: 'Resolved',    cls: 'bg-emerald-50 text-emerald-600 border-emerald-200' },
  CLOSED:      { label: 'Closed',      cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

const ALL_STATUSES: SupportTicketStatus[] = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

const fmtDate = (iso: string) => {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

const StatusBadge: React.FC<{ status: SupportTicketStatus }> = ({ status }) => {
  const { label, cls } = STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${cls}`}>
      {label}
    </span>
  );
};

// ── Skeleton Row ──────────────────────────────────────────────────────────────
const SkeletonRow = () => (
  <tr>
    {[1,2,3,4,5,6].map(i => (
      <td key={i} className="px-4 py-4">
        <div className="h-4 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + i * 8}%` }} />
      </td>
    ))}
  </tr>
);

// ── Slide-Over Panel ──────────────────────────────────────────────────────────
const SlideOver: React.FC<{
  ticket: SupportTicket | null;
  onClose: () => void;
  onUpdated: (t: SupportTicket) => void;
}> = ({ ticket, onClose, onUpdated }) => {
  const { showToast } = useToast();
  const [newStatus, setNewStatus] = useState<SupportTicketStatus>('OPEN');
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    if (ticket) {
      setNewStatus(ticket.status);
      setNote(ticket.resolutionNote ?? '');
    }
  }, [ticket]);

  if (!ticket) return null;

  const noteRequired = newStatus === 'RESOLVED' || newStatus === 'CLOSED';

  const handleUpdate = async () => {
    if (noteRequired && !note.trim()) {
      showToast('Resolution note is required for this status.', 'error');
      return;
    }
    try {
      setSaving(true);
      const res = await apiService.supportTickets.updateStatus(ticket.id, newStatus, note.trim());
      if (res.success) {
        onUpdated(res.data);
        showToast('Ticket updated successfully.', 'success');
      } else {
        showToast('Failed to update ticket.', 'error');
      }
    } catch {
      showToast('An error occurred.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30 bg-slate-900/30 backdrop-blur-sm" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-40 w-full max-w-lg flex flex-col bg-white shadow-2xl border-l border-slate-100 animate-in slide-in-from-right duration-300">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 flex-shrink-0">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Support Ticket</p>
            <h2 className="text-lg font-black text-slate-900 tracking-tight">{ticket.ticketNumber}</h2>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={ticket.status} />
            <button onClick={onClose} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* Reporter */}
          <section>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Raised By</p>
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-black text-white">{ticket.raisedByName?.[0] ?? '?'}</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{ticket.raisedByName}</p>
                <p className="text-xs text-slate-400 font-medium">{ticket.raisedByPhone}</p>
              </div>
              <span className="ml-auto text-xs text-slate-400">{fmtDate(ticket.createdAt)}</span>
            </div>
          </section>

          {/* Description */}
          <section>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</p>
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 mb-2">
                {ticket.category}
              </span>
              <p className="text-sm text-slate-700 leading-relaxed">{ticket.description}</p>
            </div>
          </section>

          {/* Device Info */}
          <section>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Device Info</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Platform', value: ticket.platform },
                { label: 'OS Version', value: ticket.osVersion },
                { label: 'Device', value: ticket.deviceModel },
                { label: 'App Version', value: ticket.appVersion },
              ].map(({ label, value }) => (
                <div key={label} className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-semibold text-slate-700 mt-0.5 truncate">{value ?? '—'}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Screenshots */}
          <section>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Screenshots <span className="normal-case">({ticket.screenshotUrls.length})</span>
            </p>
            {ticket.screenshotUrls.length === 0 ? (
              <div className="flex items-center justify-center h-20 border-2 border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-400 font-medium">No screenshots attached</p>
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {ticket.screenshotUrls.map((url, i) => (
                  <button key={i} onClick={() => setLightbox(url)} className="flex-shrink-0">
                    <img src={url} alt={`Screenshot ${i + 1}`} className="w-24 h-24 object-cover rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all" />
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Update Status — locked when CLOSED */}
          {ticket.status === 'CLOSED' ? (
            <section className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex items-start gap-3">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-200 flex items-center justify-center">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-black text-slate-700">Ticket Closed</p>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  This ticket has been closed and can no longer be updated.
                </p>
                {ticket.resolutionNote && (
                  <div className="mt-3 p-3 bg-white rounded-xl border border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Resolution Note</p>
                    <p className="text-sm text-slate-700 leading-relaxed">{ticket.resolutionNote}</p>
                  </div>
                )}
              </div>
            </section>
          ) : (
            <section className="bg-gradient-to-br from-indigo-50 to-slate-50 rounded-2xl border border-indigo-100 p-5">
              <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-4">Update Ticket</p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Change Status</label>
                  <select
                    value={newStatus}
                    onChange={e => setNewStatus(e.target.value as SupportTicketStatus)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    {ALL_STATUSES.map(s => (
                      <option key={s} value={s}>{STATUS_CONFIG[s].label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">
                    Resolution Note {noteRequired && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    rows={3}
                    placeholder={noteRequired ? 'Required — describe the resolution…' : 'Optional remarks…'}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                  />
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-100 bg-white flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-sm font-bold text-slate-700 transition-colors">
            {ticket.status === 'CLOSED' ? 'Close' : 'Cancel'}
          </button>
          {ticket.status !== 'CLOSED' && (
            <button
              onClick={handleUpdate}
              disabled={saving || (newStatus === ticket.status && note === (ticket.resolutionNote ?? ''))}
              className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-sm font-bold text-white shadow-sm shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving…
                </>
              ) : 'Update Ticket →'}
            </button>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="Screenshot" className="max-w-full max-h-full object-contain rounded-xl shadow-2xl" onClick={e => e.stopPropagation()} />
          <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const SupportTicketsPage: React.FC = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [activeStatus, setActiveStatus] = useState<SupportTicketStatus | 'ALL'>('ALL');

  const fetchTickets = async (p: number) => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiService.supportTickets.getAll(p, 20);
      if (res.success) {
        setTickets(res.data.content);
        setTotalPages(res.data.totalPages);
        setTotalElements(res.data.totalElements);
      } else {
        setError('Failed to load support tickets.');
      }
    } catch {
      setError('An error occurred while fetching tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(page); }, [page]);

  const filtered = useMemo(() =>
    activeStatus === 'ALL' ? tickets : tickets.filter(t => t.status === activeStatus),
    [tickets, activeStatus]
  );

  const countByStatus = useMemo(() => {
    const counts: Record<string, number> = { ALL: tickets.length };
    ALL_STATUSES.forEach(s => { counts[s] = tickets.filter(t => t.status === s).length; });
    return counts;
  }, [tickets]);

  const handleUpdated = (updated: SupportTicket) => {
    setTickets(prev => prev.map(t => t.id === updated.id ? updated : t));
    setSelected(updated);
  };

  const PAGE_SIZE = 20;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/30">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Support Tickets</h1>
            <p className="text-sm text-slate-500 font-medium">{totalElements} total tickets</p>
          </div>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['ALL', ...ALL_STATUSES] as const).map(s => (
          <button
            key={s}
            onClick={() => setActiveStatus(s)}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all ${
              activeStatus === s
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
            }`}
          >
            {s === 'ALL' ? 'All' : STATUS_CONFIG[s].label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${activeStatus === s ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
              {countByStatus[s] ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {error ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm font-bold text-slate-600 mb-1">Something went wrong</p>
            <p className="text-xs text-slate-400 mb-4">{error}</p>
            <button onClick={() => fetchTickets(page)} className="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">Retry</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Ticket #', 'Raised By', 'Category', 'Platform', 'Status', 'Updated'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <p className="text-sm font-bold text-slate-500">No tickets found</p>
                      <p className="text-xs text-slate-400 mt-1">Try a different status filter</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map(ticket => (
                    <tr
                      key={ticket.id}
                      onClick={() => setSelected(ticket)}
                      className={`cursor-pointer transition-colors hover:bg-indigo-50/50 ${selected?.id === ticket.id ? 'bg-indigo-50' : ''}`}
                    >
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-indigo-600">{ticket.ticketNumber}</span>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-sm font-bold text-slate-800 whitespace-nowrap">{ticket.raisedByName}</p>
                        <p className="text-xs text-slate-400 font-medium">{ticket.raisedByPhone}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100">
                          {ticket.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <p className="text-xs font-semibold text-slate-600 capitalize">{ticket.platform}</p>
                        <p className="text-[10px] text-slate-400">{ticket.osVersion}</p>
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <StatusBadge status={ticket.status} />
                      </td>
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="text-xs text-slate-500 font-medium">{fmtDate(ticket.updatedAt)}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
            <p className="text-xs font-medium text-slate-500">
              Page {page + 1} of {totalPages} &middot; {totalElements} tickets
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over */}
      <SlideOver ticket={selected} onClose={() => setSelected(null)} onUpdated={handleUpdated} />
    </div>
  );
};

export default SupportTicketsPage;
