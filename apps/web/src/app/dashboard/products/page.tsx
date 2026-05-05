"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
  Search, 
  Plus, 
  Edit3, 
  Power,
  ChevronLeft, 
  ChevronRight,
  LayoutGrid,
  Download,
  AlertCircle,
  Tag
} from 'lucide-react';
import Link from 'next/link';
import { getApiProducts, toggleProductStatus, getActiveCategories } from '@/lib/api';
import { toast } from 'sonner';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Scroll logic for categories
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const fetchCats = useCallback(async () => {
    try {
      const data = await getActiveCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const result = await getApiProducts({
        page,
        limit: 10,
        search,
        categoryId: selectedCategoryId || undefined
      });
      setProducts(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  }, [page, search, selectedCategoryId]);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

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

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { scrollLeft } = scrollContainerRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 200 : scrollLeft + 200;
      scrollContainerRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const getStockBadge = (stock: number) => {
    if (stock <= 0) return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-50 text-rose-600 border border-rose-100 uppercase tracking-widest">Sin Stock</span>;
    if (stock < 10) return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-600 border border-amber-100 uppercase tracking-widest">Stock Bajo</span>;
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-widest">En Stock</span>;
  };

  // PROCESO IDENTICO AL DE FACTURACION (VISTA DE IMPRESION)
  const handlePrintReport = () => {
    if (products.length === 0) {
      toast.error('No hay productos para imprimir');
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Bloqueador de ventanas activo. Por favor permita popups.');
      return;
    }

    const html = `
      <html>
        <head>
          <title>Reporte de Inventario - Nexus Genesis</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #111827; line-height: 1.5; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px; }
            .logo-box h2 { margin: 0; color: #4f46e5; font-size: 28px; font-weight: 900; letter-spacing: -0.02em; }
            .logo-box p { margin: 0; font-size: 10px; font-weight: 900; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; }
            .report-info { text-align: right; }
            .report-info h1 { margin: 0; font-size: 14px; font-weight: 900; color: #111827; text-transform: uppercase; letter-spacing: 0.05em; }
            .report-info p { margin: 2px 0; font-size: 10px; font-weight: 700; color: #6b7280; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background: #4f46e5; color: white; text-align: left; padding: 12px 15px; font-size: 9px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
            td { padding: 12px 15px; border-bottom: 1px solid #f3f4f6; font-size: 11px; font-weight: 600; color: #374151; }
            tr:nth-child(even) { background: #f9fafb; }
            .price { text-align: right; font-weight: 900; font-family: monospace; font-size: 12px; }
            .stock-cell { text-align: center; }
            .stock-badge { padding: 2px 8px; border-radius: 4px; font-weight: 900; font-size: 10px; }
            .low { color: #e11d48; background: #fff1f2; }
            .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #9ca3af; font-weight: 700; border-top: 1px solid #f3f4f6; padding-top: 20px; }
            @media print {
              body { padding: 0; }
              @page { margin: 1cm; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo-box">
              <h2>NEXUS GENESIS</h2>
              <p>Ecosistema ERP de Élite</p>
            </div>
            <div class="report-info">
              <h1>Reporte de Inventario</h1>
              <p>Fecha: ${new Date().toLocaleDateString()}</p>
              <p>Hora: ${new Date().toLocaleTimeString()}</p>
              <p>Página actual: ${page}</p>
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th style="text-align: right;">Precio Unit.</th>
                <th style="text-align: center;">Stock</th>
              </tr>
            </thead>
            <tbody>
              ${products.map(p => `
                <tr>
                  <td style="color: #9ca3af; font-family: monospace;">${p.id.substring(0, 8).toUpperCase()}</td>
                  <td style="font-weight: 800; color: #111827;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      ${p.imageUrl 
                        ? `<img src="${p.imageUrl}" style="width: 32px; height: 32px; border-radius: 8px; object-fit: cover; border: 1px solid #f3f4f6;" />`
                        : `<div style="width: 32px; height: 32px; border-radius: 8px; background: #f9fafb; border: 1px solid #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 8px; color: #d1d5db; font-weight: 900;">IMG</div>`
                      }
                      <span>${p.name.toUpperCase()}</span>
                    </div>
                  </td>
                  <td style="color: #4f46e5; font-size: 9px; font-weight: 900; letter-spacing: 0.05em;">${p.category?.name?.toUpperCase() || 'GENERAL'}</td>
                  <td class="price">S/ ${Number(p.price).toFixed(2)}</td>
                  <td class="stock-cell">
                    <span class="stock-badge ${p.stock < 10 ? 'low' : ''}">${p.stock}</span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="footer">
            Nexus Genesis ERP - Generado de forma automática por el sistema de gestión.
          </div>
          <script>
            window.onload = () => {
              setTimeout(() => {
                window.print();
              }, 500);
            };
          </script>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    toast.success('Abriendo panel de impresión...');
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden transition-all duration-300">
        <TopBar />

        {/* Module Header */}
        <div className="px-4 lg:px-8 py-6 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
              <span>Gestión de Inventario</span>
              <span>/</span>
              <span className="text-gray-900">Productos</span>
            </nav>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-none">Productos</h1>
            <p className="text-xs lg:text-sm text-gray-500 mt-2 font-medium">Gestione y monitoree la disponibilidad de su stock minorista.</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button 
              onClick={handlePrintReport}
              className="flex-1 sm:flex-none p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 border border-gray-100 shadow-sm active:scale-95 flex items-center justify-center"
              title="Exportar Reporte"
            >
              <Download className="w-5 h-5" />
            </button>
            <Link href="/dashboard/products/new" className="flex-1 sm:flex-none">
              <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-2xl font-black text-sm transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4 sm:hidden" />
                <span className="hidden sm:inline">Crear Producto</span>
                <span className="sm:hidden">Nuevo</span>
              </button>
            </Link>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6 scroll-smooth">
          {/* Enhanced Search Bar */}
          <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Buscar por nombre, SKU o descripción..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-4 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm focus:ring-4 focus:ring-indigo-50/50 focus:border-indigo-600 transition-all outline-none text-sm font-medium"
              />
          </div>

          {/* Category Scroller */}
          <div className="relative flex items-center gap-2">
            <button 
              onClick={() => scroll('left')}
              className="p-2 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 transition-all shrink-0 z-10"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            
            <div 
              ref={scrollContainerRef}
              className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 flex-1"
            >
              <button
                onClick={() => setSelectedCategoryId(null)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                  selectedCategoryId === null 
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-600'
                }`}
              >
                Todos los Productos
              </button>
              
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
                    selectedCategoryId === cat.id 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                    : 'bg-white border-gray-100 text-gray-400 hover:border-indigo-200 hover:text-indigo-600'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <button 
              onClick={() => scroll('right')}
              className="p-2 bg-white border border-gray-100 rounded-full shadow-sm hover:bg-gray-50 transition-all shrink-0 z-10"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Content Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[400px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[1000px]">
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
                ) : products.length === 0 ? (
                   <tr>
                     <td colSpan={6} className="px-8 py-20 text-center">
                        <AlertCircle className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="font-black text-gray-400 uppercase tracking-widest text-xs">No se encontraron productos</p>
                     </td>
                   </tr>
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
                      <div className="flex items-center gap-1.5">
                        <Tag className="w-3 h-3 text-indigo-400" />
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-widest">{product.category?.name || 'General'}</span>
                      </div>
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
          </div>

            {/* Pagination Controls */}
            <div className="px-8 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Página {page} - {products.length} de {total} registros</span>
              <div className="flex items-center gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-2 hover:bg-white border-transparent hover:border-gray-100 border rounded-xl text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-xs font-black text-indigo-600 shadow-sm">
                   {page}
                </div>
                <button 
                  disabled={page * 10 >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="p-2 hover:bg-white border-transparent hover:border-gray-100 border rounded-xl text-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
