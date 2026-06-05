import React from 'react';

const FEATURES = [
  {
    label: 'AI Invoice Verification',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  },
  {
    label: 'Outlet Execution Tracking',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
  },
  {
    label: 'Campaign & Incentive Engine',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>,
  },
  {
    label: 'Territory Performance Insights',
    icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
  },
];

const STATS = [
  { value: '98%', label: 'Invoice verification accuracy' },
  { value: '2.4x', label: 'Faster ops turnaround' },
  { value: '15K+', label: 'Active outlets managed' },
];

/**
 * Left-side brand panel for the Login page.
 * Purely presentational — zero logic, zero state.
 */
export const BrandPanel: React.FC = () => (
  <div className="
    relative text-white
    bg-gradient-to-br from-indigo-600 via-indigo-800 to-indigo-950
    overflow-y-auto overflow-x-hidden scrollbar-hide
    px-6 py-8
    lg:w-[46%] lg:min-h-screen lg:flex lg:flex-col lg:justify-between lg:p-8 xl:p-12
  ">
    {/* Animated background shapes */}
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400 rounded-full blur-[150px] animate-pulse-glow"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[600px] h-[600px] bg-rose-500/10 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900 rounded-full blur-[150px] opacity-30"></div>
      <div className="absolute top-[30%] right-[20%] w-[200px] h-[200px] bg-indigo-400 rounded-full blur-[120px] animate-subtle-drift opacity-10"></div>
    </div>

    {/* Dot pattern overlay */}
    <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
      style={{
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    ></div>

    {/* Logo */}
    <div className="relative z-10 flex flex-col gap-1.5" style={{animation: 'fadeInUp 0.5s ease-out both'}}>
      <img src="/assets/branding/reliance-logo.png" alt="Reliance Consumer Products Limited" className="w-28 h-auto rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.08)]" />
      <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] ml-1 mt-2">CDO Platform</span>
      <p className="text-[9px] font-semibold text-white/40 ml-1">Powered by Siteflow.tech</p>
    </div>

    {/* Hero Content */}
    <div className="relative z-10 max-w-lg mt-8 lg:mt-6 xl:mt-0 mb-auto lg:mb-6 xl:mb-0">
      <div className="w-16 h-1 bg-gradient-to-r from-rose-400 to-orange-400 rounded-full mb-4 xl:mb-6 shadow-[0_0_20px_rgba(244,63,94,0.5)]" style={{animation: 'fadeInUp 0.5s 0.15s ease-out both'}}></div>

      <h2 className="text-3xl lg:text-4xl xl:text-5xl font-black leading-[1.08] tracking-tighter text-white drop-shadow-lg" style={{animation: 'fadeInUp 0.6s 0.2s ease-out both'}}>
        Retail Execution.<br />
        <span className="bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">Incentive Intelligence.</span>
      </h2>

      <p className="text-indigo-100/70 text-sm xl:text-base leading-relaxed font-medium max-w-sm mt-4" style={{animation: 'fadeInUp 0.6s 0.35s ease-out both'}}>
        Powering outlet programs, AI invoice verification, and performance incentives for modern field sales teams.
      </p>

      {/* Feature Highlights — hidden on mobile */}
      <div className="hidden lg:grid grid-cols-2 gap-3 mt-8" style={{animation: 'fadeInUp 0.6s 0.5s ease-out both'}}>
        {FEATURES.map((feat) => (
          <div key={feat.label} className="flex items-center gap-3 bg-white/[0.03] backdrop-blur-md border outline outline-1 outline-white/5 border-t-white/10 border-r-white/[0.05] border-b-white/[0.02] border-l-white/[0.05] rounded-xl px-3.5 py-2.5 transition-colors hover:bg-white/[0.08]">
            <div className="bg-white/5 rounded-full p-1.5 text-indigo-300/90 shrink-0 shadow-inner">{feat.icon}</div>
            <span className="text-[11px] font-semibold text-indigo-100/80 leading-tight">{feat.label}</span>
          </div>
        ))}
      </div>

      {/* Stats Row */}
      <div className="flex gap-6 lg:gap-10 xl:gap-14 mt-6 xl:mt-10" style={{animation: 'fadeInUp 0.6s 0.65s ease-out both'}}>
        {STATS.map((stat) => (
          <div key={stat.value}>
            <div className="text-2xl lg:text-3xl font-black text-white">{stat.value}</div>
            <div className="text-[10px] font-bold text-indigo-200/50 uppercase tracking-widest mt-1 max-w-[100px] leading-snug">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Copyright (desktop only) */}
    <p className="hidden lg:block relative z-10 text-[10px] xl:text-xs text-blue-200/25 font-semibold tracking-wide mt-6 xl:mt-0">© 2026 siteflow.tech · All rights reserved.</p>
  </div>
);
