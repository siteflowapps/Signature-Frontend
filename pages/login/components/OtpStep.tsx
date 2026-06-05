import React, { useRef, useCallback } from 'react';
import { Spinner } from './Spinner';

const OTP_LENGTH = 6;

interface OtpStepProps {
  otpDigits: string[];
  setOtpDigits: (digits: string[]) => void;
  resendTimer: number;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onResend: () => void;
  onChangePhone: () => void;
}

/**
 * OTP verification step of the login flow.
 * Handles split-digit input with paste support and keyboard navigation.
 */
export const OtpStep: React.FC<OtpStepProps> = ({
  otpDigits,
  setOtpDigits,
  resendTimer,
  isLoading,
  onSubmit,
  onResend,
  onChangePhone,
}) => {
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

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
  }, [otpDigits, setOtpDigits]);

  const handleOtpKeyDown = useCallback((index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }, [otpDigits]);

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* 6 Split Digit Boxes */}
      <div className="flex justify-center gap-2 sm:gap-3">
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
            className="w-10 h-12 sm:w-12 sm:h-14 text-center border-2 border-slate-200 rounded-xl text-xl sm:text-2xl font-black text-indigo-600 bg-slate-50/60 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 focus:outline-none transition-all disabled:opacity-60 placeholder:text-slate-200"
            placeholder="·"
          />
        ))}
      </div>

      {/* Resend Timer */}
      <div className="text-center">
        {resendTimer > 0 ? (
          <p className="text-xs text-slate-400 font-medium">Resend code in <span className="font-bold text-indigo-500">{resendTimer}s</span></p>
        ) : (
          <button type="button" onClick={onResend} disabled={isLoading}
            className="text-xs text-indigo-600 font-bold hover:text-indigo-700 transition-colors disabled:opacity-50">
            Didn't receive it? Resend Code
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || otpDigits.join('').length < OTP_LENGTH}
        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {isLoading ? <Spinner /> : 'Verify & Continue'}
      </button>

      <button type="button" disabled={isLoading} onClick={onChangePhone}
        className="w-full text-center text-xs font-bold text-slate-400 hover:text-indigo-600 transition-colors py-1 disabled:opacity-50">
        ← Change Phone Number
      </button>
    </form>
  );
};
