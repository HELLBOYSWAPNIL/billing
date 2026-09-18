import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ActiveTab, 
  BusinessProfile, 
  Client, 
  Invoice, 
  Payment, 
  ProductService 
} from '../types';
import { 
  initialBusinessProfile, 
  initialClients, 
  initialInvoices, 
  initialPayments, 
  initialProducts 
} from '../sampleData';
import { generateId, getDaysDifference } from '../utils';

interface ClientFinancials {
  totalBilled: number;
  received: number;
  pending: number;
  invoiceCount: number;
  paidCount: number;
  pendingCount: number;
  overdueCount: number;
}

interface BillingContextType {
  // State
  clients: Client[];
  invoices: Invoice[];
  payments: Payment[];
  products: ProductService[];
  businessProfile: BusinessProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  
  // Navigation & Modals
  selectedClientId: string | null;
  setSelectedClientId: (id: string | null) => void;
  previewInvoice: Invoice | null;
  setPreviewInvoice: (invoice: Invoice | null) => void;
  isInvoiceFormOpen: boolean;
  setIsInvoiceFormOpen: (open: boolean) => void;
  editingInvoice: Invoice | null;
  setEditingInvoice: (invoice: Invoice | null) => void;
  recordPaymentForInvoice: Invoice | null;
  setRecordPaymentForInvoice: (invoice: Invoice | null) => void;
  
  // Global search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Actions
  addClient: (client: Omit<Client, 'id' | 'createdAt'>) => Client;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;

  addInvoice: (invoiceData: Omit<Invoice, 'id' | 'createdAt'>) => Invoice;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;

