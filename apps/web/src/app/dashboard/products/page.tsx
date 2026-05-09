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
  Tag,
  Hash
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
    if (stock <= 0) return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-widest">Sin Stock</span>;
    if (stock < 10) return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest">Stock Bajo</span>;
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">En Stock</span>;
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
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto pb-20">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                  <span>Inventario</span><span>/</span>
                  <span className="text-on-surface-variant">Catálogo de Productos</span>
                </nav>
                <h1 className="text-4xl font-black tracking-tighter mb-2">Productos y Stock</h1>
                <p className="text-sm font-medium text-on-surface-variant max-w-xl">Gestión centralizada de artículos, control de existencias y categorización comercial.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrintReport}
                  className="hidden sm:flex w-14 h-14 items-center justify-center bg-surface-low border border-outline-variant/50 rounded-2xl text-on-surface-variant hover:text-primary hover:bg-primary/5 transition-all active:scale-95 shadow-sm"
                  title="Exportar Reporte"
                >
                  <Download className="w-6 h-6" />
                </button>
                <Link href="/dashboard/products/new">
                  <button className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-primary text-on-primary rounded-[22px] text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95">
                    <Plus className="w-5 h-5" /> Nuevo Producto
                  </button>
                </Link>
              </div>
            </div>

            {/* Premium Search & Categories */}
            <div className="bg-card rounded-[40px] border border-outline-variant shadow-sm overflow-hidden mb-8">
              <div className="p-6 lg:p-8 border-b border-outline-variant/30 space-y-6">
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/30 group-focus-within:text-primary transition-colors" />
                    <input 
                      type="text" 
                      placeholder="Buscar por nombre, SKU o descripción..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-16 pr-6 py-4 bg-surface-low border border-transparent rounded-[24px] text-sm font-black focus:bg-card focus:border-primary/40 transition-all outline-none text-foreground shadow-inner placeholder:text-on-surface-variant/20"
                    />
                </div>

                {/* Category Scroller */}
                <div className="flex items-center gap-3">
                  <button onClick={() => scroll('left')} className="hidden lg:flex w-10 h-10 items-center justify-center bg-surface-low rounded-xl border border-outline-variant/50 hover:bg-card text-on-surface-variant active:scale-90 transition-all shadow-sm">
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  
                  <div ref={scrollContainerRef} className="flex-1 flex items-center gap-3 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1">
                    <button
                      onClick={() => setSelectedCategoryId(null)}
                      className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0 ${
                        selectedCategoryId === null 
                        ? 'bg-primary border-primary text-on-primary shadow-lg shadow-primary/20' 
                        : 'bg-surface-low border-transparent text-on-surface-variant hover:bg-card hover:border-primary/40 hover:text-primary'
                      }`}
                    >
                      Todos los Productos
                    </button>
                    
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryId(cat.id)}
                        className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border shrink-0 ${
                          selectedCategoryId === cat.id 
                          ? 'bg-primary border-primary text-on-primary shadow-lg shadow-primary/20' 
                          : 'bg-surface-low border-transparent text-on-surface-variant hover:bg-card hover:border-primary/40 hover:text-primary'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>

                  <button onClick={() => scroll('right')} className="hidden lg:flex w-10 h-10 items-center justify-center bg-surface-low rounded-xl border border-outline-variant/50 hover:bg-card text-on-surface-variant active:scale-90 transition-all shadow-sm">
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hybrid Data Display */}
              <div className="space-y-4 lg:space-y-0">
                {/* Mobile Cards */}
                <div className="lg:hidden p-4 space-y-6">
                  {loading ? (
                    Array(3).fill(0).map((_, i) => (
                      <div key={i} className="bg-surface-low rounded-[32px] h-48 animate-pulse"></div>
                    ))
                  ) : products.length === 0 ? (
                    <div className="py-20 text-center">
                      <LayoutGrid className="w-12 h-12 text-on-surface-variant/10 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Sin registros de productos</p>
                    </div>
                  ) : (
                    products.map((product) => (
                      <div key={product.id} className={`bg-surface-low/30 rounded-[32px] p-6 border border-outline-variant/30 shadow-sm transition-all ${!product.isActive ? 'opacity-50 grayscale' : ''}`}>
                         <div className="flex justify-between items-start mb-6">
                            <div className="flex items-center gap-4">
                               <div className="w-16 h-16 rounded-[20px] bg-card flex items-center justify-center overflow-hidden border border-outline-variant/50 shadow-inner">
                                  {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <LayoutGrid className="w-7 h-7 text-on-surface-variant/20" />
                                  )}
                               </div>
                               <div>
                                  <p className="text-base font-black text-foreground tracking-tight line-clamp-1">{product.name}</p>
                                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-0.5">SKU: {product.id.substring(0, 8).toUpperCase()}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-lg font-black text-primary tracking-tighter">S/ {Number(product.price).toFixed(2)}</p>
                               <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">P. Unitario</span>
                            </div>
                         </div>
                         
                         <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-card/50 p-3 rounded-2xl border border-outline-variant/20">
                               <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Categoría</p>
                               <div className="flex items-center gap-1.5">
                                  <Tag className="w-3 h-3 text-primary/60" />
                                  <span className="text-[10px] font-black text-foreground truncate">{product.category?.name || 'General'}</span>
                               </div>
                            </div>
                            <div className="bg-card/50 p-3 rounded-2xl border border-outline-variant/20">
                               <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Disponibilidad</p>
                               <div className="flex items-center justify-between">
                                  <span className="text-xs font-black text-foreground">{product.stock} <span className="text-[9px] text-on-surface-variant">UND</span></span>
                                  {getStockBadge(product.stock)}
                               </div>
                            </div>
                         </div>

                         <div className="flex gap-2">
                            <Link href={`/dashboard/products/${product.id}/edit`} className="flex-1">
                               <button className="w-full py-3.5 bg-surface-low text-on-surface-variant border border-outline-variant/30 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-card transition-all">
                                  Editar Registro
                               </button>
                            </Link>
                            <button 
                              onClick={() => handleToggleStatus(product.id)}
                              className={`flex-1 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                product.isActive ? 'bg-rose-500/10 text-rose-600' : 'bg-emerald-500/10 text-emerald-600'
                              }`}
                            >
                              {product.isActive ? 'Desactivar' : 'Reactivar'}
                            </button>
                         </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block overflow-x-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
                  <table className="w-full text-left border-collapse min-w-[1100px]">
                    <thead>
                      <tr className="bg-surface-low/30 border-b border-outline-variant/30">
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Información del Producto</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Clasificación</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Precio Mercado</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Existencias</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Estado</th>
                        <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Gestión</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/30">
                      {loading ? (
                        Array(5).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={6} className="px-10 py-8 h-24 bg-surface-low/10"></td>
                          </tr>
                        ))
                      ) : products.length === 0 ? (
                        <tr>
                           <td colSpan={6} className="px-10 py-32 text-center">
                              <LayoutGrid className="w-16 h-16 text-on-surface-variant/10 mx-auto mb-6" />
                              <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">No hay registros de productos en este catálogo</p>
                           </td>
                        </tr>
                      ) : (
                        products.map(product => (
                          <tr key={product.id} className={`hover:bg-primary/[0.02] transition-colors group ${!product.isActive ? 'opacity-50 grayscale' : ''}`}>
                            <td className="px-10 py-8">
                              <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-surface-low flex items-center justify-center overflow-hidden border border-outline-variant transition-transform group-hover:scale-110 shadow-sm">
                                  {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <LayoutGrid className="w-7 h-7 text-on-surface-variant/30" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-lg font-black text-foreground tracking-tighter leading-tight">{product.name}</p>
                                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mt-1.5 flex items-center gap-1.5">
                                     <Hash className="w-3 h-3 opacity-50" /> {product.id.substring(0, 8).toUpperCase()}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-10 py-8">
                               <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 text-primary rounded-xl border border-primary/10">
                                  <Tag className="w-3.5 h-3.5" />
                                  <span className="text-[10px] font-black uppercase tracking-widest">{product.category?.name || 'General'}</span>
                               </div>
                            </td>
                            <td className="px-10 py-8 text-right">
                               <p className="text-xl font-black text-foreground tracking-tighter leading-none">S/ {Number(product.price).toFixed(2)}</p>
                               <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Venta Unitario</span>
                            </td>
                            <td className="px-10 py-8 text-center">
                               <p className={`text-xl font-black tracking-tighter ${product.stock < 10 ? 'text-rose-500' : 'text-foreground'}`}>{product.stock}</p>
                               <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Unidades</span>
                            </td>
                            <td className="px-10 py-8 text-center">
                               {getStockBadge(product.stock)}
                            </td>
                            <td className="px-10 py-8">
                              <div className="flex items-center justify-center gap-3">
                                <Link href={`/dashboard/products/${product.id}/edit`}>
                                   <button className="w-11 h-11 bg-surface-low text-on-surface-variant hover:text-primary hover:bg-primary/10 border border-outline-variant/50 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-sm">
                                      <Edit3 className="w-4.5 h-4.5" />
                                   </button>
                                </Link>
                                <button
                                  onClick={() => handleToggleStatus(product.id)}
                                  className={`w-11 h-11 border rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-sm ${
                                    product.isActive 
                                    ? 'bg-surface-low text-on-surface-variant hover:text-rose-600 hover:bg-rose-500/10 border-outline-variant/50' 
                                    : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20 shadow-emerald-500/5'
                                  }`}
                                >
                                  <Power className="w-4.5 h-4.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Premium Pagination */}
                <div className="px-8 py-6 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between bg-surface-low/30 gap-6">
                  <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Mostrando {products.length} de {total} registros</p>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                      className="w-12 h-12 rounded-[18px] border border-outline-variant/50 flex items-center justify-center hover:bg-card text-on-surface-variant disabled:opacity-30 transition-all active:scale-90"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-6 py-3 bg-primary text-on-primary rounded-[18px] text-xs font-black shadow-xl shadow-primary/20">
                       Página {page}
                    </div>
                    <button onClick={() => setPage(p => Math.min(Math.ceil(total/10), p + 1))} disabled={page * 10 >= total}
                      className="w-12 h-12 rounded-[18px] border border-outline-variant/50 flex items-center justify-center hover:bg-card text-on-surface-variant disabled:opacity-30 transition-all active:scale-90"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

