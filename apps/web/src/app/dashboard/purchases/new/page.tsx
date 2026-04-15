"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import {
  ArrowLeft, Building2, Search, Plus, Trash2, 
  ShoppingCart, Package, Hash, AlertCircle, 
  CheckCircle2, Loader2, Save, ShoppingBag, 
  ChevronDown, X
} from 'lucide-react';
import { 
  getSuppliers, 
  getApiProducts, 
  createPurchase 
} from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────────
interface PurchaseItem {
  productId: string;
  name: string;
  quantity: number;
  costPrice: number;
}

export default function NewPurchasePage() {
  const router = useRouter();

  // State: Form Data
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [status, setStatus] = useState<'PENDING' | 'COMPLETED'>('COMPLETED');

  // State: Resources
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  
  // State: Product Search
  const [productQuery, setProductQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // State: Form UI
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Fetch Suppliers
  useEffect(() => {
    getSuppliers({ isActive: true, limit: 100 })
      .then(res => setSuppliers(res.data))
      .catch(console.error)
      .finally(() => setLoadingSuppliers(false));
  }, []);

  // Product Search Debounce
  useEffect(() => {
    if (productQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const t = setTimeout(() => {
      setSearchingProducts(true);
      getApiProducts({ search: productQuery, isActive: true, limit: 10 })
        .then(res => setSearchResults(res.data))
        .catch(console.error)
        .finally(() => setSearchingProducts(false));
    }, 400);
    return () => clearTimeout(t);
  }, [productQuery]);

  // Derived: Total
  const grandTotal = useMemo(() => {
    return items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0);
  }, [items]);

  // Actions
  const addProduct = (product: any) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) return; // Or increment qty

    setItems([...items, {
      productId: product.id,
      name: product.name,
      quantity: 1,
      costPrice: Number(product.purchasePrice) || 0
    }]);
    setProductQuery('');
    setSearchResults([]);
    setShowResults(false);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.productId !== id));
  };

  const updateItem = (id: string, field: 'quantity' | 'costPrice', val: number) => {
    setItems(items.map(i => i.productId === id ? { ...i, [field]: val } : i));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId) return setError('Please select a supplier');
    if (items.length === 0) return setError('Please add at least one product');
    
    // Validations
    for (const item of items) {
       if (item.quantity <= 0) return setError(`Quantity for ${item.name} must be greater than 0`);
       if (item.costPrice < 0) return setError(`Price for ${item.name} cannot be negative`);
    }

    setSubmitting(true);
    setError('');
    try {
      await createPurchase({
        supplierId: selectedSupplierId,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, costPrice: i.costPrice })),
        status: status
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/purchases'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to register purchase');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-y-auto">
        
        {/* Header */}
        <header className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push('/dashboard/purchases')}
              className="w-10 h-10 rounded-xl border border-gray-100 hover:bg-gray-50 flex items-center justify-center transition-all"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Purchasing</p>
              <h1 className="text-2xl font-black text-gray-900 leading-tight">Register New Purchase</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <select 
               value={status} 
               onChange={(e: any) => setStatus(e.target.value)}
               className="bg-gray-50 border border-gray-100 px-4 py-2.5 rounded-xl text-xs font-black text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
               <option value="COMPLETED">RECEIVED (Update Stock)</option>
               <option value="PENDING">PENDING (Draft)</option>
            </select>
          </div>
        </header>

        <main className="p-8 max-w-6xl mx-auto w-full grid grid-cols-12 gap-8 pb-20">
          
          <div className="col-span-8 space-y-6">
            
            {/* Step 1: Supplier */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Select Supplier</h2>
              </div>
              <div className="p-6">
                <div className="relative">
                  <select 
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="w-full pl-5 pr-10 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 appearance-none focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all"
                  >
                    <option value="">Select a vendor...</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.dniRuc})</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </section>

            {/* Step 2: Products */}
            <section className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Package className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">Add Products</h2>
                </div>
                {items.length > 0 && (
                   <span className="bg-indigo-600 text-white px-3 py-1 rounded-full text-[10px] font-black">{items.length} ITEMS</span>
                )}
              </div>
              
              <div className="p-6">
                <div className="relative mb-6">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                    <input 
                      placeholder="Search product by name or SKU..."
                      value={productQuery}
                      onChange={e => { setProductQuery(e.target.value); setShowResults(true); }}
                      onFocus={() => setShowResults(true)}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 transition-all placeholder:text-gray-400"
                    />
                  </div>

                  {/* Search Results Dropdown */}
                  {showResults && (productQuery.length >= 2 || searchingProducts) && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 max-h-80 overflow-y-auto overflow-hidden animate-in fade-in slide-in-from-top-2">
                       {searchingProducts ? (
                         <div className="p-8 text-center"><Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto" /></div>
                       ) : searchResults.length === 0 ? (
                         <div className="p-8 text-center text-sm font-bold text-gray-400">No products found for "{productQuery}"</div>
                       ) : (
                         searchResults.map(p => (
                           <button 
                             key={p.id}
                             type="button"
                             onClick={() => addProduct(p)}
                             className="w-full px-5 py-4 text-left hover:bg-indigo-50 flex items-center justify-between border-b border-gray-50 last:border-0 group transition-colors"
                           >
                              <div>
                                <p className="font-black text-gray-900">{p.name}</p>
                                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{p.sku || 'No SKU'}</p>
                              </div>
                              <div className="flex flex-col items-end">
                                <p className="text-xs font-black text-indigo-600">Stock: {p.stock}</p>
                                <div className="p-1 transparent group-hover:bg-indigo-600 group-hover:text-white rounded-lg transition-all">
                                  <Plus className="w-4 h-4" />
                                </div>
                              </div>
                           </button>
                         ))
                       )}
                    </div>
                  )}
                </div>

                {/* Selected Items Table */}
                <div className="rounded-2xl border border-gray-100 overflow-hidden">
                   <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr className="border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          <th className="px-4 py-3">Product Name</th>
                          <th className="px-4 py-3 w-32 text-center">Quantity</th>
                          <th className="px-4 py-3 w-40">Cost Price</th>
                          <th className="px-4 py-3 text-right">Subtotal</th>
                          <th className="px-4 py-3 w-12"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-12 text-center">
                              <ShoppingBag className="w-10 h-10 text-gray-100 mx-auto mb-3" />
                              <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No products added yet</p>
                            </td>
                          </tr>
                        ) : (
                          items.map(item => (
                            <tr key={item.productId} className="hover:bg-gray-50/50 transition-colors">
                              <td className="px-4 py-4">
                                <p className="text-sm font-black text-gray-800">{item.name}</p>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center justify-center bg-gray-100 rounded-xl p-1 gap-1">
                                   <input 
                                      type="number" 
                                      min="1"
                                      value={item.quantity}
                                      onChange={e => updateItem(item.productId, 'quantity', parseInt(e.target.value) || 0)}
                                      className="w-16 bg-transparent text-center text-sm font-black text-gray-900 focus:outline-none"
                                   />
                                </div>
                              </td>
                              <td className="px-4 py-4">
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-gray-400">$</span>
                                  <input 
                                    type="number"
                                    step="0.01"
                                    value={item.costPrice}
                                    onChange={e => updateItem(item.productId, 'costPrice', parseFloat(e.target.value) || 0)}
                                    className="w-full pl-7 pr-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-black text-gray-900 focus:ring-2 focus:ring-indigo-100 focus:outline-none transition-all"
                                  />
                                </div>
                              </td>
                              <td className="px-4 py-4 text-right">
                                <p className="text-sm font-black text-gray-900">${(item.quantity * item.costPrice).toFixed(2)}</p>
                              </td>
                              <td className="px-4 py-4 text-center">
                                <button onClick={() => removeItem(item.productId)} className="text-gray-300 hover:text-rose-600 transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                   </table>
                </div>
              </div>
            </section>
          </div>

          {/* Sidebar Area: Resumen */}
          <div className="col-span-4 space-y-6">
            <section className="bg-white rounded-[24px] shadow-xl border border-gray-100 overflow-hidden sticky top-28">
              <div className="p-8 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center">
                    <ShoppingCart className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h2 className="text-xl font-black text-gray-900">Summary</h2>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-50">
                   <div className="flex justify-between text-sm">
                      <p className="font-bold text-gray-400">Supplier</p>
                      <p className="font-black text-gray-900 truncate max-w-[150px]">
                        {suppliers.find(s => s.id === selectedSupplierId)?.name || 'Not selected'}
                      </p>
                   </div>
                   <div className="flex justify-between text-sm">
                      <p className="font-bold text-gray-400">Total Items</p>
                      <p className="font-black text-gray-900">{items.reduce((sum, i) => sum + i.quantity, 0)}</p>
                   </div>
                   <div className="flex justify-between text-sm">
                      <p className="font-bold text-gray-400">Tax</p>
                      <p className="font-black text-gray-900">$0.00</p>
                   </div>
                </div>

                <div className="pt-6 border-t-2 border-dashed border-gray-100">
                   <div className="flex items-center justify-between mb-8">
                      <p className="text-sm font-black text-gray-400 uppercase tracking-widest">Total Amount</p>
                      <p className="text-4xl font-black text-indigo-600">${grandTotal.toFixed(2)}</p>
                   </div>

                   {/* Error Display */}
                   {error && (
                     <div className="mb-6 p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-xs font-bold leading-tight">{error}</p>
                     </div>
                   )}

                   {/* Success Animation */}
                   {success && (
                     <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center gap-3 animate-bounce">
                        <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
                        <p className="text-xs font-black uppercase tracking-wider">Purchase Registered!</p>
                     </div>
                   )}

                   <button 
                     onClick={handleSubmit}
                     disabled={submitting || success}
                     className="w-full py-4.5 bg-indigo-600 text-white rounded-[20px] font-black text-lg hover:bg-indigo-700 shadow-2xl shadow-indigo-200 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-3"
                   >
                     {submitting ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                     ) : (
                        <>
                          <Save className="w-6 h-6" />
                          <span>Complete Order</span>
                        </>
                     )}
                   </button>
                   
                   <p className="text-center text-[10px] text-gray-300 font-bold uppercase tracking-widest mt-4">
                     Transactional Secure Registration
                   </p>
                </div>
              </div>
            </section>

            {/* Hint Box */}
            <div className="bg-indigo-600 rounded-[24px] p-6 text-white shadow-xl">
               <TrendingDown className="w-8 h-8 mb-4 opacity-50" />
               <p className="text-base font-bold leading-tight mb-2">Inventory Impact</p>
               <p className="text-xs text-indigo-100 leading-relaxed font-medium">
                 Registering this purchase will immediately increase stock and record a logistical movement entry.
               </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
