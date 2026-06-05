import React from 'react';
import { HierarchyMember } from '../../types';

interface OutletInfoExtended {
  name: string;
  classification: string;
  code?: string;
  address?: string;
  owner?: string;
  contact?: string;
  email?: string;
  ownerWhatsapp?: string;
  outletType?: string;
  pincode?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  outletStatus?: string;
  operationalStatus?: string;
  assetStatus?: string;
  complianceState?: string;
  plannedAnnualVolume?: number;
  stockingCommitment?: string;
  distributorId?: string;
  createdByAseName?: string;
  relaxationEndDate?: string;
  daysRemaining?: number;
  coolerType?: string;
  capacity?: string;
  signageType?: string;
  dmsId?: string;
  onboardedAt?: string;
  activatedAt?: string;
}

interface SummaryTabProps {
  isCompleted: boolean;
  completedCount: number;
  outletInfo: OutletInfoExtended;
  formatCurrency: (v: number) => string;
  hierarchy?: HierarchyMember[];
  hierarchyLoading?: boolean;
}

const HIERARCHY_ROLES = ['ASE', 'ASM', 'SM', 'RBL'] as const;
const ROLE_LABELS: Record<string, string> = {
  ASE: 'ASE',
  ASM: 'ASM',
  SM: 'Sales Manager',
  RBL: 'Regional Business Lead',
};

const formatStatus = (status: string | undefined) => {
  if (!status) return '—';
  return status.replace(/_/g, ' ');
};

