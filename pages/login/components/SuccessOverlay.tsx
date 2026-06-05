import React from 'react';

/**
 * Success overlay — displayed after OTP verification before redirect.
 */
export const SuccessOverlay: React.FC = () => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md" style={{animation: 'fadeIn 0.3s ease-out'}}>
    <div className="text-center" style={{animation: 'scaleUp 0.4s cubic-bezier(0.34,1.56,0.64,1)'}}>
      <div className="mx-auto w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-6">
        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
      </div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">You're In!</h2>
      <p className="text-slate-400 text-sm font-medium">Redirecting to your dashboard…</p>
    </div>
  </div>
);
