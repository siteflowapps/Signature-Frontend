import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../network/apiService';
import { Business, UserRole } from '../types';
import { useUserForm } from '../hooks/useUserForm';
import { useParentUsers } from '../hooks/useParentUsers';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS } from '../utils/roleConfig';
import { DistributorMultiSelect } from '../components/DistributorMultiSelect';
import { LocationPincodeSelect } from '../components/LocationPincodeSelect';

const AddUser: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.SUPER_ADMIN;

  const {
    formData,
    isSubmitting,
    isSuccess,
    parentRole,
    availableRoles,
    currentRoleConfig,
    businessId,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useUserForm();

  const { parentUsers, isLoadingParents } = useParentUsers(formData.role, businessId);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoadingBusinesses, setIsLoadingBusinesses] = useState(false);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        if (isAdmin) {
          setIsLoadingBusinesses(true);
          const bizResponse = await apiService.business.getAll(0, 500);
          if (bizResponse.success) setBusinesses(bizResponse.data.content);
          setIsLoadingBusinesses(false);
        }
      } catch {
        setIsLoadingBusinesses(false);
      }
    };
    loadInitialData();
  }, [isAdmin]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          <Link to="/users" className="hover:text-indigo-600 transition-colors font-medium">Users</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-slate-600 font-semibold">Add New User</span>
        </nav>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add New User</h2>
        <p className="text-slate-400 text-sm mt-1">Create a new user account and assign a role.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-end">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name *</label>
              <span className="text-[10px] text-slate-400 font-medium">Letters and spaces only (max 50 chars)</span>
            </div>
            <div className="relative group">
              <input
                type="text" name="name" value={formData.name} onChange={handleChange}
                required disabled={isSubmitting} maxLength={50}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50"
                placeholder="Ex. Rahul Sharma"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 bg-slate-50 pl-2">
                {formData.name.length}/50
              </div>
            </div>
          </div>

          {/* Business Selection (Admin Only) */}
          {isAdmin && (
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Business *</label>
              <div className="relative">
                <select
                  name="businessId" value={formData.businessId} onChange={(e) => {
                    handleChange(e);
                    // Clear parent selection when business changes to avoid stale ID
                  }}
                  required disabled={isSubmitting || isLoadingBusinesses}
                  className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50"
                >
                  <option value="" disabled>Select a business</option>
                  {businesses.map((biz) => (
                    <option key={biz.id} value={biz.id}>{biz.name}</option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  {isLoadingBusinesses ? (
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

          {/* Role */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Role *</label>
            <select
              name="role" value={formData.role} onChange={handleChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium text-slate-700 disabled:opacity-50"
            >
              {availableRoles.map((role) => (
                <option key={role} value={role}>{ROLE_LABELS[role] || role.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {currentRoleConfig?.hierarchyHint && (
              <p className="text-[10px] text-indigo-500 mt-1 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                Hierarchy: {currentRoleConfig.hierarchyHint}
              </p>
            )}
          </div>

          {/* Phone Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number *</label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-2 bg-slate-100/50 border-r border-slate-200 rounded-l-xl text-slate-500 font-bold text-sm pointer-events-none transition-colors group-focus-within:border-indigo-400 group-focus-within:bg-slate-100">+91</div>
              <input
                type="tel" name="phone" value={formData.phone} onChange={handleChange}
                required disabled={isSubmitting} maxLength={10}
                className="w-full pl-16 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50 tracking-wide"
                placeholder="9876543210"
              />
            </div>
            <p className={`text-[10px] text-right mt-0.5 transition-colors ${formData.phone.length === 10 ? 'text-emerald-500' : 'text-slate-400'}`}>
              {formData.phone.length}/10
            </p>
          </div>

          {/* Conditional Distributor Selection for ASM */}
          {formData.role === 'ASM' && (
            <div className="animate-slide-in">
              <DistributorMultiSelect
                selectedIds={formData.distributorIds}
                onChange={(ids) => handleChange({ target: { name: 'distributorIds', value: ids } } as unknown as React.ChangeEvent<HTMLSelectElement>)}
                disabled={isSubmitting}
              />
            </div>
          )}

          {/* Parent Manager + Location grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Parent Manager — only for roles with parentRole */}
            {parentRole && (
              <div className="space-y-1.5 animate-slide-in">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  {ROLE_LABELS[parentRole] || parentRole} *
                </label>
                <div className="relative">
                  <select
                    name="parentUserId" value={formData.parentUserId || ''} onChange={handleChange}
                    required disabled={isSubmitting || isLoadingParents}
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
                {parentUsers.length === 0 && !isLoadingParents && (
                  <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg mt-2 border border-amber-100">
                    No {ROLE_LABELS[parentRole] || parentRole}s found.
                  </p>
                )}
              </div>
            )}

            {/* Location (Optional) */}
            <LocationPincodeSelect
              label="Location (Optional)"
              value={formData.locationId}
              onChange={(id) => handleChange({ target: { name: 'locationId', value: id } } as unknown as React.ChangeEvent<HTMLSelectElement>)}
              disabled={isSubmitting}
            />
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button" onClick={handleCancel} disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >Cancel</button>
            <button
              type="submit" disabled={isSubmitting || isSuccess}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 ${
                isSuccess
                  ? 'bg-emerald-500 shadow-emerald-500/30 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-[0.98]'
              } text-white disabled:cursor-not-allowed`}
            >
              {isSuccess ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  User Created!
                </>
              ) : isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                'Add User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
