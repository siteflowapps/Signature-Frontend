import React, { useState, useEffect } from 'react';
import { User, Distributor } from '../types';
import { getRoleBadgeColor, ROLE_LABELS } from '../utils/roleConfig';
import { apiService } from '../network/apiService';

interface UserProfileModalProps {
  user: User | null;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

const UserProfileModal: React.FC<UserProfileModalProps> = ({ user, isOpen, onClose, onLogout }) => {
  const [distributorData, setDistributorData] = useState<Distributor | null>(null);
  const [isLoadingDistributor, setIsLoadingDistributor] = useState(false);

  useEffect(() => {
    if (isOpen && user && user.role === 'DISTRIBUTOR') {
      setIsLoadingDistributor(true);
      apiService.distributors.getById(user.id)
        .then(res => {
          if (res.success && res.data) {
            setDistributorData(res.data);
          }
        })
        .finally(() => setIsLoadingDistributor(false));
    } else {
      setDistributorData(null);
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const roleLabel = ROLE_LABELS[user.role] || user.role;
  const badgeColors = getRoleBadgeColor(user.role);

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };
  
  // Format dates if available
  const joinedDate = user.createdAt 
    ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Unknown';

  const formatPhone = (p: string) => p && p.length === 10 ? `+91 ${p.slice(0, 5)} ${p.slice(5)}` : p;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header / Hero */}
        <div className="bg-gradient-to-br from-indigo-50 to-white px-6 py-8 text-center border-b border-slate-100">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="relative inline-block mb-4">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center">
              <span className="text-3xl font-black text-white tracking-tight">{getInitials(user.name)}</span>
            </div>
            {user.status === 'ACTIVE' && (
              <div className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            )}
          </div>
          
          <h2 className="text-xl font-black text-slate-900 tracking-tight leading-none mb-2">
            {user.name}
          </h2>
          
          <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badgeColors}`}>
            {roleLabel}
          </div>
        </div>

        {/* Details Section */}
        <div className="px-6 py-5 space-y-4">
          
          {user.phone && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Phone Number</span>
              <span className="text-sm font-semibold text-slate-800">{formatPhone(user.phone)}</span>
            </div>
          )}

          {user.email && (
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Email Address</span>
              <span className="text-sm font-semibold text-slate-800">{user.email}</span>
            </div>
          )}

          {user.role === 'DISTRIBUTOR' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">DMS ID</span>
                <span className="text-sm font-semibold text-slate-800">
                  {isLoadingDistributor ? (
                    <span className="text-slate-400 italic text-xs animate-pulse">Loading...</span>
                  ) : distributorData?.dmsId ? (
                    <span className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-mono text-xs">{distributorData.dmsId}</span>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Not assigned</span>
                  )}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-1">Manager</span>
                <span className="text-sm font-semibold text-slate-800">
                  {isLoadingDistributor ? (
                    <span className="text-slate-400 italic text-xs animate-pulse">Loading...</span>
                  ) : distributorData?.manager?.name ? (
                    <span className="flex flex-col">
                      <span>{distributorData.manager.name}</span>
                      {distributorData.manager.phone && <span className="text-xs text-slate-500 font-medium">{formatPhone(distributorData.manager.phone)}</span>}
                    </span>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Not assigned</span>
                  )}
                </span>
              </div>
            </div>
          )}

          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">Account Status</span>
              <span className="text-xs font-bold text-slate-900">{user.status || 'Active'}</span>
            </div>
            <div className="h-8 w-px bg-slate-200"></div>
            <div className="flex flex-col text-right">
              <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5">Joined</span>
              <span className="text-xs font-bold text-slate-900">{joinedDate}</span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-600 font-bold text-sm rounded-xl transition-all shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default UserProfileModal;
