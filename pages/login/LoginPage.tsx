import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

import { BrandPanel } from './components/BrandPanel';
import { PhoneStep } from './components/PhoneStep';
import { OtpStep } from './components/OtpStep';
import { SuccessOverlay } from './components/SuccessOverlay';
import { getErrorMessage } from '../../utils/errorUtils';

type OtpStep_ = 'PHONE' | 'VERIFY';
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

/**
 * Login Page — slim orchestrator.
 * Manages step state and delegates rendering to focused sub-components.
 */
const LoginPage: React.FC = () => {
  const [otpStep, setOtpStep] = useState<OtpStep_>('PHONE');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();
  const { sendOtp, retryOtp, verifyOtp, isLoading, isAuthenticated, user } = useAuth();

  const getRedirectPath = () => {
    if (user?.role === 'SUPPORT') return '/support-dashboard';
    if (user?.role === 'DISTRIBUTOR_MANAGER') return '/my-distributors';
    return '/dashboard';
  };

  // If already authenticated, redirect
  useEffect(() => {
    if (isAuthenticated) navigate(getRedirectPath(), { replace: true });
  }, [isAuthenticated, user, navigate]);

  // Reset errors when switching steps
  useEffect(() => { setError(''); }, [otpStep]);

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // ── Handlers ──
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\s/g, '');
    if (cleanPhone.length !== 10) { setError('Please enter a valid 10-digit mobile number.'); return; }
    try {
      const res = await sendOtp(cleanPhone);
      if (res.success) {
        setOtpStep('VERIFY');
        setResendTimer(RESEND_COOLDOWN);
        setOtpDigits(Array(OTP_LENGTH).fill(''));
      }
    } catch (err: unknown) { setError(getErrorMessage(err)); }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isLoading) return;
    const cleanPhone = phone.replace(/\s/g, '');
    try {
      const res = await retryOtp(cleanPhone);
      if (res.success) {
        setResendTimer(RESEND_COOLDOWN);
        setOtpDigits(Array(OTP_LENGTH).fill(''));
        setError('');
      }
    } catch (err: unknown) { setError(getErrorMessage(err)); }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otpDigits.join('');
    if (code.length < OTP_LENGTH) { setError('Please enter the complete verification code.'); return; }
    const cleanPhone = phone.replace(/\s/g, '');
    try {
      await verifyOtp(cleanPhone, code);
      setIsSuccess(true);
      setTimeout(() => navigate(getRedirectPath()), 1200);
    } catch (err: unknown) { setError(getErrorMessage(err)); }
  };

  const getSubtitle = () => {
    if (otpStep === 'PHONE') return 'Enter your registered mobile number to continue.';
    return `A verification code was sent to +91 ${phone}`;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full bg-slate-50 selection:bg-indigo-500/30">
      {isSuccess && <SuccessOverlay />}

      {/* Left Pane — Brand */}
      <BrandPanel />

      {/* Right Pane — Login Card */}
      <div className="w-full lg:w-[54%] flex items-center justify-center p-6 sm:p-12 md:p-16 relative bg-gradient-to-br from-slate-50 to-blue-50/30 flex-1">
        <div className="absolute inset-0 pointer-events-none opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(99,102,241,0.6) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        ></div>

        <div className="max-w-[480px] w-full relative z-10 animate-fade-in-card">
          <div className="bg-white border border-slate-100/80 rounded-3xl sm:rounded-[40px] p-8 sm:p-12 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.08)]">

            {/* Logo */}
            <div className="flex flex-col items-center justify-center mb-10 gap-3">
              <img src="/assets/branding/cdo-emblem.png" alt="Campa Destination Outlet" className="w-28 h-auto" />
              <p className="text-[10px] font-semibold text-slate-400">Powered by <span className="text-slate-500 font-bold">Siteflow</span></p>
            </div>

            {/* Dynamic Header */}
            <div className="text-center mb-8">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mb-1.5">Welcome Back</h1>
              <p className="text-slate-400 text-xs sm:text-sm font-medium transition-all duration-200">{getSubtitle()}</p>
            </div>

            {/* Error Alert */}
            {error && !isSuccess && (
              <div className="mb-5 p-3.5 rounded-2xl border bg-red-50 border-red-100 text-red-600 flex items-start gap-2.5" style={{animation: 'fadeIn 0.2s ease-out'}}>
                <svg className="w-4.5 h-4.5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span className="text-sm font-semibold">{error}</span>
              </div>
            )}

            {/* Form Content */}
            <div key={otpStep} style={{animation: 'slideUp 0.25s ease-out'}}>
              {otpStep === 'PHONE' ? (
                <PhoneStep
                  phone={phone}
                  setPhone={setPhone}
                  error={error}
                  setError={setError}
                  isLoading={isLoading}
                  onSubmit={handleSendOtp}
                />
              ) : (
                <OtpStep
                  otpDigits={otpDigits}
                  setOtpDigits={setOtpDigits}
                  resendTimer={resendTimer}
                  isLoading={isLoading}
                  onSubmit={handleVerifyOtp}
                  onResend={handleResendOtp}
                  onChangePhone={() => setOtpStep('PHONE')}
                />
              )}
            </div>

            {/* Dev-Only Quick Login */}
            {!isSuccess && (((import.meta as unknown) as { env?: { DEV: boolean } }).env?.DEV) && (
              <div className="mt-8 pt-6 border-t border-slate-100/80">
                <p className="text-[8px] font-bold text-slate-300 uppercase tracking-[0.15em] text-center mb-4">Dev Profiles</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { label: 'B-Admin', phone: '9999999990' },
                    { label: 'B-User', phone: '9999999997' },
                    { label: 'Fin-Admin', phone: '9999999991' },
                    { label: 'RBL', phone: '9999999992' },
                    { label: 'SM', phone: '9999999993' },
                    { label: 'Distributor', phone: '99999 99998' },
                    { label: 'DM', phone: '99999 99996' },
                  ].map((p, i) => (
                    <button key={i} type="button"
                      onClick={() => { setPhone(p.phone.replace(/\s+/g, '')); setOtpStep('PHONE'); setError(''); }}
                      className="py-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 text-[7px] font-bold uppercase tracking-wider hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-all flex flex-col items-center gap-0.5 active:scale-95">
                      <span className="text-[6px] text-slate-300">OTP</span>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer Links */}
          <div className="mt-6 flex justify-center gap-5 text-[10px] text-slate-500 font-bold tracking-wide">
            <a href="#" className="hover:text-indigo-600 transition-colors">Privacy Policy</a>
            <span className="text-slate-300">·</span>
            <a href="#" className="hover:text-indigo-600 transition-colors">Terms of Service</a>
            <span className="text-slate-300">·</span>
            <a href="#/admin/login" className="text-slate-400 hover:text-slate-600 transition-colors">Admin</a>
          </div>
        </div>

        {/* BG glow */}
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] bg-indigo-200 rounded-full blur-[100px] opacity-25 pointer-events-none"></div>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(8px) } to { opacity: 1; transform: translateY(0) } }
        @keyframes scaleUp { from { opacity: 0; transform: scale(0.85) } to { opacity: 1; transform: scale(1) } }
      `}</style>
    </div>
  );
};

export default LoginPage;
