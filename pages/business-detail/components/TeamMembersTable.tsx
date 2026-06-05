import React from 'react';
import { SystemUser, Location } from '../../../types';
import { useToast } from '../../../context/ToastContext';
import { getRoleBadgeColor } from '../utils/constants';

interface TeamMembersTableProps {
  members: SystemUser[];
  locations: Location[];
}

/**
 * Displays the team members table for a business, with role badges,
 * phone copy, location, and status columns.
 */
export const TeamMembersTable: React.FC<TeamMembersTableProps> = ({ members, locations }) => {
  const { showToast } = useToast();

  if (members.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3.414a2 2 0 01-2-2V9.414A2 2 0 013.414 8H21a2 2 0 012 2v9.172a2 2 0 01-.586 1.414L5 21" />
              </svg>
            </div>
            <p className="text-slate-500 font-medium mb-2">No team members assigned yet</p>
            <p className="text-slate-400 text-sm">Add your first user to get started</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-6 py-4">User</th>
              <th className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-6 py-4">Role</th>
              <th className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-6 py-4">Phone</th>
              <th className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-6 py-4">Location</th>
              <th className="text-left text-[10px] font-bold text-slate-600 uppercase tracking-widest px-6 py-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {members.map((admin) => {
              const location = locations.find((loc) => loc.id === admin.locationId);
              return (
                <tr key={admin.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{admin.name || '-'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${getRoleBadgeColor(admin.role)}`}>
                      {admin.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm text-slate-600 font-medium">{admin.phone || '-'}</span>
                      {admin.phone && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            navigator.clipboard.writeText(admin.phone || '');
                            showToast('Phone number copied!', 'success', 2000);
                          }}
                          className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors relative z-10 cursor-pointer"
                          title="Copy phone number"
                        >
                          <svg className="w-3.5 h-3.5 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {location ? `${location.city}, ${location.state}` : '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700">
                      {admin.status}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
