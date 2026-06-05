
import React, { useState } from 'react';
import { Invoice } from '../types';

const MOCK_INVOICES: Invoice[] = [
  { id: '1', invoiceNo: 'INV-2024-101', invoiceNumber: 'INV-2024-101', invoiceDate: '2024-03-20', outletName: 'Sharma Medicals', distributorName: 'HUL South Dist.', date: '2024-03-20', distributor: 'HUL South Dist.', skus: 'Dove Soap 100g', totalQuantity: 120, qty: 120, totalAmount: 5400, value: 5400, status: 'Extracted', photoUrl: '', uploadDate: '' },
  { id: '2', invoiceNo: 'INV-2024-102', invoiceNumber: 'INV-2024-102', invoiceDate: '2024-03-18', outletName: 'Gupta Kirana', distributorName: 'P&G Regional', date: '2024-03-18', distributor: 'P&G Regional', skus: 'Ariel 1kg', totalQuantity: 50, qty: 50, totalAmount: 8500, value: 8500, status: 'Validated', photoUrl: '', uploadDate: '' },
  { id: '3', invoiceNo: 'INV-2024-103', invoiceNumber: 'INV-2024-103', invoiceDate: '2024-03-15', outletName: 'Apollo Store', distributorName: 'ITC Wholesale', date: '2024-03-15', distributor: 'ITC Wholesale', skus: 'Sunfeast Biscuits', totalQuantity: 300, qty: 300, totalAmount: 12000, value: 12000, status: 'Pending', photoUrl: '', uploadDate: '' },
];

const Invoices: React.FC = () => {
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setIsUploading(true);
    // Simulate OCR processing
    setTimeout(() => {
      const newInvoice: Invoice = {
        id: Math.random().toString(),
        invoiceNumber: `OCR-${Math.floor(Math.random() * 1000)}`,
        invoiceNo: `OCR-${Math.floor(Math.random() * 1000)}`,
        invoiceDate: new Date().toISOString().split('T')[0],
        date: new Date().toISOString().split('T')[0],
        distributorName: 'Detected Distributor',
        distributor: 'Detected Distributor',
        outletName: 'Unknown Outlet',
        skus: 'Extracted Product',
        totalQuantity: 0,
        qty: 0,
        totalAmount: 0,
        value: 0,
        status: 'Extracted',
        photoUrl: '',
        uploadDate: new Date().toISOString()
      };
      setInvoices([newInvoice, ...invoices]);
      setIsUploading(false);
    }, 2000);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-1">Billing Hub</h2>
          <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] opacity-60">Invoice OCR & Automated Payout Engine</p>
        </div>
        <div className="flex gap-4">
           <label className="group relative cursor-pointer bg-gradient-to-r from-indigo-600 via-indigo-500 to-indigo-600 hover:from-indigo-700 hover:to-indigo-700 text-white px-8 py-4 rounded-[24px] text-xs font-black uppercase tracking-[0.15em] transition-all shadow-2xl shadow-indigo-500/30 hover:-translate-y-1 active:scale-95 flex items-center gap-3 overflow-hidden">
            <span className="relative z-10 flex items-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4-4m4 4v12" /></svg>
              Upload Batch
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,.pdf" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50 rounded-full blur-[40px] -mr-16 -mt-16 opacity-40"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 relative z-10">Calculated Payout</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter relative z-10">₹ 4.12 <span className="text-xl text-slate-300">Cr</span></p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 w-fit px-3 py-1.5 rounded-xl shadow-sm relative z-10">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
            <span>+12.5% Yield</span>
          </div>
        </div>
        
        <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-[40px] -mr-16 -mt-16 opacity-40"></div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] mb-3 relative z-10">Pending Audit</p>
          <p className="text-4xl font-black text-slate-900 tracking-tighter relative z-10">124 <span className="text-xl text-slate-300">Docs</span></p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-orange-600 bg-orange-50 border border-orange-100 w-fit px-3 py-1.5 rounded-xl shadow-sm relative z-10">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            <span>Action Required</span>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[40px] shadow-2xl shadow-slate-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-[40px] -mr-16 -mt-16"></div>
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.25em] mb-3 relative z-10">System Accuracy</p>
          <p className="text-4xl font-black text-white tracking-tighter relative z-10">94.2 <span className="text-xl text-indigo-800">%</span></p>
          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-indigo-400 bg-white/5 border border-white/10 w-fit px-3 py-1.5 rounded-xl shadow-sm relative z-10 uppercase tracking-widest">
            Model v4.2 Pro
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[48px] border border-slate-100 shadow-[0_16px_48px_-12px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-black text-slate-900 text-xl tracking-tight">Recent Extraction Logs</h3>
          {isUploading && (
            <div className="flex items-center gap-3 text-indigo-600 font-black text-[10px] uppercase tracking-widest animate-pulse bg-indigo-50 px-5 py-2.5 rounded-2xl border border-indigo-100">
               <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full shadow-[0_0_10px_rgba(59,130,246,1)]"></div>
               Scanning Invoices...
            </div>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/40">
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Identifier</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Timestamp</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Entity</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">SKU Group</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Volume</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Net Value</th>
                <th className="px-10 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoices.map((inv) => (
                <tr key={inv.id} className="group hover:bg-slate-50 transition-all duration-300">
                  <td className="px-10 py-6 text-sm font-black text-slate-900">{inv.invoiceNo}</td>
                  <td className="px-10 py-6 text-xs font-bold text-slate-400">{inv.date}</td>
                  <td className="px-10 py-6">
                    <div>
                      <p className="text-sm font-black text-slate-800">{inv.outletName}</p>
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">{inv.distributor}</p>
                    </div>
                  </td>
                  <td className="px-10 py-6 text-xs font-black text-slate-600">{inv.skus}</td>
                  <td className="px-10 py-6 text-sm font-black text-slate-900">{inv.qty}</td>
                  <td className="px-10 py-6 text-sm font-black text-slate-900">₹ {inv.value.toLocaleString()}</td>
                  <td className="px-10 py-6">
                    <span className={`px-4 py-2 rounded-2xl text-[9px] font-black uppercase tracking-[0.15em] border-2 transition-all ${
                      inv.status === 'Validated' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white' :
                      inv.status === 'Extracted' ? 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white' :
                      'bg-slate-50 text-slate-400 border-slate-200'
                    }`}>
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Invoices;
