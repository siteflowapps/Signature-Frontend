import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../network/apiService';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorUtils';

const AddBusiness: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [phoneError, setPhoneError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      // Allow only digits, max 10 characters
      const digitOnly = value.replace(/\D/g, '').slice(0, 10);
      setFormData(prev => ({ ...prev, [name]: digitOnly }));

      // Validate phone number
      if (digitOnly.length > 0 && digitOnly.length < 10) {
        setPhoneError('Phone number must be 10 digits');
      } else {
        setPhoneError('');
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate phone number
    if (formData.phone.length !== 10) {
      setPhoneError('Phone number must be exactly 10 digits');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: formData.name,
        phone: `+91${formData.phone}`,
        address: formData.address,
      };

      const response = await apiService.business.create(payload);

      if (response.success) {
        showToast(`Business "${formData.name}" created successfully!`, 'success', 3000);
        // Navigate to /businesses after successful creation
        setTimeout(() => {
          navigate('/businesses', { state: { from: 'add-business' } });
        }, 1500);
      } else {
        const errorMsg = response.error || 'Failed to create business. Please try again.';
        showToast(errorMsg, 'error', 4000);
        setIsSubmitting(false);
      }
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err);
      showToast(errorMsg, 'error', 4000);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add New Business</h2>
        <p className="text-slate-400 text-sm mt-1">Create a new business entity in the system.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Error Message */}
          {error && (
            <div className="p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          {/* Business Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Business Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50"
              placeholder="Ex. Acme Corp"
            />
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number (India)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 font-bold text-sm pointer-events-none">+91</span>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                disabled={isSubmitting}
                className="w-full pl-12 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50"
                placeholder="98765 43210"
                maxLength={10}
              />
            </div>
            {phoneError && (
              <p className="text-xs font-medium text-red-600">{phoneError}</p>
            )}
            <p className="text-xs text-slate-400">10-digit Indian mobile number</p>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50"
              placeholder="Ex. 123 Main Street, City, State"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-slate-500 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                'Add Business'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddBusiness;
