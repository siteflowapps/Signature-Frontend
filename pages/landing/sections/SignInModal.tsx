import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { getErrorMessage } from '../../../utils/errorUtils';

type OtpStep = 'PHONE' | 'VERIFY';
const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 30;

interface SignInModalProps {
  open: boolean;
  onClose: () => void;
}

/* ── Reusable Spinner ── */
const Spinner = () => (
  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

export const SignInModal: React.FC<SignInModalProps> = ({ open, onClose }) => {
  const [otpStep, setOtpStep] = useState<OtpStep>('PHONE');
  const [phone, setPhone] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);

  const navigate = useNavigate();
  const { sendOtp, retryOtp, verifyOtp, isLoading } = useAuth();
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const backdropRef = useRef<HTMLDivElement>(null);

  // ── Reset state when modal opens/closes ──
  useEffect(() => {
    if (open) {
      setOtpStep('PHONE');
      setPhone('');
      setOtpDigits(Array(OTP_LENGTH).fill(''));
      setError('');
      setIsSuccess(false);
      setResendTimer(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  // ── Escape key to close ──
  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isLoading && !isSuccess) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [open, onClose, isLoading, isSuccess]);

  // ── Resend timer countdown ──
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => setResendTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Reset errors when switching steps
  useEffect(() => { 
    setError(''); 
  }, [otpStep]);

  // ── OTP Digit Handlers ──
  const handleOtpChange = useCallback((index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    if (value.length > 1) {
      const chars = value.slice(0, OTP_LENGTH - index).split('');
      chars.forEach((ch, i) => { if (index + i < OTP_LENGTH) newDigits[index + i] = ch; });
      setOtpDigits(newDigits);
      const focusIdx = Math.min(index + chars.length, OTP_LENGTH - 1);
      otpRefs.current[focusIdx]?.focus();
    } else {
      newDigits[index] = value;
      setOtpDigits(newDigits);
      if (value && index < OTP_LENGTH - 1) otpRefs.current[index + 1]?.focus();
    }
  }, [otpDigits]);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otpDigits]);

  // ── Phone Formatting ──
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 10);
    if (digits.length > 5) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
    return digits;
  };

  // ── Form Handlers ──
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
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
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
        otpRefs.current[0]?.focus();
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
      setTimeout(() => { onClose(); navigate('/dashboard'); }, 1200);
    } catch (err: unknown) { setError(getErrorMessage(err)); }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current && !isLoading && !isSuccess) onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="lp-modal-backdrop"
    >
      <div className={`lp-modal-card ${isSuccess ? 'lp-modal-success' : ''}`}>
        {/* ── Success Overlay ── */}
        {isSuccess && (
          <div className="lp-modal-success-overlay">
            <div className="lp-modal-success-content">
              <div className="lp-modal-success-icon">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: 900, color: 'var(--lp-text)', marginBottom: '4px' }}>You're In!</h2>
              <p style={{ fontSize: '13px', color: 'var(--lp-text-muted)', fontWeight: 500 }}>Redirecting to your dashboard…</p>
            </div>
          </div>
        )}

        {/* ── Close Button ── */}
        {!isSuccess && (
          <button
            onClick={onClose}
            className="lp-modal-close"
            aria-label="Close sign-in"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* ── Header ── */}
        {!isSuccess && (
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <div className="lp-modal-logo">
              <div className="lp-modal-logo-icon">S</div>
              <span className="lp-modal-logo-text">Signature <span style={{ color: 'var(--lp-primary)' }}>Outlets</span></span>
            </div>
            <h2 className="lp-modal-title">
              {otpStep === 'PHONE' ? 'Sign In' : 'Verify Your Phone'}
            </h2>
            <p className="lp-modal-subtitle">
              {otpStep === 'PHONE'
                ? 'Enter your registered mobile number to continue.'
                : <>A verification code was sent to <strong>+91 {phone}</strong></>}
            </p>
          </div>
        )}

        {/* ── Error Alert ── */}
        {error && !isSuccess && (
          <div className="lp-modal-error">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span style={{ fontSize: '13px', fontWeight: 600 }}>{error}</span>
          </div>
        )}

        {/* ── Form ── */}
        {!isSuccess && (
          <div key={otpStep} className="lp-modal-form-animate">
            {otpStep === 'PHONE' ? (
              <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label className="lp-modal-label">Mobile Number</label>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                    <div className="lp-modal-phone-prefix">+91</div>
                    <input
                      type="tel"
                      required
                      value={phone}
                      disabled={isLoading}
                      onChange={e => { setPhone(formatPhone(e.target.value)); if (error) setError(''); }}
                      className="lp-modal-input lp-modal-phone-input"
                      placeholder="98765 43210"
                      autoFocus
                    />
                  </div>
                  {(() => {
                    const digitCount = phone.replace(/\D/g, '').length;
                    const complete = digitCount === 10;
                    return (
                      <p style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        textAlign: 'right',
                        marginTop: '6px',
                        color: complete ? '#10b981' : 'var(--lp-text-muted)',
                        transition: 'color 0.2s',
                      }}>
                        {digitCount}/10
                      </p>
                    );
                  })()}
                </div>
                <button type="submit" disabled={isLoading} className="lp-modal-btn-primary">
                  {isLoading ? <Spinner /> : 'Get Verification Code'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* OTP Digit Boxes */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {otpDigits.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={OTP_LENGTH}
                      value={digit}
                      disabled={isLoading}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      onFocus={e => e.target.select()}
                      className="lp-modal-otp-box"
                      placeholder="·"
                    />
                  ))}
                </div>

                {/* Resend Timer */}
                <div style={{ textAlign: 'center' }}>
                  {resendTimer > 0 ? (
                    <p style={{ fontSize: '12px', color: 'var(--lp-text-muted)', fontWeight: 500 }}>
                      Resend code in <span style={{ fontWeight: 700, color: 'var(--lp-primary)' }}>{resendTimer}s</span>
                    </p>
                  ) : (
                    <button type="button" onClick={handleResendOtp} disabled={isLoading}
                      className="lp-modal-resend-btn">
                      Didn't receive it? Resend Code
                    </button>
                  )}
                </div>

                <button type="submit" disabled={isLoading || otpDigits.join('').length < OTP_LENGTH}
                  className="lp-modal-btn-verify">
                  {isLoading ? <Spinner /> : 'Verify & Continue'}
                </button>

                <button type="button" disabled={isLoading} onClick={() => setOtpStep('PHONE')}
                  className="lp-modal-back-btn">
                  ← Change Phone Number
                </button>
              </form>
            )}
          </div>
        )}

        {/* ── Dev-Only Quick Login ── */}
        {!isSuccess && (((import.meta as unknown) as { env?: { DEV: boolean } }).env?.DEV) && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--lp-border)' }}>
            <p style={{ fontSize: '8px', fontWeight: 700, color: 'var(--lp-text-muted)', textTransform: 'uppercase', letterSpacing: '0.15em', textAlign: 'center', marginBottom: '10px' }}>Dev Profiles</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {[
                { label: 'NHQ Admin', phone: '9876543210' },
                { label: 'Fin Mgr', phone: '9876543211' },
                { label: 'Mktg Mgr', phone: '9876543212' },
                { label: 'Cooler', phone: '9876543213' },
                { label: 'RSM', phone: '9876543214' },
              ].map((p, i) => (
                <button key={i} type="button"
                  onClick={() => { setPhone(formatPhone(p.phone)); setOtpStep('PHONE'); setError(''); }}
                  style={{
                    padding: '8px 4px',
                    borderRadius: '8px',
                    background: 'var(--lp-surface)',
                    border: '1px solid var(--lp-border)',
                    color: 'var(--lp-text-muted)',
                    fontSize: '9px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--lp-primary-bg)'; e.currentTarget.style.borderColor = 'var(--lp-primary)'; e.currentTarget.style.color = 'var(--lp-primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--lp-surface)'; e.currentTarget.style.borderColor = 'var(--lp-border)'; e.currentTarget.style.color = 'var(--lp-text-muted)'; }}
                >
                  <span style={{ fontSize: '7px', opacity: 0.5 }}>OTP</span>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        {!isSuccess && (
          <div className="lp-modal-footer">
            <span style={{ fontSize: '10px', color: 'var(--lp-text-muted)', fontWeight: 500 }}>
              Powered by <span style={{ fontWeight: 700, color: 'var(--lp-text-secondary)' }}>Signature Outlets</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
