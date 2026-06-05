import React, { useEffect, useState } from 'react';
import { SlideOverPanel } from './SlideOverPanel';
import { apiService } from '../network/apiService';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorUtils';
import { Outlet } from '../types';

interface EditOutletPanelProps {
  isOpen: boolean;
  outlet: Outlet | null;
  onClose: () => void;
  onSuccess: (updated: Outlet) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EditOutletPanel: React.FC<EditOutletPanelProps> = ({ isOpen, outlet, onClose, onSuccess }) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [outletType, setOutletType] = useState('');
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !outlet) return;
    setName(outlet.name || '');
    setOwnerName(outlet.ownerName || '');
    setEmail(outlet.email || '');
    setOutletType(outlet.outletType || '');
    setAddress(outlet.address || '');
    setReason('');
    setSubmitError(null);
  }, [isOpen, outlet]);

  const initial = {
    name: outlet?.name || '',
    ownerName: outlet?.ownerName || '',
    email: outlet?.email || '',
    outletType: outlet?.outletType || '',
    address: outlet?.address || '',
  };

  const trimmed = {
    name: name.trim(),
    ownerName: ownerName.trim(),
    email: email.trim(),
    outletType: outletType.trim().toUpperCase(),
    address: address.trim(),
  };

  const changed = {
    name: trimmed.name !== initial.name.trim(),
    ownerName: trimmed.ownerName !== initial.ownerName.trim(),
    email: trimmed.email !== initial.email.trim(),
    outletType: trimmed.outletType !== initial.outletType.trim().toUpperCase(),
    address: trimmed.address !== initial.address.trim(),
  };
  const dirty = Object.values(changed).some(Boolean);

  const trimmedReason = reason.trim();
  const nameValid = !changed.name || trimmed.name.length >= 2;
  const ownerValid = !changed.ownerName || trimmed.ownerName.length >= 2;
  const emailValid = !changed.email || trimmed.email === '' || EMAIL_REGEX.test(trimmed.email);
  const addressValid = !changed.address || trimmed.address.length >= 3;
  const reasonValid = trimmedReason.length >= 4;

  const canSubmit = Boolean(outlet && dirty && nameValid && ownerValid && emailValid && addressValid && reasonValid && !submitting);

  const handleSubmit = async () => {
    if (!outlet || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: { reason: string; name?: string; ownerName?: string; email?: string; outletType?: string; address?: string } = {
        reason: trimmedReason,
      };
      if (changed.name) payload.name = trimmed.name;
      if (changed.ownerName) payload.ownerName = trimmed.ownerName;
      if (changed.email) payload.email = trimmed.email;
      if (changed.outletType) payload.outletType = trimmed.outletType;
      if (changed.address) payload.address = trimmed.address;

      const res = await apiService.outlets.update(outlet.id, payload);
      if (res.success && res.data) {
        showToast(`${res.data.name || 'Outlet'} updated`, 'success');
        onSuccess(res.data);
        onClose();
      } else {
        setSubmitError(res.error || 'Failed to update outlet.');
      }
    } catch (err) {
      setSubmitError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canSubmit) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!outlet) return null;

  return (
    <SlideOverPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Outlet"
      subtitle={outlet.name || 'Outlet'}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-400 font-medium">
            <span className="hidden sm:inline">Press </span>
            <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-200 text-[10px] font-bold text-slate-500">⌘↵</kbd>
            <span className="hidden sm:inline"> to save</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm shadow-indigo-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting && (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </div>
      }
    >
      <div onKeyDown={handleKeyDown} className="space-y-6">
        <p className="text-xs text-slate-400">
          Edit any combination of these fields. A reason is required for the audit trail. Only changed fields are sent.
        </p>

        <section>
          <label htmlFor="edit-outlet-name" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Outlet name</label>
          <input
            id="edit-outlet-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Outlet business name"
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
          />
          {!nameValid && (<p className="mt-1.5 text-xs font-medium text-red-500">Name must be at least 2 characters.</p>)}
        </section>

        <section>
          <label htmlFor="edit-outlet-owner" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Owner name</label>
          <input
            id="edit-outlet-owner"
            type="text"
            value={ownerName}
            onChange={e => setOwnerName(e.target.value)}
            placeholder="Owner full name"
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
          />
          {!ownerValid && (<p className="mt-1.5 text-xs font-medium text-red-500">Owner name must be at least 2 characters.</p>)}
        </section>

        <section>
          <label htmlFor="edit-outlet-email" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
          <input
            id="edit-outlet-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="owner@example.com"
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
          />
          {!emailValid && (<p className="mt-1.5 text-xs font-medium text-red-500">Enter a valid email address.</p>)}
        </section>

        <section>
          <label htmlFor="edit-outlet-type" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Outlet type</label>
          <input
            id="edit-outlet-type"
            type="text"
            value={outletType}
            onChange={e => setOutletType(e.target.value.toUpperCase())}
            placeholder="e.g. GROCERY, KIRANA, GENERAL_STORE"
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all uppercase tracking-wider"
          />
        </section>

        <section>
          <label htmlFor="edit-outlet-address" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
          <textarea
            id="edit-outlet-address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            rows={3}
            placeholder="Street, locality, city"
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all resize-none"
          />
          {!addressValid && (<p className="mt-1.5 text-xs font-medium text-red-500">Address must be at least 3 characters.</p>)}
        </section>

        <section>
          <label htmlFor="edit-outlet-reason" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
            Reason <span className="text-red-500">*</span>
          </label>
          <textarea
            id="edit-outlet-reason"
            value={reason}
            onChange={e => setReason(e.target.value)}
            rows={3}
            placeholder="e.g. Outlet name was incorrect; corrected after onboarding visit"
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all resize-none"
          />
        </section>

        {submitError && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl">
            {submitError}
          </div>
        )}
      </div>
    </SlideOverPanel>
  );
};
