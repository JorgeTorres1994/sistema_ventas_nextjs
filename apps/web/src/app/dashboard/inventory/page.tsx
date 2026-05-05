"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import {
  Search, SlidersHorizontal, ArrowUpDown, Download, AlertTriangle,
  Package, AlertCircle, TrendingUp, ChevronLeft, ChevronRight,
  MoreVertical, X, Plus, Minus, CheckCircle, RefreshCw
} from 'lucide-react';
import { getInventoryStock, adjustInventoryStock, api } from '@/lib/api';
import { toast } from 'sonner';

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
        Sin Stock
      </span>
    );
  if (stock < 10)
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-50 text-amber-600 border border-amber-100">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Stock Bajo
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      En Stock
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

  const newStock = type === 'IN' ? product.stock + quantity : Math.max(0, product.stock - quantity);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) { toast.error('La cantidad debe ser mayor a 0'); return; }
    if (type === 'OUT' && quantity > product.stock) { toast.error(`No se puede retirar más del stock actual (${product.stock})`); return; }

    setLoading(true);
    try {
      await adjustInventoryStock({ productId: product.id, quantity, type, reason, note });
      toast.success(`Stock de "${product.name}" actualizado correctamente`);
      onSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error en el ajuste. Por favor intente de nuevo.');
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
            <h2 className="text-xl font-black text-gray-900">Ajustar Stock</h2>
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
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Stock Actual</p>
              <p className="text-3xl font-black text-gray-900">{product.stock}</p>
            </div>
            <div className={`rounded-2xl p-4 text-center border-2 ${type === 'IN' ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Nuevo Stock</p>
              <p className={`text-3xl font-black ${type === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>{newStock}</p>
            </div>
          </div>

          {/* Type Toggle */}
          <div>
            <label className="block text-sm font-black text-gray-900 mb-3">Tipo de Movimiento</label>
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={() => setType('IN')}
                className={`py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 border-2 transition-all ${type === 'IN' ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100' : 'bg-white border-gray-100 text-gray-500 hover:border-emerald-200'}`}>
                <Plus className="w-4 h-4" /> Entrada (IN)
              </button>
              <button type="button" onClick={() => setType('OUT')}
                className={`py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 border-2 transition-all ${type === 'OUT' ? 'bg-rose-600 border-rose-600 text-white shadow-lg shadow-rose-100' : 'bg-white border-gray-100 text-gray-500 hover:border-rose-200'}`}>
                <Minus className="w-4 h-4" /> Salida (OUT)
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">Cantidad</label>
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
            <label className="block text-sm font-black text-gray-900 mb-2">Motivo</label>
            <select value={reason} onChange={e => setReason(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none">
              <option value="ADJUSTMENT">Ajuste Manual / Auditoría</option>
              <option value="PURCHASE">Compra / Reabastecimiento</option>
              <option value="RETURN">Devolución de Cliente</option>
              <option value="DAMAGE">Daño / Desmedro</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">Nota de Referencia (Opcional)</label>
            <input type="text" placeholder="ej. OC #12345 o Auditoría #A-001" value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>

          {/* Toast notifications handle error/success feedback */}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-black text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className={`flex-1 py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 ${type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-100'}`}>
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {type === 'IN' ? 'Agregar Stock' : 'Retirar Stock'}
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
  const [categories, setCategories] = useState<{id: string, name: string}[]>([]);
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
    } catch (e: any) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, stockStatus, categoryId, sortBy, sortOrder]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    api.get('/products/categories/all').then((r: any) => setCategories(r.data)).catch(() => {});
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

  const stockValue = products.reduce((sum: number, p: Product) => sum + Number(p.price) * p.stock, 0);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden transition-all duration-300">
        <TopBar />

        {/* Module Header */}
        <div className="px-4 lg:px-10 py-6 lg:py-8 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shrink-0">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              <span>Inventario</span><span>/</span>
              <span className="text-indigo-600">Stock</span>
            </nav>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-none">Control de Stock</h1>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[10px] lg:text-sm font-black text-gray-600 hover:bg-gray-50 transition-colors">
              <Download className="w-4 h-4" /> <span className="hidden sm:inline">Exportar</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/inventory/movements')}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 rounded-xl text-[10px] lg:text-sm font-black text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">
              <span>Kardex</span>
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-10 space-y-8 lg:space-y-10 overflow-y-auto scroll-smooth">

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50 border-l-4 border-l-indigo-500">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Valor Total de Stock</p>
              <p className="text-3xl font-black text-gray-900">
                S/ {stockValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              </p>
              <p className="text-xs text-emerald-600 font-bold mt-2 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> {summary.totalProducts} productos en total
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Alertas Stock Bajo</p>
              <p className="text-3xl font-black text-amber-500">{summary.lowStockCount}</p>
              <p className="text-xs text-gray-400 font-bold mt-2">Requiere reabastecimiento</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Sin Stock</p>
              <p className="text-3xl font-black text-rose-600">{summary.outOfStockCount}</p>
              <p className="text-xs text-gray-400 font-bold mt-2">Potencial de venta perdida</p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-50">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Unidades Totales</p>
              <p className="text-3xl font-black text-indigo-600">{summary.totalStockUnits.toLocaleString('es-PE')}</p>
              <p className="text-xs text-gray-400 font-bold mt-2">En todos los productos activos</p>
            </div>
          </div>

          {/* Filters & Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Filter Bar */}
            <div className="px-6 py-4 border-b border-gray-100 flex flex-col lg:flex-row items-center gap-6">
              {/* Status Pills */}
              <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
                {[
                  { label: 'Todo', value: '' },
                  { label: 'Bajo', value: 'low' },
                  { label: 'Cero', value: 'out' },
                ].map(s => (
                  <button key={s.value} onClick={() => { setStockStatus(s.value); setPage(1); }}
                    className={`flex-none px-4 py-2 rounded-xl text-[10px] lg:text-xs font-black transition-all ${stockStatus === s.value ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Category Filter */}
              <select value={categoryId} onChange={e => { setCategoryId(e.target.value); setPage(1); }}
                className="w-full lg:w-auto px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-[10px] lg:text-xs font-bold text-gray-600 focus:outline-none">
                <option value="">Categorías</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>

              {/* Search */}
              <div className="w-full lg:ml-auto lg:w-auto flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3">
                <Search className="w-4 h-4 text-gray-400" />
                <input placeholder="Buscar..." value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  className="bg-transparent outline-none text-[10px] lg:text-xs font-medium text-gray-700 w-full lg:w-48" />
              </div>
            </div>

            {/* Results count */}
            <div className="px-6 py-2 bg-gray-50/50 border-b border-gray-50 flex items-center justify-between">
              <p className="text-xs font-bold text-gray-400">
                Mostrando {Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)} de {total} productos
              </p>
              <button onClick={() => fetchData()} className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-indigo-600 transition-colors">
                <RefreshCw className="w-3 h-3" /> Actualizar
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="px-6 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Producto</th>
                    <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Categoría</th>
                    <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Estado de Stock</th>
                    <th className="px-4 py-4 text-left">
                      <button onClick={() => toggleSort('stock')} className="flex items-center gap-1 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-700">
                        Stock Actual <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="px-4 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Punto de Pedido</th>
                    <th className="px-6 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Acciones</th>
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
                        <p className="font-black text-gray-400">No se encontraron productos</p>
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
                              <p className="text-xs text-gray-400 font-medium">S/ {Number(product.price).toFixed(2)}</p>
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
                            {product.stock} unidades
                          </span>
                        </td>
                        {/* Reorder Level (static hint) */}
                        <td className="px-4 py-4">
                          <span className="text-sm font-bold text-gray-400">10 unidades</span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => setAdjustProduct(product)}
                            className="transition-opacity px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-black">
                            Ajustar Stock
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
              <p className="text-sm font-bold text-gray-400">Página {page} de {totalPages}</p>
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
