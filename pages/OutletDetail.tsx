import React, { useState, useEffect } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { Task, Outlet, UserRole, HierarchyMember } from '../types';

import SummaryTab from './outlet/SummaryTab';
import OnboardingTab from './outlet/OnboardingTab';
import InvoicesTab from './outlet/InvoicesTab';
import { SlideOverPanel } from '../components/SlideOverPanel';
import { PhotoLightbox } from '../components/PhotoLightbox';
import { EditOutletPanel } from '../components/EditOutletPanel';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { apiService } from '../network/apiService';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../hooks/queries/queryKeys';

// ─── Data Helpers ─────────────────────────────────────────────────────────────

const getInitials = (name: string) => {
  if (!name) return '?';
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const formatCurrency = (v: number) => '₹' + v.toLocaleString('en-IN');
const formatDate = (dateStr: string) => {
  if (!dateStr) return '—';
  try { return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return dateStr; }
};

const buildTasksFromData = (outletData: Outlet | undefined): { tasks: Task[]; completed: boolean } => {
  if (!outletData) return { tasks: [], completed: false };

  const hasPhotos = (outletData.photos || []).length > 0;
  const isOnboarded = !!outletData.onboardedAt;
  const compliance = (outletData.complianceRecords || [])[0];
  const hasCompliance = !!compliance;
  const isVerified = compliance?.verified === true;

  const step1Status: Task['status'] = 'Completed';
  const step2Status: Task['status'] = hasPhotos ? 'Completed' : 'In Progress';
  const step3Status: Task['status'] = isOnboarded ? 'Completed' : (step2Status === 'Completed' ? 'In Progress' : 'Locked');
  const step4Status: Task['status'] = isVerified ? 'Completed' : (hasCompliance ? 'In Progress' : (step3Status === 'Completed' ? 'In Progress' : 'Locked'));

  const allCompleted = step4Status === 'Completed';

  const tasks: Task[] = [
    { id: '1', title: 'Outlet Details', description: 'Basic details, geo auto-capture, classification & owner info', status: step1Status, estimatedTime: '5 mins', isMandatory: true, phase: 1 },
    { id: '2', title: 'Onboarding Photos', description: 'Max 5 geo-tagged photos: Outside, Inside, Cooler Space, Shelf Visibility, Branding Opportunity', status: step2Status, estimatedTime: '10 mins', isMandatory: true, phase: 1 },
    { id: '3', title: 'PFP Enrollment', description: 'Forecast, stock commitment, branding consent, bank details & digital declaration', status: step3Status, estimatedTime: '8 mins', isMandatory: true, isNextStep: step3Status === 'In Progress', phase: 1 },
    { id: '4', title: 'Verification Photos & Location', description: 'Max 5 geo-tagged verification photos after third-party branding & cooler installation', status: step4Status, estimatedTime: '10 mins', isMandatory: true, isNextStep: step4Status === 'In Progress' && step3Status === 'Completed', phase: 2 },
  ];

  return { tasks, completed: allCompleted };
};

const buildRealStepDetails = (stepId: string, outletData: Outlet): { label: string; value: string }[] => {
  switch (stepId) {
    case '1': return [
      { label: 'Outlet Name', value: outletData.name || '—' },
      { label: "Owner's Full Name", value: outletData.ownerName || '—' },
      { label: 'Contact Number', value: outletData.phone || outletData.ownerMobile || '—' },
      { label: 'WhatsApp Number', value: outletData.ownerWhatsapp || '—' },
      { label: 'Email ID', value: outletData.email || '—' },
      { label: 'Outlet Type', value: outletData.outletType || '—' },
      { label: 'Classification', value: outletData.classification || '—' },
      { label: 'Outlet Address', value: [outletData.address, outletData.landmark, outletData.locality, outletData.city, outletData.state, outletData.pincode].filter(Boolean).join(', ') || '—' },
      { label: 'GPS Coordinates (Auto)', value: outletData.latitude && outletData.longitude ? `${outletData.latitude}°, ${outletData.longitude}°` : '—' },
      { label: 'Pin Code', value: outletData.pincode || '—' },
    ];
    case '2': {
      const onboardingPhotos = (outletData.photos || []).filter(p => p.photoType !== 'VERIFICATION');
      return [
        { label: 'Photos Captured', value: onboardingPhotos.length > 0 ? `${onboardingPhotos.length} photo(s)` : '—' },
        ...onboardingPhotos.map((p, i) => ({
          label: `Photo ${i + 1} — ${p.photoType || 'Photo'}`,
          value: p.uploadedAt ? `Captured ✓ (${formatDate(p.uploadedAt)})` : 'Captured ✓',
        })),
        { label: 'Uploaded By', value: onboardingPhotos[0]?.uploadedByName || '—' },
      ];
    }
    case '3': return [
      { label: 'Classification', value: outletData.classification || '—' },
      { label: 'Compliance State', value: outletData.complianceState || '—' },
      { label: 'Onboarded At', value: formatDate(outletData.onboardedAt) },
      { label: 'Asset Status', value: outletData.assetStatus || '—' },
      { label: 'Relaxation End Date', value: formatDate(outletData.relaxationEndDate) },
      { label: 'Days Remaining', value: outletData.daysRemaining ? String(outletData.daysRemaining) : '—' },
    ];
    case '4': {
      const compliance = (outletData.complianceRecords || [])[0];
      if (!compliance) {
        return [
          { label: 'Compliance Status', value: 'No compliance record yet' },
          { label: 'Asset Status', value: outletData.assetStatus || '—' },
          { label: 'Compliance State', value: outletData.complianceState || '—' },
        ];
      }
      const complianceImages = compliance.images || [];
      return [
        { label: 'Cooler Installed', value: compliance.coolerInstalled ? 'Yes ✓' : 'No' },
        { label: 'Cooler Type', value: compliance.coolerType || '—' },
        { label: 'Cooler Capacity', value: compliance.capacity || '—' },
        { label: 'Serial No', value: compliance.serialNo || '—' },
        { label: 'Signage Installed', value: compliance.signageInstalled ? 'Yes ✓' : 'No' },
        { label: 'Verified', value: compliance.verified ? `Yes ✓ — by ${compliance.verifiedByName || 'Unknown'}` : 'Pending' },
        { label: 'Verified At', value: compliance.verifiedAt ? formatDate(compliance.verifiedAt) : '—' },
        { label: 'Uploaded By', value: compliance.uploadedByName || '—' },
        { label: 'Uploaded At', value: formatDate(compliance.uploadedAt) },
        { label: 'Verification Photos', value: complianceImages.length > 0 ? `${complianceImages.length} photo(s)` : '—' },
        ...complianceImages.map((img, i) => ({
          label: `Photo ${i + 1} — ${img.imageType?.replace(/_/g, ' ') || 'Photo'}`,
          value: 'Captured ✓',
        })),
        { label: 'GPS Coordinates', value: outletData.latitude && outletData.longitude ? `${outletData.latitude}°, ${outletData.longitude}°` : '—' },
      ];
    }
    default: return [];
  }
};

const buildOutletInfo = (outletData: Outlet | undefined, id: string | undefined) => {
  const fallbackInfo = {
    name: 'Unknown Outlet', code: id || '', classification: 'UNCLASSIFIED',
    address: 'Address not available', owner: 'Unknown', contact: '—',
  };

  if (!outletData) {
    return { ...fallbackInfo, initials: '?', email: '', ownerWhatsapp: '', outletType: '', pincode: '', city: '', state: '', latitude: 0, longitude: 0, outletStatus: '', operationalStatus: '', assetStatus: '', complianceState: '', plannedAnnualVolume: 0, stockingCommitment: '', distributorId: '', createdByAseName: '', relaxationEndDate: '', daysRemaining: 0, coolerType: '', capacity: '', signageType: '', dmsId: '', onboardedAt: '', activatedAt: '' };
  }

  return {
    name: outletData.name || fallbackInfo.name,
    code: fallbackInfo.code,
    classification: outletData.classification || fallbackInfo.classification,
    address: [outletData.address, outletData.landmark, outletData.locality, outletData.city, outletData.state, outletData.pincode].filter(Boolean).join(', ') || fallbackInfo.address,
    owner: outletData.ownerName || fallbackInfo.owner,
    initials: getInitials(outletData.ownerName || fallbackInfo.owner),
    contact: outletData.phone || outletData.ownerMobile || fallbackInfo.contact,
    email: outletData.email || '',
    ownerWhatsapp: outletData.ownerWhatsapp || '',
    outletType: outletData.outletType || '',
    pincode: outletData.pincode || '',
    city: outletData.city || '',
    state: outletData.state || '',
    latitude: outletData.latitude,
    longitude: outletData.longitude,
    outletStatus: outletData.outletStatus || '',
    operationalStatus: outletData.operationalStatus || '',
    assetStatus: outletData.assetStatus || '',
    complianceState: outletData.complianceState || '',
    plannedAnnualVolume: outletData.plannedAnnualVolume,
    stockingCommitment: outletData.stockingCommitment || '',
    distributorId: outletData.distributorId || '',
    createdByAseName: outletData.createdByAseName || '',
    relaxationEndDate: outletData.relaxationEndDate || '',
    daysRemaining: outletData.daysRemaining,
    coolerType: outletData.coolerType || '',
    capacity: outletData.capacity || '',
    signageType: outletData.signageType || '',
    dmsId: outletData.dmsId || '',
    onboardedAt: outletData.onboardedAt || '',
    activatedAt: outletData.activatedAt || '',
  };
};

// ─── Component ────────────────────────────────────────────────────────────────

const OutletDetail: React.FC = () => {
  const { id } = useParams();
  const location = useLocation();
  const [openSlider, setOpenSlider] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxPhotos, setLightboxPhotos] = useState<{ url: string; caption: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'onboarding' | 'invoices'>('summary');

  const { user } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const canDeactivate = user?.role === UserRole.SUPER_ADMIN || user?.role === UserRole.BUSINESS_ADMIN;
  const canEdit = canDeactivate;

  const initialOutlet: Outlet | undefined = (location.state as { outlet?: Outlet })?.outlet;
  const backTo = (location.state as { from?: string })?.from || '/outlets';
  const [outletData, setOutletData] = useState<Outlet | undefined>(initialOutlet);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const handleOutletUpdated = (updated: Outlet) => {
    setOutletData(prev => (prev ? { ...prev, ...updated } : updated));
    queryClient.invalidateQueries({ queryKey: queryKeys.outlets.all });
  };
  const { tasks: outletTasks, completed: isCompleted } = buildTasksFromData(outletData);
  const outletInfo = buildOutletInfo(outletData, id);
  const completedCount = outletTasks.filter(t => t.status === 'Completed').length;

  const [localOpStatus, setLocalOpStatus] = useState<string>(outletInfo.operationalStatus || '');
  const [showDeactivateConfirm, setShowDeactivateConfirm] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deactivateError, setDeactivateError] = useState<string | null>(null);

  const aseId = outletData?.createdByAseId;
  const [hierarchy, setHierarchy] = useState<HierarchyMember[]>([]);
  const [hierarchyLoading, setHierarchyLoading] = useState(false);

  useEffect(() => {
    if (!aseId) { setHierarchy([]); return; }
    let cancelled = false;
    setHierarchyLoading(true);
    apiService.hierarchy.getUpwardByAse(aseId)
      .then(res => { if (!cancelled && res.success) setHierarchy(res.data || []); })
      .catch(() => { if (!cancelled) setHierarchy([]); })
      .finally(() => { if (!cancelled) setHierarchyLoading(false); });
    return () => { cancelled = true; };
  }, [aseId]);

  const isDeactivated = localOpStatus === 'DEACTIVATED';

  const handleDeactivate = async () => {
    if (!id) return;
    setIsDeactivating(true);
    setDeactivateError(null);
    try {
      const res = await apiService.outlets.deactivate(id);
      if (res.success) {
        setLocalOpStatus(res.data?.operationalStatus || 'DEACTIVATED');
        setShowDeactivateConfirm(false);
        showToast('Outlet deactivated successfully', 'success');
      } else {
        setDeactivateError(res.error || 'Failed to deactivate outlet.');
      }
    } catch {
      setDeactivateError('An error occurred while deactivating the outlet.');
    } finally {
      setIsDeactivating(false);
    }
  };

  // Photo arrays
  const realOnboardingPhotos = (outletData?.photos || [])
    .map(p => ({ url: p.photoUrl, caption: p.photoType?.replace(/_/g, ' ') || 'Photo' }));
  const complianceRecord = (outletData?.complianceRecords || [])[0];
  const realVerificationPhotos = (complianceRecord?.images || [])
    .map(img => ({ url: img.imageUrl, caption: img.imageType?.replace(/_/g, ' ') || 'Verification' }));

  const selectedTask = outletTasks.find(t => t.id === openSlider);
  const selectedDetails = openSlider && outletData ? buildRealStepDetails(openSlider, outletData) : [];
  const selectedPhotos = openSlider === '2' && realOnboardingPhotos.length > 0
    ? realOnboardingPhotos
    : openSlider === '4' && realVerificationPhotos.length > 0
      ? realVerificationPhotos
      : [];

  const openLightbox = (index: number, photos?: { url: string; caption: string }[]) => {
    setLightboxIndex(index);
    setLightboxPhotos(photos || selectedPhotos);
    setLightboxOpen(true);
  };

  // Status badge for slide-over
  const getStatusBadge = () => {
    if (!selectedTask) return undefined;
    if (selectedTask.status === 'Completed') {
      return <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest">Verified</span>;
    }
    if (selectedTask.status === 'In Progress') {
      return <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100 uppercase tracking-widest">In Progress</span>;
    }
    return undefined;
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-[0.98] duration-700 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
        <Link to={backTo} className="flex items-center gap-2 hover:text-indigo-600 transition-colors group">
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
          Outlets
        </Link>
        <svg className="w-4 h-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
        <span className="text-slate-800">{outletInfo.name}</span>
      </div>

      {/* Outlet Header Card */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 flex items-start gap-5">
          {(() => {
            const shopFrontPhoto = outletData?.photos?.find(p => p.photoType === 'SHOP_FRONT');
            if (shopFrontPhoto) {
              return (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100 shadow-sm">
                  <img src={shopFrontPhoto.photoUrl} className="w-full h-full object-cover" alt={outletInfo.name} />
                </div>
              );
            }
            return (
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl shrink-0 bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-sm">
                <span className="text-2xl font-black text-white tracking-tighter select-none">{outletInfo.initials}</span>
              </div>
            );
          })()}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap mb-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight truncate">{outletInfo.name}</h1>
                  {(outletInfo.outletStatus === 'ASM_APPROVED' || outletInfo.outletStatus === 'ACTIVE') && (
                    <img src="/assets/branding/cdo-emblem.png" alt="Certified Destination Outlet" title="Certified Destination Outlet" className="w-7 h-7 object-contain shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="bg-indigo-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">{outletInfo.classification}</span>
                  {outletInfo.outletType && (
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">{outletInfo.outletType}</span>
                  )}
                  {outletInfo.outletStatus && (
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider border ${
                      outletInfo.outletStatus === 'ASM_APPROVED' || outletInfo.outletStatus === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                        : 'bg-orange-50 text-orange-700 border-orange-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        outletInfo.outletStatus === 'ASM_APPROVED' || outletInfo.outletStatus === 'ACTIVE' ? 'bg-emerald-500' : 'bg-orange-500'
                      }`}></span>
                      {(outletInfo.outletStatus || '').replace(/_/g, ' ')}
                    </span>
                  )}
                  {isDeactivated && (
                    <span className="inline-flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-100 text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      Deactivated
                    </span>
                  )}
                </div>
              </div>

              {(canEdit || (canDeactivate && !isDeactivated)) && (
                <div className="inline-flex items-center gap-2 shrink-0">
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setIsEditOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 hover:border-indigo-200 rounded-lg transition-colors"
                      title="Edit outlet details"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  )}
                  {canDeactivate && !isDeactivated && (
                    <button
                      type="button"
                      onClick={() => setShowDeactivateConfirm(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 border border-red-100 hover:border-red-200 rounded-lg transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Deactivate
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Meta row */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/40 grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2.5">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Address
            </div>
            <div className="text-sm font-medium text-slate-700 truncate" title={outletInfo.address}>{outletInfo.address}</div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Owner
            </div>
            <div className="text-sm font-medium text-slate-700 truncate">
              {outletInfo.owner} <span className="text-slate-400">·</span> {outletInfo.contact}
            </div>
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
              Outlet ID
            </div>
            <div className="text-xs font-mono font-semibold text-slate-600 truncate" title={outletInfo.code || id}>{outletInfo.code || id}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="relative border-b border-slate-100 pb-1">
        <div className="flex gap-8 px-2">
          {([
            { key: 'summary', label: 'Summary', icon: '📊' },
            { key: 'onboarding', label: 'Onboarding', icon: '🚀' },
            { key: 'invoices', label: 'Invoices & Payouts', icon: '🧾' },
          ] as { key: typeof activeTab; label: string; icon: string; count?: number }[]).map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="relative py-4 flex items-center gap-2.5 transition-all duration-300 group"
              >
                <span className={`text-base transition-transform duration-300 ${isActive ? 'scale-110' : 'opacity-50 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`}>
                  {tab.icon}
                </span>
                <span className={`text-sm font-black tracking-tight transition-colors duration-300 ${
                  isActive ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                }`}>
                  {tab.label}
                </span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg transition-colors duration-300 ${
                    isActive ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                  }`}>{tab.count}</span>
                )}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full shadow-[0_-4px_12px_rgba(37,99,235,0.4)] animate-in slide-in-from-bottom-1 duration-300" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <SummaryTab isCompleted={isCompleted} completedCount={completedCount} outletInfo={outletInfo} formatCurrency={formatCurrency} hierarchy={hierarchy} hierarchyLoading={hierarchyLoading} />
      )}
      {activeTab === 'onboarding' && (
        <OnboardingTab
          id={id}
          isCompleted={isCompleted}
          completedCount={completedCount}
          outletTasks={outletTasks}
          setOpenSlider={setOpenSlider}
          openLightbox={openLightbox}
          realOnboardingPhotos={realOnboardingPhotos}
          realVerificationPhotos={realVerificationPhotos}
        />
      )}
      {activeTab === 'invoices' && (
        <InvoicesTab outletId={id || ''} />
      )}

      {/* Slide-Over Panel (using shared component) */}
      <SlideOverPanel
        isOpen={!!openSlider}
        title={selectedTask?.title || ''}
        subtitle={openSlider ? `Step ${openSlider} of ${outletTasks.length}` : undefined}
        statusBadge={getStatusBadge()}
        onClose={() => setOpenSlider(null)}
        footer={<p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">View Only — Data submitted via Mobile App</p>}
      >
        {selectedPhotos.length > 0 && (
          <div className="pb-6 mb-4 border-b border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
              {openSlider === '3' ? 'PFP Agreement Docs' : 'Photos'}
              <span className="ml-2 bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[9px]">{selectedPhotos.length}</span>
            </p>
            <div className="grid grid-cols-3 gap-3">
              {selectedPhotos.map((photo, idx) => (
                <button key={idx} onClick={() => openLightbox(idx)} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-indigo-300 transition-all shadow-sm hover:shadow-lg">
                  <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-x-0 bottom-0 pt-8 pb-3 px-3 bg-gradient-to-t from-black/80 to-transparent flex items-end pointer-events-none">
                    <span className="text-white text-[10px] font-black uppercase tracking-wider drop-shadow-md">{photo.caption}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {selectedDetails.map((detail, idx) => (
          <div key={idx} className="py-5 border-b border-slate-50 last:border-0">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">{detail.label}</p>
            <p className={`text-sm font-bold leading-relaxed ${detail.value === '—' ? 'text-slate-300 italic' : 'text-slate-800'}`}>
              {detail.value === '—' ? 'Not filled yet' : detail.value}
            </p>
          </div>
        ))}
      </SlideOverPanel>

      {/* Lightbox (using shared component) */}
      <PhotoLightbox
        isOpen={lightboxOpen}
        photos={lightboxPhotos}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxOpen(false)}
      />
      <EditOutletPanel
        isOpen={isEditOpen}
        outlet={outletData || null}
        onClose={() => setIsEditOpen(false)}
        onSuccess={handleOutletUpdated}
      />
      {/* Deactivate Confirmation Modal */}
      {showDeactivateConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
            <div className="px-6 pt-6 pb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-base font-black text-slate-900 mb-2">Deactivate this outlet?</h2>
              <p className="text-sm text-slate-500 leading-relaxed">
                <span className="font-bold text-slate-700">{outletInfo.name}</span> will be marked as deactivated.
                Onboarded data is preserved and the outlet can be reactivated later by backend support.
              </p>
              {deactivateError && (
                <p className="mt-3 text-xs font-medium text-red-500">{deactivateError}</p>
              )}
            </div>
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => { setShowDeactivateConfirm(false); setDeactivateError(null); }}
                disabled={isDeactivating}
                className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeactivate}
                disabled={isDeactivating}
                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-sm shadow-red-500/25 transition-colors disabled:opacity-40 flex items-center gap-2"
              >
                {isDeactivating && (
                  <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                )}
                {isDeactivating ? 'Deactivating…' : 'Deactivate Outlet'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutletDetail;
