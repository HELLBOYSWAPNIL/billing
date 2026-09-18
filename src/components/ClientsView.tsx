import React, { useState } from 'react';
import { 
  UserPlus, 
  Search, 
  Phone, 
  Mail, 
  ArrowRight, 
  X, 
  Building2, 
  MapPin, 
  Receipt,
  FileText
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatCurrency } from '../utils';
import { Client } from '../types';
import { ClientProfileView } from './ClientProfileView';

export const ClientsView: React.FC = () => {
  const { 
    clients, 
    addClient, 
    updateClient, 
    businessProfile, 
    getClientFinancials,
    selectedClientId,
    setSelectedClientId
  } = useBilling();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [cityState, setCityState] = useState('');
  const [taxNumber, setTaxNumber] = useState('');
  const [notes, setNotes] = useState('');

  // Selected client profile view
  const activeClient = selectedClientId ? clients.find(c => c.id === selectedClientId) : null;

  const openAddModal = () => {
    setEditingClient(null);
    setName('');
    setCompany('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCityState('');
    setTaxNumber('');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditingClient(client);
    setName(client.name);
    setCompany(client.company);
    setPhone(client.phone);
    setEmail(client.email);
    setAddress(client.address);
    setCityState(client.cityState);
    setTaxNumber(client.taxNumber || '');
    setNotes(client.notes || '');
    setIsModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!company.trim() && !name.trim()) return;

    if (editingClient) {
      updateClient(editingClient.id, {
        name: name.trim() || company.trim(),
        company: company.trim() || name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        cityState: cityState.trim(),
        taxNumber: taxNumber.trim(),
        notes: notes.trim(),
      });
    } else {
      const created = addClient({
        name: name.trim() || company.trim(),
        company: company.trim() || name.trim(),
        phone: phone.trim(),
        email: email.trim(),
        address: address.trim(),
        cityState: cityState.trim(),
        taxNumber: taxNumber.trim(),
        notes: notes.trim(),
      });
      setSelectedClientId(created.id);
    }
    setIsModalOpen(false);
  };

  // If a client is selected, show their full profile
  if (activeClient) {
    return (
      <ClientProfileView 
        client={activeClient} 
        onBack={() => setSelectedClientId(null)} 
        onEditClient={openEditModal} 
      />
    );
  }

  // Filter clients
  const trimmed = search.trim().toLowerCase();
  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(trimmed) ||
    c.company.toLowerCase().includes(trimmed) ||
    c.phone.includes(trimmed) ||
    (c.taxNumber && c.taxNumber.toLowerCase().includes(trimmed))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Clients Management
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Keep each customer's billing details, invoices, and payments organized.
          </p>
        </div>

        <button
          id="btn-add-client"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Client</span>
        </button>
      </div>

      {/* Search & Counter bar */}
      <div className="flex items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-xl border border-neutral-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by client name, company, phone, or GST..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:border-emerald-500"
          />
        </div>
        <span className="text-xs font-semibold text-neutral-500 hidden sm:block">
          {filteredClients.length} {filteredClients.length === 1 ? 'Client' : 'Clients'}
        </span>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => {
          const fin = getClientFinancials(client.id);
          return (
            <div
              key={client.id}
              onClick={() => setSelectedClientId(client.id)}
              className="bg-white p-5 rounded-2xl border border-neutral-200/80 hover:border-emerald-500/60 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-emerald-50 text-neutral-700 group-hover:text-emerald-700 flex items-center justify-center font-bold text-sm transition-colors">
                    {client.company.charAt(0).toUpperCase()}
                  </div>
                  {fin.pending > 0 ? (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-amber-50 text-amber-800 border border-amber-200/60">
                      Pending Dues
                    </span>
                  ) : (
                    <span className="text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/60">
                      Fully Cleared
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-neutral-900 text-base group-hover:text-emerald-700 transition-colors">
                  {client.company}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                  {client.name}
                </p>

                <div className="mt-3 space-y-1 text-xs text-neutral-600">
                  {client.phone && (
                    <p className="flex items-center gap-1.5 truncate">
                      <Phone className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span>{client.phone}</span>
                    </p>
                  )}
                  {client.email && (
                    <p className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Financial mini-table (Section 2 & 7 in prompt) */}
              <div className="mt-4 pt-3 border-t border-neutral-100">
                <div className="grid grid-cols-3 gap-1 text-center bg-neutral-50/80 p-2 rounded-xl">
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Billed</span>
                    <span className="text-xs font-bold text-neutral-900">
                      {formatCurrency(fin.totalBilled, businessProfile.currencySymbol)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-600 uppercase font-semibold block">Received</span>
                    <span className="text-xs font-bold text-emerald-700">
                      {formatCurrency(fin.received, businessProfile.currencySymbol)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-amber-600 uppercase font-semibold block">Pending</span>
                    <span className="text-xs font-bold text-amber-700">
                      {formatCurrency(fin.pending, businessProfile.currencySymbol)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                  <span className="flex items-center gap-1 text-neutral-500 text-[11px]">
                    <FileText className="w-3.5 h-3.5" /> {fin.invoiceCount} invoices
                  </span>
                  <span className="flex items-center gap-1">
                    View profile <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center">
          <Building2 className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-800">No clients found</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {search ? `No clients matched "${search}".` : 'Add your first client to start creating bills.'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            + Add Client
          </button>
        </div>
      )}

      {/* Add / Edit Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">
                {editingClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Company / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ABC Enterprises"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Contact Person Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Shah"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98230 12345"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="accounts@client.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  placeholder="Plot 45, MIDC Industrial Area"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    City & State
                  </label>
                  <input
                    type="text"
                    placeholder="Pune, Maharashtra"
                    value={cityState}
                    onChange={(e) => setCityState(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Tax / GST Number
                  </label>
                  <input
                    type="text"
                    placeholder="27ABCDE1234F1Z5"
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Internal Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Regular monthly customer, net 15 days..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-xs cursor-pointer"
                >
                  {editingClient ? 'Save Changes' : 'Add Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
