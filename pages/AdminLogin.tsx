import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getErrorMessage } from '../utils/errorUtils';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const navigate = useNavigate();
  const { login, isLoading, isAuthenticated } = useAuth();

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // Clear error on input change
  useEffect(() => { setError(''); }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter both email and password.'); return; }
    try {
      await login({ email, password });
      setIsSuccess(true);
      setTimeout(() => navigate('/dashboard'), 1200);
    } catch (err: unknown) { setError(getErrorMessage(err)); }
  };

  const handleQuickLogin = (emailVal: string, passVal: string) => {
    setEmail(emailVal);
    setPassword(passVal);
    setError('');
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 selection:bg-indigo-500/30">
      {/* ═══ Success Overlay ═══ */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-md" style={{animation: 'adminFadeIn 0.3s ease-out'}}>
          <div className="text-center" style={{animation: 'adminScaleUp 0.4s cubic-bezier(0.34,1.56,0.64,1)'}}>
            <div className="mx-auto w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-1">You're In!</h2>
            <p className="text-slate-400 text-sm font-medium">Redirecting to admin dashboard…</p>
          </div>
        </div>
      )}

      {/* ═══ Left Pane — Branding ═══ */}
      <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-indigo-600 via-indigo-800 to-indigo-950 relative overflow-hidden flex-col justify-center p-12 text-white">
        {/* Logo — pinned top, premium glass container */}
        <div className="absolute top-10 left-12 z-10 flex flex-col gap-2">
          <div className="bg-white/95 backdrop-blur-xl px-4 py-3 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
            <img 
              src="/assets/branding/signature-emblem.png" 
              alt="Signature" 
              className="w-28 h-auto" 
            />
          </div>
          <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] ml-1 mt-2">Signature Platform</span>
          <p className="text-[9px] font-semibold text-white/40 mt-1 ml-1">Powered by Signature Outlets</p>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 space-y-8 max-w-lg mt-8">
          <div className="w-12 h-1 bg-[#EE2C24] rounded-full"></div>
          <h2 className="text-5xl font-black leading-[1.05] tracking-tight text-white drop-shadow-lg">
            Admin<br />
            <span className="text-amber-400">Console.</span>
          </h2>
          <p className="text-blue-100/60 text-lg leading-relaxed font-medium max-w-sm">
            Back-office portal for managing businesses, payouts, and platform operations.
          </p>
          <div className="flex gap-14 pt-4">
            <div>
              <div className="text-3xl font-black text-white">98%</div>
              <div className="text-[10px] font-bold text-blue-200/40 uppercase tracking-widest mt-1">Compliance Rate</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white">2.4x</div>
              <div className="text-[10px] font-bold text-blue-200/40 uppercase tracking-widest mt-1">ROI Uplift</div>
            </div>
            <div>
              <div className="text-3xl font-black text-white">15k+</div>
              <div className="text-[10px] font-bold text-blue-200/40 uppercase tracking-widest mt-1">Active Users</div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <p className="absolute bottom-12 left-12 z-10 text-xs text-blue-200/25 font-semibold tracking-wide">© 2026 signatureoutlets.com · All rights reserved.</p>

        {/* Glow effects */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-500 rounded-full blur-[150px] opacity-8"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-blue-900 rounded-full blur-[150px] opacity-30"></div>
      </div>

      {/* ═══ Right Pane — Admin Login Form ═══ */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-6 sm:p-12 md:p-16 relative bg-gradient-to-br from-slate-50 to-blue-50/30">
        <div className="max-w-[480px] w-full relative z-10">
          <div className="bg-white border border-slate-100/80 rounded-3xl sm:rounded-[40px] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">

            {/* Logo — Signature primary, Siteflow secondary */}
            <div className="flex flex-col items-center justify-center mb-10 gap-3">
              <img src="/assets/branding/signature-emblem.png" alt="Signature" className="w-24 h-auto" />
              <p className="text-[10px] font-semibold text-slate-400">Powered by <span className="text-slate-500 font-bold">Signature Outlets</span></p>
            </div>

            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1.5">Admin Console</h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium">Sign in with your admin credentials to manage operations.</p>
            </div>

            {/* Error Alert */}
            {error && !isSuccess && (
              <div className="mb-5 p-3.5 rounded-2xl border bg-red-50 border-red-100 text-red-600 flex items-start gap-2.5" style={{animation: 'adminFadeIn 0.2s ease-out'}}>
                <svg className="w-4.5 h-4.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            {/* Admin Login Form */}
            <form onSubmit={handleSubmit} className="space-y-5" style={{animation: 'adminSlideUp 0.25s ease-out'}}>
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Email</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                  </span>
                  <input type="email" required value={email} disabled={isLoading}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-400 focus:outline-none transition-all text-slate-800 font-semibold text-sm placeholder:text-slate-300 disabled:opacity-60"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Password</label>
                  <a href="#" className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest hover:text-indigo-600 transition-colors">Forgot?</a>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  </span>
                  <input type={showPassword ? 'text' : 'password'} required value={password} disabled={isLoading}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full pl-11 pr-12 py-3 bg-slate-50/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-400 focus:outline-none transition-all text-slate-800 font-semibold text-sm placeholder:text-slate-300 disabled:opacity-60"
                    placeholder="••••••••••••"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-300 hover:text-slate-500 transition-colors">
                    {showPassword ? (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" /></svg>
                    ) : (
                      <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-slate-800/20 transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:hover:translate-y-0">
                {isLoading ? <Spinner /> : 'Sign In to Admin'}
              </button>
            </form>

            {/* Dev-Only Quick Login */}
            {(((import.meta as unknown) as { env?: { DEV: boolean } }).env?.DEV) && (
              <div className="mt-8 pt-6 border-t border-slate-100/80">
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.15em] text-center mb-4">Dev Profiles</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'Super Admin', email: 'admin@gmail.com', pass: 'Cdo@Super#2026' },
                  ].map((p, i) => (
                    <button key={i} type="button"
                      onClick={() => handleQuickLogin(p.email, p.pass)}
                      className="py-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 text-[7px] font-bold uppercase tracking-wider hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all flex flex-col items-center gap-0.5 active:scale-95 col-span-2">
                      <span className="text-[6px] text-slate-300">EMAIL</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-center gap-5 text-[10px] text-slate-300 font-medium">
            <a href="#/login" className="hover:text-indigo-500 transition-colors">← Field Team Login</a>
            <span className="text-slate-200">·</span>
            <a href="#" className="hover:text-indigo-500 transition-colors">Privacy Policy</a>
          </div>
        </div>

        {/* BG glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-200 rounded-full blur-[100px] opacity-25 pointer-events-none"></div>
      </div>

      <style>{`
        @keyframes adminFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes adminSlideUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes adminScaleUp { from { opacity: 0; transform: scale(0.85) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
};

/* Reusable Spinner */
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export default AdminLogin;
