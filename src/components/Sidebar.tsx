import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Package, 
  CreditCard, 
  BarChart3, 
  Settings, 
  PlusCircle,
  Receipt,
  X
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { ActiveTab } from '../types';

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, setMobileOpen }) => {
  const { 
    activeTab, 
    setActiveTab, 
    setIsInvoiceFormOpen, 
    setEditingInvoice, 
    setSelectedClientId,
    reminders,
    invoices
  } = useBilling();

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'clients') {
      setSelectedClientId(null);
    }
    setMobileOpen(false);
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setIsInvoiceFormOpen(true);
    setMobileOpen(false);
  };

  const pendingCount = invoices.filter(i => i.status === 'pending' || i.status === 'overdue').length;

  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number; badgeColor?: string }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'clients', label: 'Clients', icon: <Users className="w-5 h-5" /> },
    { 
      id: 'invoices', 
      label: 'Invoices', 
      icon: <FileText className="w-5 h-5" />,
      badge: pendingCount > 0 ? pendingCount : undefined,
      badgeColor: reminders.overdueCount > 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
    },
    { id: 'products', label: 'Products & Services', icon: <Package className="w-5 h-5" /> },
    { id: 'payments', label: 'Payments', icon: <CreditCard className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div 
          id="mobile-nav-backdrop"
          className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside 
        id="app-sidebar"
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-neutral-200 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } print:hidden`}
      >
        {/* Logo / Brand Header */}
        <div className="h-16 px-5 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-neutral-900 text-base tracking-tight block leading-tight">
                Simple Billing
              </span>
              <span className="text-[11px] text-neutral-500 font-medium leading-none block">
                Digital Billing Notebook
              </span>
            </div>
          </div>
          <button 
            id="btn-close-sidebar-mobile"
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action Button */}
        <div className="p-4 pb-2">
          <button
            id="btn-sidebar-create-invoice"
            onClick={handleCreateInvoice}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-sm font-semibold rounded-lg shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 shrink-0" />
            <span>+ Create Invoice</span>
          </button>
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-800 font-semibold'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={isActive ? 'text-emerald-700' : 'text-neutral-400'}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${item.badgeColor || 'bg-neutral-100 text-neutral-700'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User quick status footer */}
        <div className="p-4 border-t border-neutral-100 bg-neutral-50/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-800 flex items-center justify-center text-xs font-bold">
              SW
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-neutral-800 truncate">Swapnil</p>
              <p className="text-[11px] text-neutral-500 truncate">swapnilshetty46@gmail.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
