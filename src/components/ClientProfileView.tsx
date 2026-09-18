import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  Edit, 
  Trash2, 
  Clock, 
  CheckCircle, 
  Receipt,
  Eye,
  CreditCard
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatCurrency, formatDate } from '../utils';
import { Client, Invoice } from '../types';

interface ClientProfileViewProps {
  client: Client;
  onBack: () => void;
  onEditClient: (client: Client) => void;
}

export const ClientProfileView: React.FC<ClientProfileViewProps> = ({ 
  client, 
  onBack, 
  onEditClient 
}) => {
  const { 
    invoices, 
    payments, 
    businessProfile, 
    getClientFinancials, 
    setPreviewInvoice, 
    setIsInvoiceFormOpen, 
    setEditingInvoice, 
    deleteClient,
    markInvoiceAsPaid
  } = useBilling();

  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'payments'>('invoices');

  const financials = getClientFinancials(client.id);

  // Invoices for this specific client (Client Separation!)
  const clientInvoices = invoices.filter(inv => inv.clientId === client.id);
  const clientPayments = payments.filter(p => p.clientId === client.id);

  const handleCreateInvoiceForClient = () => {
    setEditingInvoice(null);
    setIsInvoiceFormOpen(true);
  };

  const handleDeleteClient = () => {
    if (window.confirm(`Are you sure you want to delete ${client.company}? All billing data will remain in history.`)) {
      deleteClient(client.id);
      onBack();
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top navigation / Back bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-lg border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                {client.company}
              </h1>
              {client.taxNumber && (
                <span className="text-[11px] px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-md font-mono">
                  {client.taxNumber}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-500">
              Contact Person: <span className="font-semibold text-neutral-700">{client.name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEditClient(client)}
            className="px-3 py-2 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Client</span>
          </button>
          <button
            onClick={handleDeleteClient}
            className="p-2 bg-white border border-neutral-200 hover:bg-rose-50 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
            title="Delete Client"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreateInvoiceForClient}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Create Invoice</span>
          </button>
        </div>
      </div>

      {/* Client Financial Summary Cards (Section 2 & 7 in prompt) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Billed */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block mb-1">
            Total Billed
          </span>
          <div className="text-lg sm:text-xl font-bold text-neutral-900">
            {formatCurrency(financials.totalBilled, businessProfile.currencySymbol)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {financials.invoiceCount} invoices generated
          </span>
        </div>

        {/* Received */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-emerald-700 uppercase tracking-wider block mb-1">
            Amount Received
          </span>
          <div className="text-lg sm:text-xl font-bold text-emerald-700">
            {formatCurrency(financials.received, businessProfile.currencySymbol)}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            {financials.paidCount} fully paid bills
          </span>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs">
          <span className="text-xs font-medium text-amber-700 uppercase tracking-wider block mb-1">
            Amount Pending
          </span>
          <div className="text-lg sm:text-xl font-bold text-amber-700">
            {formatCurrency(financials.pending, businessProfile.currencySymbol)}
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">
            {financials.pendingCount + financials.overdueCount} bills outstanding
          </span>
        </div>

        {/* Status indicator */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/80 shadow-xs flex flex-col justify-between">
          <span className="text-xs font-medium text-neutral-500 uppercase tracking-wider block">
            Account Balance
          </span>
          <div>
            {financials.pending === 0 ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md">
                <CheckCircle className="w-3.5 h-3.5" /> All Cleared
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-md">
                <Clock className="w-3.5 h-3.5" /> Payment Awaited
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Client Information Card */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <h3 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-3">
          Contact & Address Information
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="flex items-start gap-2.5">
            <Phone className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-neutral-500 text-xs">Phone Number</p>
              <p className="font-semibold text-neutral-900">{client.phone || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <Mail className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-neutral-500 text-xs">Email Address</p>
              <p className="font-semibold text-neutral-900">{client.email || '—'}</p>
            </div>
          </div>

          <div className="flex items-start gap-2.5">
            <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-neutral-500 text-xs">Billing Address</p>
              <p className="font-semibold text-neutral-900">
                {client.address ? `${client.address}, ${client.cityState}` : client.cityState || '—'}
              </p>
            </div>
          </div>
        </div>

        {client.notes && (
          <div className="mt-4 pt-3 border-t border-neutral-100 text-xs text-neutral-600">
            <span className="font-semibold text-neutral-800">Notes: </span>
            {client.notes}
          </div>
        )}
      </div>

      {/* Client's Invoices & Payments History */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="border-b border-neutral-100 flex items-center justify-between px-5 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveSubTab('invoices')}
              className={`pb-1 text-sm font-bold cursor-pointer border-b-2 transition-colors ${
                activeSubTab === 'invoices'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Invoices History ({clientInvoices.length})
            </button>
            <button
              onClick={() => setActiveSubTab('payments')}
              className={`pb-1 text-sm font-bold cursor-pointer border-b-2 transition-colors ${
                activeSubTab === 'payments'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-neutral-500 hover:text-neutral-800'
              }`}
            >
              Received Payments ({clientPayments.length})
            </button>
          </div>

          <button
            onClick={handleCreateInvoiceForClient}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Create bill
          </button>
        </div>

        {activeSubTab === 'invoices' ? (
          clientInvoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              <FileText className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              No invoices created for {client.company} yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50/75 text-neutral-500 text-[11px] uppercase tracking-wider font-semibold border-b border-neutral-100">
                  <tr>
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Due Date</th>
                    <th className="px-5 py-3 text-right">Amount</th>
                    <th className="px-5 py-3 text-right">Balance</th>
                    <th className="px-5 py-3 text-center">Status</th>
                    <th className="px-5 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {clientInvoices.map((inv: Invoice) => (
                    <tr key={inv.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-5 py-3 font-semibold text-neutral-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-5 py-3 text-neutral-600">
                        {formatDate(inv.date)}
                      </td>
                      <td className="px-5 py-3 text-neutral-600">
                        {formatDate(inv.dueDate)}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-neutral-900">
                        {formatCurrency(inv.totalAmount, businessProfile.currencySymbol)}
                      </td>
                      <td className="px-5 py-3 text-right text-neutral-600">
                        {formatCurrency(inv.balanceDue, businessProfile.currencySymbol)}
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                          inv.status === 'paid'
                            ? 'bg-emerald-100 text-emerald-800'
                            : inv.status === 'overdue'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {inv.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPreviewInvoice(inv)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-md cursor-pointer"
                            title="View & Print Bill"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {inv.status !== 'paid' && (
                            <button
                              onClick={() => markInvoiceAsPaid(inv.id)}
                              className="px-2 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold rounded-md cursor-pointer"
                            >
                              Mark Paid
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          clientPayments.length === 0 ? (
            <div className="p-8 text-center text-xs text-neutral-500">
              <CreditCard className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
              No recorded payments from {client.company} yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-neutral-50/75 text-neutral-500 text-[11px] uppercase tracking-wider font-semibold border-b border-neutral-100">
                  <tr>
                    <th className="px-5 py-3">Receipt Date</th>
                    <th className="px-5 py-3">Invoice</th>
                    <th className="px-5 py-3">Method</th>
                    <th className="px-5 py-3">Reference #</th>
                    <th className="px-5 py-3 text-right">Amount Received</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {clientPayments.map(pay => (
                    <tr key={pay.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="px-5 py-3 text-neutral-700 font-medium">
                        {formatDate(pay.date)}
                      </td>
                      <td className="px-5 py-3 font-semibold text-neutral-900">
                        {pay.invoiceNumber}
                      </td>
                      <td className="px-5 py-3 text-neutral-600">
                        <span className="px-2 py-0.5 bg-neutral-100 rounded-md text-xs font-medium text-neutral-700">
                          {pay.method}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-neutral-500 font-mono text-xs">
                        {pay.referenceNumber || '—'}
                      </td>
                      <td className="px-5 py-3 text-right font-bold text-emerald-700">
                        {formatCurrency(pay.amount, businessProfile.currencySymbol)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};
