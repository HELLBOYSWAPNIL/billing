import React, { useState } from 'react';
import { 
  CreditCard, 
  Plus, 
  Search, 
  CheckCircle, 
  Clock, 
  X, 
  Calendar, 
  ArrowDownRight,
  TrendingUp
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatCurrency, formatDate } from '../utils';

export const PaymentsView: React.FC = () => {
  const { 
    payments, 
    invoices, 
    businessProfile, 
    recordPayment,
    dashboardSummary 
  } = useBilling();

  const [search, setSearch] = useState('');
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

  // Form states
  const [selectedInvoiceId, setSelectedInvoiceId] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [method, setMethod] = useState<'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Card'>('UPI');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [refNo, setRefNo] = useState('');
  const [notes, setNotes] = useState('');

  const pendingInvoices = invoices.filter(inv => inv.status !== 'paid');

  const openRecordModal = (invoiceId?: string) => {
    const inv = invoiceId ? invoices.find(i => i.id === invoiceId) : pendingInvoices[0];
    if (inv) {
      setSelectedInvoiceId(inv.id);
      setAmount(inv.balanceDue || inv.totalAmount);
    } else {
      setSelectedInvoiceId('');
      setAmount(0);
    }
    setDate(new Date().toISOString().split('T')[0]);
    setMethod('UPI');
    setRefNo('');
    setNotes('');
    setIsRecordModalOpen(true);
  };

  const handleInvoiceChange = (id: string) => {
    setSelectedInvoiceId(id);
    const inv = invoices.find(i => i.id === id);
    if (inv) {
      setAmount(inv.balanceDue || inv.totalAmount);
    }
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoiceId || amount <= 0) return;

    recordPayment({
      invoiceId: selectedInvoiceId,
      amount: Number(amount),
      method,
      date,
      referenceNumber: refNo.trim(),
      notes: notes.trim(),
    });

    setIsRecordModalOpen(false);
  };

  const trimmed = search.trim().toLowerCase();
  const filteredPayments = payments.filter(p => 
    p.invoiceNumber.toLowerCase().includes(trimmed) ||
    p.clientCompany.toLowerCase().includes(trimmed) ||
    p.clientName.toLowerCase().includes(trimmed) ||
    p.method.toLowerCase().includes(trimmed) ||
    (p.referenceNumber && p.referenceNumber.toLowerCase().includes(trimmed))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Payment Tracking
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Log received payments and track outstanding client balances automatically.
          </p>
        </div>

        <button
          id="btn-record-payment"
          onClick={() => openRecordModal()}
          disabled={pendingInvoices.length === 0}
          className={`inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto ${
            pendingInvoices.length === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
        </button>
      </div>

      {/* KPI Cards for payments */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block mb-1">
            Total Received
          </span>
          <div className="text-xl sm:text-2xl font-bold text-emerald-700">
            {formatCurrency(dashboardSummary.paidAmount, businessProfile.currencySymbol)}
          </div>
          <p className="text-[11px] text-emerald-600 mt-1 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Across {payments.length} payment records</span>
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block mb-1">
            Pending Collection
          </span>
          <div className="text-xl sm:text-2xl font-bold text-amber-700">
            {formatCurrency(dashboardSummary.pendingAmount, businessProfile.currencySymbol)}
          </div>
          <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{pendingInvoices.length} invoices awaiting payment</span>
          </p>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
            Overdue Amount
          </span>
          <div className="text-xl sm:text-2xl font-bold text-rose-700">
            {formatCurrency(dashboardSummary.overdueAmount, businessProfile.currencySymbol)}
          </div>
          <p className="text-[11px] text-rose-600 mt-1">
            Needs follow-up with clients
          </p>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by invoice number, company, payment method, or transaction reference..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-emerald-500 shadow-xs"
        />
      </div>

      {/* Payments Ledger Table */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Payments History</h2>
            <p className="text-xs text-neutral-500">Every recorded payment transaction</p>
          </div>
          <span className="text-xs font-bold text-neutral-500">
            {filteredPayments.length} records
          </span>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            <CreditCard className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-800">No payment records found</h3>
            <p className="mt-1">When clients pay their invoices, record payments here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-50/75 text-neutral-500 text-[11px] uppercase tracking-wider font-semibold border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Invoice #</th>
                  <th className="px-5 py-3.5">Client Company</th>
                  <th className="px-5 py-3.5">Method</th>
                  <th className="px-5 py-3.5">Reference ID</th>
                  <th className="px-5 py-3.5 text-right">Amount Received</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredPayments.map(pay => (
                  <tr key={pay.id} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-5 py-3.5 text-neutral-700 font-medium">
                      {formatDate(pay.date)}
                    </td>
                    <td className="px-5 py-3.5 font-bold font-mono text-neutral-900">
                      {pay.invoiceNumber}
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-neutral-900">{pay.clientCompany}</p>
                      <p className="text-[11px] text-neutral-500">{pay.clientName}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2.5 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-xs font-semibold">
                        {pay.method}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-xs text-neutral-500">
                      {pay.referenceNumber || '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-emerald-700 font-mono text-sm sm:text-base">
                      +{formatCurrency(pay.amount, businessProfile.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                <span>Record Client Payment</span>
              </h2>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Select Pending Invoice *
                </label>
                <select
                  value={selectedInvoiceId}
                  onChange={(e) => handleInvoiceChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  {pendingInvoices.map(inv => (
                    <option key={inv.id} value={inv.id}>
                      {inv.invoiceNumber} — {inv.clientCompany} (Pending: {formatCurrency(inv.balanceDue || inv.totalAmount, businessProfile.currencySymbol)})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Amount Received ({businessProfile.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono font-bold text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Payment Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={method}
                  onChange={(e) => setMethod(e.target.value as any)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 font-medium focus:bg-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="UPI">UPI (GPay / PhonePe / Paytm)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT / RTGS / IMPS)</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Card">Debit / Credit Card</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Reference / Transaction Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI/39102948120 or CHQ-92810"
                  value={refNo}
                  onChange={(e) => setRefNo(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Payment Notes (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cleared via bank app, partial payment..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
