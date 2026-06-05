import React, { useEffect, useState } from 'react';
import { SlideOverPanel } from './SlideOverPanel';
import { LocationPincodeSelect } from './LocationPincodeSelect';
import { apiService } from '../network/apiService';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorUtils';
import { Location, SystemUser } from '../types';

interface EditUserProfilePanelProps {
  isOpen: boolean;
  user: SystemUser | null;
  initialLocation?: Location | null;
  onClose: () => void;
  onSuccess: (updated: SystemUser) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const EditUserProfilePanel: React.FC<EditUserProfilePanelProps> = ({ isOpen, user, initialLocation, onClose, onSuccess }) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [locationId, setLocationId] = useState('');
  const [locationObj, setLocationObj] = useState<Location | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !user) return;
    setName(user.name || '');
    setEmail(user.email || '');
    setLocationId(user.locationId || '');
    setLocationObj(initialLocation || null);
    setSubmitError(null);
  }, [isOpen, user, initialLocation]);

  const initialName = user?.name || '';
  const initialEmail = user?.email || '';
  const initialLocationId = user?.locationId || '';

  const trimmedName = name.trim();
  const trimmedEmail = email.trim();

  const nameChanged = trimmedName !== initialName.trim();
  const emailChanged = trimmedEmail !== initialEmail.trim();
  const locationChanged = locationId !== initialLocationId;
  const dirty = nameChanged || emailChanged || locationChanged;

  const nameValid = !nameChanged || trimmedName.length >= 2;
  const emailValid = !emailChanged || trimmedEmail === '' || EMAIL_REGEX.test(trimmedEmail);

  const canSubmit = Boolean(user && dirty && nameValid && emailValid && !submitting);

  const handleSubmit = async () => {
    if (!user || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: { name?: string; email?: string; locationId?: string } = {};
      if (nameChanged) payload.name = trimmedName;
      if (emailChanged) payload.email = trimmedEmail;
      if (locationChanged) payload.locationId = locationId;

      const res = await apiService.users.update(user.id, payload);
      if (res.success && res.data) {
        showToast(`${res.data.name || 'User'} updated`, 'success');
        onSuccess(res.data);
        onClose();
      } else {
        setSubmitError(res.error || 'Failed to update profile.');
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

  if (!user) return null;

  return (
    <SlideOverPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Profile"
      subtitle={user.name || 'User'}
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
          Edit any combination of name, email, or location. Only changed fields are sent.
        </p>

        <section>
          <label htmlFor="edit-name" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
          <input
            id="edit-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name"
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
          />
          {!nameValid && (
            <p className="mt-1.5 text-xs font-medium text-red-500">Name must be at least 2 characters.</p>
          )}
        </section>

        <section>
          <label htmlFor="edit-email" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Email</label>
          <input
            id="edit-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
          />
          {!emailValid && (
            <p className="mt-1.5 text-xs font-medium text-red-500">Enter a valid email address.</p>
          )}
        </section>

        <section>
          <LocationPincodeSelect
            value={locationId}
            onChange={(id, loc) => { setLocationId(id); setLocationObj(loc); }}
            initialLocation={locationObj}
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
