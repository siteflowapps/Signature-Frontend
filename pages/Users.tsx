import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useUsersList } from '../hooks/useUsersList';
import { apiService } from '../network/apiService';
import { ROLE_LABELS, getRoleBadgeColor, ROLE_FILTERS } from '../utils/roleConfig';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { UserRole } from '../types';
import { downloadCSV } from '../utils/csvExport';
import { getErrorMessage } from '../utils/errorUtils';

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  } catch {
    return '-';
  }
};

const getInitials = (name: string | undefined) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

/** Skeleton row for loading state */
const SkeletonRow = () => (
  <tr className="animate-pulse">
    <td className="py-4 px-6">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-slate-200 rounded-full"></div>
        <div>
          <div className="h-3.5 bg-slate-200 rounded w-28 mb-1.5"></div>
          <div className="h-2.5 bg-slate-100 rounded w-36"></div>
        </div>
      </div>
    </td>
    <td className="py-4 px-6"><div className="h-5 bg-slate-200 rounded-lg w-16"></div></td>
    <td className="py-4 px-6 hidden md:table-cell"><div className="h-5 bg-slate-100 rounded w-12"></div></td>
    <td className="py-4 px-6 hidden lg:table-cell"><div className="h-5 bg-slate-200 rounded-full w-16"></div></td>
    <td className="py-4 px-6 hidden lg:table-cell"><div className="h-3 bg-slate-100 rounded w-20"></div></td>
    <td className="py-4 px-4 w-10"></td>
  </tr>
);

const TABLE_HEADERS = [
  { label: 'User', className: '' },
  { label: 'Role', className: '' },
  { label: 'Phone', className: 'hidden md:table-cell' },
  { label: 'Status', className: 'hidden lg:table-cell' },
  { label: 'Created', className: 'hidden lg:table-cell' },
  { label: '', className: 'w-10' },
];

const getSafeEmail = (obj: any) => obj.email || obj.emailId || obj.emailAddress || obj.contactEmail || obj.Email || '';

const Users: React.FC = () => {
  const {
    users: filteredUsers,
    isLoading,
    isSearchMode,
    error,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    currentPage,
    setCurrentPage,
    totalPages,
    totalElements,
  } = useUsersList();

  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isRSM = currentUser?.role === UserRole.RSM;
  const isViewOnly = currentUser?.role === UserRole.FINANCE_ADMIN || currentUser?.role === UserRole.FINANCE_MANAGER || currentUser?.role === UserRole.BUSINESS_USER || isRSM;

  const handleExportUsers = async () => {
    if (totalElements === 0) return;
    try {
      showToast('Preparing export...', 'info', 2000);
      const response = await apiService.users.getAll(0, 5000);
      if (response.success && response.data?.content) {
        const fullData = response.data.content;
        downloadCSV({
          filename: 'users_export_full',
          headers: ['Name', 'Email', 'Phone', 'Role', 'Auth Type', 'Status', 'Created At'],
          rows: fullData.map(u => [
            u.name || '—', getSafeEmail(u) || '—', u.phone || '—',
            ROLE_LABELS[u.role] || u.role, u.authType || '—',
            u.status || '—', u.createdAt ? formatDate(u.createdAt) : '—',
          ]),
        });
        showToast('Export successful!', 'success', 2000);
      } else {
        showToast('Export failed to load data.', 'error', 3000);
      }
    } catch (err: unknown) {
      showToast('Export error: ' + getErrorMessage(err), 'error', 3000);
    }
  };

  return (
    <div className="space-y-5">

      {/* ── Zone 1: Page title + action buttons ─────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {isRSM ? 'Team Members' : 'Users'}
          </h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {isRSM ? 'View your hierarchy and team structure.' : 'Manage system access and roles.'}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={handleExportUsers}
            disabled={isLoading || filteredUsers.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm shadow-emerald-500/20 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            Export
          </button>
          {!isViewOnly && (
            <Link
              to="/add-user"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm shadow-indigo-500/20 hover:-translate-y-0.5 active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add User
            </Link>
          )}
        </div>
      </div>

      {/* ── Zone 2: Full-width search bar ───────────────────────────────── */}
      <div className="relative">
        {isLoading && searchQuery ? (
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        )}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search users by name, phone, or email…"
          className="w-full pl-11 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full bg-slate-200 hover:bg-slate-300 text-slate-500 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Zone 3: Role filter pills + result count ─────────────────────── */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {ROLE_FILTERS.map((role) => (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                roleFilter === role
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {role === 'ALL' ? 'All Roles' : ROLE_LABELS[role] || role}
            </button>
          ))}
        </div>
        <div className="flex-shrink-0 text-xs font-semibold text-slate-400 whitespace-nowrap">
          {isSearchMode
            ? isLoading
              ? 'Searching…'
              : `${filteredUsers.length} result${filteredUsers.length !== 1 ? 's' : ''}`
            : `${totalElements} total`}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">{error}</div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm">
        {/* Skeleton Loading */}
        {isLoading && (
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {TABLE_HEADERS.map((h, i) => (
                  <th key={i} className={`text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${h.className}`}>{h.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {[...Array(5)].map((_, i) => <SkeletonRow key={i} />)}
            </tbody>
          </table>
        )}

        {/* Empty State */}
        {!isLoading && filteredUsers.length === 0 && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <p className="text-slate-500 font-medium mb-2">
                {isSearchMode ? `No users found for "${searchQuery}"` : searchQuery || roleFilter !== 'ALL' ? 'No matching users' : 'No users found'}
              </p>
              <p className="text-slate-400 text-sm">
                {isSearchMode ? 'Try a different name or phone number.' : searchQuery || roleFilter !== 'ALL' ? 'Try adjusting your search or filter.' : 'Add users to see them listed here.'}
              </p>
            </div>
          </div>
        )}

        {/* Data Table */}
        {!isLoading && filteredUsers.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {TABLE_HEADERS.map((h, i) => (
                      <th key={i} className={`text-left py-4 px-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest ${h.className}`}>{h.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredUsers.map((user) => {
                    const isActive = user.status === 'ACTIVE';
                    return (
                      <tr
                        key={user.id}
                        className="hover:bg-indigo-50/30 transition-colors group cursor-pointer"
                        onClick={() => navigate(`/users/${user.id}`, { state: { user, from: location.pathname + location.search } })}
                      >
                        <td className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${getRoleBadgeColor(user.role)}`}>
                              {getInitials(user.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-bold text-slate-900 truncate group-hover:text-indigo-700 transition-colors">{user.name || '-'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                            {ROLE_LABELS[user.role] || user.role}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 hidden md:table-cell">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm text-slate-600 font-medium">{user.phone || '-'}</span>
                            {user.phone && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(user.phone || '');
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
                        <td className="py-3.5 px-6 hidden lg:table-cell">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                            {user.status || 'UNKNOWN'}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-sm text-slate-500 hidden lg:table-cell">{formatDate(user.createdAt)}</td>
                        <td className="py-3.5 px-4">
                          <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                          </svg>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="text-xs font-semibold text-slate-600">
                <span>Page {currentPage + 1} of {Math.max(totalPages, 1)}</span>
                <span className="ml-2">•</span>
                <span className="ml-2">{filteredUsers.length} of {totalElements} users</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 0))}
                  disabled={currentPage === 0 || isLoading}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >← Previous</button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1))}
                  disabled={currentPage >= totalPages - 1 || isLoading}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 border border-slate-200 hover:bg-white hover:text-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >Next →</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Users;
