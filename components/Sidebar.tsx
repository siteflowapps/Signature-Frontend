
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Icons } from '../constants';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import UserProfileModal from './UserProfileModal';
import packageJson from '../package.json';

const appVersion = packageJson.version;

const ADMIN_MENU = [
  { name: 'Dashboard', icon: Icons.Dashboard, path: '/dashboard' },
  { name: 'Businesses', icon: Icons.Businesses, path: '/businesses' },
  { name: 'Outlets', icon: Icons.Outlets, path: '/outlets' },
  { name: 'Users', icon: Icons.Search, path: '/users' },
  { name: 'Distributors', icon: Icons.Distributors, path: '/distributors' },
  { name: 'Slabs', icon: Icons.Dashboard, path: '/slabs' },
  { name: 'Payouts', icon: Icons.Payouts, path: '/payouts' },
  { name: 'Reports', icon: Icons.Reports, path: '/reports' },
  { name: 'Stock Reports', icon: Icons.Reports, path: '/stock-reports' },
  { name: 'ASE Lookup', icon: Icons.ASELookup, path: '/ase-lookup' },
  { name: 'DM Lookup', icon: Icons.ASELookup, path: '/dm-lookup' },
];

const BUSINESS_ADMIN_MENU = [
  { name: 'Dashboard', icon: Icons.Dashboard, path: '/dashboard' },
  { name: 'Outlets', icon: Icons.Outlets, path: '/outlets' },
  { name: 'Distributors', icon: Icons.Distributors, path: '/distributors' },
  { name: 'Slabs', icon: Icons.Dashboard, path: '/slabs' },
  { name: 'Users', icon: Icons.Search, path: '/users' },
  { name: 'Stock Reports', icon: Icons.Reports, path: '/stock-reports' },
  { name: 'ASE Lookup', icon: Icons.ASELookup, path: '/ase-lookup' },
  { name: 'DM Lookup', icon: Icons.ASELookup, path: '/dm-lookup' },
];

const BUSINESS_MENU = [
  { name: 'Dashboard', icon: Icons.Dashboard, path: '/dashboard' },
  { name: 'Outlets', icon: Icons.Outlets, path: '/outlets' },
  { name: 'Distributors', icon: Icons.Distributors, path: '/distributors' },
  { name: 'Reports', icon: Icons.Reports, path: '/reports' },
];

const FINANCE_ADMIN_MENU = [
  { name: 'Dashboard', icon: Icons.Dashboard, path: '/dashboard' },
  { name: 'Outlets', icon: Icons.Outlets, path: '/outlets' },
  { name: 'Distributors', icon: Icons.Distributors, path: '/distributors' },
  { name: 'Slabs', icon: Icons.Dashboard, path: '/slabs' },
  { name: 'Users', icon: Icons.Search, path: '/users' },
  { name: 'Payouts', icon: Icons.Payouts, path: '/payouts' },
  { name: 'Stock Reports', icon: Icons.Reports, path: '/stock-reports' },
];

const BUSINESS_USER_MENU = [
  { name: 'Dashboard', icon: Icons.Dashboard, path: '/dashboard' },
  { name: 'Outlets', icon: Icons.Outlets, path: '/outlets' },
  { name: 'Distributors', icon: Icons.Distributors, path: '/distributors' },
  { name: 'Slabs', icon: Icons.Dashboard, path: '/slabs' },
  { name: 'Locations', icon: Icons.Locations, path: '/locations' },
  { name: 'ASE Lookup', icon: Icons.ASELookup, path: '/ase-lookup' },
  { name: 'Stock Reports', icon: Icons.Reports, path: '/stock-reports' },
  { name: 'Support Tickets', icon: Icons.Ticket, path: '/support-tickets' },
  { name: 'Users', icon: Icons.Search, path: '/users' },
];

const RBL_MENU = [
  { name: 'Dashboard', icon: Icons.Dashboard, path: '/dashboard' },
  { name: 'Outlets', icon: Icons.Outlets, path: '/outlets' },
  { name: 'Distributors', icon: Icons.Distributors, path: '/distributors' },
  { name: 'Slabs', icon: Icons.Dashboard, path: '/slabs' },
  { name: 'My Team', icon: Icons.Team, path: '/team' },
  { name: 'Team Members', icon: Icons.Search, path: '/users' },
];

const SM_MENU = [
  { name: 'Dashboard', icon: Icons.Dashboard, path: '/dashboard' },
  { name: 'Outlets', icon: Icons.Outlets, path: '/outlets' },
  { name: 'Distributors', icon: Icons.Distributors, path: '/distributors' },
  { name: 'Slabs', icon: Icons.Dashboard, path: '/slabs' },
  { name: 'My Team', icon: Icons.Team, path: '/team' },
  { name: 'Team Members', icon: Icons.Search, path: '/users' },
];

const DISTRIBUTOR_MENU = [
  { name: 'Dashboard', icon: Icons.Dashboard, path: '/dashboard' },
];

const DISTRIBUTOR_MANAGER_MENU = [
  { name: 'Dashboard', icon: Icons.Dashboard, path: '/dashboard' },
  { name: 'My Distributors', icon: Icons.Team, path: '/my-distributors' },
];

