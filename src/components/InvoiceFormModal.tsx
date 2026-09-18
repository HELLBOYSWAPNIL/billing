import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Calendar, 
  User, 
  Package, 
  FileText, 
  Check, 
  Eye
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatCurrency, generateId, getNextInvoiceNumber } from '../utils';
import { Invoice, InvoiceItem } from '../types';

export const InvoiceFormModal: React.FC = () => {
  const { 
    clients, 
    products, 
    invoices, 
    businessProfile,
    isInvoiceFormOpen, 
    setIsInvoiceFormOpen, 
    editingInvoice, 
    setEditingInvoice,
    addInvoice, 
    updateInvoice,
    setPreviewInvoice,
    selectedClientId
  } = useBilling();

  if (!isInvoiceFormOpen) return null;

  // Invoice Fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [clientId, setClientId] = useState('');
  const [date, setDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(0);
  const [initialStatus, setInitialStatus] = useState<'pending' | 'paid'>('pending');
  const [notes, setNotes] = useState('');

  // Prepopulate form
  useEffect(() => {
    if (editingInvoice) {
      setInvoiceNumber(editingInvoice.invoiceNumber);
      setClientId(editingInvoice.clientId);
      setDate(editingInvoice.date);
      setDueDate(editingInvoice.dueDate);
      setItems(editingInvoice.items);
      setDiscountType(editingInvoice.discountType || 'percentage');
      setDiscountValue(editingInvoice.discountValue || 0);
      setTaxRate(editingInvoice.taxRate || 0);
      setInitialStatus(editingInvoice.status === 'paid' ? 'paid' : 'pending');
      setNotes(editingInvoice.notes || '');
    } else {
      // New Invoice defaults
      const existingNos = invoices.map(i => i.invoiceNumber);
      setInvoiceNumber(getNextInvoiceNumber(existingNos));

      const defaultClient = selectedClientId || (clients[0]?.id ?? '');
      setClientId(defaultClient);

      const today = new Date().toISOString().split('T')[0];
      setDate(today);

      // Default due date: +7 days
      const due = new Date();
      due.setDate(due.getDate() + 7);
      setDueDate(due.toISOString().split('T')[0]);

      // Default one empty row
      setItems([
        {
          id: generateId('item'),
          description: '',
          quantity: 1,
          price: 0,
          amount: 0,
        },
      ]);
      setDiscountType('percentage');
      setDiscountValue(0);
      setTaxRate(0);
      setInitialStatus('pending');
      setNotes(businessProfile.invoiceNotes || 'Thank you for your business! Payment is due within 7 days.');
    }
  }, [editingInvoice, isInvoiceFormOpen]);

  // Selected client object
  const selectedClient = clients.find(c => c.id === clientId);

  // Line item manipulation
  const handleItemChange = (index: number, field: keyof InvoiceItem, value: any) => {
    setItems(prev => {
      const copy = [...prev];
      const current = { ...copy[index], [field]: value };
      if (field === 'quantity' || field === 'price') {
        const q = field === 'quantity' ? Number(value) : current.quantity;
        const p = field === 'price' ? Number(value) : current.price;
        current.amount = Math.max(0, (isNaN(q) ? 0 : q) * (isNaN(p) ? 0 : p));
      }
      copy[index] = current;
      return copy;
    });
  };

  const handleSelectPresetProduct = (index: number, productId: string) => {
    const prod = products.find(p => p.id === productId);
    if (!prod) return;
    setItems(prev => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        description: prod.name,
        price: prod.defaultPrice,
        amount: copy[index].quantity * prod.defaultPrice,
      };
      return copy;
    });
  };

  const addItemRow = () => {
    setItems(prev => [
      ...prev,
      {
        id: generateId('item'),
        description: '',
        quantity: 1,
        price: 0,
        amount: 0,
      },
    ]);
  };

  const removeItemRow = (index: number) => {
    if (items.length === 1) return; // Keep at least one
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  // Calculations
  const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  
  let discountAmount = 0;
  if (discountType === 'percentage') {
    discountAmount = Math.round((subtotal * Math.min(100, Math.max(0, discountValue))) / 100);
  } else {
    discountAmount = Math.min(subtotal, Math.max(0, discountValue));
  }

  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const taxAmount = Math.round((taxableAmount * Math.max(0, taxRate)) / 100);
  const grandTotal = taxableAmount + taxAmount;

  const handleClose = () => {
    setIsInvoiceFormOpen(false);
    setEditingInvoice(null);
  };

  const handleSave = (previewImmediately: boolean = false) => {
    if (!selectedClient) {
      alert('Please select or add a client.');
      return;
    }
    if (items.some(i => !i.description.trim())) {
      alert('Please provide descriptions for all invoice items.');
      return;
    }
    if (grandTotal <= 0) {
      alert('Invoice total must be greater than zero.');
      return;
    }

    const isPaid = initialStatus === 'paid';
    const paidAmount = isPaid ? grandTotal : (editingInvoice ? editingInvoice.paidAmount : 0);
    const balanceDue = Math.max(0, grandTotal - paidAmount);
    const finalStatus: Invoice['status'] = balanceDue === 0 ? 'paid' : (editingInvoice?.status === 'overdue' ? 'overdue' : 'pending');

    const invoicePayload = {
      invoiceNumber: invoiceNumber.trim() || 'INV-1000',
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      clientCompany: selectedClient.company,
      clientAddress: `${selectedClient.address}, ${selectedClient.cityState}`.trim(),
      clientPhone: selectedClient.phone,
      clientEmail: selectedClient.email,
      clientTaxNumber: selectedClient.taxNumber,
      date,
      dueDate,
      items,
      subtotal,
      discountType,
      discountValue,
      discountAmount,
      taxRate,
      taxAmount,
      totalAmount: grandTotal,
      paidAmount,
      balanceDue,
      status: finalStatus,
      notes: notes.trim(),
    };

    let resultInvoice: Invoice;
    if (editingInvoice) {
      updateInvoice(editingInvoice.id, invoicePayload);
      resultInvoice = { ...editingInvoice, ...invoicePayload };
    } else {
      resultInvoice = addInvoice(invoicePayload);
    }

    handleClose();

    if (previewImmediately) {
      setPreviewInvoice(resultInvoice);
    }
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/70">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-neutral-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-600" />
              <span>{editingInvoice ? `Edit Invoice (${editingInvoice.invoiceNumber})` : 'Create New Invoice'}</span>
            </h2>
            <p className="text-xs text-neutral-500">
              Fill in client and service details to generate a bill in seconds.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-200/60 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs sm:text-sm">
          {/* Top row: Client select & Invoice metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-neutral-50/75 p-4 rounded-xl border border-neutral-200/70">
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Select Client *
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-900 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.company} ({c.name})
                  </option>
                ))}
              </select>
              {selectedClient && (
                <div className="mt-2 text-[11px] text-neutral-500 space-y-0.5">
                  <p className="truncate font-medium text-neutral-700">{selectedClient.company}</p>
                  <p className="truncate">{selectedClient.cityState || selectedClient.address}</p>
                  {selectedClient.taxNumber && <p className="font-mono">GST: {selectedClient.taxNumber}</p>}
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="INV-1025"
                className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg font-mono font-semibold text-neutral-900 focus:outline-none focus:border-emerald-500"
              />
              <div className="mt-3">
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Payment Status
                </label>
                <select
                  value={initialStatus}
                  onChange={(e) => setInitialStatus(e.target.value as 'pending' | 'paid')}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-900 font-medium focus:outline-none focus:border-emerald-500"
                >
                  <option value="pending">🟠 Pending (Payment awaited)</option>
                  <option value="paid">🟢 Paid (Money received)</option>
                </select>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Line items section */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-neutral-900 text-sm flex items-center gap-1.5">
                <Package className="w-4 h-4 text-neutral-500" />
                Products & Services
              </h3>
              <span className="text-[11px] text-neutral-500">
                You can choose a saved service or type directly
              </span>
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-left">
                <thead className="bg-neutral-50 text-neutral-500 text-[11px] font-semibold uppercase tracking-wider border-b border-neutral-200">
                  <tr>
                    <th className="px-3 py-2.5 w-1/2">Description / Service</th>
                    <th className="px-3 py-2.5 w-20 text-center">Qty</th>
                    <th className="px-3 py-2.5 w-28 text-right">Price ({businessProfile.currencySymbol})</th>
                    <th className="px-3 py-2.5 w-28 text-right">Amount</th>
                    <th className="px-2 py-2.5 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-neutral-50/50">
                      <td className="p-2.5">
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            placeholder="e.g. Website Design & Development"
                            value={item.description}
                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            className="w-full px-2.5 py-1.5 bg-neutral-50 focus:bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-emerald-500 font-medium"
                          />
                          {products.length > 0 && (
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                              <span className="text-neutral-400">Quick fill:</span>
                              <select
                                onChange={(e) => {
                                  if (e.target.value) {
                                    handleSelectPresetProduct(index, e.target.value);
                                    e.target.value = '';
                                  }
                                }}
                                className="bg-transparent text-emerald-700 hover:text-emerald-800 font-medium focus:outline-none cursor-pointer text-[11px]"
                              >
                                <option value="">Select saved service...</option>
                                {products.map(p => (
                                  <option key={p.id} value={p.id}>
                                    {p.name} ({formatCurrency(p.defaultPrice, businessProfile.currencySymbol)})
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="p-2.5 align-top">
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 text-center bg-neutral-50 focus:bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-emerald-500"
                        />
                      </td>
                      <td className="p-2.5 align-top">
                        <input
                          type="number"
                          min="0"
                          value={item.price}
                          onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                          className="w-full px-2 py-1.5 text-right bg-neutral-50 focus:bg-white border border-neutral-200 rounded-lg text-neutral-900 focus:outline-none focus:border-emerald-500 font-mono"
                        />
                      </td>
                      <td className="p-2.5 align-top text-right font-bold text-neutral-900 font-mono pt-3.5">
                        {formatCurrency(item.amount, businessProfile.currencySymbol)}
                      </td>
                      <td className="p-2.5 align-top text-center pt-3">
                        <button
                          type="button"
                          onClick={() => removeItemRow(index)}
                          disabled={items.length <= 1}
                          className={`p-1 rounded-md text-neutral-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer ${
                            items.length <= 1 ? 'opacity-30 cursor-not-allowed' : ''
                          }`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="p-2.5 bg-neutral-50 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={addItemRow}
                  className="px-3 py-1.5 bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Item</span>
                </button>
              </div>
            </div>
          </div>

          {/* Bottom section: Notes (left) and Totals breakdown (right) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
            {/* Notes & Terms */}
            <div>
              <label className="block text-xs font-semibold text-neutral-700 mb-1">
                Invoice Notes & Payment Instructions
              </label>
              <textarea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Thank you for your business! Payment terms, bank account info, or UPI details..."
                className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
              />
              <p className="text-[11px] text-neutral-400 mt-1">
                This note will appear at the bottom of the printable invoice.
              </p>
            </div>

            {/* Totals Calculation Card */}
            <div className="bg-neutral-50/80 p-4 rounded-xl border border-neutral-200 space-y-2.5">
              {/* Subtotal */}
              <div className="flex items-center justify-between text-xs sm:text-sm text-neutral-600">
                <span>Subtotal</span>
                <span className="font-semibold text-neutral-900 font-mono">
                  {formatCurrency(subtotal, businessProfile.currencySymbol)}
                </span>
              </div>

              {/* Discount */}
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1 text-neutral-600">
                  <span>Discount</span>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percentage' | 'fixed')}
                    className="text-[11px] bg-white border border-neutral-200 rounded px-1 py-0.5"
                  >
                    <option value="percentage">%</option>
                    <option value="fixed">{businessProfile.currencySymbol}</option>
                  </select>
                </div>
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    value={discountValue || ''}
                    onChange={(e) => setDiscountValue(Number(e.target.value))}
                    placeholder="0"
                    className="w-16 px-1.5 py-0.5 text-right bg-white border border-neutral-200 rounded text-xs"
                  />
                  <span className="text-neutral-500 font-mono w-20 text-right">
                    -{formatCurrency(discountAmount, businessProfile.currencySymbol)}
                  </span>
                </div>
              </div>

              {/* Tax / GST */}
              <div className="flex items-center justify-between gap-2 text-xs sm:text-sm">
                <div className="flex items-center gap-1 text-neutral-600">
                  <span>Tax / GST</span>
                  <select
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="text-[11px] bg-white border border-neutral-200 rounded px-1 py-0.5"
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18% (Standard GST)</option>
                    <option value="28">28%</option>
                  </select>
                </div>
                <span className="font-semibold text-neutral-900 font-mono">
                  +{formatCurrency(taxAmount, businessProfile.currencySymbol)}
                </span>
              </div>

              <div className="pt-2 border-t border-neutral-200 flex items-center justify-between">
                <span className="text-sm font-bold text-neutral-900">Total Amount</span>
                <span className="text-base sm:text-lg font-black text-emerald-800 font-mono">
                  {formatCurrency(grandTotal, businessProfile.currencySymbol)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-neutral-200 bg-neutral-50 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 bg-white border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSave(true)}
              className="px-4 py-2.5 bg-white border border-emerald-600 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Save & Preview</span>
            </button>
            <button
              type="button"
              onClick={() => handleSave(false)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Invoice</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