  recordPayment: (paymentData: {
    invoiceId: string;
    amount: number;
    method: 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Card';
    date: string;
    referenceNumber?: string;
    notes?: string;
  }) => void;
  markInvoiceAsPaid: (invoiceId: string, method?: 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Card') => void;

  addProduct: (product: Omit<ProductService, 'id'>) => void;
  updateProduct: (id: string, updates: Partial<ProductService>) => void;
  deleteProduct: (id: string) => void;

  updateBusinessProfile: (updates: Partial<BusinessProfile>) => void;
  resetToSampleData: () => void;

  // Computed
  getClientFinancials: (clientId: string) => ClientFinancials;
  dashboardSummary: {
    totalSales: number;
    paidAmount: number;
    pendingAmount: number;
    overdueAmount: number;
    invoiceCount: number;
    clientCount: number;
  };
  reminders: {
    dueSoonCount: number;
    overdueCount: number;
    dueSoonInvoices: Invoice[];
    overdueInvoices: Invoice[];
  };
}

const STORAGE_KEYS = {
  CLIENTS: 'simple_billing_clients_v1',
  INVOICES: 'simple_billing_invoices_v1',
  PAYMENTS: 'simple_billing_payments_v1',
  PRODUCTS: 'simple_billing_products_v1',
  PROFILE: 'simple_billing_profile_v1',
};

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const BillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Clients state
  const [clients, setClients] = useState<Client[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return saved ? JSON.parse(saved) : initialClients;
    } catch {
      return initialClients;
    }
  });

  // Invoices state
  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return saved ? JSON.parse(saved) : initialInvoices;
    } catch {
      return initialInvoices;
    }
  });

  // Payments state
  const [payments, setPayments] = useState<Payment[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
      return saved ? JSON.parse(saved) : initialPayments;
    } catch {
      return initialPayments;
    }
  });

  // Products state
  const [products, setProducts] = useState<ProductService[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : initialProducts;
    } catch {
      return initialProducts;
    }
  });

  // Business profile state
  const [businessProfile, setBusinessProfile] = useState<BusinessProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : initialBusinessProfile;
    } catch {
      return initialBusinessProfile;
    }
  });

  // UI state
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [previewInvoice, setPreviewInvoice] = useState<Invoice | null>(null);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [recordPaymentForInvoice, setRecordPaymentForInvoice] = useState<Invoice | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Persist whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
    } catch (e) {
      console.error(e);
    }
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
    } catch (e) {
      console.error(e);
    }
  }, [invoices]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
    } catch (e) {
      console.error(e);
    }
  }, [payments]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
    } catch (e) {
      console.error(e);
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(businessProfile));
    } catch (e) {
      console.error(e);
    }
  }, [businessProfile]);

  // Client actions
  const addClient = (clientData: Omit<Client, 'id' | 'createdAt'>): Client => {
    const newClient: Client = {
      ...clientData,
      id: generateId('client'),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setClients(prev => [newClient, ...prev]);
    return newClient;
  };

  const updateClient = (id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
    // Also update cached client info on invoices if name/company changed
    if (updates.name || updates.company || updates.address) {
      setInvoices(prev => prev.map(inv => {
        if (inv.clientId === id) {
          return {
            ...inv,
            clientName: updates.name || inv.clientName,
            clientCompany: updates.company || inv.clientCompany,
            clientAddress: updates.address || inv.clientAddress,
            clientPhone: updates.phone ?? inv.clientPhone,
            clientEmail: updates.email ?? inv.clientEmail,
            clientTaxNumber: updates.taxNumber ?? inv.clientTaxNumber,
          };
        }
        return inv;
      }));
    }
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    if (selectedClientId === id) {
      setSelectedClientId(null);
    }
  };

  // Invoice actions
  const addInvoice = (invoiceData: Omit<Invoice, 'id' | 'createdAt'>): Invoice => {
    const newInvoice: Invoice = {
      ...invoiceData,
      id: generateId('inv'),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setInvoices(prev => [newInvoice, ...prev]);

    // If initial status was paid and had paidAmount, log a payment
    if (newInvoice.paidAmount > 0) {
      const payment: Payment = {
        id: generateId('pay'),
        invoiceId: newInvoice.id,
        invoiceNumber: newInvoice.invoiceNumber,
        clientId: newInvoice.clientId,
        clientName: newInvoice.clientName,
        clientCompany: newInvoice.clientCompany,
        date: newInvoice.date,
        amount: newInvoice.paidAmount,
        method: 'UPI',
        notes: 'Initial payment recorded with invoice creation',
        createdAt: new Date().toISOString().split('T')[0],
      };
      setPayments(prev => [payment, ...prev]);
    }

    return newInvoice;
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        const updated = { ...inv, ...updates };
        // Recalculate status if balance changes
        if (updated.balanceDue <= 0 && updated.totalAmount > 0) {
          updated.status = 'paid';
        }
        return updated;
      }
      return inv;
    }));
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
    setPayments(prev => prev.filter(p => p.invoiceId !== id));
    if (previewInvoice?.id === id) setPreviewInvoice(null);
  };

  // Payment actions
  const recordPayment = (data: {
    invoiceId: string;
    amount: number;
    method: 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Card';
    date: string;
    referenceNumber?: string;
    notes?: string;
  }) => {
    const invoice = invoices.find(inv => inv.id === data.invoiceId);
    if (!invoice) return;

    const newPaidAmount = (invoice.paidAmount || 0) + data.amount;
    const newBalance = Math.max(0, invoice.totalAmount - newPaidAmount);
    const newStatus: Invoice['status'] = newBalance === 0 ? 'paid' : (getDaysDifference(invoice.dueDate) < 0 ? 'overdue' : 'pending');

    // Update invoice
    setInvoices(prev => prev.map(inv => {
      if (inv.id === data.invoiceId) {
        return {
          ...inv,
          paidAmount: newPaidAmount,
          balanceDue: newBalance,
          status: newStatus,
        };
      }
      return inv;
    }));

    // Add payment entry
    const newPayment: Payment = {
      id: generateId('pay'),
      invoiceId: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
      clientName: invoice.clientName,
      clientCompany: invoice.clientCompany,
      date: data.date,
      amount: data.amount,
      method: data.method,
      referenceNumber: data.referenceNumber,
      notes: data.notes,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPayments(prev => [newPayment, ...prev]);

    // If previewing this invoice, update preview
    if (previewInvoice && previewInvoice.id === invoice.id) {
      setPreviewInvoice({
        ...previewInvoice,
        paidAmount: newPaidAmount,
        balanceDue: newBalance,
        status: newStatus,
      });
    }
  };

  const markInvoiceAsPaid = (invoiceId: string, method: 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Card' = 'UPI') => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (!invoice) return;
    const pendingAmount = invoice.balanceDue > 0 ? invoice.balanceDue : invoice.totalAmount;
    if (pendingAmount <= 0) return;

    recordPayment({
      invoiceId: invoice.id,
      amount: pendingAmount,
      method,
      date: new Date().toISOString().split('T')[0],
      notes: 'Marked as Paid from application',
    });
  };

  // Product actions
  const addProduct = (productData: Omit<ProductService, 'id'>) => {
    const newProd: ProductService = {
      ...productData,
      id: generateId('prod'),
    };
    setProducts(prev => [newProd, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<ProductService>) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  // Business profile
  const updateBusinessProfile = (updates: Partial<BusinessProfile>) => {
    setBusinessProfile(prev => ({ ...prev, ...updates }));
  };

  const resetToSampleData = () => {
    setClients(initialClients);
    setInvoices(initialInvoices);
    setPayments(initialPayments);
    setProducts(initialProducts);
    setBusinessProfile(initialBusinessProfile);
    setSelectedClientId(null);
    setPreviewInvoice(null);
    localStorage.removeItem(STORAGE_KEYS.CLIENTS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.PROFILE);
  };

  // Client financials calculation
  const getClientFinancials = (clientId: string): ClientFinancials => {
    const clientInvoices = invoices.filter(inv => inv.clientId === clientId);
    const totalBilled = clientInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
    const received = clientInvoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
    const pending = clientInvoices.reduce((sum, inv) => sum + (inv.balanceDue ?? (inv.totalAmount - (inv.paidAmount || 0))), 0);

    return {
      totalBilled,
      received,
      pending,
      invoiceCount: clientInvoices.length,
      paidCount: clientInvoices.filter(i => i.status === 'paid').length,
      pendingCount: clientInvoices.filter(i => i.status === 'pending').length,
      overdueCount: clientInvoices.filter(i => i.status === 'overdue').length,
    };
  };

  // Dashboard summary metrics
  const totalSales = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  const paidAmount = invoices.reduce((sum, inv) => sum + (inv.paidAmount || 0), 0);
  const pendingAmount = invoices.reduce((sum, inv) => sum + (inv.balanceDue ?? (inv.totalAmount - (inv.paidAmount || 0))), 0);
  const overdueAmount = invoices
    .filter(inv => inv.status === 'overdue')
    .reduce((sum, inv) => sum + (inv.balanceDue ?? (inv.totalAmount - (inv.paidAmount || 0))), 0);

  const dashboardSummary = {
    totalSales,
    paidAmount,
    pendingAmount,
    overdueAmount,
    invoiceCount: invoices.length,
    clientCount: clients.length,
  };

  // Reminders calculation
  const dueSoonInvoices = invoices.filter(inv => {
    if (inv.status === 'paid') return false;
    const days = getDaysDifference(inv.dueDate);
    return days >= 0 && days <= 7;
  });

  const overdueInvoices = invoices.filter(inv => {
    if (inv.status === 'paid') return false;
    const days = getDaysDifference(inv.dueDate);
    return days < 0 || inv.status === 'overdue';
  });

  const reminders = {
    dueSoonCount: dueSoonInvoices.length,
    overdueCount: overdueInvoices.length,
    dueSoonInvoices,
    overdueInvoices,
  };

  return (
    <BillingContext.Provider
      value={{
        clients,
        invoices,
        payments,
        products,
        businessProfile,
        activeTab,
        setActiveTab,
        selectedClientId,
        setSelectedClientId,
        previewInvoice,
        setPreviewInvoice,
        isInvoiceFormOpen,
        setIsInvoiceFormOpen,
        editingInvoice,
        setEditingInvoice,
        recordPaymentForInvoice,
        setRecordPaymentForInvoice,
        searchQuery,
        setSearchQuery,
        addClient,
        updateClient,
        deleteClient,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        recordPayment,
        markInvoiceAsPaid,
        addProduct,
        updateProduct,
        deleteProduct,
        updateBusinessProfile,
        resetToSampleData,
        getClientFinancials,
        dashboardSummary,
        reminders,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within a BillingProvider');
  }
  return context;
};
