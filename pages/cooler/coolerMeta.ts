import { AssetRequestStatus, CoolerSize } from '../../types';

/** Human label + Tailwind badge classes for each asset-request status. */
export const STATUS_META: Record<AssetRequestStatus, { label: string; badge: string; dot: string }> = {
  REQUESTED:            { label: 'Requested',            badge: 'bg-slate-100 text-slate-600',   dot: 'bg-slate-400' },
  ASE_APPROVED:         { label: 'ASE Approved',         badge: 'bg-sky-100 text-sky-700',       dot: 'bg-sky-500' },
  ASM_APPROVED:         { label: 'Ready to Deploy',      badge: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  MARKETING_APPROVED:   { label: 'Marketing Approved',   badge: 'bg-violet-100 text-violet-700', dot: 'bg-violet-500' },
  EXECUTED:             { label: 'Installed · Awaiting Photo', badge: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' },
  COMPLIANCE_SUBMITTED: { label: 'Photo Submitted',      badge: 'bg-fuchsia-100 text-fuchsia-700', dot: 'bg-fuchsia-500' },
  COMPLIANCE_OVERDUE:   { label: 'Compliance Overdue',   badge: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  COMPLIANT:            { label: 'Compliant',            badge: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  NON_COMPLIANT:        { label: 'Non-compliant',        badge: 'bg-red-100 text-red-700',       dot: 'bg-red-500' },
  REJECTED:             { label: 'Rejected',             badge: 'bg-slate-200 text-slate-600',   dot: 'bg-slate-400' },
};

export const statusLabel = (s?: AssetRequestStatus | null) => (s ? STATUS_META[s]?.label ?? s : '—');
export const statusBadge = (s?: AssetRequestStatus | null) => (s ? STATUS_META[s]?.badge ?? 'bg-slate-100 text-slate-600' : 'bg-slate-100 text-slate-600');

/** "SIZE_450L" → "450 L" */
export const coolerSizeLabel = (size?: CoolerSize | null): string => {
  if (!size) return '—';
  const m = /SIZE_(\d+)L/.exec(size);
  return m ? `${m[1]} L` : size;
};

export const formatDate = (iso?: string | null): string => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
};

/** Whether a compliance due date has passed. */
export const isOverdue = (dueDate?: string | null): boolean => {
  if (!dueDate) return false;
  const d = new Date(dueDate);
  if (isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
};
