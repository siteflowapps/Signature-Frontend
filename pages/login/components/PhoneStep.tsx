import React from 'react';
import { Spinner } from './Spinner';

interface PhoneStepProps {
  phone: string;
  setPhone: (value: string) => void;
  error: string;
  setError: (value: string) => void;
  isLoading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

const formatPhone = (val: string) => {
  const digits = val.replace(/\D/g, '').slice(0, 10);
  if (digits.length > 5) return `${digits.slice(0, 5)} ${digits.slice(5)}`;
  return digits;
};

/**
 * Phone number input step of the login flow.
 */
export const PhoneStep: React.FC<PhoneStepProps> = ({ phone, setPhone, error, setError, isLoading, onSubmit }) => (
  <form onSubmit={onSubmit} className="space-y-5">
    <div className="space-y-1.5">
      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Mobile Number</label>
      <div className="relative flex items-center">
        <div className="absolute left-4 font-bold text-sm text-slate-400 border-r border-slate-200 pr-3 pointer-events-none select-none">+91</div>
        <input
          type="tel"
          required
          value={phone}
          disabled={isLoading}
          onChange={e => { setPhone(formatPhone(e.target.value)); if (error) setError(''); }}
          className="w-full pl-16 pr-4 py-3 bg-slate-50/60 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-400 focus:outline-none transition-all text-slate-800 font-bold text-sm tracking-wider placeholder:text-slate-300 disabled:opacity-60"
          placeholder="98765 43210"
        />
      </div>
    </div>
    <button
      type="submit"
      disabled={isLoading}
      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:-translate-y-0.5 active:scale-[0.98] flex items-center justify-center gap-2 text-sm disabled:opacity-70 disabled:hover:translate-y-0"
    >
      {isLoading ? <Spinner /> : 'Get Verification Code'}
    </button>
  </form>
);
