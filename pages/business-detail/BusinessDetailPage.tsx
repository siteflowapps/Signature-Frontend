import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Business, Location, SystemUser } from '../../types';
import { apiService } from '../../network/apiService';
import { useToast } from '../../context/ToastContext';

import { BusinessInfoCard } from './components/BusinessInfoCard';
import { AddUserForm } from './components/AddUserForm';
import { TeamMembersTable } from './components/TeamMembersTable';
import { getErrorMessage } from '../../utils/errorUtils';

/**
 * Business Detail Page — slim orchestrator.
 * Fetches data and delegates rendering to focused sub-components.
 */
const BusinessDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [business, setBusiness] = useState<Business | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [businessAdmins, setBusinessAdmins] = useState<SystemUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddAdminForm, setShowAddAdminForm] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const locationsResponse = await apiService.locations.getAll();
      if (locationsResponse.success) {
        setLocations(locationsResponse.data);
      }

      const businessesResponse = await apiService.business.getAll();
      if (businessesResponse.success && businessesResponse.data && id) {
        const foundBusiness = businessesResponse.data.content.find((b) => b.id === id);
        if (foundBusiness) {
          setBusiness(foundBusiness);
        }
      }

      const usersResponse = await apiService.users.getAll(0, 500);
      if (usersResponse.success && id) {
        const admins = usersResponse.data.content.filter((user) => user.businessId === id);
        setBusinessAdmins(admins);
      }
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error', 4000);
    } finally {
      setIsLoading(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ─── Loading State ───
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <svg className="animate-spin h-8 w-8 text-indigo-600 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-500 font-medium">Loading business details...</p>
        </div>
      </div>
    );
  }

  // ─── Not Found State ───
  if (!business) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 font-bold">Business not found</p>
        <button
          onClick={() => navigate('/businesses')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold"
        >
          Back to Businesses
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/businesses')}
        className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold text-sm"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Businesses
      </button>

      {/* Business Details Card */}
      <BusinessInfoCard business={business} />

      {/* Users Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">Team Members</h3>
            <p className="text-slate-400 text-sm mt-0.5">Manage users and team members for {business.name}</p>
          </div>
          <button
            onClick={() => setShowAddAdminForm(!showAddAdminForm)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Users
          </button>
        </div>

        {showAddAdminForm && (
          <AddUserForm
            businessId={id || ''}
            onUserAdded={() => {
              setShowAddAdminForm(false);
              loadData();
            }}
            onCancel={() => setShowAddAdminForm(false)}
          />
        )}

        <TeamMembersTable members={businessAdmins} locations={locations} />
      </div>
    </div>
  );
};

export default BusinessDetailPage;
