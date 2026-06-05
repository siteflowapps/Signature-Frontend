import React, { useEffect, useState } from 'react';
import { SlideOverPanel } from './SlideOverPanel';
import { apiService } from '../network/apiService';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorUtils';
import { Distributor } from '../types';
import { LocationPincodeSelect } from './LocationPincodeSelect';

interface EditDistributorPanelProps {
  isOpen: boolean;
  distributor: Distributor | null;
  onClose: () => void;
  onSuccess: (updated: Distributor) => void;
}

export const EditDistributorPanel: React.FC<EditDistributorPanelProps> = ({ isOpen, distributor, onClose, onSuccess }) => {
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [gstNumber, setGstNumber] = useState('');
  const [dmsId, setDmsId] = useState('');
  const [address, setAddress] = useState('');
  const [locationId, setLocationId] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || !distributor) return;
    setName(distributor.name || '');
    setGstNumber(distributor.gstNumber || '');
    setDmsId(distributor.dmsId || '');
    setAddress(distributor.address || '');
    setLocationId(distributor.locationId || distributor.location?.id || '');
    setSubmitError(null);
  }, [isOpen, distributor]);

  const initialName = distributor?.name || '';
  const initialGst = distributor?.gstNumber || '';
  const initialDmsId = distributor?.dmsId || '';
  const initialAddress = distributor?.address || '';
  const initialLocationId = distributor?.locationId || distributor?.location?.id || '';

  const trimmedName = name.trim();
  const trimmedGst = gstNumber.trim().toUpperCase();
  const trimmedDmsId = dmsId.trim();
  const trimmedAddress = address.trim();

  const nameChanged = trimmedName !== initialName.trim();
  const gstChanged = trimmedGst !== initialGst.trim().toUpperCase();
  const dmsIdChanged = trimmedDmsId !== initialDmsId.trim();
  const addressChanged = trimmedAddress !== initialAddress.trim();
  const locationChanged = locationId !== initialLocationId;
  const dirty = nameChanged || gstChanged || addressChanged || locationChanged || dmsIdChanged;

  const nameValid = !nameChanged || trimmedName.length >= 2;
  const addressValid = !addressChanged || trimmedAddress.length >= 3;

  const canSubmit = Boolean(distributor && dirty && nameValid && addressValid && !submitting);

  const handleSubmit = async () => {
    if (!distributor || !canSubmit) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const payload: { name?: string; gstNumber?: string; address?: string; locationId?: string; dmsId?: string } = {};
      if (nameChanged) payload.name = trimmedName;
      if (gstChanged) payload.gstNumber = trimmedGst;
      if (dmsIdChanged) payload.dmsId = trimmedDmsId;
      if (addressChanged) payload.address = trimmedAddress;
      if (locationChanged) payload.locationId = locationId;

      const res = await apiService.distributors.update(distributor.id, payload);
      if (res.success && res.data) {
        showToast(`${res.data.name || 'Distributor'} updated`, 'success');
        onSuccess(res.data);
        onClose();
      } else {
        setSubmitError(res.error || 'Failed to update distributor.');
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

  if (!distributor) return null;

  return (
    <SlideOverPanel
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Distributor"
      subtitle={distributor.name || 'Distributor'}
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
          Edit any combination of name, GSTIN, or address. Only changed fields are sent.
        </p>

        <section>
          <label htmlFor="edit-dist-name" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Name</label>
          <input
            id="edit-dist-name"
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Distributor business name"
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
          />
          {!nameValid && (
            <p className="mt-1.5 text-xs font-medium text-red-500">Name must be at least 2 characters.</p>
          )}
        </section>

        <section>
          <label htmlFor="edit-dist-gst" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">GSTIN</label>
          <input
            id="edit-dist-gst"
            type="text"
            value={gstNumber}
            onChange={e => setGstNumber(e.target.value.toUpperCase())}
            placeholder="e.g. 27ABCDE1234F1Z5"
            maxLength={15}
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-sans focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all uppercase tracking-wider"
          />
        </section>

        <section>
          <label htmlFor="edit-dist-dmsid" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">DMS ID</label>
          <input
            id="edit-dist-dmsid"
            type="text"
            value={dmsId}
            onChange={e => setDmsId(e.target.value)}
            placeholder="e.g. DMS-12345"
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-mono font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-sans focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all"
          />
        </section>

        <section>
          <label htmlFor="edit-dist-address" className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Address</label>
          <textarea
            id="edit-dist-address"
            value={address}
            onChange={e => setAddress(e.target.value)}
            rows={3}
            placeholder="Street, city, state"
            className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all resize-none"
          />
          {!addressValid && (
            <p className="mt-1.5 text-xs font-medium text-red-500">Address must be at least 3 characters.</p>
          )}
        </section>

        <section className="mt-2">
          <LocationPincodeSelect
            label="Location"
            value={locationId}
            onChange={setLocationId}
            disabled={submitting}
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
