"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
  Tag, Plus, Search, X, Edit2, Trash2, Package, 
  ChevronRight, ChevronLeft, AlertCircle, CheckCircle,
  Eye, EyeOff, Info
} from 'lucide-react';
import { getCategories, createCategory, updateCategory } from '@/lib/api';
import { toast } from 'sonner';

// ── Category Form Drawer ─────────────────────────────────────────────────────
function CategoryDrawer({ 
  category, 
  onClose, 
  onSave 
}: { 
  category?: any; 
  onClose: () => void; 
  onSave: () => void; 
}) {
  const [name, setName] = useState(category?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setLoading(true);
    setError(null);
    try {
      if (category?.id) {
        await updateCategory(category.id, { name });
        toast.success('Categoría actualizada');
      } else {
        await createCategory({ name });
        toast.success('Categoría creada exitosamente');
      }
      onSave();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error al guardar la categoría');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex justify-end" onClick={onClose}>
      {/* Dimmed Overlay - NO BLUR to avoid issues */}
      <div className="absolute inset-0 bg-black/70 animate-in fade-in duration-300" />
      
      <div 
        className="relative w-full sm:max-w-md bg-card h-full shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col animate-in slide-in-from-right duration-500 border-l border-outline-variant/30 z-[110]"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-6 sm:px-10 sm:py-9 border-b border-outline-variant/20 flex items-center justify-between bg-card sticky top-0 z-20">
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tight">
              {category ? 'Editar Categoría' : 'Nueva Categoría'}
            </h2>
            <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1.5 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-primary" />
               Módulo de Inventario
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center hover:bg-surface-low rounded-xl transition-all active:scale-90 text-on-surface-variant/40 hover:text-foreground">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 sm:p-10 space-y-10 overflow-y-auto scrollbar-hide bg-card">
          {error && (
            <div className="p-5 bg-rose-500/10 border border-rose-500/20 rounded-3xl flex items-center gap-4 text-rose-500 text-sm font-black animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">
              Nombre de la Categoría <span className="text-rose-500">*</span>
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                <Tag className="h-5 w-5 text-on-surface-variant/30 group-focus-within:text-primary transition-colors" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="block w-full pl-16 pr-6 py-5 bg-surface-low border border-transparent rounded-[24px] text-sm font-black text-foreground placeholder:text-on-surface-variant/20 focus:bg-card focus:border-primary/30 transition-all outline-none shadow-inner"
                placeholder="Ej. Electrónica, Ropa, Hogar..."
              />
            </div>
          </div>

          <div className="p-8 bg-surface-low/30 rounded-[40px] border border-outline-variant/30 relative overflow-hidden group">
            <div className="absolute -right-6 -top-6 opacity-5 group-hover:scale-110 transition-transform">
               <Info className="w-28 h-28 text-on-surface-variant" />
            </div>
            <div className="flex gap-6 relative z-10">
              <div className="w-14 h-14 bg-card rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-outline-variant/30">
                <Info className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-black text-foreground mb-1.5 uppercase tracking-tight">Dato importante</h4>
                <p className="text-xs text-on-surface-variant font-bold leading-relaxed opacity-70">
                  Las categorías inactivas no aparecerán al crear nuevos productos, pero se mantendrán en los reportes históricos para integridad de datos.
                </p>
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 sm:p-10 border-t border-outline-variant/20 bg-card shrink-0">
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="w-full py-5 bg-primary text-on-primary rounded-[22px] font-black text-[12px] uppercase tracking-[0.15em] hover:opacity-90 shadow-2xl shadow-primary/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-[0.98]"
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-6 h-6" />
            )}
            {category ? 'ACTUALIZAR DATOS' : 'REGISTRAR CATEGORÍA'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Modal ────────────────────────────────────────────────────────────
function ConfirmModal({ 
  title, 
  message, 
  isOpen, 
  onClose, 
  onConfirm,
  confirmText = "Aceptar",
  type = 'danger'
}: {
  title: string;
  message: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  confirmText?: string;
  type?: 'danger' | 'warning' | 'success';
}) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-4">
      {/* Heavy solid overlay */}
      <div className="absolute inset-0 bg-black/80 animate-in fade-in duration-300" onClick={onClose} />
      
      <div className="relative bg-card w-full max-w-sm rounded-[48px] p-8 sm:p-12 shadow-[0_0_80px_-15px_rgba(0,0,0,0.6)] animate-in zoom-in-95 duration-300 border border-outline-variant/20 z-[210]">
        <div className={`w-20 h-20 rounded-[32px] mb-8 flex items-center justify-center shadow-inner ${
          type === 'danger' ? 'bg-rose-500/10 text-rose-500' : 'bg-amber-500/10 text-amber-500'
        }`}>
          <AlertCircle className="w-10 h-10" />
        </div>
        
        <h3 className="text-2xl sm:text-3xl font-black text-foreground mb-4 tracking-tight leading-tight">{title}</h3>
        <p className="text-sm text-on-surface-variant font-bold leading-relaxed mb-10 opacity-80">{message}</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 py-4.5 px-6 bg-surface-low text-on-surface-variant rounded-2xl font-black text-[10px] hover:bg-card transition-all border border-outline-variant/30 uppercase tracking-[0.2em] active:scale-95 shadow-sm"
          >
            CANCELAR
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-4.5 px-6 rounded-2xl font-black text-[10px] text-white shadow-2xl transition-all active:scale-95 uppercase tracking-[0.2em] ${
              type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30' : 'bg-primary hover:opacity-90 shadow-primary/30'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL'); // ALL, ACTIVE, INACTIVE
  const [sortBy, setSortBy] = useState('NAME_ASC'); 
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Modal State
  const [confirmModal, setConfirmModal] = useState<{isOpen: boolean, catId: string, isActive: boolean}>({
    isOpen: false, catId: '', isActive: false
  });

  const ITEMS_PER_PAGE = 15;

  const fetchCats = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCats();
  }, [fetchCats]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterType, sortBy]);

  const filteredAndSorted = categories
    .filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
      if (filterType === 'ACTIVE') return matchesSearch && c.isActive;
      if (filterType === 'INACTIVE') return matchesSearch && !c.isActive;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
      if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
      if (sortBy === 'PROD_DESC') return (b._count?.products || 0) - (a._count?.products || 0);
      if (sortBy === 'PROD_ASC') return (a._count?.products || 0) - (b._count?.products || 0);
      return 0;
    });

  const totalPages = Math.ceil(filteredAndSorted.length / ITEMS_PER_PAGE);
  const paginated = filteredAndSorted.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateCategory(id, { isActive: !currentStatus });
      toast.success(currentStatus ? 'Categoría desactivada' : 'Categoría activada');
      fetchCats();
    } catch (err: any) {
      toast.error('Error al cambiar el estado');
    }
  };

  const activeCount = categories.filter(c => c.isActive).length;
  const inactiveCount = categories.filter(c => !c.isActive).length;

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
                  <span>Logística</span><span>/</span>
                  <span className="text-on-surface-variant">Clasificación comercial</span>
                </nav>
                <h1 className="text-4xl font-black tracking-tighter mb-2">Categorías</h1>
                <p className="text-sm font-medium text-on-surface-variant max-w-xl">Organización estructural del catálogo de productos y servicios.</p>
              </div>
              
              <button
                onClick={() => { setSelectedCategory(null); setIsDrawerOpen(true); }}
                className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-on-primary rounded-[22px] text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 w-full md:w-auto"
              >
                <Plus className="w-5 h-5" /> Nueva Categoría
              </button>
            </div>

            {/* Premium Stats Bar */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
              <div className="bg-card p-6 lg:p-8 rounded-[32px] shadow-sm border border-outline-variant/30 flex flex-col lg:flex-row items-center lg:items-start gap-4 transition-all hover:border-primary/20 group">
                <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Tag className="w-6 h-6" />
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Total</p>
                  <h3 className="text-2xl font-black text-foreground tracking-tighter">{categories.length}</h3>
                </div>
              </div>
              <div className="bg-card p-6 lg:p-8 rounded-[32px] shadow-sm border border-outline-variant/30 flex flex-col lg:flex-row items-center lg:items-start gap-4 transition-all hover:border-emerald-500/20 group">
                <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Activas</p>
                  <h3 className="text-2xl font-black text-emerald-500 tracking-tighter">{activeCount}</h3>
                </div>
              </div>
              <div className="bg-card p-6 lg:p-8 rounded-[32px] shadow-sm border border-outline-variant/30 flex flex-col lg:flex-row items-center lg:items-start gap-4 transition-all hover:border-rose-500/20 group">
                <div className="w-12 h-12 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <EyeOff className="w-6 h-6" />
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Pausadas</p>
                  <h3 className="text-2xl font-black text-rose-500 tracking-tighter">{inactiveCount}</h3>
                </div>
              </div>
              <div className="bg-card p-6 lg:p-8 rounded-[32px] shadow-sm border border-outline-variant/30 flex flex-col lg:flex-row items-center lg:items-start gap-4 transition-all hover:border-on-surface-variant/20 group">
                <div className="w-12 h-12 bg-surface-low text-on-surface-variant rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform border border-outline-variant/50">
                  <Package className="w-6 h-6" />
                </div>
                <div className="text-center lg:text-left">
                  <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Artículos</p>
                  <h3 className="text-2xl font-black text-foreground tracking-tighter">
                    {categories.reduce((acc, c) => acc + (c._count?.products || 0), 0)}
                  </h3>
                </div>
              </div>
            </div>

            {/* Search Bar & Filters */}
            <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
              <div className="flex-1 relative group w-full">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/30 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text" 
                    placeholder="Filtrar categorías por nombre..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-16 pr-6 py-4 bg-card border border-outline-variant rounded-[24px] text-sm font-black focus:border-primary/40 transition-all outline-none text-foreground shadow-sm placeholder:text-on-surface-variant/20"
                  />
              </div>

              <div className="flex items-center gap-3 w-full lg:w-auto">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="flex-1 lg:flex-none bg-card border border-outline-variant rounded-[20px] px-6 py-4 text-[10px] font-black text-on-surface-variant outline-none shadow-sm transition-all cursor-pointer uppercase tracking-widest hover:border-primary/40"
                >
                  <option value="ALL">Estados</option>
                  <option value="ACTIVE">Activas</option>
                  <option value="INACTIVE">Pausadas</option>
                </select>

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="flex-1 lg:flex-none bg-card border border-outline-variant rounded-[20px] px-6 py-4 text-[10px] font-black text-on-surface-variant outline-none shadow-sm transition-all cursor-pointer uppercase tracking-widest hover:border-primary/40"
                >
                  <option value="NAME_ASC">Nombre (A-Z)</option>
                  <option value="PROD_DESC">Volumen Stock</option>
                </select>
              </div>
            </div>

            {/* Grid of Categories */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {loading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-[240px] bg-card rounded-[40px] animate-pulse border border-outline-variant/30 shadow-sm" />
                ))
              ) : paginated.length === 0 ? (
                <div className="col-span-full py-32 text-center bg-card rounded-[40px] border border-outline-variant/30 shadow-inner">
                  <Tag className="w-20 h-20 text-on-surface-variant/10 mx-auto mb-6" />
                  <p className="font-black text-on-surface-variant uppercase tracking-[0.2em] text-xs">Sin registros que mostrar</p>
                </div>
              ) : (
                paginated.map(cat => (
                  <div 
                    key={cat.id} 
                    className={`bg-card p-8 rounded-[40px] border transition-all group relative overflow-hidden flex flex-col justify-between min-h-[260px] shadow-sm ${
                      cat.isActive ? 'border-outline-variant/50 hover:shadow-2xl hover:shadow-primary/5 hover:border-primary/20' : 'border-rose-500/10 opacity-70 grayscale-[0.5] bg-rose-500/5'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center transition-all border ${
                        cat.isActive ? 'bg-surface-low text-on-surface-variant border-outline-variant group-hover:bg-primary/5 group-hover:text-primary group-hover:border-primary/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                      }`}>
                        <Tag className="w-8 h-8" />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setSelectedCategory(cat); setIsDrawerOpen(true); }}
                          className="w-10 h-10 bg-card border border-outline-variant/50 text-on-surface-variant rounded-xl flex items-center justify-center hover:bg-primary hover:text-on-primary hover:border-primary transition-all active:scale-90 shadow-sm"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setConfirmModal({ isOpen: true, catId: cat.id, isActive: cat.isActive });
                          }}
                          className={`w-10 h-10 border rounded-xl flex items-center justify-center transition-all active:scale-90 bg-card shadow-sm ${
                            cat.isActive 
                            ? 'border-outline-variant text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500' 
                            : 'border-emerald-500/40 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:border-emerald-500'
                          }`}
                        >
                          {cat.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className={`text-2xl font-black uppercase tracking-tight line-clamp-1 transition-colors mb-1 ${
                        cat.isActive ? 'text-foreground group-hover:text-primary' : 'text-on-surface-variant'
                      }`}>
                        {cat.name}
                      </h3>
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">ID: {cat.id.substring(0, 8).toUpperCase()}</p>
                    </div>
                    
                    <div className={`mt-8 pt-6 border-t flex items-center justify-between transition-colors ${cat.isActive ? 'border-outline-variant/30 group-hover:border-primary/10' : 'border-rose-500/20'}`}>
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${cat.isActive ? 'bg-primary/5 text-primary' : 'bg-surface-low text-on-surface-variant'}`}>
                          <Package className="w-5 h-5" />
                        </div>
                        <div>
                          <span className={`text-lg font-black block leading-none ${cat.isActive ? 'text-foreground' : 'text-on-surface-variant'}`}>{cat._count?.products || 0}</span>
                          <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Productos</span>
                        </div>
                      </div>
                      <ChevronRight className={`w-5 h-5 transition-transform group-hover:translate-x-1 ${cat.isActive ? 'text-on-surface-variant/20 group-hover:text-primary/30' : 'text-rose-500/10'}`} />
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between bg-card px-8 py-6 rounded-[32px] border border-outline-variant/30 shadow-sm mt-12">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  Página <span className="text-primary">{currentPage}</span> de <span className="text-foreground">{totalPages}</span>
                </p>
                <div className="flex items-center gap-2">
                  <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1}
                    className="w-12 h-12 rounded-2xl border border-outline-variant/50 flex items-center justify-center hover:bg-card text-on-surface-variant disabled:opacity-30 transition-all active:scale-90"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <div className="w-12 h-12 flex items-center justify-center bg-primary text-on-primary rounded-2xl text-xs font-black shadow-xl shadow-primary/20">
                     {currentPage}
                  </div>
                  <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages}
                    className="w-12 h-12 rounded-2xl border border-outline-variant/50 flex items-center justify-center hover:bg-card text-on-surface-variant disabled:opacity-30 transition-all active:scale-90"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {isDrawerOpen && (
        <CategoryDrawer
          category={selectedCategory}
          onClose={() => setIsDrawerOpen(false)}
          onSave={fetchCats}
        />
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={() => handleToggleStatus(confirmModal.catId, confirmModal.isActive)}
        title={confirmModal.isActive ? "¿Desactivar Categoría?" : "¿Activar Categoría?"}
        message={confirmModal.isActive 
          ? "La categoría dejará de estar disponible para nuevos productos. Los productos actuales mantendrán su categoría." 
          : "La categoría volverá a estar disponible para su uso en todo el sistema."}
        confirmText={confirmModal.isActive ? "Desactivar" : "Activar"}
        type={confirmModal.isActive ? 'danger' : 'success'}
      />
    </div>
  );
}

