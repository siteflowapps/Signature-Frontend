import React, { useMemo, useRef, useState } from 'react';
import { apiService } from '../../network/apiService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import { getErrorMessage } from '../../utils/errorUtils';
import { BulkImportResult, UserRole } from '../../types';

interface Column { name: string; req: boolean; note?: string }
interface Sheet { name: string; columns: Column[] }
interface StepDef {
  key: string;
  templateType: string;
  title: string;
  endpoint: string;
  blurb: string;
  depends?: string[];
  notes?: string[];
  columns: Column[];
  sheets?: Sheet[];
  upload: (file: File) => Promise<{ success: boolean; data: BulkImportResult | null; error?: string }>;
}

// Columns mirror the backend TemplateService headers verbatim. Ordered to respect
// data dependencies: locations & team before distributors/retailers.
const STEPS: StepDef[] = [
  {
    key: 'locations',
    templateType: 'locations',
    title: 'Locations',
    endpoint: 'POST /bulk-import/locations',
    blurb: 'Builds the location tree REGION → STATE → PINCODE. "Region" is the level used for region matching. The downloaded template is pre-filled with your existing locations.',
    columns: [
      { name: 'Region', req: true },
      { name: 'State', req: true },
      { name: 'City', req: true },
      { name: 'Pincode', req: true },
      { name: 'Location ID', req: false, note: 'explicit pincode id; normally blank' },
    ],
    upload: (file) => apiService.bulkImport.locations(file),
  },
  {
    key: 'sales-team',
    templateType: 'sales-team',
    title: 'Sales Team',
    endpoint: 'POST /bulk-import/sales-team',
    blurb: 'One row per CSO; repeat the RSM/ASM/ASE across rows to build the reporting tree.',
    notes: [
      'Strict tree: a node may have only one parent. A row that puts an ASE under a second ASM, or an ASM under a second RSM, is rejected.',
      'If ASE is left blank, that CSO attaches directly to the ASM.',
      'Headquarters columns hold a Pincode (resolved against the Location master) — import Locations first.',
    ],
    depends: ['locations'],
    columns: [
      { name: 'Region', req: true },
      { name: 'RSM Name', req: true },
      { name: 'RSM Mobile', req: true },
      { name: 'RSM Email', req: false },
      { name: 'ASM Name', req: true },
      { name: 'ASM Mobile', req: true },
      { name: 'ASM Headquarters', req: true, note: 'pincode' },
      { name: 'ASM Employee Code', req: false },
      { name: 'ASM Email', req: false },
      { name: 'ASE Name', req: false },
      { name: 'ASE Mobile', req: false },
      { name: 'ASE Headquarters', req: false, note: 'pincode' },
      { name: 'ASE Employee Code', req: false },
      { name: 'ASE Email', req: false },
      { name: 'CSO Name', req: true },
      { name: 'CSO Mobile', req: true },
      { name: 'CSO Headquarters', req: true, note: 'pincode' },
      { name: 'CSO Employee Code', req: false },
      { name: 'CSO Email', req: false },
    ],
    upload: (file) => apiService.bulkImport.salesTeam(file),
  },
  {
    key: 'skus',
    templateType: 'skus',
    title: 'SKUs',
    endpoint: 'POST /bulk-import/skus',
    blurb: 'Product master — one row per article.',
    columns: [
      { name: 'Article', req: true },
      { name: 'Category', req: true },
      { name: 'MRP Per Unit', req: true },
      { name: 'Case Lot', req: true },
      { name: 'Unit', req: true, note: 'ML / L / G / KG / PCS' },
      { name: 'Description', req: false },
    ],
    upload: (file) => apiService.bulkImport.skus(file),
  },
  {
    key: 'distributors',
    templateType: 'distributors',
    title: 'Distributors',
    endpoint: 'POST /bulk-import/distributors',
    blurb: 'Distributor master. Each distributor is owned by exactly one ASM.',
    depends: ['sales-team'],
    notes: ['Mapped ASM Phone is required — one ASM owns the distributor.'],
    columns: [
      { name: 'DB Code', req: true },
      { name: 'Distributor Name', req: true },
      { name: 'Phone Number', req: true },
      { name: 'Mapped ASM Phone', req: true, note: 'one ASM owns the distributor' },
      { name: 'Pincode', req: false },
      { name: 'City', req: false },
      { name: 'Email', req: false },
      { name: 'GST', req: false },
      { name: 'Address', req: false },
    ],
    upload: (file) => apiService.bulkImport.distributors(file),
  },
  {
    key: 'retailers',
    templateType: 'retailers',
    title: 'Retailers',
    endpoint: 'POST /bulk-import/retailers',
    blurb: 'Outlet master. The whole sheet is validated before any row is saved — fix and re-upload on errors.',
    depends: ['locations', 'sales-team', 'distributors'],
    notes: [
      'Pin Code / City must resolve in the Location master — import Locations first.',
      'Distributor Code & Phone must already exist and belong to the outlet’s ASM — import Distributors first.',
      'Payment: provide either a UPI ID, or the full bank trio — Account Number + Bank Name + IFSC Code.',
    ],
    columns: [
      { name: 'Contact No', req: true, note: 'unique phone' },
      { name: 'Store Name', req: true },
      { name: 'Pin Code', req: true },
      { name: 'City', req: true, note: 'must resolve in location master' },
      { name: 'Latitude', req: true },
      { name: 'Longitude', req: true },
      { name: 'Distributor Code', req: true },
      { name: 'Distributor Phone No', req: true },
      { name: 'Monthly Rental Amount', req: true, note: 'rental payout input' },
      { name: 'Expected Sales Potential', req: true, note: 'feeds monthly achievement %' },
      { name: 'Mapped ASM Phone', req: true, note: 'pins the outlet’s ASM' },
      { name: 'Owner Name', req: false },
      { name: 'Outlet Type', req: false, note: 'default OTHERS' },
      { name: 'State', req: false },
      { name: 'Address', req: false },
      { name: 'Account Number', req: false, note: 'bank trio' },
      { name: 'Bank Name', req: false, note: 'bank trio' },
      { name: 'IFSC Code', req: false, note: 'bank trio' },
      { name: 'UPI ID', req: false, note: 'or use this' },
      { name: 'GST', req: false },
      { name: 'PAN', req: false },
      { name: 'Email', req: false },
    ],
    upload: (file) => apiService.bulkImport.retailers(file),
  },
  {
    key: 'qps',
    templateType: 'qps',
    title: 'QPS Schemes',
    endpoint: 'POST /bulk-import/qps',
    blurb: 'Two sheets: "Schemes" (one row per slab; the scheme header repeats) and "Conditions". The scheme is upserted by name, then each Schemes row is attached as a slab.',
    notes: [
      'Conditions in the same Group are AND-ed; different Groups are OR-ed.',
      'Operator is >= or <=. Channel Group: RMT / NON_RMT (blank = applies to all).',
    ],
    columns: [],
    sheets: [
      {
        name: 'Schemes',
        columns: [
          { name: 'Scheme Name', req: true },
          { name: 'Start Date', req: true },
          { name: 'End Date', req: true },
          { name: 'Channel Group', req: false, note: 'RMT / NON_RMT' },
          { name: 'Classification', req: false },
          { name: 'Min Sales Value', req: false },
          { name: 'Max Sales Value', req: false },
          { name: 'Payout Amount', req: false },
          { name: 'Min Volume', req: false },
          { name: 'Max Volume', req: false },
          { name: 'Rate Per Case', req: false },
        ],
      },
      {
        name: 'Conditions',
        columns: [
          { name: 'Scheme Name', req: true },
          { name: 'Group', req: true },
          { name: 'Operator', req: true, note: '>= or <=' },
          { name: 'Percentage', req: true },
          { name: 'Categories', req: false, note: 'comma-separated' },
        ],
      },
    ],
    upload: (file) => apiService.bulkImport.qps(file),
  },
];

