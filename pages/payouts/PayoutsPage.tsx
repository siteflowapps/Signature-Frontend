import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import { Invoice, Outlet, PayoutResult } from '../../types';
import { downloadCSV } from '../../utils/csvExport';
import { apiService } from '../../network/apiService';
import { useBulkInvoiceApprove } from '../../hooks/useBulkInvoiceApprove';
import { useInvoicesQuery } from '../../hooks/queries/useInvoicesQuery';
import { usePayoutsQuery } from '../../hooks/queries/usePayoutsQuery';
import { useOutletsQuery } from '../../hooks/queries/useOutletsQuery';
import { queryKeys } from '../../hooks/queries/queryKeys';

import { PAYOUT_STATUSES, statusLabels, formatDate } from './utils/constants';

import { GlobalInvoicesTab } from './tabs/GlobalInvoicesTab';
import { GlobalPayoutsTab } from './tabs/GlobalPayoutsTab';
import { InvoiceReviewModal } from './modals/InvoiceReviewModal';
import { RunCycleModal } from './modals/RunCycleModal';
import { MarkPaidModal } from './modals/MarkPaidModal';
import { ApprovalDialog } from './modals/ApprovalDialog';

import BulkApproveBar from '../../components/BulkApproveBar';
import BulkApproveModal from '../../components/BulkApproveModal';
import BulkApproveResultsModal from '../../components/BulkApproveResultsModal';
import { getErrorMessage } from '../../utils/errorUtils';

type ActiveTab = 'invoices' | 'payouts';
const INV_PAGE_SIZE = 50;
const PAY_PAGE_SIZE = 10;

const PayoutsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<ActiveTab>('invoices');

  // ─── PAGINATION & FILTER STATE (client-only, not fetched) ───
  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [invPage, setInvPage] = useState(0);
  const [invStatusFilter, setInvStatusFilter] = useState('All');
  const [invSearch, setInvSearch] = useState('');
  const [payPage, setPayPage] = useState(0);
  const [payStatusFilter, setPayStatusFilter] = useState('All');

  // Dialog/modal UI state
  const [showDialog, setShowDialog] = useState(false);
  const [dialogAction, setDialogAction] = useState<'approve' | 'reject' | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [remarks, setRemarks] = useState('');
  const [processing, setProcessing] = useState(false);
  const [markingPaidId, setMarkingPaidId] = useState<string | null>(null);
  const [markPaidPayout, setMarkPaidPayout] = useState<PayoutResult | null>(null);
  const [transactionId, setTransactionId] = useState('');
  const [reviewingInvoice, setReviewingInvoice] = useState<Invoice | null>(null);
  const [showCycleDialog, setShowCycleDialog] = useState(false);
  const [cycleRunning, setCycleRunning] = useState(false);
  const [cycleResults, setCycleResults] = useState<PayoutResult[] | null>(null);
  const [cycleError, setCycleError] = useState('');

  // ─── REACT QUERY: DATA FETCHING ───
  const { data: outletsData, isLoading: loadingOutlets } = useOutletsQuery(0, 200);
  const outlets = useMemo<Outlet[]>(() => outletsData?.content || [], [outletsData]);

  const { data: invData, isLoading: invLoading } = useInvoicesQuery(invPage, INV_PAGE_SIZE);
  const invoices = useMemo<Invoice[]>(() => invData?.content || [], [invData]);
  const invTotalPages = invData?.totalPages || 0;
  const invTotalElements = invData?.totalElements || 0;

  const { data: payData, isLoading: payLoading, error: payQueryError } = usePayoutsQuery(payPage, PAY_PAGE_SIZE, activeTab === 'payouts');
  const payouts = useMemo<PayoutResult[]>(() => payData?.content || [], [payData]);
  const payTotalPages = payData?.totalPages || 0;
  const payTotalElements = payData?.totalElements || 0;
  const payError = payQueryError ? (payQueryError as Error).message : '';

  // ─── Helper to invalidate queries ───
  const invalidateInvoices = () => queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
  const invalidatePayouts = () => queryClient.invalidateQueries({ queryKey: queryKeys.payouts.all });

  // ─── FILTERED INVOICES ───
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      if (selectedOutletId) {
        const currentOutlet = outlets.find(o => o.id === selectedOutletId);
        if (currentOutlet && inv.outletName !== currentOutlet.name) return false;
      }
      if (invStatusFilter !== 'All' && inv.status !== invStatusFilter) return false;
      if (invSearch) {
        const s = invSearch.toLowerCase();
        if (
          !(inv.invoiceNumber || '').toLowerCase().includes(s) &&
          !(inv.outletName || '').toLowerCase().includes(s) &&
          !(inv.distributorName || '').toLowerCase().includes(s) &&
          !(inv.skus || '').toLowerCase().includes(s)
        ) return false;
      }
      return true;
    });
  }, [invoices, invStatusFilter, invSearch, selectedOutletId, outlets]);

  // ─── BULK APPROVE ───
  const bulk = useBulkInvoiceApprove(filteredInvoices, () => invalidateInvoices());

  // ─── FILTERED PAYOUTS ───
  const filteredPayouts = useMemo(() => {
    return payouts.filter(p => {
      if (payStatusFilter !== 'All' && p.status !== payStatusFilter) return false;
      return true;
    });
  }, [payouts, payStatusFilter]);

  // ─── INVOICE KPIs ───
  const invKpis = useMemo(() => {
    const asmApproved = filteredInvoices.filter(i => i.status === 'ASM_APPROVED');
    const finApproved = filteredInvoices.filter(i => i.status === 'FINANCE_APPROVED');
    const paid = filteredInvoices.filter(i => i.status === 'PAID');
    return {
      pendingApproval: asmApproved.length,
      pendingAmount: asmApproved.reduce((s, i) => s + (i.totalAmount || 0), 0),
      approvedCount: finApproved.length,
      approvedAmount: finApproved.reduce((s, i) => s + (i.totalAmount || 0), 0),
      paidCount: paid.length,
      paidAmount: paid.reduce((s, i) => s + (i.totalAmount || 0), 0),
      totalCount: filteredInvoices.length,
      totalAmount: filteredInvoices.reduce((s, i) => s + (i.totalAmount || 0), 0),
    };
  }, [filteredInvoices]);

  // ─── PAYOUT KPIs ───
  const payKpis = useMemo(() => {
    const calculated = filteredPayouts.filter(p => p.status === 'CALCULATED');
    const paid = filteredPayouts.filter(p => p.status === 'PAID');
    return {
      calculatedCount: calculated.length,
      calculatedAmount: calculated.reduce((s, p) => s + p.calculatedAmount, 0),
      paidCount: paid.length,
      paidAmount: paid.reduce((s, p) => s + p.calculatedAmount, 0),
      totalCount: filteredPayouts.length,
      totalAmount: filteredPayouts.reduce((s, p) => s + p.calculatedAmount, 0),
    };
  }, [filteredPayouts]);

  const financeApprovedCount = invoices.filter(i => i.status === 'FINANCE_APPROVED').length;
  const financeApprovedValue = invoices.filter(i => i.status === 'FINANCE_APPROVED').reduce((s, i) => s + (i.totalAmount || 0), 0);
  const unpaidPayoutCount = payouts.filter(p => p.status === 'CALCULATED').length;

  // ─── INVOICE ACTIONS (mutations stay imperative, invalidate cache on success) ───
  const handleActionClick = (invoice: Invoice, action: 'approve' | 'reject') => {
    setSelectedInvoice(invoice);
    setDialogAction(action);
    setRemarks('');
    setShowDialog(true);
  };

  const handleDialogSubmit = async () => {
    if (!selectedInvoice || !dialogAction) return;
    setProcessing(true);
    try {
      const res = dialogAction === 'approve'
        ? await apiService.invoices.approve(selectedInvoice.id, remarks)
        : await apiService.invoices.reject(selectedInvoice.id, remarks);
      if (res.success) {
        const newStatus = dialogAction === 'approve' ? 'FINANCE_APPROVED' : 'REJECTED';
        if (reviewingInvoice && reviewingInvoice.id === selectedInvoice.id) {
          setReviewingInvoice({ ...reviewingInvoice, status: newStatus } as Invoice);
        }
        setShowDialog(false);
        invalidateInvoices();
        showToast(
          dialogAction === 'approve'
            ? `Invoice ${selectedInvoice.invoiceNumber || selectedInvoice.invoiceNo} approved successfully`
            : `Invoice ${selectedInvoice.invoiceNumber || selectedInvoice.invoiceNo} rejected`,
          'success'
        );
      } else {
        showToast(res.error || `Failed to ${dialogAction} invoice`, 'error');
      }
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setProcessing(false);
    }
  };

  // ─── PAYOUT ACTIONS ───
  const openMarkPaidModal = (payout: PayoutResult) => {
    setMarkPaidPayout(payout);
    setTransactionId('');
  };

  const handleMarkPaidConfirm = async () => {
    if (!markPaidPayout || !transactionId.trim()) return;
    setMarkingPaidId(markPaidPayout.id);
    try {
      const res = await apiService.payouts.markPaid(markPaidPayout.id);
      if (res.success) {
        invalidatePayouts();
        setMarkPaidPayout(null);
        setTransactionId('');
      } else {
        showToast(res.error || 'Failed to mark as paid', 'error');
      }
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error');
    } finally {
      setMarkingPaidId(null);
    }
  };

  // ─── RUN CYCLE ───
  const handleRunCycle = async () => {
    setCycleRunning(true);
    setCycleError('');
    setCycleResults(null);
    try {
      const res = await apiService.payouts.runCycle();
      if (res.success) {
        setCycleResults(res.data);
        invalidateInvoices();
        invalidatePayouts();
      } else {
        setCycleError(res.error || 'Failed to run payout cycle');
      }
    } catch (err: unknown) {
      setCycleError(getErrorMessage(err));
    } finally {
      setCycleRunning(false);
    }
  };

  // ─── EXPORTS (one-off fetches, not cached) ───
  const handleExportPayouts = async () => {
    try {
      showToast('Preparing export...', 'success');
      const [payRes, invRes] = await Promise.all([
        apiService.payouts.getAll(0, 5000),
        apiService.invoices.getAll(0, 5000)
      ]);
      const fullPayouts = payRes.success ? payRes.data?.content || [] : [];
      const fullInvoices = invRes.success ? invRes.data?.content || [] : [];
      
      const invoiceMap = new Map<string, Invoice>(fullInvoices.map(inv => [inv.id, inv]));
      const exportablePayouts = fullPayouts.filter(p => p.status === 'CALCULATED' || p.status === 'PAID');

      if (exportablePayouts.length === 0) {
        showToast('No calculated payouts to export', 'error');
        return;
      }

      downloadCSV({
        filename: 'payouts_export_full',
        headers: [
          'Invoice Number', 'Invoice ID', 'Retailer Name', 'Distributor Name', 'Invoice Date',
          'SKUs', 'Total Quantity', 'Invoice Amount (₹)', 'Slab %', 'Payout Amount (₹)',
          'Payout Status', 'Calculated At', 'Paid At',
        ],
        rows: exportablePayouts.map(p => {
          const inv = invoiceMap.get(p.invoiceId);
          return [
            inv?.invoiceNumber || inv?.invoiceNo || '—',
            p.invoiceId,
            inv?.outletName || '—',
            inv?.distributorName || inv?.distributor || '—',
            inv?.invoiceDate || inv?.date || '—',
            inv?.skus || '—',
            inv?.totalQuantity ?? inv?.quantity ?? inv?.qty ?? '—',
            inv?.totalAmount ?? inv?.value ?? 0,
            p.slabPercentage,
            p.calculatedAmount,
            p.status,
            p.calculatedAt ? formatDate(p.calculatedAt) : '—',
            p.paidAt ? formatDate(p.paidAt) : '—'
          ];
        })
      });
      showToast(`Exported ${exportablePayouts.length} payout(s) to CSV`, 'success');
    } catch (err: unknown) {
      showToast('Export error: ' + getErrorMessage(err), 'error');
    }
  };

  const handleExportInvoices = async () => {
    try {
      showToast('Preparing export...', 'success');
      const response = await apiService.invoices.getAll(0, 5000);
      if (response.success && response.data?.content) {
        const fullInvoices = response.data.content;
        if (fullInvoices.length === 0) {
          showToast('No invoices to export', 'error');
          return;
        }

        downloadCSV({
          filename: 'invoices_export_full',
          headers: ['Invoice Number', 'Invoice ID', 'Outlet Name', 'Distributor Name', 'Invoice Date', 'SKUs', 'Total Quantity', 'Total Amount (₹)', 'Status', 'Uploaded At', 'Created By'],
          rows: fullInvoices.map(inv => [
            inv.invoiceNumber || inv.invoiceNo || '—',
            inv.id,
            inv.outletName || '—',
            inv.distributorName || inv.distributor || '—',
            inv.invoiceDate || inv.date || '—',
            inv.skus || '—',
            inv.totalQuantity ?? inv.quantity ?? inv.qty ?? '—',
            inv.totalAmount ?? inv.value ?? 0,
            statusLabels[inv.status as string] || inv.status,
            inv.uploadDate ? formatDate(inv.uploadDate) : '—',
            inv.createdByName || '—',
          ]),
        });
        showToast(`Exported ${fullInvoices.length} invoice(s) to Excel`, 'success');
      } else {
        showToast('Export failed to load data.', 'error');
      }
    } catch (err: unknown) {
      showToast('Export error: ' + getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Payouts</h2>
          <p className="text-slate-400 text-sm mt-0.5">Finance Settlement Dashboard</p>
        </div>
        <button
          onClick={() => { setCycleResults(null); setCycleError(''); setShowCycleDialog(true); }}
          disabled={financeApprovedCount === 0}
          className="group flex items-center gap-2.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:-translate-y-0.5 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none disabled:hover:translate-y-0"
          title={financeApprovedCount === 0 ? 'No finance-approved invoices to process' : `Process ${financeApprovedCount} approved invoice(s)`}
        >
          <svg className="w-4.5 h-4.5 group-hover:rotate-[360deg] transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Run Payout Cycle
        </button>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 rounded-2xl p-1.5 w-fit">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
            activeTab === 'invoices' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          Invoices
        </button>
        <button
          onClick={() => setActiveTab('payouts')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${
            activeTab === 'payouts' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
          Payouts
          {unpaidPayoutCount > 0 && activeTab !== 'payouts' && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm">
              {unpaidPayoutCount}
            </span>
          )}
        </button>
      </div>

      {activeTab === 'invoices' && (
        <GlobalInvoicesTab
          invoices={invoices}
          filteredInvoices={filteredInvoices}
          invLoading={invLoading}
          invPage={invPage}
          invTotalPages={invTotalPages}
          invTotalElements={invTotalElements}
          setInvPage={setInvPage}
          outlets={outlets}
          selectedOutletId={selectedOutletId}
          setSelectedOutletId={setSelectedOutletId}
          loadingOutlets={loadingOutlets}
          invSearch={invSearch}
          setInvSearch={setInvSearch}
          invStatusFilter={invStatusFilter}
          setInvStatusFilter={setInvStatusFilter}
          invKpis={invKpis}
          handleExportInvoices={handleExportInvoices}
          bulk={bulk}
          setReviewingInvoice={setReviewingInvoice}
        />
      )}

      {activeTab === 'payouts' && (
        <GlobalPayoutsTab
          payouts={payouts}
          filteredPayouts={filteredPayouts}
          invoices={invoices}
          payLoading={payLoading}
          payError={payError}
          payPage={payPage}
          payTotalPages={payTotalPages}
          payTotalElements={payTotalElements}
          payStatusFilter={payStatusFilter}
          setPayStatusFilter={setPayStatusFilter}
          setPayPage={setPayPage}
          payKpis={payKpis}
          handleExportPayouts={handleExportPayouts}
          openMarkPaidModal={openMarkPaidModal}
          markingPaidId={markingPaidId}
          PAYOUT_STATUSES={PAYOUT_STATUSES}
        />
      )}

      <ApprovalDialog
        isOpen={showDialog}
        dialogAction={dialogAction}
        selectedInvoice={selectedInvoice}
        remarks={remarks}
        setRemarks={setRemarks}
        processing={processing}
        onClose={() => setShowDialog(false)}
        onSubmit={handleDialogSubmit}
      />

      <MarkPaidModal
        isOpen={!!markPaidPayout}
        payout={markPaidPayout}
        transactionId={transactionId}
        setTransactionId={setTransactionId}
        onClose={() => { setMarkPaidPayout(null); setTransactionId(''); }}
        onConfirm={handleMarkPaidConfirm}
        processing={!!markingPaidId}
      />

      <RunCycleModal
        isOpen={showCycleDialog}
        cycleRunning={cycleRunning}
        cycleResults={cycleResults}
        cycleError={cycleError}
        financeApprovedCount={financeApprovedCount}
        financeApprovedValue={financeApprovedValue}
        onClose={() => setShowCycleDialog(false)}
        onRunCycle={handleRunCycle}
        onViewPayouts={() => { setShowCycleDialog(false); setActiveTab('payouts'); }}
      />

      <InvoiceReviewModal
        reviewingInvoice={reviewingInvoice}
        setReviewingInvoice={setReviewingInvoice}
        filteredInvoices={filteredInvoices}
        onActionClick={handleActionClick}
      />

      <BulkApproveBar
        selectedCount={bulk.selectedIds.size}
        totalAmount={bulk.selectedTotalAmount}
        onBulkApprove={bulk.openConfirmModal}
        onClearSelection={bulk.clearSelection}
      />
      <BulkApproveModal
        isOpen={bulk.showConfirmModal}
        invoices={bulk.selectedInvoices}
        totalAmount={bulk.selectedTotalAmount}
        isProcessing={bulk.isProcessing}
        error={bulk.error}
        onClose={bulk.closeConfirmModal}
        onSubmit={bulk.submitBulkApprove}
      />
      <BulkApproveResultsModal
        isOpen={bulk.showResultsModal}
        results={bulk.results}
        onClose={bulk.closeResultsModal}
      />
    </div>
  );
};

export default PayoutsPage;
