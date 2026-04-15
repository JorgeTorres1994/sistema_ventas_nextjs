"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import {
  Search, SlidersHorizontal, ArrowUpDown, Download, AlertTriangle,
  Package, AlertCircle, TrendingUp, ChevronLeft, ChevronRight,
  MoreVertical, X, Plus, Minus, CheckCircle, RefreshCw
} from 'lucide-react';
import { getInventoryStock, adjustInventoryStock } from '@/lib/api';
import api from '@/lib/api';

// ── Types ──────────────────────────────────────────────────────────────────────
interface Product {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  stock: number;
  price: number;
  category?: { id: string; name: string };
}
interface Summary {
  totalProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalStockUnits: number;
}

// ── Stock Status Badge ─────────────────────────────────────────────────────────
function StockBadge({ stock }: { stock: number }) {
  if (stock === 0)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-50 text-rose-600 border border-rose-100">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        Out of Stock
      </span>
    );
  if (stock < 10)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-600 border border-amber-100">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Low Stock
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      In Stock
    </span>
  );
}

// ── Adjust Stock Modal ─────────────────────────────────────────────────────────
function AdjustStockModal({
  product,
  onClose,
  onSuccess,
}: {
  product: Product;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [type, setType] = useState<'IN' | 'OUT'>('IN');
  const [quantity, setQuantity] = useState(1);
  const [reason, setReason] = useState('ADJUSTMENT');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const newStock = type === 'IN' ? product.stock + quantity : Math.max(0, product.stock - quantity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) { setError('Quantity must be greater than 0'); return; }
    if (type === 'OUT' && quantity > product.stock) { setError(`Cannot remove more than current stock (${product.stock})`); return; }

    setLoading(true);
    setError('');
    try {
      await adjustInventoryStock({ productId: product.id, quantity, type, reason, note });
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 1200);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Adjustment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-start justify-between">
          <div>
            <h2 className="text-xl font-black text-gray-900">Adjust Stock</h2>
            <p className="text-sm font-semibold text-gray-500 mt-1">{product.name}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Current / New Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 rounded-2xl p-4 text-center">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Current Stock</p>
              <p className="text-3xl font-black text-gray-900">{product.stock}</p>
            </div>
            <div className={`rounded-2xl p-4 text-center border-2 ${type === 'IN' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">New Stock</p>
              <p className={`text-3xl font-black ${type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>{newStock}</p>
            </div>
          </div>

          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-black text-gray-900 mb-3">Movement Type</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setType('IN')}
                className={`py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 border-2 transition-all ${type === 'IN' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white border-gray-100 text-gray-500 hover:border-emerald-200'}`}>
                <Plus className="w-4 h-4" /> Stock IN
              </button>
              <button type="button" onClick={() => setType('OUT')}
                className={`py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 border-2 transition-all ${type === 'OUT' ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-100' : 'bg-white border-gray-100 text-gray-500 hover:border-rose-200'}`}>
                <Minus className="w-4 h-4" /> Stock OUT
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">Quantity</label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-black text-gray-700 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <input type="number" min={1} value={quantity}
                onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                className="flex-1 text-center py-2.5 bg-gray-50 rounded-xl font-black text-gray-900 text-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              <button type="button" onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center font-black text-gray-700 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">Reason</label>
            <select value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
              <option value="ADJUSTMENT">Manual Adjustment / Audit</option>
              <option value="PURCHASE">Purchase / Restock</option>
              <option value="RETURN">Customer Return</option>
              <option value="DAMAGE">Damage / Shrinkage</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">Reference Note (Optional)</label>
            <input type="text" placeholder="e.g. PO #12345 or Audit #A-001" value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {error && (
            <div className="flex items-center gap-3 p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}
          {success && (
            <div className="flex items-center gap-3 p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <p className="text-sm font-bold">Stock adjusted successfully!</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-black text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || success}
              className={`flex-1 py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 ${type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'}`}>
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {type === 'IN' ? 'Add Stock' : 'Remove Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function InventoryPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [summary, setSummary] = useState<Summary>({ totalProducts: 0, lowStockCount: 0, outOfStockCount: 0, totalStockUnits: 0 });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [stockStatus, setStockStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');
  const [adjustProduct, setAdjustProduct] = useState<Product | null>(null);

  const LIMIT = 10;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInventoryStock({ page, limit: LIMIT, search, stockStatus, categoryId, sortBy, sortOrder });
      setProducts(res.data);
      setTotal(res.total);
      setSummary(res.summary);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, stockStatus, categoryId, sortBy, sortOrder]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    api.get('/products/categories/all').then(r => setCategories(r.data)).catch(() => {});
  }, []);

  // debounce search
  const [searchInput, setSearchInput] = useState('');
  useEffect(() => {
    const t = setTimeout(() => { setSearch(searchInput); setPage(1); }, 300);
    return () => clearTimeout(t);
  }, [searchInput]);

  const toggleSort = (field: string) => {
    if (sortBy === field) setSortOrder(o => o === 'asc' ? 'desc' : 'asc');
    else { setSortBy(field); setSortOrder('asc'); }
  };

  const stockValue = products.reduce((sum, p) => sum + Number(p.price) * p.stock, 0);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-y-auto">

        {/* Header */}
        <header className="px-8 py-6 bg-white border-b border-gray-100 flex items-start justify-between sticky top-0 z-20">
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
              <span>Inventory</span><span>/</span>
              <span className="text-indigo-600">Stock Overview</span>
            </nav>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Stock Inventory</h1>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-black text-gray-600 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
            <button
              onClick={() => router.push('/dashboard/inventory/movements')}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 rounded-xl text-sm font-black text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
              Movement History
            </button>
          </div>
        </header>

        <main className="flex-1 p-8 space-y-8">

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 border-l-4 border-l-indigo-500">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Total Stock Value</p>
              <p className="text-3xl font-black text-gray-900">
                ${stockValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
              <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {summary.totalProducts} total products
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Low Stock Alerts</p>
              <p className="text-3xl font-black text-amber-500">{summary.lowStockCount}</p>
              <p className="text-xs text-gray-400 font-bold mt-2">Requires immediate reorder</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Out of Stock</p>
              <p className="text-3xl font-black text-rose-600">{summary.outOfStockCount}</p>
              <p className="text-xs text-gray-400 font-bold mt-2">Lost sales potential identified</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Total Stock Units</p>
              <p className="text-3xl font-black text-indigo-600">{summary.totalStockUnits.toLocaleString()}</p>
              <p className="text-xs text-gray-400 font-bold mt-2">Across all active products</p>
            </div>
          </div>

          {/* Filters & Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Filter Bar */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4 flex-wrap">
              {/* Status Pills */}
              <div className="flex items-center gap-2">
                {[
                  { label: 'All Stock', value: '' },
                  { label: 'Low Stock', value: 'low' },
                  { label: 'Out of Stock', value: 'out' },
                ].map(s => (
                  <button key={s.value} onClick={() => { setStockStatus(s.value); setPage(1); }}
                    className={`px-4 py-2 rounded-xl text-sm font-black transition-all ${stockStatus === s.value ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1); }}
                className="px-3 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-600 focus:outline-none">
                <option value="">All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              {/* Search */}
              <div className="ml-auto flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-3 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input placeholder="Search products..." value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="bg-transparent outline-none text-sm font-medium text-gray-700 w-48" />
              </div>
            </div>

            {/* Results count */}
            <div className="px-6 py-2 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400">
                Showing {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} of {total} products
              </p>
              <button onClick={() => fetchData()} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                    <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Category</th>
                    <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Stock Status</th>
                    <th className="px-4 py-4 text-left">
                      <button onClick={() => toggleSort('stock')} className="flex items-center gap-1 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-700">
                        Current Stock <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Reorder Level</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: 6 }).map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-gray-100 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-16 text-center">
                        <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                        <p className="font-black text-gray-400">No products found</p>
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id} className="hover:bg-gray-50/60 transition-colors group">
                        {/* Product */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Package className="w-5 h-5 text-gray-300" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-black text-sm text-gray-900">{product.name}</p>
                              <p className="text-xs text-gray-400 font-medium">${Number(product.price).toFixed(2)}</p>
                            </div>
                          </div>
                        </td>
                        {/* Category */}
                        <td className="px-4 py-4">
                          {product.category ? (
                            <span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-bold">
                              {product.category.name}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-xs">—</span>
                          )}
                        </td>
                        {/* Status */}
                        <td className="px-4 py-4"><StockBadge stock={product.stock} /></td>
                        {/* Stock */}
                        <td className="px-4 py-4">
                          <span className={`text-lg font-black ${product.stock === 0 ? 'text-rose-600' : product.stock < 10 ? 'text-amber-500' : 'text-gray-900'}`}>
                            {product.stock} units
                          </span>
                        </td>
                        {/* Reorder Level (static hint) */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-gray-400">10 units</span>
                        </td>
                        {/* Actions */}
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setAdjustProduct(product)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-black">
                            Adjust Stock
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
              <p className="text-sm font-bold text-gray-400">Page {page} of {totalPages}</p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                  return (
                    <button key={p} onClick={() => setPage(p)}
                      className={`w-8 h-8 rounded-lg text-sm font-black transition-colors ${p === page ? 'bg-indigo-600 text-white' : 'border border-gray-200 text-gray-500 hover:bg-gray-50'}`}>
                      {p}
                    </button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Adjust Modal */}
      {adjustProduct && (
        <AdjustStockModal
          product={adjustProduct}
          onClose={() => setAdjustProduct(null)}
          onSuccess={fetchData}
        />
      )}
    </div>
  );
}