const SummaryTab: React.FC<SummaryTabProps> = ({
  isCompleted,
  completedCount,
  outletInfo,
  hierarchy = [],
  hierarchyLoading = false,
}) => {
  // Map fetched members by role for stable rendering order (ASE → ASM → SM → RBL).
  const hierarchyByRole: Record<string, HierarchyMember | undefined> = Object.fromEntries(
    hierarchy.map((m) => [m.role, m])
  );
  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case 'ACTIVE':
      case 'ASM_APPROVED':
        return 'text-emerald-700 bg-emerald-50 border-emerald-100';
      case 'ASM_PENDING':
      case 'IN_PROGRESS':
        return 'text-amber-700 bg-amber-50 border-amber-100';
      case 'REJECTED':
      case 'INACTIVE':
      case 'SUSPENDED':
        return 'text-red-600 bg-red-50 border-red-100';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  // Group fields into logical sections
  const ownerFields = [
    { label: 'Owner Name', value: outletInfo.owner },
    { label: 'Contact', value: outletInfo.contact },
    { label: 'WhatsApp', value: outletInfo.ownerWhatsapp },
    { label: 'Email', value: outletInfo.email },
  ];

  const locationFields = [
    { label: 'City', value: outletInfo.city },
    { label: 'State', value: outletInfo.state },
    { label: 'Pincode', value: outletInfo.pincode },
    { label: 'GPS', value: outletInfo.latitude && outletInfo.longitude ? `${outletInfo.latitude.toFixed(4)}°, ${outletInfo.longitude.toFixed(4)}°` : '' },
  ];

  const businessFields = [
    { label: 'Outlet Type', value: outletInfo.outletType },
    { label: 'Classification', value: outletInfo.classification },
    { label: 'Distributor ID', value: outletInfo.distributorId },
    { label: 'DMS ID', value: outletInfo.dmsId },
  ];

  const assetFields = [
    { label: 'Cooler Type', value: outletInfo.coolerType },
    { label: 'Cooler Capacity', value: outletInfo.capacity },
    { label: 'Signage Type', value: outletInfo.signageType },
  ];

  const statusFields = [
    { label: 'Outlet Status', value: outletInfo.outletStatus },
    { label: 'Operational Status', value: outletInfo.operationalStatus },
    { label: 'Asset Status', value: outletInfo.assetStatus },
    { label: 'Compliance State', value: outletInfo.complianceState },
  ];

  const timelineFields = [
    { label: 'Onboarded At', value: outletInfo.onboardedAt },
    { label: 'Activated At', value: outletInfo.activatedAt },
    { label: 'Relaxation End Date', value: outletInfo.relaxationEndDate },
    { label: 'Days Remaining', value: outletInfo.daysRemaining ? String(outletInfo.daysRemaining) : '' },
  ];

  const renderFieldGrid = (fields: { label: string; value: string | undefined }[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-4">
      {fields.map((field) => (
        <div key={field.label} className="py-2 border-b border-slate-50">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{field.label}</p>
          <p className={`text-sm font-bold ${field.value ? 'text-slate-800' : 'text-slate-300 italic'}`}>
            {field.value || '—'}
          </p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Quick Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Onboarding</p>
            <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg border uppercase tracking-wider ${isCompleted ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-amber-600 bg-amber-50 border-amber-100'}`}>
              {isCompleted ? 'Completed' : 'In Progress'}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-700">{isCompleted ? 'All 4 steps completed' : `${completedCount} of 4 steps done`}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Classification</p>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-[9px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">{outletInfo.classification || '—'}</span>
            {outletInfo.outletType && <span className="text-xs font-bold text-slate-500">{outletInfo.outletType}</span>}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Outlet Status</p>
          <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-3 py-1.5 rounded-xl border uppercase tracking-wider ${getStatusColor(outletInfo.outletStatus)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
              outletInfo.outletStatus === 'ACTIVE' || outletInfo.outletStatus === 'ASM_APPROVED' ? 'bg-emerald-500' :
              outletInfo.outletStatus === 'ASM_PENDING' || outletInfo.outletStatus === 'IN_PROGRESS' ? 'bg-amber-500' :
              'bg-slate-400'
            }`}></span>
            {formatStatus(outletInfo.outletStatus)}
          </span>
        </div>
      </div>

      {/* Owner & Contact */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-7 shadow-sm">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Contact</p>
          <h4 className="text-lg font-black text-slate-900 tracking-tighter">Owner Information</h4>
        </div>
        {renderFieldGrid(ownerFields)}
      </div>

      {/* Location */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-7 shadow-sm">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Geography</p>
          <h4 className="text-lg font-black text-slate-900 tracking-tighter">Location Details</h4>
        </div>
        {renderFieldGrid(locationFields)}
      </div>

      {/* Business & Distribution */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-7 shadow-sm">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Business</p>
          <h4 className="text-lg font-black text-slate-900 tracking-tighter">Classification & Distribution</h4>
        </div>
        {renderFieldGrid(businessFields)}
      </div>

      {/* Asset / CDO */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-7 shadow-sm">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Assets</p>
          <h4 className="text-lg font-black text-slate-900 tracking-tighter">Cooler & Signage</h4>
        </div>
        {renderFieldGrid(assetFields)}
      </div>

      {/* Status & Compliance */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-7 shadow-sm">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Compliance</p>
          <h4 className="text-lg font-black text-slate-900 tracking-tighter">Status & Compliance</h4>
        </div>
        {renderFieldGrid(statusFields)}
      </div>

      {/* Reporting Hierarchy */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-7 shadow-sm">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">People</p>
          <h4 className="text-lg font-black text-slate-900 tracking-tighter">Reporting Hierarchy</h4>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
          {HIERARCHY_ROLES.map((role) => {
            const member = hierarchyByRole[role];
            return (
              <div key={role} className="py-2 border-b border-slate-50">
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.15em] mb-1">{ROLE_LABELS[role]}</p>
                {hierarchyLoading && !member ? (
                  <div className="space-y-1.5 animate-pulse">
                    <div className="h-3.5 bg-slate-100 rounded w-24" />
                    <div className="h-2.5 bg-slate-100 rounded w-20" />
                  </div>
                ) : member ? (
                  <>
                    <p className="text-sm font-bold text-slate-800">{member.name}</p>
                    <p className="text-xs font-semibold text-slate-500 mt-0.5">{member.phone || '—'}</p>
                  </>
                ) : (
                  <p className="text-sm font-bold text-slate-300 italic">—</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-[28px] border border-slate-100 p-7 shadow-sm">
        <div className="mb-5">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-1">Timeline</p>
          <h4 className="text-lg font-black text-slate-900 tracking-tighter">Key Dates</h4>
        </div>
        {renderFieldGrid(timelineFields)}
      </div>
    </div>
  );
};

export default SummaryTab;
