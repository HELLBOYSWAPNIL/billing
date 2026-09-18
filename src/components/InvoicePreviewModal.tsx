import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  Share2, 
  CheckCircle, 
  Edit, 
  CreditCard,
  Copy,
  Check,
  Building,
  Phone,
  Mail,
  QrCode
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatCurrency, formatDate } from '../utils';
import { Invoice } from '../types';

interface InvoicePreviewModalProps {
  invoice: Invoice;
  onClose: () => void;
}

export const InvoicePreviewModal: React.FC<InvoicePreviewModalProps> = ({ 
  invoice, 
  onClose 
}) => {
  const { 
    businessProfile, 
    setEditingInvoice, 
    setIsInvoiceFormOpen, 
    markInvoiceAsPaid,
    setRecordPaymentForInvoice 
  } = useBilling();

  const [copied, setCopied] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    setEditingInvoice(invoice);
    setIsInvoiceFormOpen(true);
    onClose();
  };

  const handleShare = () => {
    const text = `Invoice ${invoice.invoiceNumber} from ${businessProfile.businessName}\nAmount: ${formatCurrency(invoice.totalAmount, businessProfile.currencySymbol)}\nDue Date: ${formatDate(invoice.dueDate)}\nStatus: ${invoice.status.toUpperCase()}\nClient: ${invoice.clientCompany}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setShowShareToast(true);
    setTimeout(() => {
      setCopied(false);
      setShowShareToast(false);
    }, 2500);
  };

  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(
      `Hello ${invoice.clientName || invoice.clientCompany},\n\nHere is your invoice *${invoice.invoiceNumber}* from *${businessProfile.businessName}*.\n\n*Total Amount:* ${formatCurrency(invoice.totalAmount, businessProfile.currencySymbol)}\n*Due Date:* ${formatDate(invoice.dueDate)}\n*Status:* ${invoice.status.toUpperCase()}\n\nThank you for doing business with us!`
    );
    const phone = invoice.clientPhone ? invoice.clientPhone.replace(/[^0-9]/g, '') : '';
    const url = phone ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-neutral-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:p-0 print:static print:bg-white print:z-auto">
      {/* Toast */}
      {showShareToast && (
        <div className="fixed top-6 right-6 bg-neutral-900 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-xl z-60 flex items-center gap-2 print:hidden animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>Invoice summary copied to clipboard!</span>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-3xl w-full max-h-[95vh] flex flex-col overflow-hidden my-auto print:max-w-none print:w-full print:border-none print:shadow-none print:rounded-none print:max-h-none print:h-auto">
        {/* Modal Top Action Toolbar (Hidden on Print) */}
        <div className="px-5 py-3 border-b border-neutral-200 flex flex-wrap items-center justify-between gap-3 bg-neutral-50/80 print:hidden">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-neutral-900">
              Invoice Preview
            </span>
            <span className="text-xs text-neutral-400 font-mono">
              ({invoice.invoiceNumber})
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {invoice.status !== 'paid' && (
              <button
                onClick={() => markInvoiceAsPaid(invoice.id)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Mark as Paid</span>
              </button>
            )}

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5 text-neutral-600" />
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleWhatsAppShare}
              className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Share on WhatsApp"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleShare}
              className="px-3 py-1.5 bg-white border border-neutral-300 hover:bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy Summary"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={handleEdit}
              className="p-1.5 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer"
              title="Edit Invoice"
            >
              <Edit className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-200 rounded-lg transition-colors cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Bill Area (Pure, crisp, professional design matching Section 4) */}
        <div id="printable-invoice" className="p-6 sm:p-10 overflow-y-auto flex-1 bg-white text-neutral-900 print:p-8 print:overflow-visible">
          {/* Header Section: Business branding */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b-2 border-neutral-900">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight uppercase">
                {businessProfile.businessName}
              </h1>
              <div className="text-xs text-neutral-600 mt-1.5 space-y-0.5">
                <p>{businessProfile.address}</p>
                <p>{businessProfile.cityState}</p>
                <p className="flex items-center gap-3 mt-1">
                  <span>Phone: {businessProfile.phone}</span>
                  <span>•</span>
                  <span>Email: {businessProfile.email}</span>
                </p>
                {businessProfile.taxId && (
                  <p className="font-semibold text-neutral-800 font-mono text-[11px]">
                    {businessProfile.taxId}
                  </p>
                )}
              </div>
            </div>

            <div className="sm:text-right shrink-0">
              <span className="text-2xl sm:text-3xl font-black text-neutral-900 tracking-wider block">
                INVOICE
              </span>
              <div className="mt-2 text-xs space-y-1">
                <p>
                  <span className="font-semibold text-neutral-700">Invoice No:</span>{' '}
                  <span className="font-mono font-bold text-neutral-900">{invoice.invoiceNumber}</span>
                </p>
                <p>
                  <span className="font-semibold text-neutral-700">Date:</span>{' '}
                  <span>{formatDate(invoice.date)}</span>
                </p>
                <p>
                  <span className="font-semibold text-neutral-700">Due Date:</span>{' '}
                  <span>{formatDate(invoice.dueDate)}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Bill To & Status Badge */}
          <div className="py-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-neutral-200">
            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Bill To:
              </span>
              <h3 className="font-bold text-base text-neutral-900">
                {invoice.clientCompany}
              </h3>
              <p className="text-xs text-neutral-600 font-medium mt-0.5">
                Attn: {invoice.clientName}
              </p>
              <p className="text-xs text-neutral-600 mt-0.5 whitespace-pre-line max-w-sm">
                {invoice.clientAddress}
              </p>
              {invoice.clientPhone && (
                <p className="text-xs text-neutral-500 mt-0.5">Phone: {invoice.clientPhone}</p>
              )}
              {invoice.clientTaxNumber && (
                <p className="text-xs text-neutral-700 font-mono mt-1">
                  GSTIN: {invoice.clientTaxNumber}
                </p>
              )}
            </div>

            <div className="sm:text-right">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Payment Status
              </span>
              <div className="inline-block">
                <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : invoice.status === 'overdue'
                    ? 'bg-rose-100 text-rose-800 border border-rose-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {invoice.status === 'paid' ? '● PAID IN FULL' : invoice.status === 'overdue' ? '● OVERDUE' : '● PENDING PAYMENT'}
                </span>
              </div>
              {invoice.paidAmount > 0 && invoice.status !== 'paid' && (
                <div className="mt-1 text-xs text-neutral-600">
                  <span>Paid: {formatCurrency(invoice.paidAmount, businessProfile.currencySymbol)}</span>
                  <span className="mx-1">•</span>
                  <span className="font-semibold text-rose-700">Due: {formatCurrency(invoice.balanceDue, businessProfile.currencySymbol)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Line items Table (Section 4 in prompt) */}
          <div className="py-6">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b-2 border-neutral-900 text-neutral-900 text-[11px] font-black uppercase tracking-wider">
                  <th className="pb-3 w-1/2">Service / Description</th>
                  <th className="pb-3 text-center w-16">Qty</th>
                  <th className="pb-3 text-right w-24">Rate</th>
                  <th className="pb-3 text-right w-28">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {invoice.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 font-medium text-neutral-900">
                      {item.description}
                    </td>
                    <td className="py-3 text-center text-neutral-700">
                      {item.quantity}
                    </td>
                    <td className="py-3 text-right text-neutral-700 font-mono">
                      {formatCurrency(item.price, businessProfile.currencySymbol)}
                    </td>
                    <td className="py-3 text-right font-bold text-neutral-900 font-mono">
                      {formatCurrency(item.amount, businessProfile.currencySymbol)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Subtotal, Tax, Discount, Total Calculation Block */}
          <div className="pt-4 pb-6 border-t-2 border-neutral-900 flex flex-col sm:flex-row sm:justify-end">
            <div className="w-full sm:w-72 space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-neutral-900">
                  {formatCurrency(invoice.subtotal, businessProfile.currencySymbol)}
                </span>
              </div>

              {invoice.discountAmount > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Discount {invoice.discountType === 'percentage' ? `(${invoice.discountValue}%)` : ''}</span>
                  <span className="font-mono text-emerald-700 font-medium">
                    -{formatCurrency(invoice.discountAmount, businessProfile.currencySymbol)}
                  </span>
                </div>
              )}

              {invoice.taxAmount > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>Tax ({invoice.taxRate}%)</span>
                  <span className="font-mono font-medium text-neutral-900">
                    +{formatCurrency(invoice.taxAmount, businessProfile.currencySymbol)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-neutral-900 flex justify-between items-baseline font-bold text-base sm:text-lg text-neutral-900">
                <span>Total</span>
                <span className="font-mono text-xl sm:text-2xl font-black">
                  {formatCurrency(invoice.totalAmount, businessProfile.currencySymbol)}
                </span>
              </div>

              {invoice.paidAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-700 font-medium pt-1">
                  <span>Amount Paid</span>
                  <span className="font-mono">
                    {formatCurrency(invoice.paidAmount, businessProfile.currencySymbol)}
                  </span>
                </div>
              )}

              {invoice.balanceDue > 0 && (
                <div className="flex justify-between text-xs text-rose-700 font-bold pt-1 border-t border-dashed border-neutral-300">
                  <span>Balance Due</span>
                  <span className="font-mono">
                    {formatCurrency(invoice.balanceDue, businessProfile.currencySymbol)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Details & Bank Information (Section 9 in prompt) */}
          <div className="mt-6 pt-6 border-t border-neutral-200 grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                Bank & Payment Details
              </span>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 text-neutral-700 space-y-1">
                <p><span className="font-semibold text-neutral-900">Bank Name:</span> {businessProfile.bankName}</p>
                <p><span className="font-semibold text-neutral-900">Account No:</span> <span className="font-mono">{businessProfile.accountNumber}</span></p>
                <p><span className="font-semibold text-neutral-900">IFSC Code:</span> <span className="font-mono">{businessProfile.ifscCode}</span></p>
                {businessProfile.upiId && (
                  <p><span className="font-semibold text-neutral-900">UPI ID:</span> <span className="font-mono text-emerald-700 font-bold">{businessProfile.upiId}</span></p>
                )}
              </div>
            </div>

            <div>
              <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1">
                Notes & Terms
              </span>
              <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200/80 text-neutral-600 text-xs italic">
                {invoice.notes || businessProfile.invoiceNotes || 'Thank you for your business! Payment is due within 7 days.'}
              </div>
              <p className="text-[10px] text-neutral-400 mt-2">
                This is a computer generated invoice and does not require a physical signature.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
