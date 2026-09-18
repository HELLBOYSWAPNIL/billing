import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Bell, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  X,
  FileText,
  User,
  ExternalLink
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatCurrency, formatDate } from '../utils';

interface HeaderProps {
  setMobileOpen: (open: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({ setMobileOpen }) => {
  const { 
    clients, 
    invoices, 
    businessProfile,
    searchQuery, 
    setSearchQuery, 
    setIsInvoiceFormOpen, 
    setEditingInvoice, 
    setPreviewInvoice,
    setSelectedClientId,
    setActiveTab,
    reminders
  } = useBilling();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchResults(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered search results
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const matchedClients = trimmedQuery
    ? clients.filter(c => 
        c.name.toLowerCase().includes(trimmedQuery) ||
        c.company.toLowerCase().includes(trimmedQuery) ||
        c.phone.includes(trimmedQuery) ||
        (c.taxNumber && c.taxNumber.toLowerCase().includes(trimmedQuery))
      )
    : [];

  const matchedInvoices = trimmedQuery
    ? invoices.filter(inv =>
        inv.invoiceNumber.toLowerCase().includes(trimmedQuery) ||
        inv.clientCompany.toLowerCase().includes(trimmedQuery) ||
        inv.clientName.toLowerCase().includes(trimmedQuery)
      )
    : [];

  const totalMatches = matchedClients.length + matchedInvoices.length;

  const handleOpenClient = (clientId: string) => {
    setSelectedClientId(clientId);
    setActiveTab('clients');
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const handleOpenInvoice = (invoiceId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (inv) {
      setPreviewInvoice(inv);
    }
    setShowSearchResults(false);
    setSearchQuery('');
  };

  const totalAlerts = reminders.dueSoonCount + reminders.overdueCount;

  return (
    <header 
      id="app-header"
      className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200 px-4 sm:px-6 flex items-center justify-between gap-4 print:hidden"
    >
      {/* Left: Mobile menu toggle + breadcrumb/greeting */}
      <div className="flex items-center gap-3">
        <button
          id="btn-mobile-menu"
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:block">
          <h2 className="text-sm font-semibold text-neutral-900">
            {businessProfile.businessName}
          </h2>
          <p className="text-[11px] text-neutral-500">
            Welcome back, {businessProfile.ownerName}
          </p>
        </div>
      </div>

      {/* Middle: Universal Search */}
      <div ref={searchRef} className="flex-1 max-w-md relative">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            id="global-search-input"
            type="text"
            placeholder="Search client, company, invoice number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchResults(true);
            }}
            onFocus={() => setShowSearchResults(true)}
            className="w-full pl-9 pr-8 py-2 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 focus:border-emerald-500 rounded-lg text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Search Results Dropdown */}
        {showSearchResults && trimmedQuery && (
          <div 
            id="search-results-dropdown"
            className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-neutral-200 rounded-xl shadow-lg z-50 max-h-96 overflow-y-auto divide-y divide-neutral-100"
          >
            {totalMatches === 0 ? (
              <div className="p-4 text-center text-sm text-neutral-500">
                No matching clients or invoices found for "{searchQuery}"
              </div>
            ) : (
              <>
                {/* Matched Clients */}
                {matchedClients.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Clients ({matchedClients.length})
                    </p>
                    {matchedClients.map(client => (
                      <button
                        key={client.id}
                        onClick={() => handleOpenClient(client.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-sm group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <User className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600" />
                          <div>
                            <p className="font-medium text-neutral-900">{client.company}</p>
                            <p className="text-xs text-neutral-500">{client.name} • {client.phone}</p>
                          </div>
                        </div>
                        <span className="text-xs text-emerald-600 font-medium opacity-0 group-hover:opacity-100 flex items-center gap-1">
                          View profile <ExternalLink className="w-3 h-3" />
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Matched Invoices */}
                {matchedInvoices.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Invoices ({matchedInvoices.length})
                    </p>
                    {matchedInvoices.map(inv => (
                      <button
                        key={inv.id}
                        onClick={() => handleOpenInvoice(inv.id)}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-neutral-50 flex items-center justify-between text-sm group cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <FileText className="w-4 h-4 text-neutral-400 group-hover:text-emerald-600" />
                          <div>
                            <p className="font-medium text-neutral-900 flex items-center gap-2">
                              <span>{inv.invoiceNumber}</span>
                              <span className="text-xs font-normal text-neutral-500">• {inv.clientCompany}</span>
                            </p>
                            <p className="text-xs text-neutral-500">{formatDate(inv.date)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-neutral-900">{formatCurrency(inv.totalAmount, businessProfile.currencySymbol)}</p>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            inv.status === 'paid' ? 'bg-emerald-100 text-emerald-800' :
                            inv.status === 'overdue' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                          }`}>
                            {inv.status.toUpperCase()}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Notifications & Reminders Bell */}
        <div ref={notifRef} className="relative">
          <button
            id="btn-notifications-bell"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Reminders"
          >
            <Bell className="w-5 h-5" />
            {totalAlerts > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white animate-pulse" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div 
              id="notifications-popover"
              className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-neutral-200 rounded-xl shadow-xl z-50 p-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                <h4 className="font-semibold text-neutral-900 text-sm flex items-center gap-2">
                  <Bell className="w-4 h-4 text-emerald-600" />
                  Reminders & Alerts
                </h4>
                <span className="text-xs text-neutral-500">
                  {totalAlerts} active
                </span>
              </div>

              <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto">
                {reminders.overdueCount > 0 && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-xs text-rose-900 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-800">
                        ⚠️ {reminders.overdueCount} {reminders.overdueCount === 1 ? 'invoice is' : 'invoices are'} overdue
                      </p>
                      <p className="text-rose-700 mt-0.5">
                        Follow up with clients to collect pending dues.
                      </p>
                    </div>
                  </div>
                )}

                {reminders.dueSoonCount > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-900 flex items-start gap-2.5">
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800">
                        🔔 {reminders.dueSoonCount} {reminders.dueSoonCount === 1 ? 'invoice is' : 'invoices are'} due this week
                      </p>
                      <p className="text-amber-700 mt-0.5">
                        Payments expected in the next few days.
                      </p>
                    </div>
                  </div>
                )}

                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs text-emerald-900 flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-emerald-800">
                      ✅ Recent payment cleared
                    </p>
                    <p className="text-emerald-700 mt-0.5">
                      ₹15,000 received from ABC Enterprises.
                    </p>
                  </div>
                </div>

                {totalAlerts === 0 && (
                  <p className="text-center text-xs text-neutral-500 py-3">
                    All set! No overdue or pending deadlines right now.
                  </p>
                )}
              </div>

              <div className="mt-3 pt-2 border-t border-neutral-100 text-center">
                <button
                  onClick={() => {
                    setActiveTab('invoices');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                >
                  View all invoices →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Header Create Invoice Button */}
        <button
          id="btn-header-create-invoice"
          onClick={() => {
            setEditingInvoice(null);
            setIsInvoiceFormOpen(true);
          }}
          className="hidden sm:flex items-center gap-1.5 py-2 px-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Invoice</span>
        </button>
      </div>
    </header>
  );
};
