import React from 'react';
import { Business } from '../../../types';

interface BusinessInfoCardProps {
  business: Business;
}

/**
 * Displays the business header card with name, status, phone, address, ID, and creation date.
 */
export const BusinessInfoCard: React.FC<BusinessInfoCardProps> = ({ business }) => (
  <div className="bg-white rounded-2xl border border-slate-100 p-8 shadow-sm">
    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
      <div>
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          {business.name}
        </h2>
        <p className="text-slate-400 text-sm mt-2">Business Management Dashboard</p>
      </div>
      <span className="inline-flex items-center px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm">
        {business.status || 'ACTIVE'}
      </span>
    </div>

    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Phone</p>
        <p className="text-slate-900 font-semibold">{business.phone}</p>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Address</p>
        <p className="text-slate-900 font-semibold">{business.address}</p>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Business ID</p>
        <p className="text-slate-600 text-sm font-mono">{business.id}</p>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Created</p>
        <p className="text-slate-900 font-semibold">
          {business.createdAt
            ? new Date(business.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })
            : '-'}
        </p>
      </div>
    </div>
  </div>
);
