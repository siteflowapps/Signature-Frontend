
import React from 'react';
import { Icons } from '../constants';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  useAuth();
  const today = new Date().toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <header className="h-16 bg-white border-b border-slate-100 px-6 flex items-center justify-between gap-4 shrink-0 z-30">
      {/* Search */}
      <div className="relative w-full max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
          <Icons.Search />
        </div>
        <input
          type="text"
          placeholder="Search outlets, users, distributors…"
          className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 focus:bg-white transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Right: date */}
      <div className="flex items-center gap-3 shrink-0">
        <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-500">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          {today}
        </span>
      </div>
    </header>
  );
};

export default Header;
