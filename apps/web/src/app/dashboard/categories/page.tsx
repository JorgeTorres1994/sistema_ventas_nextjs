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
    <div className="fixed inset-0 z-[60] flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
      <div 
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-lg font-black text-gray-900">
            {category ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-6">
          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-600 text-sm font-bold animate-in fade-in zoom-in duration-200">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Nombre de la Categoría
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Tag className="h-4 w-4 text-gray-400 group-focus-within:text-indigo-600 transition-colors" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="block w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all"
                placeholder="Ej. Electrónica, Ropa, Hogar..."
              />
            </div>
          </div>

          <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100/50">
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <Info className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h4 className="text-sm font-black text-indigo-900 mb-1">Dato importante</h4>
                <p className="text-xs text-indigo-600/80 font-medium leading-relaxed">
                  Las categorías inactivas no aparecerán al crear nuevos productos, pero se mantendrán en los reportes históricos.
                </p>
              </div>
            </div>
          </div>
        </form>

        <div className="p-6 border-t border-gray-100 bg-gray-50/50">
          <button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 shadow-xl shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <CheckCircle className="w-5 h-5" />
            )}
            {category ? 'Guardar Cambios' : 'Crear Categoría'}
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      <div className="relative bg-white w-full max-w-sm rounded-[32px] p-8 shadow-2xl animate-in zoom-in duration-200">
        <div className={`w-16 h-16 rounded-2xl mb-6 flex items-center justify-center ${
          type === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-amber-50 text-amber-500'
        }`}>
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 px-4 bg-gray-50 text-gray-500 rounded-2xl font-black text-xs hover:bg-gray-100 transition-all">
            CANCELAR
          </button>
          <button 
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 py-3.5 px-4 rounded-2xl font-black text-xs text-white shadow-lg transition-all active:scale-95 ${
              type === 'danger' ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-100' : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-100'
            }`}
          >
            {confirmText.toUpperCase()}
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
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden transition-all duration-300">
        <TopBar />

        {/* Header */}
        <div className="px-4 lg:px-8 py-6 bg-white border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div>
            <p className="text-[10px] lg:text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Logística</p>
            <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight leading-none">Categorías</h1>
            <p className="text-xs lg:text-sm text-gray-400 font-medium mt-1">Gestione el estado y organización de sus productos.</p>
          </div>
          <button
            onClick={() => { setSelectedCategory(null); setIsDrawerOpen(true); }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 bg-indigo-600 rounded-2xl text-sm font-black text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <Plus className="w-5 h-5" /> Nueva Categoría
          </button>
        </div>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 space-y-6">
          {/* Search Bar & Filters */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 p-2 w-full">
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-xl px-4 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  placeholder="Buscar categoría..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="bg-transparent text-sm font-bold text-gray-700 outline-none flex-1"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              <select
                value={filterType}
                onChange={e => setFilterType(e.target.value)}
                className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 text-xs font-black text-gray-600 outline-none shadow-sm focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
              >
                <option value="ALL">TODOS LOS ESTADOS</option>
                <option value="ACTIVE">SOLO ACTIVAS</option>
                <option value="INACTIVE">SOLO INACTIVAS</option>
              </select>

              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="bg-white border border-gray-100 rounded-2xl px-4 py-3.5 text-xs font-black text-gray-600 outline-none shadow-sm focus:ring-2 focus:ring-indigo-100 transition-all cursor-pointer"
              >
                <option value="NAME_ASC">ORDEN: A - Z</option>
                <option value="NAME_DESC">ORDEN: Z - A</option>
                <option value="PROD_DESC">MÁS PRODUCTOS</option>
                <option value="PROD_ASC">MENOS PRODUCTOS</option>
              </select>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
                <Tag className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total</p>
                <h3 className="text-2xl font-black text-gray-900">{categories.length}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Activas</p>
                <h3 className="text-2xl font-black text-emerald-600">{activeCount}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
                <EyeOff className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Inactivas</p>
                <h3 className="text-2xl font-black text-rose-600">{inactiveCount}</h3>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Items Totales</p>
                <h3 className="text-2xl font-black text-gray-900">
                  {categories.reduce((acc, c) => acc + (c._count?.products || 0), 0)}
                </h3>
              </div>
            </div>
          </div>

          {/* Grid of Categories */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="h-40 bg-white rounded-3xl animate-pulse border border-gray-100" />
              ))
            ) : paginated.length === 0 ? (
              <div className="col-span-full py-20 text-center">
                <Tag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="font-black text-gray-400">No se encontraron categorías</p>
              </div>
            ) : (
              paginated.map(cat => (
                <div 
                  key={cat.id} 
                  className={`bg-white p-6 rounded-3xl shadow-sm border transition-all group relative overflow-hidden ${
                    cat.isActive ? 'border-gray-100 hover:shadow-xl hover:shadow-indigo-50/50 hover:border-indigo-100' : 'border-rose-100 opacity-70 bg-rose-50/20'
                  }`}
                >
                  {/* Action Buttons */}
                  <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10">
                    <button 
                      onClick={() => { setSelectedCategory(cat); setIsDrawerOpen(true); }}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        setConfirmModal({ isOpen: true, catId: cat.id, isActive: cat.isActive });
                      }}
                      className={`p-2 rounded-xl transition-all shadow-sm active:scale-90 ${
                        cat.isActive 
                        ? 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white' 
                        : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white'
                      }`}
                      title={cat.isActive ? 'Desactivar' : 'Activar'}
                    >
                      {cat.isActive ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>

                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors mb-4 ${
                    cat.isActive ? 'bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600' : 'bg-rose-100 text-rose-400'
                  }`}>
                    <Tag className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-2 mb-1">
                    <h3 className={`text-lg font-black uppercase truncate pr-16 ${
                      cat.isActive ? 'text-gray-900 group-hover:text-indigo-600' : 'text-gray-400'
                    }`}>
                      {cat.name}
                    </h3>
                    {!cat.isActive && (
                      <span className="px-2 py-0.5 bg-rose-100 text-rose-600 text-[8px] font-black uppercase rounded-full">Inactiva</span>
                    )}
                  </div>
                  
                  <div className={`flex items-center justify-between mt-6 pt-4 border-t ${cat.isActive ? 'border-gray-50' : 'border-rose-100/50'}`}>
                    <div className="flex items-center gap-1.5">
                      <Package className={`w-3.5 h-3.5 ${cat.isActive ? 'text-indigo-500' : 'text-gray-300'}`} />
                      <span className={`text-xs font-black ${cat.isActive ? 'text-indigo-900' : 'text-gray-400'}`}>{cat._count?.products || 0}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Productos</span>
                    </div>
                    <ChevronRight className={`w-4 h-4 ${cat.isActive ? 'text-gray-200 group-hover:text-indigo-300' : 'text-rose-200'}`} />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-8 py-5 rounded-3xl border border-gray-100 shadow-sm mt-6 mb-10">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Página <span className="text-gray-900">{currentPage}</span> de <span className="text-gray-900">{totalPages}</span>
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl border border-gray-100 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
              </div>
            </div>
          )}
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
