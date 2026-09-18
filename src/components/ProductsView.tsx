import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  X, 
  Tag, 
  Check, 
  FileText
} from 'lucide-react';
import { useBilling } from '../context/BillingContext';
import { formatCurrency } from '../utils';
import { ProductService } from '../types';

export const ProductsView: React.FC = () => {
  const { 
    products, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    businessProfile,
    setIsInvoiceFormOpen,
    setEditingInvoice 
  } = useBilling();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductService | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultPrice, setDefaultPrice] = useState<number>(0);
  const [unit, setUnit] = useState('Project');

  const openAddModal = () => {
    setEditingItem(null);
    setName('');
    setDescription('');
    setDefaultPrice(0);
    setUnit('Project');
    setIsModalOpen(true);
  };

  const openEditModal = (item: ProductService) => {
    setEditingItem(item);
    setName(item.name);
    setDescription(item.description || '');
    setDefaultPrice(item.defaultPrice);
    setUnit(item.unit || 'Project');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingItem) {
      updateProduct(editingItem.id, {
        name: name.trim(),
        description: description.trim(),
        defaultPrice: Number(defaultPrice),
        unit: unit.trim(),
      });
    } else {
      addProduct({
        name: name.trim(),
        description: description.trim(),
        defaultPrice: Number(defaultPrice),
        unit: unit.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (item: ProductService) => {
    if (window.confirm(`Delete "${item.name}" from your saved catalog?`)) {
      deleteProduct(item.id);
    }
  };

  const trimmed = search.trim().toLowerCase();
  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(trimmed) ||
    (p.description && p.description.toLowerCase().includes(trimmed))
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
            Products & Services
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500">
            Save frequently billed items so you don't have to retype them on each bill.
          </p>
        </div>

        <button
          id="btn-add-product"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product / Service</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search saved products & services..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-neutral-200 rounded-xl text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-emerald-500 shadow-xs"
        />
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map(item => (
          <div
            key={item.id}
            className="bg-white p-5 rounded-2xl border border-neutral-200/80 hover:border-emerald-500/50 hover:shadow-xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="text-[11px] px-2 py-0.5 rounded-md font-semibold bg-neutral-100 text-neutral-700">
                  {item.unit || 'Standard'}
                </span>
                <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={() => openEditModal(item)}
                    className="p-1 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-md cursor-pointer"
                    title="Edit"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded-md cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h3 className="font-bold text-neutral-900 text-base">
                {item.name}
              </h3>
              {item.description && (
                <p className="text-xs text-neutral-500 mt-1 line-clamp-2">
                  {item.description}
                </p>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-neutral-400 uppercase font-semibold block">Default Rate</span>
                <span className="text-lg font-bold text-neutral-900 font-mono">
                  {formatCurrency(item.defaultPrice, businessProfile.currencySymbol)}
                </span>
              </div>

              <button
                onClick={() => {
                  setEditingInvoice(null);
                  setIsInvoiceFormOpen(true);
                }}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bill this</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="bg-white p-12 rounded-2xl border border-neutral-200 text-center">
          <Package className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-neutral-800">No items in catalog</h3>
          <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
            {search ? `No products match "${search}".` : 'Add your frequently provided services to speed up invoice creation.'}
          </p>
          <button
            onClick={openAddModal}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
          >
            + Add Product / Service
          </button>
        </div>
      )}

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200 shadow-2xl max-w-md w-full">
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <h2 className="text-base font-bold text-neutral-900">
                {editingItem ? 'Edit Service / Product' : 'Add New Service / Product'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Item Name / Service Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Website Design & Development"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Default Price ({businessProfile.currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    placeholder="20000"
                    value={defaultPrice || ''}
                    onChange={(e) => setDefaultPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg font-mono font-bold text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Unit / Frequency
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Project, Month, Session, Hour"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Description (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Includes responsive layout, modern styling, and deployment"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 focus:bg-white focus:outline-none focus:border-emerald-500"
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
                  {editingItem ? 'Save Changes' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
