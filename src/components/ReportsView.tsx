import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Building2,
  PieChart
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatCurrency } from '../utils';

type PeriodFilter = 'today' | 'week' | 'month' | 'year' | 'all';

export const ReportsView: React.FC = () => {
  const { 
    invoices, 
    clients, 
    businessProfile,
    setSelectedClientId,
    setActiveTab 
  } = useBilling();

  const [period, setPeriod] = useState<PeriodFilter>('month');

  // Filter invoices based on selected period
  const now = new Date();
  const filteredInvoices = invoices.filter(inv => {
    if (period === 'all') return true;

    const [y, m, d] = inv.date.split('-').map(Number);
    const invDate = new Date(y, m - 1, d);

    if (period === 'today') {
      return (
        invDate.getDate() === now.getDate() &&
        invDate.getMonth() === now.getMonth() &&
        invDate.getFullYear() === now.getFullYear()
      );
    }

    if (period === 'week') {
      const diffTime = now.getTime() - invDate.getTime();
      const diffDays = diffTime / (1000 * 3600 * 24);
      return diffDays >= 0 && diffDays <= 7;
    }

    if (period === 'month') {
      return (
        invDate.getMonth() === now.getMonth() &&
        invDate.getFullYear() === now.getFullYear()
      );
    }

    if (period === 'year') {
      return invDate.getFullYear() === now.getFullYear();
    }

    return true;
  });

  const totalInvoiced = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const totalReceived = filteredInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const totalPending = filteredInvoices.reduce((sum, inv) => sum + (inv.balanceDue ?? (inv.totalAmount - (inv.paidAmount || 0))), 0);
  const totalOverdue = filteredInvoices
    .filter(i => i.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.balanceDue ?? (inv.totalAmount - (inv.paidAmount || 0))), 0);

  const countPaid = filteredInvoices.filter(i => i.status === 'paid').length;
  const countPending = filteredInvoices.filter(i => i.status === 'pending').length;
  const countOverdue = filteredInvoices.filter(i => i.status === 'overdue').length;

  // Client-wise Sales breakdown
  const clientSalesMap: { [clientId: string]: { billed: number; received: number; pending: number; count: number } } = {};
  filteredInvoices.forEach(inv => {
    if (!clientSalesMap[inv.clientId]) {
      clientSalesMap[inv.clientId] = { billed: 0, received: 0, pending: 0, count: 0 };
    }
    clientSalesMap[inv.clientId].billed += inv.totalAmount;
    clientSalesMap[inv.clientId].received += (inv.paidAmount || 0);
    clientSalesMap[inv.clientId].pending += (inv.balanceDue ?? (inv.totalAmount - (inv.paidAmount || 0)));
    clientSalesMap[inv.clientId].count += 1;
  });

  const clientSalesList = Object.entries(clientSalesMap).map(([clientId, data]) => {
    const client = clients.find(c => c.id === clientId);
    return {
      clientId,
      company: client?.company || 'Unknown Client',
      name: client?.name || '',
      ...data,
    };
  }).sort((a, b) => b.billed - a.billed);

  const getPeriodLabel = () => {
    switch (period) {
      case 'today': return 'Today';
      case 'week': return 'This Week (Past 7 Days)';
      case 'month': return 'This Month';
      case 'year': return 'This Year';
      case 'all': return 'All Time';
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Simple Reports
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Clear summaries of what was invoiced, what was collected, and who owes what.
          </p>
        </div>

        {/* Period Selector (Section 11 in prompt) */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200 shadow-xs self-start sm:self-auto overflow-x-auto">
          {(['today', 'week', 'month', 'year', 'all'] as PeriodFilter[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer whitespace-nowrap ${
                period === p
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              {p === 'all' ? 'All Time' : p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : p === 'year' ? 'This Year' : 'Today'}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Blocks */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Sales */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-neutral-500 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Invoiced</span>
            <TrendingUp className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-neutral-900 font-mono">
            {formatCurrency(totalInvoiced, businessProfile.currencySymbol)}
          </div>
          <span className="text-[11px] text-neutral-500 mt-1 block">
            {filteredInvoices.length} bills in {getPeriodLabel()}
          </span>
        </div>

        {/* Payments Received */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-emerald-700 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Received</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
            {formatCurrency(totalReceived, businessProfile.currencySymbol)}
          </div>
          <span className="text-[11px] text-emerald-700 mt-1 block">
            {totalInvoiced > 0 ? `${Math.round((totalReceived / totalInvoiced) * 100)}% collection rate` : 'No bills'}
          </span>
        </div>

        {/* Pending Payments */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-amber-700 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700 font-mono">
            {formatCurrency(totalPending, businessProfile.currencySymbol)}
          </div>
          <span className="text-[11px] text-amber-700 mt-1 block">
            {countPending + countOverdue} unpaid bills
          </span>
        </div>

        {/* Overdue Amount */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
          <div className="flex items-center justify-between text-rose-700 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue</span>
            <AlertCircle className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700 font-mono">
            {formatCurrency(totalOverdue, businessProfile.currencySymbol)}
          </div>
          <span className="text-[11px] text-rose-700 mt-1 block">
            {countOverdue} bills past due date
          </span>
        </div>
      </div>

      {/* Invoice Status Distribution Summary */}
      <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-xs">
        <h2 className="text-sm font-bold text-neutral-900 uppercase tracking-wider mb-4">
          Invoice Status Breakdown ({getPeriodLabel()})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-emerald-800 font-semibold">🟢 Fully Paid</p>
              <p className="text-xl font-bold text-emerald-900 mt-1">{countPaid} Invoices</p>
            </div>
            <span className="text-xs font-bold text-emerald-700">
              {formatCurrency(totalReceived, businessProfile.currencySymbol)}
            </span>
          </div>

          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-amber-800 font-semibold">🟠 Pending Payment</p>
              <p className="text-xl font-bold text-amber-900 mt-1">{countPending} Invoices</p>
            </div>
            <span className="text-xs font-bold text-amber-700">
              {formatCurrency(totalPending - totalOverdue, businessProfile.currencySymbol)}
            </span>
          </div>

          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs text-rose-800 font-semibold">🔴 Overdue</p>
              <p className="text-xl font-bold text-rose-900 mt-1">{countOverdue} Invoices</p>
            </div>
            <span className="text-xs font-bold text-rose-700">
              {formatCurrency(totalOverdue, businessProfile.currencySymbol)}
            </span>
          </div>
        </div>
      </div>

      {/* Client-wise Sales Table (Section 11 in prompt) */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-neutral-900">Client-wise Sales Breakdown</h2>
            <p className="text-xs text-neutral-500">How much has been billed to each client during {getPeriodLabel()}</p>
          </div>
          <span className="text-xs font-bold text-neutral-500">
            {clientSalesList.length} Active Clients
          </span>
        </div>

        {clientSalesList.length === 0 ? (
          <div className="p-10 text-center text-xs text-neutral-500">
            No billing records found in this timeframe.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-neutral-50/75 text-neutral-500 text-[11px] uppercase tracking-wider font-semibold border-b border-neutral-200">
                <tr>
                  <th className="px-5 py-3.5">Client / Business</th>
                  <th className="px-5 py-3.5 text-center">Bills</th>
                  <th className="px-5 py-3.5 text-right">Total Billed</th>
                  <th className="px-5 py-3.5 text-right">Received</th>
                  <th className="px-5 py-3.5 text-right">Pending</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {clientSalesList.map(item => (
                  <tr key={item.clientId} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="font-bold text-neutral-900">{item.company}</p>
                      {item.name && <p className="text-[11px] text-neutral-500">{item.name}</p>}
                    </td>
                    <td className="px-5 py-3.5 text-center text-neutral-600 font-medium">
                      {item.count}
                    </td>
                    <td className="px-5 py-3.5 text-right font-bold text-neutral-900 font-mono">
                      {formatCurrency(item.billed, businessProfile.currencySymbol)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-emerald-700 font-mono">
                      {formatCurrency(item.received, businessProfile.currencySymbol)}
                    </td>
                    <td className="px-5 py-3.5 text-right font-semibold text-amber-700 font-mono">
                      {formatCurrency(item.pending, businessProfile.currencySymbol)}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setSelectedClientId(item.clientId);
                          setActiveTab('clients');
                        }}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer"
                      >
                        View Client Profile →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
