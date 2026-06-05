import React, { useState, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Invoice, Outlet } from '../../types';
import { useInvoicesQuery } from '../../hooks/queries/useInvoicesQuery';
import { useOutletsQuery } from '../../hooks/queries/useOutletsQuery';
import { queryKeys } from '../../hooks/queries/queryKeys';
import { apiService } from '../../network/apiService';
import { downloadCSV } from '../../utils/csvExport';
import { statusLabels, formatDate } from '../payouts/utils/constants';

import { GlobalInvoicesTab } from '../payouts/tabs/GlobalInvoicesTab';
import { InvoiceEditModal } from './modals/InvoiceEditModal';
import { useToast } from '../../context/ToastContext';
import { getErrorMessage } from '../../utils/errorUtils';
import { useBulkInvoiceApprove } from '../../hooks/useBulkInvoiceApprove';

const INV_PAGE_SIZE = 50;

const SupportDashboard: React.FC = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const [selectedOutletId, setSelectedOutletId] = useState('');
  const [invPage, setInvPage] = useState(0);
  const [invStatusFilter, setInvStatusFilter] = useState('All');
  const [invSearch, setInvSearch] = useState('');

  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const { data: outletsData, isLoading: loadingOutlets } = useOutletsQuery(0, 200);
  const outlets = useMemo<Outlet[]>(() => outletsData?.content || [], [outletsData]);

  const { data: invData, isLoading: invLoading } = useInvoicesQuery(invPage, INV_PAGE_SIZE);
  const invoices = useMemo<Invoice[]>(() => invData?.content || [], [invData]);
  const invTotalPages = invData?.totalPages || 0;
  const invTotalElements = invData?.totalElements || 0;

  const invalidateInvoices = () => queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });

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

  const bulk = useBulkInvoiceApprove(filteredInvoices, () => invalidateInvoices());

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
          filename: 'invoices_support_export',
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
        showToast(`Exported ${fullInvoices.length} invoice(s) to CSV`, 'success');
      } else {
        showToast('Export failed to load data.', 'error');
      }
    } catch (err: unknown) {
      showToast('Export error: ' + getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-700 pb-20 max-w-[1600px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Support Dashboard</h2>
          <p className="text-slate-400 text-sm mt-0.5">Manage and correct uploaded invoices</p>
        </div>
      </div>

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
        setReviewingInvoice={setEditingInvoice}
        hideBulkActions={true}
      />

      <InvoiceEditModal
        isOpen={!!editingInvoice}
        invoice={editingInvoice}
        onClose={() => setEditingInvoice(null)}
        onSuccess={() => {
          setEditingInvoice(null);
          invalidateInvoices();
        }}
      />
    </div>
  );
};

export default SupportDashboard;
