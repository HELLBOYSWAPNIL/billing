import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Filter, 
  Clock, 
  Calendar,
  Printer,
  ChevronDown
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatCurrency, formatDate, getDaysDifference } from '../utils';
import { Invoice, InvoiceStatus } from '../types';

export const InvoicesView: React.FC = () => {
  const { 
    invoices, 
    clients, 
    businessProfile,
    setIsInvoiceFormOpen, 
    setEditingInvoice, 
    setPreviewInvoice, 
    markInvoiceAsPaid, 
    deleteInvoice,
    setRecordPaymentForInvoice
  } = useBilling();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvoiceStatus>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setIsInvoiceFormOpen(true);
  };

  const handleEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setIsInvoiceFormOpen(true);
  };

  const handleDeleteInvoice = (inv: Invoice) => {
    if (window.confirm(`Are you sure you want to delete invoice ${inv.invoiceNumber}?`)) {
      deleteInvoice(inv.id);
    }
  };

  // Filter and sort invoices
  const trimmedSearch = search.trim().toLowerCase();
  const filtered = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNumber.toLowerCase().includes(trimmedSearch) ||
      inv.clientCompany.toLowerCase().includes(trimmedSearch) ||
      inv.clientName.toLowerCase().includes(trimmedSearch);

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesClient = clientFilter === 'all' || inv.clientId === clientFilter;

    return matchesSearch && matchesStatus && matchesClient;
  }).sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
    if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
    if (sortBy === 'amount-desc') return b.totalAmount - a.totalAmount;
    if (sortBy === 'amount-asc') return a.totalAmount - b.totalAmount;
    return 0;
  });

  const countPaid = invoices.filter(i => i.status === 'paid').length;
  const countPending = invoices.filter(i => i.status === 'pending').length;
  const countOverdue = invoices.filter(i => i.status === 'overdue').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Invoices
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Create, view, download, print, and track payments for all customer bills.
          </p>
        </div>

        <button
          id="btn-invoices-create-new"
          onClick={handleCreateInvoice}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Invoice</span>
        </button>
      </div>

      {/* Filter Tabs & Quick Stats Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 sm:p-4 rounded-xl border border-neutral-200/80 shadow-xs">
        {/* Status pill selectors */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-neutral-900 text-white'
                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            All ({invoices.length})
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'paid'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            🟢 Paid ({countPaid})
          </button>
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            🟠 Pending ({countPending})
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            🔴 Overdue ({countOverdue})
          </button>
        </div>

        {/* Client filter dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={clientFilter}
            onChange={(e) => setClientFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.company}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-2.5 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-700 font-medium focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="date-desc">Newest Date</option>
            <option value="date-asc">Oldest Date</option>
            <option value="amount-desc">Highest Amount</option>
            <option value="amount-asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search by invoice number (e.g. INV-1025), client name, or company..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-emerald-500 shadow-xs"
        />
      </div>

      {/* Invoices Table (Section 5 in prompt) */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-neutral-500">
            <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-neutral-800">No invoices match your filter</h3>
            <p className="mt-1">Try adjusting the search query or status filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-50/75 text-neutral-500 text-[11px] uppercase tracking-wider font-semibold border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3.5">Invoice</th>
                  <th className="px-5 py-3.5">Client</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Due Date</th>
                  <th className="px-5 py-3.5 text-right">Amount</th>
                  <th className="px-5 py-3.5 text-center">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filtered.map(inv => {
                  const daysDiff = getDaysDifference(inv.dueDate);
                  return (
                    <tr key={inv.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Invoice Number */}
                      <td className="px-5 py-3.5 font-bold text-neutral-900 font-mono">
                        {inv.invoiceNumber}
                      </td>

                      {/* Client */}
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-neutral-900">{inv.clientCompany}</p>
                        <p className="text-[11px] text-neutral-500">{inv.clientName}</p>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-3.5 text-neutral-600">
                        {formatDate(inv.date)}
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-3.5 text-neutral-600">
                        <span>{formatDate(inv.dueDate)}</span>
                        {inv.status === 'overdue' && (
                          <span className="block text-[10px] text-rose-600 font-semibold">
                            {Math.abs(daysDiff)} days late
                          </span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="px-5 py-3.5 text-right font-bold text-neutral-900 font-mono text-sm">
                        {formatCurrency(inv.totalAmount, businessProfile.currencySymbol)}
                        {inv.paidAmount > 0 && inv.status !== 'paid' && (
                          <span className="block text-[10px] text-neutral-500 font-normal">
                            Bal: {formatCurrency(inv.balanceDue, businessProfile.currencySymbol)}
                          </span>
                        )}
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-3.5 text-center">
                        <span className={`inline-block text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status === 'paid' ? '🟢 Paid' : inv.status === 'overdue' ? '🔴 Overdue' : '🟠 Pending'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setPreviewInvoice(inv)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                            title="View, Print & Share"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => markInvoiceAsPaid(inv.id)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                              title="Mark full payment received"
                            >
                              Mark Paid
                            </button>
                          )}

                          <button
                            onClick={() => handleEditInvoice(inv)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteInvoice(inv)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