const SUPPORT_MENU = [
  { name: 'Dashboard', icon: Icons.Dashboard, path: '/support-dashboard' },
  { name: 'Outlets', icon: Icons.Outlets, path: '/outlets' },
  { name: 'Distributors', icon: Icons.Distributors, path: '/distributors' },
  { name: 'Support Tickets', icon: Icons.Ticket, path: '/support-tickets' },
];

const Sidebar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [showPopover, setShowPopover] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Close popover on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    };
    if (showPopover) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showPopover]);

  const getMenuItems = () => {
    if (user?.role === UserRole.SUPER_ADMIN) {
      return ADMIN_MENU;
    } else if (user?.role === UserRole.BUSINESS_ADMIN) {
      return BUSINESS_ADMIN_MENU;
    } else if (user?.role === UserRole.FINANCE_ADMIN) {
      return FINANCE_ADMIN_MENU;
    } else if (user?.role === UserRole.BUSINESS_USER) {
      return BUSINESS_USER_MENU;
    } else if (user?.role === UserRole.RBL) {
      return RBL_MENU;
    } else if (user?.role === UserRole.SM) {
      return SM_MENU;
    } else if (user?.role === UserRole.DISTRIBUTOR) {
      return DISTRIBUTOR_MENU;
    } else if (user?.role === UserRole.DISTRIBUTOR_MANAGER) {
      return DISTRIBUTOR_MANAGER_MENU;
    } else if (user?.role === UserRole.SUPPORT) {
      return SUPPORT_MENU;
    } else {
      return BUSINESS_MENU;
    }
  };

  const menuItems = getMenuItems();

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    setShowPopover(false);
    logout();
    navigate('/');
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'Super Admin';
      case 'BUSINESS_ADMIN':
        return 'Business Admin';
      case 'BUSINESS_USER':
        return 'Business User';
      case 'FINANCE_ADMIN':
        return 'Finance Admin';
      case 'RBL':
        return 'RBL';
      case 'SM':
        return 'Sales Manager';
      case 'DISTRIBUTOR':
        return 'Distributor';
      case 'DISTRIBUTOR_MANAGER':
        return 'Distributor Manager';
      default:
        return role;
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return parts[0][0].toUpperCase();
  };

  return (
    <aside className="w-64 bg-white h-screen flex flex-col border-r border-slate-100 flex-shrink-0 relative z-20">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-2">
          <img src="/assets/branding/cdo-emblem.png" alt="CDO" className="w-10 h-10 object-contain" />
          <div className="flex flex-col">
            <h1 className="text-[15px] font-black tracking-tighter text-slate-900 leading-none">Siteflow CDO</h1>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-wider mt-1">Powered by Siteflow</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 translate-x-1'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900 hover:translate-x-1'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
              <span className="font-bold text-sm tracking-wide">{item.name}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* App Version */}
      <div className="px-5 pb-3 flex justify-center cursor-default">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-100 shadow-[inset_0_1px_0_white]">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse"></div>
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Version {appVersion}</span>
        </div>
      </div>

      {/* User Section — single click zone */}
      <div className="px-3 pb-4 mt-auto relative" ref={popoverRef}>
        {/* Popover Menu */}
        {showPopover && (
          <div className="absolute bottom-full left-3 right-3 mb-2 bg-white rounded-xl shadow-lg shadow-slate-200/80 border border-slate-100 overflow-hidden z-30 animate-in slide-in-from-bottom-2 fade-in duration-150">
            <button
              onClick={() => {
                setShowPopover(false);
                setShowProfileModal(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              View Profile
            </button>
            <div className="h-px bg-slate-100" />
            <button
              onClick={() => {
                setShowPopover(false);
                setShowLogoutConfirm(true);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        )}

        {/* User Plate */}
        <div 
          className="flex items-center gap-2.5 px-2 py-2.5 hover:bg-slate-50 rounded-xl cursor-pointer transition-colors"
          onClick={() => setShowPopover(!showPopover)}
        >
          <div className="w-8 h-8 rounded-full border border-slate-200 shadow-sm bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-black text-white">{getInitials(user?.name || 'U')}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-bold text-slate-800 truncate leading-tight">
              {user?.name || 'User'}
            </p>
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">
              {user?.role ? getRoleBadge(user.role) : 'Guest'}
            </p>
          </div>
          <div className="p-1.5 text-slate-300">
            <svg className={`w-4 h-4 transition-transform duration-200 ${showPopover ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
          </div>
        </div>
      </div>

      {/* User Profile Modal */}
      <UserProfileModal 
        user={user}
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onLogout={() => {
          setShowProfileModal(false);
          setShowLogoutConfirm(true);
        }}
      />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-full shrink-0">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight">Leaving so soon?</h3>
            </div>
            <p className="text-slate-500 text-sm font-medium mb-6">
              You're about to end your current session. Any unsaved changes will be lost. You can always sign back in to pick up where you left off.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold text-sm rounded-xl transition-colors"
              >
                Stay Signed In
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm shadow-red-500/20 active:scale-[0.98]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
