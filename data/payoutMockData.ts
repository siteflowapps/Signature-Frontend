import { PayoutRecord, BankDetails } from '../types';

// ── Per-Outlet Consolidated Payout Records ─────────────────
// One record per outlet per month — aggregates all approved invoices

export const PAYOUT_RECORDS: PayoutRecord[] = [
  // ── January 2025 ──
  { id: 'po-1-jan', outletId: '1', outletName: 'Sharma General Store', classification: 'Platinum', month: 'January', year: 2025, invoiceCount: 3, invoiceNos: ['INV-2025-0112', 'INV-2025-0118', 'INV-2025-0125'], totalInvoiceValue: 53000, payoutAmount: 1060, status: 'Settled', transactionId: 'TXN-78234561', settledDate: '15 Feb 2025', linkedBy: 'Amit Kumar (Finance)' },
  { id: 'po-2-jan', outletId: '2', outletName: 'Patel Supermart', classification: 'Gold', month: 'January', year: 2025, invoiceCount: 2, invoiceNos: ['INV-2025-0156', 'INV-2025-0161'], totalInvoiceValue: 67000, payoutAmount: 1340, status: 'Settled', transactionId: 'TXN-78234562', settledDate: '15 Feb 2025', linkedBy: 'Amit Kumar (Finance)' },
  { id: 'po-3-jan', outletId: '3', outletName: 'Singh Medical Store', classification: 'Diamond', month: 'January', year: 2025, invoiceCount: 4, invoiceNos: ['INV-2025-0178', 'INV-2025-0182', 'INV-2025-0190', 'INV-2025-0195'], totalInvoiceValue: 102500, payoutAmount: 2050, status: 'Settled', transactionId: 'TXN-78234563', settledDate: '15 Feb 2025', linkedBy: 'Amit Kumar (Finance)' },
  { id: 'po-4-jan', outletId: '4', outletName: 'Verma Kirana Store', classification: 'Silver', month: 'January', year: 2025, invoiceCount: 1, invoiceNos: ['INV-2025-0201'], totalInvoiceValue: 28000, payoutAmount: 560, status: 'Settled', transactionId: 'TXN-78234564', settledDate: '16 Feb 2025', linkedBy: 'Amit Kumar (Finance)' },
  { id: 'po-5-jan', outletId: '5', outletName: 'Reddy Supermarket', classification: 'Gold', month: 'January', year: 2025, invoiceCount: 2, invoiceNos: ['INV-2025-0189', 'INV-2025-0198'], totalInvoiceValue: 72000, payoutAmount: 1440, status: 'Settled', transactionId: 'TXN-78234565', settledDate: '16 Feb 2025', linkedBy: 'Priya Mehta (Finance)' },

  // ── February 2025 ──
  { id: 'po-1-feb', outletId: '1', outletName: 'Sharma General Store', classification: 'Platinum', month: 'February', year: 2025, invoiceCount: 4, invoiceNos: ['INV-2025-0245', 'INV-2025-0251', 'INV-2025-0260', 'INV-2025-0268'], totalInvoiceValue: 66000, payoutAmount: 1320, status: 'Settled', transactionId: 'TXN-91456782', settledDate: '14 Mar 2025', linkedBy: 'Amit Kumar (Finance)' },
  { id: 'po-2-feb', outletId: '2', outletName: 'Patel Supermart', classification: 'Gold', month: 'February', year: 2025, invoiceCount: 3, invoiceNos: ['INV-2025-0298', 'INV-2025-0305', 'INV-2025-0312'], totalInvoiceValue: 66000, payoutAmount: 1320, status: 'Settled', transactionId: 'TXN-91456783', settledDate: '14 Mar 2025', linkedBy: 'Amit Kumar (Finance)' },
  { id: 'po-3-feb', outletId: '3', outletName: 'Singh Medical Store', classification: 'Diamond', month: 'February', year: 2025, invoiceCount: 3, invoiceNos: ['INV-2025-0330', 'INV-2025-0341', 'INV-2025-0349'], totalInvoiceValue: 117000, payoutAmount: 2340, status: 'Settled', transactionId: 'TXN-91456784', settledDate: '14 Mar 2025', linkedBy: 'Amit Kumar (Finance)' },
  { id: 'po-5-feb', outletId: '5', outletName: 'Reddy Supermarket', classification: 'Gold', month: 'February', year: 2025, invoiceCount: 2, invoiceNos: ['INV-2025-0334', 'INV-2025-0345'], totalInvoiceValue: 78000, payoutAmount: 1560, status: 'Settled', transactionId: 'TXN-91456785', settledDate: '15 Mar 2025', linkedBy: 'Priya Mehta (Finance)' },
  { id: 'po-6-feb', outletId: '6', outletName: 'Joshi Corner Shop', classification: 'Silver', month: 'February', year: 2025, invoiceCount: 1, invoiceNos: ['INV-2025-0378'], totalInvoiceValue: 22000, payoutAmount: 440, status: 'Settled', transactionId: 'TXN-91456786', settledDate: '15 Mar 2025', linkedBy: 'Priya Mehta (Finance)' },

  // ── March 2025 (current month — mixed statuses) ──
  { id: 'po-1-mar', outletId: '1', outletName: 'Sharma General Store', classification: 'Platinum', month: 'March', year: 2025, invoiceCount: 3, invoiceNos: ['INV-2025-0389', 'INV-2025-0402', 'INV-2025-0415'], totalInvoiceValue: 58600, payoutAmount: 1172, status: 'Pending', remarks: 'Sent to bank on 28 Mar' },
  { id: 'po-2-mar', outletId: '2', outletName: 'Patel Supermart', classification: 'Gold', month: 'March', year: 2025, invoiceCount: 0, invoiceNos: [], totalInvoiceValue: 0, payoutAmount: 0, status: 'On Hold', remarks: 'No invoices submitted' },
  { id: 'po-3-mar', outletId: '3', outletName: 'Singh Medical Store', classification: 'Diamond', month: 'March', year: 2025, invoiceCount: 2, invoiceNos: ['INV-2025-0445', 'INV-2025-0460'], totalInvoiceValue: 110600, payoutAmount: 2212, status: 'Pending', remarks: 'Sent to bank on 28 Mar' },
  { id: 'po-4-mar', outletId: '4', outletName: 'Verma Kirana Store', classification: 'Silver', month: 'March', year: 2025, invoiceCount: 1, invoiceNos: ['INV-2025-0478'], totalInvoiceValue: 30000, payoutAmount: 600, status: 'Eligible' },
  { id: 'po-5-mar', outletId: '5', outletName: 'Reddy Supermarket', classification: 'Gold', month: 'March', year: 2025, invoiceCount: 2, invoiceNos: ['INV-2025-0490', 'INV-2025-0498'], totalInvoiceValue: 75000, payoutAmount: 1500, status: 'Eligible' },
  { id: 'po-6-mar', outletId: '6', outletName: 'Joshi Corner Shop', classification: 'Silver', month: 'March', year: 2025, invoiceCount: 1, invoiceNos: ['INV-2025-0501'], totalInvoiceValue: 25000, payoutAmount: 500, status: 'Eligible' },
  { id: 'po-7-mar', outletId: '7', outletName: 'Mehta General Store', classification: 'Gold', month: 'March', year: 2025, invoiceCount: 2, invoiceNos: ['INV-2025-0512', 'INV-2025-0519'], totalInvoiceValue: 55000, payoutAmount: 1100, status: 'Eligible' },
  { id: 'po-8-mar', outletId: '8', outletName: 'Gupta Beverages', classification: 'Diamond', month: 'March', year: 2025, invoiceCount: 3, invoiceNos: ['INV-2025-0523', 'INV-2025-0530', 'INV-2025-0538'], totalInvoiceValue: 95000, payoutAmount: 1900, status: 'Pending', remarks: 'Sent to bank on 28 Mar' },
];

