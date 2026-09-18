import React from 'react';
import { 
  PlusCircle, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  Users, 
  FileText, 
  ArrowUpRight, 
  AlertCircle,
  Eye,
  Check
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatCurrency, formatDate, getDaysDifference } from '../utils';
import { Invoice } from '../types';

export const DashboardView: React.FC = () => {
  const { 
    dashboardSummary, 
    invoices, 
    businessProfile,
    setIsInvoiceFormOpen, 
    setEditingInvoice, 
    setPreviewInvoice, 
    setActiveTab,
    setSelectedClientId,
    markInvoiceAsPaid,
    reminders
  } = useBilling();

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setIsInvoiceFormOpen(true);
  };

  // Recent invoices (top 5 sorted by date)
  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Pending payments (invoices that are pending or overdue)
  const pendingInvoices = invoices
    .filter(inv => inv.status === 'pending' || inv.status === 'overdue')
    .slice(0, 4);

  // Dynamic greeting based on current local hour
  const currentHour = new Date().getHours();
  let timeGreeting = 'Good Morning';
  if (currentHour >= 12 && currentHour < 17) {
    timeGreeting = 'Good Afternoon';
  } else if (currentHour >= 17) {
    timeGreeting = 'Good Evening';
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Greeting & Create Invoice Hero */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <span>{timeGreeting}, {businessProfile.ownerName}</span>
            <span className="text-xl sm:text-2xl">👋</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Here is your financial summary and pending bills for today.
          </p>
        </div>

        <button
          id="btn-dashboard-hero-create"
          onClick={handleCreateInvoice}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Create Invoice</span>
        </button>
      </div>

      {/* Reminders / Alert Pill if any overdue */}
      {reminders.overdueCount > 0 && (
        <div 
          id="alert-overdue-banner"
          className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-900"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 shrink-0">
              <AlertCircle className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-rose-800">
                {reminders.overdueCount} {reminders.overdueCount === 1 ? 'Invoice is overdue' : 'Invoices are overdue'}
              </p>
              <p className="text-xs text-rose-600">
                Totaling {formatCurrency(dashboardSummary.overdueAmount, businessProfile.currencySymbol)} waiting to be collected.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('invoices')}
            className="text-xs font-semibold text-rose-800 underline hover:text-rose-900 cursor-pointer"
          >
            Review overdue bills →
          </button>
        </div>
      )}

      {/* Summary KPI Cards Grid (Matches user prompt table) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Invoiced */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Sales</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight">
            {formatCurrency(dashboardSummary.totalSales, businessProfile.currencySymbol)}
          </div>
          <p className="text-[11px] text-neutral-500 mt-1 flex items-center gap-1">
            <FileText className="w-3 h-3" />
            <span>Across {dashboardSummary.invoiceCount} invoices</span>
          </p>
        </div>

        {/* Received / Paid */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Received</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-emerald-700 tracking-tight">
            {formatCurrency(dashboardSummary.paidAmount, businessProfile.currencySymbol)}
          </div>
          <p className="text-[11px] text-emerald-700 mt-1">
            Money collected in full
          </p>
        </div>

        {/* Pending Amount */}
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Pending</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-amber-700 tracking-tight">
            {formatCurrency(dashboardSummary.pendingAmount, businessProfile.currencySymbol)}
          </div>
          <p className="text-[11px] text-amber-700 mt-1">
            Expected from active clients
          </p>
        </div>

        {/* Total Clients */}
        <div 
          onClick={() => setActiveTab('clients')}
          className="bg-white p-4 sm:p-5 rounded-xl border border-neutral-200/80 shadow-xs hover:border-neutral-300 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Clients</span>
            <div className="w-7 h-7 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-600 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-colors">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-neutral-900 tracking-tight flex items-center justify-between">
            <span>{dashboardSummary.clientCount}</span>
            <ArrowUpRight className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600" />
          </div>
          <p className="text-[11px] text-neutral-500 mt-1">
            Click to manage clients
          </p>
        </div>
      </div>

      {/* Two Column Layout: Recent Invoices & Pending Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Invoices */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Recent Invoices</h2>
              <p className="text-xs text-neutral-500">Your latest issued customer bills</p>
            </div>
            <button
              onClick={() => setActiveTab('invoices')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              View all invoices →
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {recentInvoices.map((inv: Invoice) => {
              const daysDiff = getDaysDifference(inv.dueDate);
              return (
                <div 
                  key={inv.id}
                  className="p-4 sm:px-5 hover:bg-neutral-50/70 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-start sm:items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-600 shrink-0 font-mono text-xs font-bold">
                      {inv.invoiceNumber.replace('INV-', '')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-neutral-900 text-sm">{inv.invoiceNumber}</span>
                        <span className="text-neutral-400 text-xs">—</span>
                        <button 
                          onClick={() => {
                            setSelectedClientId(inv.clientId);
                            setActiveTab('clients');
                          }}
                          className="font-medium text-neutral-700 text-sm hover:text-emerald-700 hover:underline text-left cursor-pointer"
                        >
                          {inv.clientCompany}
                        </button>
                      </div>
                      <div className="text-xs text-neutral-500 flex items-center gap-2 mt-0.5">
                        <span>Issued: {formatDate(inv.date)}</span>
                        <span>•</span>
                        <span>Due: {formatDate(inv.dueDate)}</span>
                        {inv.status === 'overdue' && (
                          <span className="text-rose-600 font-medium">({Math.abs(daysDiff)} days late)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <p className="font-bold text-neutral-900 text-sm sm:text-base">
                        {formatCurrency(inv.totalAmount, businessProfile.currencySymbol)}
                      </p>
                      <span className={`inline-block text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        inv.status === 'paid' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : inv.status === 'overdue'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {inv.status === 'paid' ? '🟢 Paid' : inv.status === 'overdue' ? '🔴 Overdue' : '🟠 Pending'}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        title="View & Print Bill"
                        onClick={() => setPreviewInvoice(inv)}
                        className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {inv.status !== 'paid' && (
                        <button
                          title="Mark as Paid"
                          onClick={() => markInvoiceAsPaid(inv.id)}
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Paid</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 1 Col: Pending Payments */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-neutral-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-neutral-900">Pending Payments</h2>
              <p className="text-xs text-neutral-500">Awaiting client settlement</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
              {pendingInvoices.length} Pending
            </span>
          </div>

          <div className="p-4 flex-1 divide-y divide-neutral-100">
            {pendingInvoices.length === 0 ? (
              <div className="py-8 text-center text-xs text-neutral-500">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                No pending bills. All clients are fully cleared!
              </div>
            ) : (
              pendingInvoices.map((inv: Invoice) => (
                <div key={inv.id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-neutral-900 text-xs truncate">
                      {inv.clientCompany}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      {inv.invoiceNumber} • Due {formatDate(inv.dueDate)}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-bold text-neutral-900 text-xs">
                      {formatCurrency(inv.balanceDue || inv.totalAmount, businessProfile.currencySymbol)}
                    </p>
                    <button
                      onClick={() => markInvoiceAsPaid(inv.id)}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 hover:underline block cursor-pointer mt-0.5"
                    >
                      Mark as Paid
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-neutral-50/70 border-t border-neutral-100">
            <div className="flex items-center justify-between text-xs font-semibold text-neutral-700">
              <span>Total Outstanding:</span>
              <span className="text-amber-700 font-bold text-sm">
                {formatCurrency(dashboardSummary.pendingAmount, businessProfile.currencySymbol)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
