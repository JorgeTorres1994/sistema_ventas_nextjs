"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
  Search, 
  Filter, 
  Plus, 
  MoreVertical, 
  Edit3, 
  Power,
  ChevronLeft, 
  ChevronRight,
  LayoutGrid,
  Table as TableIcon,
  Download,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { getApiProducts, toggleProductStatus } from '@/lib/api';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  
  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Todos los Productos');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getApiProducts({
        page,
        limit: 10,
        search,
        categoryId: category === 'Todos los Productos' ? undefined : category
      });
      setProducts(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    const timer = setTimeout(() => fetchProducts(), 300);
    return () => clearTimeout(timer);
  }, [fetchProducts]);

  const handleToggleStatus = async (id: string) => {
    try {
      await toggleProductStatus(id);
      fetchProducts();
    } catch (error) {
      toast.error('Error al actualizar el estado del producto');
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock <= 0) return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-widest">Sin Stock</span>;
    if (stock < 10) return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-widest">Stock Bajo</span>;
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">En Stock</span>;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-hidden">
        <TopBar />

        {/* Module Header */}
        <div className="px-8 py-6 bg-white border-b border-gray-100 flex items-center justify-between shrink-0">
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              <span>Gestión de Inventario</span>
              <span>/</span>
              <span className="text-gray-900">Productos</span>
            </nav>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none">Productos</h1>
            <p className="text-sm text-gray-500 mt-2 font-medium">Gestione y monitoree la disponibilidad de su stock minorista.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 border border-gray-100">
              <Download className="w-5 h-5" />
            </button>
            <Link href="/dashboard/products/new">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-100 flex items-center gap-2">
                Crear Producto
              </button>
            </Link>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth hide-scrollbar">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4">
             {/* Category Pills */}
             <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm overflow-x-auto no-scrollbar">
                {['Todos los Productos', 'Electrónica', 'Decoración', 'Cocina'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCategory(c)}
                    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                      category === c ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {c}
                  </button>
                ))}
                <div className="w-[1px] h-6 bg-gray-200 mx-2" />
                <button className="flex items-center gap-2 px-6 py-2.5 text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-600 transition-all">
                  <Filter className="w-4 h-4" /> Más Filtros
                </button>
             </div>
             {/* View Mode */}
             <div className="flex bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm">
                <button 
                  onClick={() => setViewMode('table')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'table' ? 'bg-gray-100 text-gray-900 shadow-inner' : 'text-gray-400'}`}
                >
                  <TableIcon className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900 shadow-inner' : 'text-gray-400'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
             </div>
          </div>

          {/* Search & Bulk Bar */}
          <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar en el inventario..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-50 focus:border-indigo-600 transition-all outline-none text-sm font-medium"
              />
          </div>
          {/* Content */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100">
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Producto</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Categoría</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-right">Precio</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Stock</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Estado</th>
                  <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 text-center">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-8 py-6 h-20 bg-gray-50/20" />
                    </tr>
                  ))
                ) : products.map((product) => (
                  <tr key={product.id} className={`group hover:bg-gray-50/50 transition-colors ${!product.isActive ? 'opacity-50' : ''}`}>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-200">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <LayoutGrid className="w-6 h-6 text-gray-300" />
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-black text-gray-900 leading-none">{product.name}</p>
                          <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">SKU: {product.id.substring(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{product.category?.name || 'Sin Categoría'}</span>
                    </td>
                    <td className="px-8 py-5 text-right font-black text-gray-900 text-sm tracking-tight">
                      S/ {Number(product.price).toFixed(2)}
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className={`text-sm font-black ${product.stock < 10 ? 'text-rose-600' : 'text-gray-600'}`}>{product.stock}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      {getStockBadge(product.stock)}
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/dashboard/products/${product.id}/edit`}>
                          <button className="p-2 hover:bg-white border-transparent hover:border-gray-100 border rounded-xl text-gray-400 hover:text-indigo-600 shadow-sm transition-all">
                            <Edit3 className="w-5 h-5" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleToggleStatus(product.id)}
                          className={`p-2 border rounded-xl shadow-sm transition-all ${
                            product.isActive ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50' : 'text-emerald-600 bg-emerald-50 border-emerald-100'
                          }`}
                        >
                          <Power className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mostrando {(page-1)*10+1} a {Math.min(page*10, total)} de {total} productos</span>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 hover:bg-white border-transparent hover:border-gray-100 border rounded-xl text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="flex bg-white border border-gray-100 rounded-xl p-1">
                   <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-black tracking-widest shadow-lg shadow-indigo-100 transition-all">{page}</button>
                </div>
                <button 
                  disabled={page * 10 >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 hover:bg-white border-transparent hover:border-gray-100 border rounded-xl text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Promo Cards (Exact Design Match) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-start gap-6">
                <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center shrink-0">
                  <AlertCircle className="w-6 h-6 text-rose-500" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-black text-gray-900 leading-none">Alertas de Stock Bajo</h3>
                    <span className="bg-rose-100 text-rose-600 px-2 py-0.5 rounded text-[10px] font-black uppercase">Urgente</span>
                  </div>
                  <p className="text-sm text-gray-500 font-medium mb-4">12 productos están actualmente por debajo de su umbral mínimo.</p>
                  <button className="text-xs font-black text-indigo-600 underline uppercase tracking-widest">Ver reporte de reposición →</button>
                </div>
             </div>

             <div className="col-span-1 lg:col-span-2 bg-indigo-600 p-8 rounded-[2rem] shadow-2xl shadow-indigo-100 relative overflow-hidden flex items-center justify-between group">
                {/* Background Decor */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
                
                <div className="relative z-10 max-w-lg">
                  <h3 className="text-2xl font-black text-white mb-2">Optimización Inteligente de Inventario</h3>
                  <p className="text-indigo-100 font-medium mb-6">Aproveche nuestro sistema impulsado por IA para predecir faltantes antes de que ocurran basándose en tendencias estacionales.</p>
                  <button className="bg-white text-indigo-600 px-8 py-3 rounded-2xl font-black text-sm hover:scale-105 transition-all shadow-xl">Probar Pronóstico IA</button>
                </div>

                <div className="relative z-10 hidden md:block">
                  <div className="w-24 h-24 bg-white/10 backdrop-blur-3xl rounded-3xl flex items-center justify-center border border-white/20 hover:rotate-12 transition-transform cursor-pointer">
                    <Plus className="w-10 h-10 text-white" />
                  </div>
                </div>
             </div>
          </div>
        </main>
      </div>
    </div>
  );
}