type StepStatus = 'idle' | 'uploading' | 'done' | 'error';

const ColumnChips: React.FC<{ columns: Column[] }> = ({ columns }) => {
  const required = columns.filter(c => c.req);
  const optional = columns.filter(c => !c.req);
  return (
    <div className="space-y-3">
      {required.length > 0 && (
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Required</p>
          <div className="flex flex-wrap gap-1.5">
            {required.map(c => (
              <span key={c.name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                {c.name}{c.note && <span className="text-indigo-400 font-normal">· {c.note}</span>}
              </span>
            ))}
          </div>
        </div>
      )}
      {optional.length > 0 && (
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1.5">Optional</p>
          <div className="flex flex-wrap gap-1.5">
            {optional.map(c => (
              <span key={c.name} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-xs font-medium border border-slate-100">
                {c.name}{c.note && <span className="text-slate-400">· {c.note}</span>}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const MasterDataSetupPage: React.FC = () => {
  const { showToast } = useToast();
  const { user } = useAuth();

  // Super admins are scoped to the Location master only; other admins get the full setup flow.
  const steps = useMemo(
    () => (user?.role === UserRole.SUPER_ADMIN ? STEPS.filter(s => s.key === 'locations') : STEPS),
    [user?.role],
  );

  const [activeKey, setActiveKey] = useState(steps[0].key);
  const [statusMap, setStatusMap] = useState<Record<string, StepStatus>>({});
  const [resultMap, setResultMap] = useState<Record<string, BulkImportResult | null>>({});
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeIndex = Math.max(0, steps.findIndex(s => s.key === activeKey));
  const step = steps[activeIndex];
  const status = statusMap[activeKey] || 'idle';
  const result = resultMap[activeKey] || null;
  const doneCount = steps.filter(s => statusMap[s.key] === 'done').length;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const blob = await apiService.bulkImport.downloadTemplate(step.templateType);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${step.templateType}-template.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      showToast(getErrorMessage(err) || 'Failed to download template.', 'error');
    } finally {
      setDownloading(false);
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (!file) return;

    setStatusMap(m => ({ ...m, [activeKey]: 'uploading' }));
    try {
      const res = await step.upload(file);
      if (res.success && res.data) {
        const r = res.data;
        setResultMap(m => ({ ...m, [activeKey]: r }));
        const clean = (r.errors?.length ?? 0) === 0;
        setStatusMap(m => ({ ...m, [activeKey]: clean ? 'done' : 'error' }));
        showToast(
          `${step.title}: ${r.created} added, ${r.updated} updated, ${r.skipped} skipped${clean ? '' : ` · ${r.errors.length} error(s)`}`,
          clean ? 'success' : 'error',
          4000,
        );
      } else {
        setStatusMap(m => ({ ...m, [activeKey]: 'error' }));
        showToast(res.error || `Failed to import ${step.title}.`, 'error', 4000);
      }
    } catch (err) {
      setStatusMap(m => ({ ...m, [activeKey]: 'error' }));
      showToast(getErrorMessage(err), 'error', 4000);
    }
  };

  const unmetDeps = (step.depends || []).filter(d => statusMap[d] !== 'done');

  const StepDot: React.FC<{ s: StepStatus; index: number }> = ({ s, index }) => {
    if (s === 'done') return <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg></div>;
    if (s === 'error') return <div className="w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center shrink-0 text-xs font-black">!</div>;
    if (s === 'uploading') return <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center shrink-0"><svg className="w-4 h-4 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg></div>;
    return <div className="w-7 h-7 rounded-full border-2 border-slate-200 text-slate-400 flex items-center justify-center shrink-0 text-xs font-bold">{index + 1}</div>;
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Master Data Setup</h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Download a template, fill it, and upload — one step at a time. {doneCount} of {steps.length} completed.
        </p>
        <div className="mt-3 h-1.5 bg-slate-100 rounded-full overflow-hidden max-w-md">
          <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${(doneCount / steps.length) * 100}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Stepper */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2">
            {steps.map((s, i) => {
              const st = statusMap[s.key] || 'idle';
              const active = s.key === activeKey;
              return (
                <button
                  key={s.key}
                  onClick={() => setActiveKey(s.key)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-colors ${active ? 'bg-indigo-50' : 'hover:bg-slate-50'}`}
                >
                  <StepDot s={st} index={i} />
                  <div className="min-w-0 flex-1">
                    <p className={`text-sm font-bold truncate ${active ? 'text-indigo-700' : 'text-slate-800'}`}>{s.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {st === 'done' ? 'Completed' : st === 'error' ? 'Needs attention' : st === 'uploading' ? 'Uploading…' : 'Pending'}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active step detail */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Step {activeIndex + 1}</span>
                  <code className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-0.5 rounded">{step.endpoint}</code>
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight mt-1">{step.title}</h2>
              </div>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 rounded-xl transition-colors disabled:opacity-50"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                {downloading ? 'Preparing…' : 'Download template'}
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">{step.blurb}</p>

            {/* Dependency hint */}
            {unmetDeps.length > 0 && (
              <div className="mt-4 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs text-amber-700">
                Recommended: upload <strong>{unmetDeps.map(d => STEPS.find(s => s.key === d)?.title).filter(Boolean).join(', ')}</strong> first — this step references that data.
              </div>
            )}

            {/* Notes */}
            {step.notes && step.notes.length > 0 && (
              <ul className="mt-4 space-y-1.5">
                {step.notes.map((n, i) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-500">
                    <span className="text-indigo-400 mt-0.5">•</span><span>{n}</span>
                  </li>
                ))}
              </ul>
            )}

            {/* Columns */}
            <div className="mt-5 space-y-4">
              {step.sheets ? (
                step.sheets.map(sh => (
                  <div key={sh.name} className="p-4 rounded-xl border border-slate-100 bg-slate-50/40">
                    <p className="text-xs font-black text-slate-700 mb-3">Sheet: <span className="text-indigo-600">{sh.name}</span></p>
                    <ColumnChips columns={sh.columns} />
                  </div>
                ))
              ) : (
                <ColumnChips columns={step.columns} />
              )}
            </div>

            {/* Upload */}
            <div className="mt-6">
              <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={status === 'uploading'}
                className="w-full py-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 transition-colors flex flex-col items-center gap-1.5 disabled:opacity-60"
              >
                {status === 'uploading' ? (
                  <svg className="w-6 h-6 text-indigo-500 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                ) : (
                  <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                )}
                <span className="text-sm font-bold text-slate-700">{status === 'uploading' ? 'Uploading…' : `Upload ${step.title} file`}</span>
                <span className="text-[11px] text-slate-400">Excel or CSV (.xlsx, .xls, .csv)</span>
              </button>
            </div>

            {/* Result */}
            {result && (
              <div className={`mt-4 p-4 rounded-xl border ${status === 'done' ? 'bg-emerald-50 border-emerald-100' : 'bg-red-50 border-red-100'}`}>
                <div className="flex items-center gap-4 text-sm flex-wrap">
                  <span className="font-bold text-slate-700">{result.totalRows} rows</span>
                  <span className="text-emerald-600 font-semibold">{result.created} added</span>
                  <span className="text-blue-600 font-semibold">{result.updated} updated</span>
                  <span className="text-slate-500 font-semibold">{result.skipped} skipped</span>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs font-bold text-red-600 mb-1">{result.errors.length} error(s) — fix and re-upload:</p>
                    <ul className="space-y-1 text-xs text-red-600 max-h-48 overflow-y-auto">
                      {result.errors.slice(0, 50).map((er, i) => (
                        <li key={i}>Row {er.row}: {er.message}</li>
                      ))}
                      {result.errors.length > 50 && <li className="text-red-400">…and {result.errors.length - 50} more</li>}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Next */}
            {activeIndex < steps.length - 1 && (
              <div className="mt-5 flex justify-end">
                <button
                  onClick={() => setActiveKey(steps[activeIndex + 1].key)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${status === 'done' ? 'text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-500/25' : 'text-slate-600 bg-slate-100 hover:bg-slate-200'}`}
                >
                  Next: {steps[activeIndex + 1].title} →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterDataSetupPage;
