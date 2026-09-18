export type InvoiceStatus = 'paid' | 'pending' | 'overdue';

export interface Client {
  id: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  address: string;
  cityState: string;
  taxNumber?: string; // GSTIN or Tax ID
  notes?: string;
  createdAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string; // e.g. "INV-1025"
  clientId: string;
  clientName: string;
  clientCompany: string;
  clientAddress: string;
  clientPhone?: string;
  clientEmail?: string;
  clientTaxNumber?: string;
  date: string; // YYYY-MM-DD
  dueDate: string; // YYYY-MM-DD
  items: InvoiceItem[];
  subtotal: number;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  discountAmount: number;
  taxRate: number; // percentage, e.g. 18
  taxAmount: number;
  totalAmount: number;
  paidAmount: number;
  balanceDue: number;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoiceNumber: string;
  clientId: string;
  clientName: string;
  clientCompany: string;
  date: string;
  amount: number;
  method: 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Card';
  referenceNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface ProductService {
  id: string;
  name: string;
  description?: string;
  defaultPrice: number;
  unit?: string;
}

export interface BusinessProfile {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  cityState: string;
  taxId: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  upiId: string;
  invoiceNotes: string;
  currencySymbol: string;
}

export type ActiveTab = 
  | 'dashboard'
  | 'clients'
  | 'invoices'
  | 'products'
  | 'payments'
  | 'reports'
  | 'settings';