// ── Outlet Bank Details (mock — will come from API later) ──

export const OUTLET_BANK_DETAILS: Record<string, BankDetails> = {
  '1': { accountNo: '10234567890', ifsc: 'SBIN0001234', bankName: 'State Bank of India', beneficiaryName: 'Rajesh Kumar Sharma' },
  '2': { accountNo: '20345678901', ifsc: 'HDFC0002345', bankName: 'HDFC Bank', beneficiaryName: 'Hitesh Patel' },
  '3': { accountNo: '30456789012', ifsc: 'ICIC0003456', bankName: 'ICICI Bank', beneficiaryName: 'Gurpreet Singh' },
  '4': { accountNo: '40567890123', ifsc: 'UTIB0004567', bankName: 'Axis Bank', beneficiaryName: 'Arun Verma' },
  '5': { accountNo: '50678901234', ifsc: 'KKBK0005678', bankName: 'Kotak Mahindra Bank', beneficiaryName: 'Venkat Reddy' },
  '6': { accountNo: '60789012345', ifsc: 'BARB0006789', bankName: 'Bank of Baroda', beneficiaryName: 'Manoj Joshi' },
  '7': { accountNo: '70890123456', ifsc: 'PUNB0007890', bankName: 'Punjab National Bank', beneficiaryName: 'Suresh Mehta' },
  '8': { accountNo: '80901234567', ifsc: 'CNRB0008901', bankName: 'Canara Bank', beneficiaryName: 'Ramesh Gupta' },
};
