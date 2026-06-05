import React, { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, InvoiceLineItemDto, Distributor } from '../../../types';
import { apiService } from '../../../network/apiService';
import { useToast } from '../../../context/ToastContext';

interface InvoiceEditModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InvoiceEditModal: React.FC<InvoiceEditModalProps> = ({ invoice, isOpen, onClose, onSuccess }) => {
  const { showToast } = useToast();
  const [distributorId, setDistributorId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [gr, setGr] = useState<number>(0);
  const [remarks, setRemarks] = useState('');
  const [items, setItems] = useState<InvoiceLineItemDto[]>([]);
  const [photo, setPhoto] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [distributors, setDistributors] = useState<Distributor[]>([]);

  useEffect(() => {
    if (isOpen) {
      apiService.distributors.getAll(0, 500).then(res => {
        if (res.success) {
          setDistributors(res.data.content);
        }
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (invoice && isOpen) {
      setDistributorId(invoice.distributor || ''); // Fallback if distributor ID isn't directly available
      // Try to match distributorId from name if possible
      const dist = distributors.find(d => d.name === (invoice.distributorName || invoice.distributor));
      if (dist) setDistributorId(dist.id);
      
      setInvoiceNumber(invoice.invoiceNumber || invoice.invoiceNo || '');
      setInvoiceDate(invoice.invoiceDate || invoice.date || '');
      setTotalAmount(invoice.totalAmount ?? invoice.value ?? 0);
      setGr(invoice.gr ?? 0);
      setRemarks('');
      setPhoto(null);

      if (invoice.items && invoice.items.length > 0) {
        setItems(invoice.items.map(item => ({
          skuId: null,
          skuName: item.skuName || item.matchedSkuName || '',
          invoicedSkuName: item.invoicedSkuName || item.skuName || '',
          invoicedQuantity: item.invoicedQuantity || item.physicalCases || item.qty || 0,
          invoicedUnit: item.invoicedUnit || 'CASE',
          invoicedUnitPrice: item.mrpPerCase || 0,
          invoicedTotalPrice: item.mrpRevenue || item.value || 0,
          isSchemeItem: false,
          isNonCatalogItem: false
        })));
      } else {
        setItems([]);
      }
    }
  }, [invoice, isOpen, distributors]);

  if (!isOpen || !invoice) return null;

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        skuId: null,
        skuName: '',
        invoicedSkuName: '',
        invoicedQuantity: 1,
        invoicedUnit: 'CASE',
        invoicedUnitPrice: 0,
        invoicedTotalPrice: 0,
        isSchemeItem: false,
        isNonCatalogItem: false
      }
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof InvoiceLineItemDto, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-calculate total price if quantity or unit price changes
    if (field === 'invoicedQuantity' || field === 'invoicedUnitPrice') {
      const qty = field === 'invoicedQuantity' ? Number(value) : newItems[index].invoicedQuantity;
      const price = field === 'invoicedUnitPrice' ? Number(value) : newItems[index].invoicedUnitPrice;
      newItems[index].invoicedTotalPrice = (qty || 0) * (price || 0);
    }
    
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!distributorId) {
      showToast('Please select a distributor', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        distributorId,
        invoiceNumber,
        invoiceDate,
        items,
        totalAmount,
        digitalSignature: invoice.digitalSignature || false,
        gr,
        remarks
      };

      const formData = new FormData();
      formData.append('data', JSON.stringify(payload));
      if (photo) {
        formData.append('photo', photo);
      }

      const res = await apiService.invoices.edit(invoice.id, formData);
      if (res.success) {
        showToast('Invoice updated successfully', 'success');
        onSuccess();
        onClose();
      } else {
        showToast(res.error || 'Failed to update invoice', 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Error updating invoice', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h2 className="text-lg font-black text-slate-900 tracking-tight">Fix / Edit Invoice</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="edit-invoice-form" onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Distributor</label>
                <select
                  value={distributorId}
                  onChange={(e) => setDistributorId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                >
                  <option value="">Select Distributor...</option>
                  {distributors.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Number</label>
                <input
                  type="text"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Total Amount (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">GR / Returns (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={gr}
                  onChange={(e) => setGr(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Upload New Photo (Optional)</label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setPhoto(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">Correction Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="e.g. Corrected line item quantity based on outlet escalation"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">Line Items</h3>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="px-3 py-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold rounded-lg transition-colors"
                >
                  + Add Item
                </button>
              </div>

              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-xl border border-slate-100">No items added.</p>
                ) : (
                  items.map((item, index) => (
                    <div key={index} className="flex flex-wrap items-end gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl relative group">
                      <div className="flex-1 min-w-[200px]">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">SKU Name</label>
                        <input
                          type="text"
                          value={item.skuName}
                          onChange={(e) => handleItemChange(index, 'skuName', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Qty</label>
                        <input
                          type="number"
                          value={item.invoicedQuantity}
                          onChange={(e) => handleItemChange(index, 'invoicedQuantity', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                          required
                        />
                      </div>
                      <div className="w-24">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unit</label>
                        <select
                          value={item.invoicedUnit}
                          onChange={(e) => handleItemChange(index, 'invoicedUnit', e.target.value)}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        >
                          <option value="CASE">Case</option>
                          <option value="BOTTLE">Bottle</option>
                          <option value="PACK">Pack</option>
                        </select>
                      </div>
                      <div className="w-28">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Unit Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.invoicedUnitPrice}
                          onChange={(e) => handleItemChange(index, 'invoicedUnitPrice', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <div className="w-28">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Total</label>
                        <input
                          type="number"
                          step="0.01"
                          value={item.invoicedTotalPrice}
                          onChange={(e) => handleItemChange(index, 'invoicedTotalPrice', Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-xs focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                        title="Remove Item"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="edit-invoice-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : null}
            Submit Corrections
          </button>
        </div>
      </div>
    </div>
  );
};
