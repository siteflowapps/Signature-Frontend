import React, { useState } from 'react';
import { apiService } from '../../../network/apiService';
import { useToast } from '../../../context/ToastContext';
import { useParentUsers } from '../../../hooks/useParentUsers';
import { ROLE_CONFIG, ROLE_LABELS } from '../../../utils/roleConfig';
import { AVAILABLE_ROLES } from '../utils/constants';
import { getErrorMessage } from '../../../utils/errorUtils';
import { LocationPincodeSelect } from '../../../components/LocationPincodeSelect';

interface AddUserFormProps {
  businessId: string;
  onUserAdded: () => void;
  onCancel: () => void;
}

/**
 * Self-contained form for adding a new user to a business.
 * Owns all form state, validation, and submission logic.
 */
export const AddUserForm: React.FC<AddUserFormProps> = ({
  businessId,
  onUserAdded,
  onCancel,
}) => {
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    role: 'BUSINESS_ADMIN',
    authType: 'OTP',
    businessId,
    locationId: '',
    parentUserId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { parentUsers, isLoadingParents } = useParentUsers(formData.role, businessId);
  const currentRoleConfig = ROLE_CONFIG[formData.role];
  const parentRole = currentRoleConfig?.parentRole;

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Name: letters and spaces only, max 50 chars
    if (name === 'name') {
      const sanitizedValue = value.replace(/[^a-zA-Z\s]/g, '').slice(0, 50);
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name || !formData.phone) {
        showToast('Please fill all required fields', 'error', 3000);
        setIsSubmitting(false);
        return;
      }

      if (formData.name.trim().length < 2) {
        showToast('Name must be at least 2 characters long', 'error', 3000);
        setIsSubmitting(false);
        return;
      }

      if (parentRole && !formData.parentUserId) {
        const parentLabel = ROLE_LABELS[parentRole] || parentRole;
        showToast(`Please select a ${parentLabel}`, 'error', 3000);
        setIsSubmitting(false);
        return;
      }

      const payload = {
        name: formData.name,
        phone: formData.phone,
        role: formData.role,
        authType: 'OTP',
        businessId: formData.businessId,
        locationId: formData.locationId || undefined,
        parentUserId: parentRole ? formData.parentUserId : undefined,
      };

      const response = await apiService.users.create(payload);

      if (response.success) {
        showToast(`User "${formData.name}" added successfully!`, 'success', 3000);
        setFormData({
          name: '',
          phone: '',
          role: 'BUSINESS_ADMIN',
          authType: 'OTP',
          businessId,
          locationId: '',
          parentUserId: '',
        });
        onUserAdded();
      } else {
        showToast(response.error || 'Failed to create user', 'error', 4000);
      }
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error', 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
      <h4 className="text-lg font-bold text-slate-900 mb-6">Add New User</h4>
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-end">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
            <span className="text-[10px] text-slate-400 font-medium">Letters and spaces only (max 50 chars)</span>
          </div>
          <div className="relative group">
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleFormChange}
              required
              disabled={isSubmitting}
              maxLength={50}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50"
              placeholder="Ex. Rahul Sharma"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-50 pl-2">
              {formData.name.length}/50
            </div>
          </div>
        </div>

        {/* Phone Number */}
        <div className="space-y-1.5 animate-slide-in">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number *</label>
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-2 bg-slate-100/50 border-r border-slate-200 rounded-l-xl text-slate-500 font-bold text-sm pointer-events-none transition-colors group-focus-within:border-indigo-400 group-focus-within:bg-slate-100">+91</div>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                setFormData(prev => ({ ...prev, phone: val }));
              }}
              required
              disabled={isSubmitting}
              maxLength={10}
              className="w-full pl-16 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50 tracking-wide"
              placeholder="9876543210"
            />
          </div>
          <p className={`text-[10px] text-right mt-0.5 transition-colors ${formData.phone.length === 10 ? 'text-emerald-500' : 'text-slate-400'}`}>
            {formData.phone.length}/10
          </p>
        </div>

        {/* Role */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Role *</label>
          <select
            name="role"
            value={formData.role}
            onChange={(e) => {
              const newRole = e.target.value;
              setFormData(prev => ({
                ...prev,
                role: newRole,
                parentUserId: '',
              }));
            }}
            disabled={isSubmitting}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium text-slate-700 disabled:opacity-50"
          >
            {AVAILABLE_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role] || role.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
          {currentRoleConfig?.hierarchyHint && (
            <p className="text-[10px] text-indigo-500 mt-1 flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Hierarchy: {currentRoleConfig.hierarchyHint}
            </p>
          )}
        </div>

        {/* Parent Manager + Location grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {parentRole && (
            <div className="space-y-1.5 animate-slide-in">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                {ROLE_LABELS[parentRole] || parentRole} *
              </label>
              <div className="relative">
                <select
                  name="parentUserId"
                  value={formData.parentUserId || ''}
                  onChange={handleFormChange}
                  required
                  disabled={isSubmitting || isLoadingParents}
                  className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50"
                >
                  <option value="" disabled>Select {ROLE_LABELS[parentRole] || parentRole}</option>
                  {parentUsers.map((parent) => (
                    <option key={parent.id} value={parent.id}>
                      {parent.name || parent.email || parent.phone || '—'}
                      {parent.phone ? ` — ${parent.phone}` : ''}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  {isLoadingParents ? (
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Location */}
          <LocationPincodeSelect
            label="Location (Optional)"
            value={formData.locationId}
            onChange={(id) => setFormData((prev) => ({ ...prev, locationId: id }))}
            disabled={isSubmitting}
          />
        </div>

        {/* Actions */}
        <div className="pt-4 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Adding...
              </>
            ) : (
              'Add Users'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
