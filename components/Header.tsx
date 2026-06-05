
import React from 'react';
import { Icons } from '../constants';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0 z-30">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h2>
        <span className="text-xs text-slate-400 hidden sm:inline">Monitor campaigns, clients, and vendor activities</span>
      </div>

      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden lg:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Icons.Search />
          </div>
          <input
            type="text"
            placeholder="Search anything..."
            className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 w-56 transition-all placeholder:text-slate-300"
          />
        </div>




      </div>
    </header>
  );
};

export default Header;
