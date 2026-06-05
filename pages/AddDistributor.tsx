import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiService } from '../network/apiService';
import { useDistributorForm } from '../hooks/useDistributorForm';
import { LocationPincodeSelect } from '../components/LocationPincodeSelect';

const AddDistributor: React.FC = () => {
  const {
    formData,
    isSubmitting,
    isSuccess,
    isBusinessAdmin,
    handleChange,
    handleSubmit,
    handleCancel,
  } = useDistributorForm();

  useEffect(() => {
    const fetchData = async () => {
      // Load businesses — Business Admins may not have access to this endpoint
      if (!isBusinessAdmin) {
        try {
          const bizRes = await apiService.business.getAll(0, 100);
          if (bizRes.success) {
            const fetchedBusinesses = bizRes.data.content || [];
            if (fetchedBusinesses.length > 0) {
              handleChange({ target: { name: 'businessId', value: fetchedBusinesses[0].id } } as unknown as React.ChangeEvent<HTMLSelectElement>);
            }
          }
        } catch (err) {
          console.error('Failed to load businesses', err);
        }
      }
    };
    fetchData();
  }, [handleChange, isBusinessAdmin]);

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Breadcrumb */}
      <div>
        <nav className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
          <Link to="/distributors" className="hover:text-indigo-600 transition-colors font-medium">Distributors</Link>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          <span className="text-slate-600 font-semibold">Add New Distributor</span>
        </nav>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Add New Distributor</h2>
        <p className="text-slate-400 text-sm mt-1">Register a new distributor to the platform.</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section: Business Identification */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Business Identification</h3>
            </div>
            
            <div className="space-y-5">
              {/* Name */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Distributor Name *</label>
                <input
                  type="text" name="name" value={formData.name} onChange={handleChange}
                  required disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50"
                  placeholder="Ex. Mumbai Central Distributors"
                />
              </div>

              {/* Address */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Office Address *</label>
                <textarea
                  name="address" value={formData.address} onChange={handleChange}
                  required disabled={isSubmitting} rows={3}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50 resize-none"
                  placeholder="Full office/warehouse address"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* GST Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">GST Number *</label>
                  <input
                    type="text" name="gstNumber" value={formData.gstNumber} onChange={handleChange}
                    required disabled={isSubmitting} maxLength={15}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50 uppercase ${
                      formData.gstNumber && formData.gstNumber.length !== 15 ? 'border-slate-300' : 'border-slate-200'
                    }`}
                    placeholder="27AABCU9603R1ZM"
                  />
                  <div className="flex justify-between items-center px-1">
                    <p className="text-[10px] text-slate-400 font-medium">15-character alphanumeric ID</p>
                    {formData.gstNumber && formData.gstNumber.length > 0 && formData.gstNumber.length < 15 && (
                      <p className="text-[10px] text-slate-400 font-bold">{15 - formData.gstNumber.length} remaining</p>
                    )}
                  </div>
                </div>

                {/* DMS ID */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">DMS ID *</label>
                  <input
                    type="text" name="dmsId" value={formData.dmsId} onChange={handleChange}
                    required disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50"
                    placeholder="Ex. DMS-12345"
                  />
                </div>

                {/* Location */}
                <LocationPincodeSelect
                  label="Location"
                  required
                  value={formData.locationId}
                  onChange={(id) => handleChange({ target: { name: 'locationId', value: id } } as unknown as React.ChangeEvent<HTMLSelectElement>)}
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Section: Contact Details */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-1.5 h-4 bg-indigo-600 rounded-full" />
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Contact Details</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Email Address *</label>
                <input
                  type="email" name="email" value={formData.email} onChange={handleChange}
                  required disabled={isSubmitting}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50"
                  placeholder="contact@distributor.com"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Phone Number *</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-4 pr-2 bg-slate-100/50 border-r border-slate-200 rounded-l-xl text-slate-500 font-bold text-sm pointer-events-none transition-colors group-focus-within:border-indigo-400 group-focus-within:bg-slate-100">+91</div>
                  <input
                    type="tel" name="phone" value={formData.phone} onChange={handleChange}
                    required disabled={isSubmitting} maxLength={10}
                    className="w-full pl-16 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:outline-none transition-all text-sm font-medium disabled:opacity-50 tracking-wide"
                    placeholder="9876543210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-4 flex items-center justify-end gap-3">
            <button
              type="button" onClick={handleCancel} disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-slate-500 border border-slate-200 font-bold text-xs uppercase tracking-wider hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >Cancel</button>
            <button
              type="submit" disabled={isSubmitting || isSuccess}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 ${
                isSuccess
                  ? 'bg-emerald-500 shadow-emerald-500/30 cursor-default'
                  : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-[0.98]'
              } text-white disabled:cursor-not-allowed`}
            >
              {isSuccess ? (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  Created!
                </>
              ) : isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                'Add Distributor'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDistributor;
