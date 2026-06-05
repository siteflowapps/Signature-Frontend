export const STATUSES = ['All', 'SUBMITTED', 'ASE_APPROVED', 'ASM_APPROVED', 'FINANCE_APPROVED', 'CALCULATED', 'PAID', 'REJECTED'];
export const PAYOUT_STATUSES = ['All', 'CALCULATED', 'PAID'];

export const statusStyles: Record<string, string> = {
  SUBMITTED: 'bg-slate-50 text-slate-600 border-slate-200',
  ASE_APPROVED: 'bg-sky-50 text-sky-700 border-sky-200',
  ASM_APPROVED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  FINANCE_APPROVED: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  CALCULATED: 'bg-violet-50 text-violet-700 border-violet-200',
  PAID: 'bg-teal-50 text-teal-700 border-teal-200',
  REJECTED: 'bg-red-50 text-red-700 border-red-200',
};

export const statusLabels: Record<string, string> = {
  SUBMITTED: 'Submitted',
  ASE_APPROVED: 'ASE Approved',
  ASM_APPROVED: 'ASM Approved',
  FINANCE_APPROVED: 'Finance Approved',
  CALCULATED: 'Calculated',
  PAID: 'Paid',
  REJECTED: 'Rejected',
};

export const formatDate = (d: string) => {
  if (!d) return '—';
  try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return d; }
};
