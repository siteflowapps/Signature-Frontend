import React from 'react';
import { Task } from '../../types';
import { ONBOARDING_PHOTOS, VERIFICATION_PHOTOS } from '../../data/outletMockData';

interface OnboardingTabProps {
  id: string | undefined;
  isCompleted: boolean;
  completedCount: number;
  outletTasks: Task[];
  setOpenSlider: (id: string | null) => void;
  openLightbox: (index: number, photos: { url: string; caption: string }[]) => void;
  realOnboardingPhotos?: { url: string; caption: string }[];
  realVerificationPhotos?: { url: string; caption: string }[];
}

const OnboardingTab: React.FC<OnboardingTabProps> = ({
  id,
  isCompleted,
  completedCount,
  outletTasks,
  setOpenSlider,
  openLightbox,
  realOnboardingPhotos = [],
  realVerificationPhotos = [],
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-black text-slate-900 tracking-tight">Outlet Onboarding</h3>
          <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${isCompleted ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-800'}`}>{isCompleted ? 'Signature Complete — 4 of 4' : `Stage ${completedCount + 1} of 4`}</span>
        </div>
        <div className="relative">
          {outletTasks.map((task, index) => {
            const prevTask = index > 0 ? outletTasks[index - 1] : null;
            const showPhaseHeader = !prevTask || prevTask.phase !== task.phase;
            return (
              <div key={task.id}>
                {showPhaseHeader && (
                  <div className={`mb-6 ${index > 0 ? 'mt-4' : ''}`}>
                    <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl border ${task.phase === 1 ? 'bg-indigo-50/60 border-indigo-100' : 'bg-orange-50/60 border-orange-100'}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white ${task.phase === 1 ? 'bg-indigo-600' : 'bg-orange-500'}`}>{task.phase}</div>
                      <div>
                        <p className="text-sm font-black text-slate-900 tracking-tight">{task.phase === 1 ? 'Phase 1 — Outlet Onboarding' : 'Phase 2 — Branding & Cooler Verification'}</p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{task.phase === 1 ? 'Instant Enrollment by Sales Executive' : 'Verified by Sales Executive'}</p>
                      </div>
                      {task.phase === 1 && isCompleted && <span className="ml-auto text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest">Enrolled</span>}
                      {task.phase === 2 && isCompleted && <span className="ml-auto text-[9px] font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 uppercase tracking-widest">Signature Complete</span>}
                    </div>
                  </div>
                )}
                <div className="relative flex gap-8">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-14 h-14 rounded-[18px] flex items-center justify-center shrink-0 shadow-sm relative z-10 ${task.status === 'Completed' ? 'bg-emerald-50 text-emerald-500 border border-emerald-100' : task.status === 'In Progress' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/30' : 'bg-slate-100 text-slate-300 border border-slate-200'}`}>
                      {task.status === 'Completed' ? (
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" /></svg>
                      ) : task.status === 'Locked' ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      )}
                    </div>
                    {index < outletTasks.length - 1 && (
                      <div className={`w-0.5 flex-1 min-h-[24px] my-1 rounded-full ${task.status === 'Completed' ? 'bg-emerald-200' : task.status === 'In Progress' ? 'bg-indigo-200' : 'bg-slate-100'}`} />
                    )}
                  </div>
                  <div className={`flex-1 mb-5 p-7 rounded-[28px] border-2 transition-all duration-300 flex flex-col md:flex-row md:items-center gap-6 ${task.isNextStep ? 'bg-indigo-50/40 border-indigo-200 shadow-[0_20px_40px_-15px_rgba(59,130,246,0.1)]' : task.status === 'Locked' ? 'bg-white border-slate-50 opacity-40 filter grayscale' : 'bg-white border-slate-100'}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-black text-slate-900 text-xl tracking-tight leading-none">{task.title}</h4>
                        {task.isNextStep && <span className="bg-orange-500 text-white text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-[0.2em] shadow-lg shadow-orange-500/20">Action Required</span>}
                      </div>
                      <p className="text-sm text-slate-500 font-bold leading-relaxed max-w-lg mb-4">{task.description}</p>
                      {task.id === '3' && (
                        <div className="flex items-center gap-4 bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100/50 w-fit">
                          <img src="/assets/branding/campa-cooler-single.png" alt="Campa Cooler" className="h-12 w-auto drop-shadow-md" />
                          <div>
                            <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest">Main Goal</p>
                            <p className="text-[10px] font-bold text-slate-700">Pure Magic Cooling Asset</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-3">
                      {task.status === 'Completed' ? (
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-4 py-2 rounded-2xl border border-emerald-100 uppercase tracking-widest">Verified</span>
                      ) : task.status === 'Locked' ? (
                        <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-5 py-2.5 rounded-2xl border border-slate-100 uppercase tracking-widest opacity-60">Awaiting Installation</span>
                      ) : (
                        <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 px-4 py-2 rounded-2xl border border-indigo-100 uppercase tracking-widest">In Progress</span>
                      )}
                      <button onClick={() => setOpenSlider(task.id)} disabled={task.status === 'Locked'} className="flex items-center gap-2 px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all disabled:opacity-30 disabled:cursor-not-allowed bg-white text-slate-600 border-slate-200 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 active:scale-95">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        View
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Before vs After Signature */}
      {id && (() => {
        const beforePhotos = realOnboardingPhotos.length > 0 ? realOnboardingPhotos : (ONBOARDING_PHOTOS[id] || []);
        const afterPhotos = realVerificationPhotos.length > 0 ? realVerificationPhotos : (VERIFICATION_PHOTOS[id] || []);
        const hasPhotos = beforePhotos.length > 0 || afterPhotos.length > 0;
        if (!hasPhotos) return null;
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Before & After Signature</h3>
              <span className="px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-50 text-emerald-700">{isCompleted ? 'Transformation' : 'In Progress'}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {beforePhotos.length > 0 && (
                <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-100"><p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Before Signature — Onboarding Photos</p></div>
                  <div className="p-5 grid grid-cols-2 gap-3">
                    {beforePhotos.map((photo, idx) => (
                      <button key={idx} onClick={() => openLightbox(idx, beforePhotos)} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-100 hover:border-indigo-300 transition-all">
                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-x-0 bottom-0 pt-10 pb-2.5 px-3 bg-gradient-to-t from-black/80 to-transparent flex items-end pointer-events-none">
                          <span className="text-white text-[9px] font-black uppercase tracking-wider drop-shadow-md">{photo.caption}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {afterPhotos.length > 0 && (
                <div className="bg-white rounded-[32px] border border-emerald-100 overflow-hidden shadow-sm">
                  <div className="px-6 py-4 bg-emerald-50 border-b border-emerald-100"><p className="text-[10px] font-black text-emerald-700 uppercase tracking-[0.2em]">After Signature — Verification Photos</p></div>
                  <div className="p-5 grid grid-cols-2 gap-3">
                    {afterPhotos.map((photo, idx) => (
                      <button key={idx} onClick={() => openLightbox(idx, afterPhotos)} className="group relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-emerald-100 hover:border-emerald-300 transition-all">
                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        <div className="absolute inset-x-0 bottom-0 pt-10 pb-2.5 px-3 bg-gradient-to-t from-black/80 to-transparent flex items-end pointer-events-none">
                          <span className="text-white text-[9px] font-black uppercase tracking-wider drop-shadow-md">{photo.caption}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default OnboardingTab;
