"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import {
  ArrowLeft, Building2, Search, Plus, Trash2, 
  ShoppingCart, Package, Hash, AlertCircle, 
  CheckCircle2, Loader2, Save, ShoppingBag, 
  ChevronDown, X, TrendingDown, Calendar,
  Truck, FileText, Info
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
  description?: string;
  imageUrl?: string;
  sku?: string;
  quantity: number;
  costPrice: number;
}

export default function NewPurchasePage() {
  const router = useRouter();

  // State: Form Data
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [shippingCost, setShippingCost] = useState(125);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [status, setStatus] = useState<'PENDING' | 'COMPLETED'>('PENDING');

  // State: Resources
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  
  // State: Product Selection
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [productQuery, setProductQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchingProducts, setSearchingProducts] = useState(false);

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

  // Derived: Stats
  const selectedSupplier = useMemo(() => suppliers.find(s => s.id === selectedSupplierId), [selectedSupplierId, suppliers]);
  
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + (item.quantity * item.costPrice), 0), [items]);
  const taxRate = 0.08; // 8% as per mockup
  const taxAmount = subtotal * taxRate;
  const grandTotal = subtotal + taxAmount + shippingCost;

  // Actions
  const addProduct = (product: any) => {
    const existing = items.find(i => i.productId === product.id);
    if (existing) {
        setItems(items.map(i => i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
        setItems([...items, {
            productId: product.id,
            name: product.name,
            description: product.description || 'No description available',
            imageUrl: product.imageUrl,
            sku: product.sku || 'SKU-TEMP',
            quantity: 1,
            costPrice: Number(product.purchasePrice) || 0
        }]);
    }
    setIsSearchOpen(false);
    setProductQuery('');
  };

  const updateItem = (id: string, field: 'quantity' | 'costPrice', val: number) => {
    setItems(items.map(i => i.productId === id ? { ...i, [field]: val } : i));
  };

  const removeItem = (id: string) => {
    setItems(items.filter(i => i.productId !== id));
  };

  const handleSubmit = async (isConfirm: boolean = true) => {
    if (!selectedSupplierId) return setError('Please select a supplier');
    if (items.length === 0) return setError('Please add at least one product');
    
    setSubmitting(true);
    setError('');
    try {
      await createPurchase({
        supplierId: selectedSupplierId,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity, costPrice: i.costPrice })),
        status: isConfirm ? 'COMPLETED' : 'PENDING',
        notes,
        expectedDelivery: expectedDelivery || undefined,
        subtotal,
        taxAmount,
        shippingCost,
        total: grandTotal
      });
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/purchases'), 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to process order');
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#F0F4F8] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-y-auto">
        
        {/* Mockup Header Style: Lumen Ledger */}
        <header className="px-10 py-6 bg-transparent flex items-center justify-between sticky top-0 z-30 transition-all">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => router.push('/dashboard/purchases')}
              className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-gray-50 transition-all text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Create Purchase Order</h1>
              <span className="text-sm font-bold text-gray-400 bg-white/50 px-3 py-1 rounded-full border border-gray-100 italic">
                Draft #PO-8842
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button 
                onClick={() => handleSubmit(false)}
                className="px-6 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 transition-colors"
             >
                Save Draft
             </button>
             <button 
                onClick={() => handleSubmit(true)}
                disabled={submitting}
                className="px-8 py-2.5 bg-[#0052FF] text-white rounded-xl font-black text-sm shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
             >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Purchase'}
             </button>
          </div>
        </header>

        <main className="px-10 py-4 max-w-7xl mx-auto w-full space-y-8 pb-32">
          
          {/* Top Cards: Supplier & Logistics */}
          <div className="grid grid-cols-12 gap-8">
            {/* Supplier Section */}
            <div className="col-span-12 lg:col-span-7 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100/50 p-8 relative overflow-hidden group">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-[#0052FF] opacity-80" />
               <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-6 flex items-center gap-2">
                 <Building2 className="w-4 h-4 text-blue-600" /> Supplier Selection
               </h2>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Supplier Name</label>
                    <div className="relative group">
                      <select 
                        value={selectedSupplierId}
                        onChange={e => setSelectedSupplierId(e.target.value)}
                        className="w-full pl-5 pr-10 py-4 bg-[#F5F8FA] border-2 border-transparent focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-900 appearance-none focus:outline-none transition-all"
                      >
                        <option value="">Select a vendor...</option>
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Supplier ID</label>
                    <input 
                      readOnly
                      placeholder="SUP-2024-0012"
                      value={selectedSupplier ? `SUP-${selectedSupplier.id.slice(0,8).toUpperCase()}` : ''}
                      className="w-full px-5 py-4 bg-[#EBF0F5] border-2 border-transparent rounded-2xl text-sm font-black text-gray-500 font-mono outline-none cursor-default"
                    />
                  </div>
               </div>
            </div>

            {/* Logistics Section */}
            <div className="col-span-12 lg:col-span-5 bg-white rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.03)] border border-gray-100 p-8">
               <h2 className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-6 flex items-center gap-2">
                 <Truck className="w-4 h-4 text-blue-600" /> Logistics Details
               </h2>
               <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Order Date</label>
                    <div className="relative">
                      <input 
                        type="date"
                        value={orderDate}
                        onChange={e => setOrderDate(e.target.value)}
                        className="w-full px-5 py-3.5 bg-[#F5F8FA] border-2 border-transparent focus:border-blue-100 rounded-xl text-sm font-bold text-gray-900 focus:outline-none text-center"
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Expected Delivery</label>
                    <input 
                        type="date"
                        placeholder="mm/dd/yyyy"
                        value={expectedDelivery}
                        onChange={e => setExpectedDelivery(e.target.value)}
                        className="w-full px-5 py-3.5 bg-[#F5F8FA] border-2 border-transparent focus:border-blue-100 rounded-xl text-sm font-bold text-gray-900 focus:outline-none text-center"
                    />
                  </div>
               </div>
            </div>
          </div>

          {/* Items Section */}
          <section className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
            <div className="px-10 py-6 border-b border-gray-50 flex items-center justify-between bg-white sticky top-0 z-20">
              <div>
                <h2 className="text-base font-black text-gray-900">Order Items</h2>
                <p className="text-xs text-gray-400 font-bold mt-0.5">Add products and specify quantities for fulfillment</p>
              </div>
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="px-5 py-2.5 bg-[#A8C7FF] text-[#001D4A] rounded-xl font-black text-sm hover:bg-[#8DABFF] transition-all flex items-center gap-2"
              >
                <Plus className="w-5 h-5" /> Add Product
              </button>
            </div>

            <div className="overflow-x-auto">
               <table className="w-full text-left min-w-[800px]">
                 <thead>
                   <tr className="bg-gray-50/30 text-[9px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-50">
                     <th className="px-10 py-5">Product Details</th>
                     <th className="px-6 py-5 text-center">SKU</th>
                     <th className="px-6 py-5 text-center">Quantity</th>
                     <th className="px-6 py-5 text-center">Unit Cost</th>
                     <th className="px-10 py-5 text-right w-48">Total Amount</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                   {items.length === 0 ? (
                     <tr>
                       <td colSpan={5} className="py-24 text-center">
                          <div className="w-16 h-16 bg-blue-50/50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-50">
                            <Package className="w-8 h-8 text-blue-200" />
                          </div>
                          <p className="text-sm font-black text-gray-900 mb-1">Your order list is empty</p>
                          <p className="text-xs text-gray-400 font-bold">Search and add products to begin the procurement process.</p>
                       </td>
                     </tr>
                   ) : (
                     items.map(item => (
                       <tr key={item.productId} className="group hover:bg-gray-50/30 transition-colors">
                         <td className="px-10 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 bg-[#D1D5DB] rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center border border-gray-100 shadow-sm">
                                  {item.imageUrl ? <img src={item.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-gray-400" />}
                               </div>
                               <div>
                                  <p className="text-sm font-black text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</p>
                                  <p className="text-[10px] text-gray-400 font-medium leading-tight max-w-[240px] truncate">{item.description}</p>
                               </div>
                            </div>
                         </td>
                         <td className="px-6 py-6 text-center">
                            <span className="px-3 py-1 bg-[#E4E9FC] text-[#475467] rounded-md text-[10px] font-black tracking-widest uppercase">
                               {item.sku}
                            </span>
                         </td>
                         <td className="px-6 py-6 font-bold">
                            <div className="flex items-center justify-center">
                               <input 
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={e => updateItem(item.productId, 'quantity', parseInt(e.target.value) || 0)}
                                  className="w-16 py-2 px-1 bg-[#F1F3F9] border-none rounded-lg text-sm font-black text-gray-900 text-center focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                               />
                            </div>
                         </td>
                         <td className="px-6 py-6 text-center font-bold text-gray-500 text-sm">
                            ${Number(item.costPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                         </td>
                         <td className="px-10 py-6 text-right relative group/row">
                            <p className="text-sm font-black text-gray-900">${(item.quantity * item.costPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            <button 
                                onClick={() => removeItem(item.productId)}
                                className="absolute -right-2 top-1/2 -translate-y-1/2 p-2 text-gray-300 hover:text-red-500 opacity-0 group-hover/row:opacity-100 transition-all"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                         </td>
                       </tr>
                     ))
                   )}
                 </tbody>
               </table>
            </div>
            
            {/* Footer Summary & Notes */}
            <div className="p-10 bg-white grid grid-cols-12 gap-12 border-t border-gray-50">
               {/* Notes Section */}
               <div className="col-span-12 lg:col-span-7 space-y-3">
                  <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600" /> Order Notes
                  </h3>
                  <textarea 
                    placeholder="Internal notes for logistics team..."
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    rows={5}
                    className="w-full bg-[#F5F8FA] border-2 border-transparent focus:border-blue-50 rounded-2xl p-5 text-sm font-medium text-gray-700 focus:outline-none transition-all resize-none shadow-inner"
                  />
               </div>

               {/* Amounts Section */}
               <div className="col-span-12 lg:col-span-5 space-y-4 pr-4">
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Subtotal</p>
                    <p className="font-black text-gray-900">${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Shipping (Standard)</p>
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400 font-bold">$</span>
                      <input 
                        type="number" 
                        value={shippingCost} 
                        onChange={e => setShippingCost(parseFloat(e.target.value) || 0)}
                        className="w-16 bg-transparent text-right font-black text-gray-900 focus:outline-none focus:border-b border-blue-200"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Tax (VAT 8%)</p>
                    <p className="font-black text-gray-900">${taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                  </div>
                  
                  <div className="pt-6 border-t border-gray-50 mt-4 flex items-center justify-between">
                     <p className="text-sm font-black text-gray-900 uppercase tracking-[2px]">Total</p>
                     <p className="text-3xl font-black text-[#0052FF] animate-in fade-in zoom-in duration-500">
                        ${grandTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                     </p>
                  </div>
               </div>
            </div>
          </section>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-center gap-4 pt-4">
             <button 
                onClick={() => router.push('/dashboard/purchases')}
                className="px-10 py-4 border-2 border-transparent hover:bg-gray-100 rounded-2xl text-sm font-black text-gray-400 transition-all flex items-center gap-3"
             >
                <X className="w-5 h-5" /> Discard Order
             </button>
             <button 
                onClick={() => handleSubmit(true)}
                disabled={submitting || success}
                className="px-12 py-4 bg-[#0052FF] text-white rounded-2xl font-black text-lg shadow-2xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
             >
                {submitting ? <Loader2 className="w-6 h-6 animate-spin" /> : 'Confirm Purchase Order'}
             </button>
          </div>
          
          {/* Status Feedback */}
          {error && (
            <div className="max-w-md mx-auto p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 flex items-start gap-4 animate-in slide-in-from-bottom-2">
               <AlertCircle className="w-6 h-6 flex-shrink-0" />
               <p className="text-xs font-bold leading-relaxed">{error}</p>
            </div>
          )}
          {success && (
            <div className="max-w-md mx-auto p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 flex items-center gap-4 animate-in zoom-in">
               <CheckCircle2 className="w-8 h-8 flex-shrink-0" />
               <p className="text-sm font-black uppercase tracking-widest">Order Successfully Processed!</p>
            </div>
          )}
        </main>
      </div>

      {/* Product Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsSearchOpen(false)}>
           <div className="w-full max-w-2xl bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
              <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center">
                       <Search className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                       <h3 className="text-xl font-black text-gray-900 leading-tight">Add Warehouse Item</h3>
                       <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-0.5">Global Inventory Lookup</p>
                    </div>
                 </div>
                 <button onClick={() => setIsSearchOpen(false)} className="w-10 h-10 rounded-xl hover:bg-gray-100 flex items-center justify-center text-gray-300 hover:text-gray-900 transition-all">
                    <X className="w-6 h-6" />
                 </button>
              </div>
              <div className="p-8 space-y-6">
                 <div className="relative group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                    <input 
                       autoFocus
                       placeholder="Enter product name, category or SKU barcode..."
                       value={productQuery}
                       onChange={e => setProductQuery(e.target.value)}
                       className="w-full pl-14 pr-6 py-4.5 bg-[#F5F8FA] border-2 border-transparent focus:border-blue-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none transition-all shadow-inner"
                    />
                 </div>
                 
                 <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {searchingProducts ? (
                       <div className="py-20 flex flex-col items-center justify-center text-gray-300 gap-4">
                          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                          <p className="text-xs font-black uppercase tracking-widest animate-pulse">Scanning Warehouse...</p>
                       </div>
                    ) : searchResults.length === 0 ? (
                       <div className="py-16 text-center text-gray-300 flex flex-col items-center gap-4 bg-gray-50/50 rounded-3xl border border-dashed border-gray-100">
                          <Info className="w-12 h-12 opacity-30" />
                          <p className="text-sm font-bold">{productQuery.length < 2 ? 'Search for inventory items' : 'No matches found in database'}</p>
                       </div>
                    ) : (
                       searchResults.map(p => (
                          <button 
                             key={p.id}
                             className="w-full text-left p-5 hover:bg-blue-50/50 rounded-2xl flex items-center gap-6 border-2 border-transparent hover:border-blue-100 transition-all group"
                             onClick={() => addProduct(p)}
                          >
                             <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shadow-sm flex items-center justify-center flex-shrink-0">
                                {p.imageUrl ? <img src={p.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-gray-400" />}
                             </div>
                             <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                   <p className="text-sm font-black text-gray-900 truncate">{p.name}</p>
                                   <span className="text-[8px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded uppercase tracking-widest">{p.sku}</span>
                                </div>
                                <p className="text-[10px] text-gray-500 font-bold truncate opacity-60">{p.description || 'Global Logistics Item'}</p>
                             </div>
                             <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Unit Price</p>
                                <p className="text-sm font-black text-blue-600 group-hover:scale-110 transition-transform">${Number(p.purchasePrice || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                             </div>
                          </button>
                       ))
                    )}
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Custom Styles for Scrollbar */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>
    </div>
  );
}
