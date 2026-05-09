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
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
        Sin Stock
      </span>
    );
  if (stock < 10)
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Stock Bajo
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
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
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2 sm:p-6" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-500" />
      <div 
        className="relative bg-card border border-outline-variant/30 rounded-[32px] sm:rounded-[48px] shadow-[0_40px_120px_-20px_rgba(0,0,0,0.5)] w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-500 flex flex-col max-h-[98vh] z-[120]" 
        onClick={e => e.stopPropagation()}
      >
        
        {/* Header - More compact on mobile */}
        <div className="px-6 py-6 sm:px-10 sm:py-10 border-b border-outline-variant/10 flex items-start justify-between bg-card/80 backdrop-blur-md sticky top-0 z-20">
          <div className="space-y-1 sm:space-y-1.5">
            <h2 className="text-xl sm:text-3xl font-black text-foreground tracking-tighter uppercase leading-tight">Ajustar Stock</h2>
            <div className="flex items-center gap-2 sm:gap-3">
               <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${type === 'IN' ? 'bg-emerald-500' : 'bg-rose-500'} animate-pulse`} />
               <p className="text-[9px] sm:text-[11px] font-black text-primary uppercase tracking-[0.25em] truncate max-w-[180px] sm:max-w-none">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-2xl bg-surface-low border border-outline-variant/20 hover:bg-card transition-all active:scale-90 text-on-surface-variant/40 hover:text-foreground shadow-sm">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 px-6 py-6 sm:px-10 sm:py-10 space-y-6 sm:space-y-10 overflow-y-auto scrollbar-hide">
          
          {/* Stock Comparison Grid - Compact on mobile */}
          <div className="grid grid-cols-2 gap-3 sm:gap-5">
            <div className="relative group overflow-hidden bg-surface-low rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 border border-outline-variant/10 shadow-inner flex flex-col items-center justify-center">
              <p className="text-[8px] sm:text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.25em] mb-2 sm:mb-3">Actual</p>
              <p className="text-3xl sm:text-5xl font-black text-foreground tracking-tighter">{product.stock}</p>
            </div>
            
            <div className={`relative group overflow-hidden rounded-[32px] sm:rounded-[40px] p-5 sm:p-8 border-2 transition-all duration-700 shadow-xl flex flex-col items-center justify-center ${
              type === 'IN' ? 'bg-emerald-500/[0.03] border-emerald-500/20 shadow-emerald-500/5' : 'bg-rose-500/[0.03] border-rose-500/20 shadow-rose-500/5'
            }`}>
              <p className="text-[8px] sm:text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.25em] mb-2 sm:mb-3">Proyectado</p>
              <p className={`text-3xl sm:text-5xl font-black tracking-tighter animate-in slide-in-from-bottom-3 duration-500 ${type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>{newStock}</p>
            </div>
          </div>

          {/* Movement Type Toggle */}
          <div className="space-y-3">
            <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.3em] ml-2">Operación</label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-surface-low rounded-[28px] border border-outline-variant/10 shadow-inner">
              <button type="button" onClick={() => setType('IN')}
                className={`py-3.5 rounded-[22px] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  type === 'IN' 
                    ? 'bg-card text-emerald-500 shadow-lg border border-emerald-500/10' 
                    : 'text-on-surface-variant/30 hover:text-on-surface-variant/60'
                }`}>
                <Plus className="w-4 h-4 sm:w-5 h-5" /> 
                Entrada
              </button>
              <button type="button" onClick={() => setType('OUT')}
                className={`py-3.5 rounded-[22px] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.15em] flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
                  type === 'OUT' 
                    ? 'bg-card text-rose-500 shadow-lg border border-rose-500/10' 
                    : 'text-on-surface-variant/30 hover:text-on-surface-variant/60'
                }`}>
                <Minus className="w-4 h-4 sm:w-5 h-5" /> 
                Salida
              </button>
            </div>
          </div>

          {/* Quantity Counter - Scaled for mobile */}
          <div className="space-y-3">
            <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.3em] ml-2">Cantidad</label>
            <div className="flex items-center justify-between gap-4 bg-surface-low p-3 sm:p-4 rounded-[32px] sm:rounded-[40px] border border-outline-variant/10 shadow-inner">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-card border border-outline-variant/30 hover:bg-surface-low flex items-center justify-center transition-all active:scale-90 shadow-md text-on-surface-variant/60 hover:text-primary">
                <Minus className="w-5 h-5 sm:w-6 h-6" />
              </button>
              
              <div className="flex-1 text-center">
                 <input type="number" min={1} value={quantity}
                   onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                   className="w-full text-center bg-transparent font-black text-foreground text-4xl sm:text-7xl focus:outline-none tracking-tighter" />
                 <p className="text-[8px] sm:text-[10px] font-black text-primary/40 uppercase tracking-[0.2em] mt-1">Unid.</p>
              </div>

              <button type="button" onClick={() => setQuantity(quantity + 1)}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-card border border-outline-variant/30 hover:bg-surface-low flex items-center justify-center transition-all active:scale-90 shadow-md text-on-surface-variant/60 hover:text-primary">
                <Plus className="w-5 h-5 sm:w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Reason & Notes */}
          <div className="grid grid-cols-1 gap-6">
            <div className="space-y-3">
              <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.3em] ml-2">Justificación</label>
              <div className="relative group">
                 <select value={reason} onChange={e => { setReason(e.target.value); }}
                  className="w-full pl-6 pr-10 py-4 sm:py-5 bg-card border-2 border-transparent rounded-[22px] sm:rounded-[28px] text-[10px] sm:text-xs font-black text-foreground focus:border-primary transition-all outline-none shadow-sm uppercase tracking-widest appearance-none cursor-pointer">
                  <option value="ADJUSTMENT">Ajuste de Stock</option>
                  <option value="PURCHASE">Compra / Ingreso</option>
                  <option value="RETURN">Devolución</option>
                  <option value="DAMAGE">Merma / Daño</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                   <ChevronRight className="w-4 h-4 rotate-90 text-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant/50 uppercase tracking-[0.3em] ml-2">Notas</label>
              <input type="text" placeholder="Referencia..." value={note}
                onChange={e => setNote(e.target.value)}
                className="w-full px-6 py-4 sm:py-5 bg-card border-2 border-transparent rounded-[22px] sm:rounded-[28px] text-[10px] sm:text-xs font-black text-foreground placeholder:text-on-surface-variant/20 focus:border-primary transition-all outline-none shadow-sm tracking-widest" />
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-6 sm:px-10 sm:py-10 border-t border-outline-variant/10 bg-card/80 backdrop-blur-md flex flex-col sm:flex-row gap-3 sm:gap-5 shrink-0 z-20">
          <button type="button" onClick={onClose} disabled={loading}
            className="flex-1 py-4 bg-surface-low text-on-surface-variant rounded-[22px] sm:rounded-[28px] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-card transition-all border border-outline-variant/30 active:scale-[0.98] shadow-sm">
            Cancelar
          </button>
          <button type="submit" onClick={handleSubmit} disabled={loading}
            className={`flex-[1.5] py-4 rounded-[22px] sm:rounded-[28px] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white flex items-center justify-center gap-3 shadow-xl transition-all disabled:opacity-50 active:scale-[0.98] ${
              type === 'IN' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30'
            }`}>
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : (type === 'IN' ? <CheckCircle className="w-4 h-4 sm:w-5 h-5" /> : <AlertCircle className="w-4 h-4 sm:w-5 h-5" />)}
            {type === 'IN' ? 'Confirmar Entrada' : 'Confirmar Salida'}
          </button>
        </div>
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

  const handleExportPDF = async () => {
    if (products.length === 0) {
      toast.error('No hay productos para exportar');
      return;
    }

    const toastId = toast.loading('Procesando inventario y generando PDF...');

    try {
      const doc = new jsPDF('l', 'mm', 'a4');
      
      // Helper to convert image URL to base64
      const getBase64Image = (url: string): Promise<string | null> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.setAttribute('crossOrigin', 'anonymous');
          img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            if (!ctx) return resolve(null);
            ctx.drawImage(img, 0, 0);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
          };
          img.onerror = () => resolve(null);
          img.src = url;
        });
      };

      // Pre-load images
      const imagePromises = products.map(async (p) => {
        if (p.imageUrl) {
          return { id: p.id, base64: await getBase64Image(p.imageUrl) };
        }
        return { id: p.id, base64: null };
      });

      const images = await Promise.all(imagePromises);
      const imageMap = new Map(images.map(img => [img.id, img.base64]));
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text('Inventario de Existencias - Valorizado', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado el: ${format(new Date(), "d 'de' MMMM, yyyy HH:mm", { locale: es })}`, 14, 28);
      doc.text(`Valor Total del Inventario: S/ ${stockValue.toLocaleString('es-PE')}`, 14, 33);
      
      const tableData = products.map(p => [
        '', // Space for image
        p.name,
        p.category?.name ?? 'General',
        `${p.stock.toLocaleString('es-PE')} UNID`,
        `S/ ${Number(p.price).toFixed(2)}`,
        `S/ ${(p.stock * Number(p.price)).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['Foto', 'Nombre del Producto', 'Categoría', 'Stock', 'Precio U.', 'Valor Total']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [37, 99, 235], 
          textColor: 255, 
          fontSize: 9, 
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: { 
          fontSize: 8, 
          cellPadding: 4,
          valign: 'middle'
        },
        columnStyles: {
          0: { cellWidth: 20, halign: 'center' },
          3: { halign: 'center', fontStyle: 'bold' },
          4: { halign: 'right' },
          5: { halign: 'right', fontStyle: 'bold' }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const pId = products[data.row.index].id;
            const base64 = imageMap.get(pId);
            if (base64) {
              const x = data.cell.x + 2;
              const y = data.cell.y + 2;
              doc.addImage(base64, 'JPEG', x, y, 16, 16);
            }
          }
        },
        bodyStyles: {
          minCellHeight: 20
        }
      });

      // Preview
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
      
      toast.success('Reporte de inventario generado', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Error al generar el PDF', { id: toastId });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 w-full overflow-hidden">
        <TopBar />

        {/* Module Header */}
        <div className="px-6 py-6 sm:px-10 sm:py-9 bg-card border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shrink-0">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-2.5 opacity-60">
              <span>Inventario</span>
              <div className="w-1 h-1 rounded-full bg-outline-variant" />
              <span className="text-primary">Vista General</span>
            </nav>
            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-none">Stock de Inventario</h1>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            <button 
              onClick={handleExportPDF}
              className="flex-1 sm:flex-none flex items-center justify-center gap-3 px-5 py-4 bg-surface-low border border-outline-variant/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant hover:bg-card transition-all active:scale-95 shadow-sm"
            >
              <Download className="w-4 h-4" /> 
              <span className="hidden xs:inline">Exportar</span>
            </button>
            <button
              onClick={() => router.push('/dashboard/inventory/movements')}
              className="flex-2 sm:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-primary rounded-2xl text-[10px] font-black uppercase tracking-widest text-on-primary hover:opacity-90 shadow-[0_10px_25px_-5px_rgba(37,99,235,0.4)] transition-all active:scale-95">
              <RefreshCw className="w-4 h-4" /> 
              <span>Movimientos</span>
            </button>
          </div>
        </div>

        <main className="flex-1 p-4 lg:p-8 space-y-8 overflow-y-auto scroll-smooth pb-20">

          {/* Optimized Summary Cards - Compact & Efficient */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-card rounded-[32px] p-6 sm:p-8 shadow-sm border border-outline-variant border-l-4 border-l-primary group hover:shadow-xl hover:border-primary/20 transition-all flex flex-col justify-between min-h-[160px]">
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-4 opacity-60">Valor Total Stock</p>
                <p className="text-3xl font-black text-foreground tracking-tighter">
                  S/ {stockValue.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                </p>
              </div>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mt-6 flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5" /> {summary.totalProducts} ACTIVOS
              </p>
            </div>

            <div className="bg-card rounded-[32px] p-6 sm:p-8 shadow-sm border border-outline-variant group hover:shadow-xl hover:border-amber-500/20 transition-all min-h-[160px] flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-4 opacity-60">Stock Bajo</p>
                <p className="text-3xl font-black text-amber-500 tracking-tighter">{summary.lowStockCount}</p>
              </div>
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-6 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 opacity-40" /> 
                <span className="opacity-60">EN RIESGO</span>
              </p>
            </div>

            <div className="bg-card rounded-[32px] p-6 sm:p-8 shadow-sm border border-outline-variant group hover:shadow-xl hover:border-rose-500/20 transition-all min-h-[160px] flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-4 opacity-60">Sin Stock</p>
                <p className="text-3xl font-black text-rose-500 tracking-tighter">{summary.outOfStockCount}</p>
              </div>
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-6 flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 opacity-40" /> 
                <span className="opacity-60">VENTAS PERDIDAS</span>
              </p>
            </div>

            <div className="bg-card rounded-[32px] p-6 sm:p-8 shadow-sm border border-outline-variant group hover:shadow-xl hover:border-primary/20 transition-all min-h-[160px] flex flex-col justify-between">
              <div>
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-4 opacity-60">Unidades Totales</p>
                <p className="text-3xl font-black text-primary tracking-tighter">{summary.totalStockUnits.toLocaleString('es-PE')}</p>
              </div>
              <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest mt-6 flex items-center gap-2">
                <Package className="w-3.5 h-3.5 opacity-40" /> 
                <span className="opacity-60">EN ALMACÉN</span>
              </p>
            </div>
          </div>

          {/* Filters & Table Container */}
          <div className="bg-card rounded-[40px] shadow-sm border border-outline-variant/30 overflow-hidden">

            {/* Premium Filter Bar - Perfectly Aligned Symmetry */}
            <div className="px-6 py-6 sm:px-10 sm:py-10 border-b border-outline-variant/10 bg-card">
              <div className="max-w-[1600px] mx-auto flex flex-col xl:flex-row xl:items-end justify-between gap-8 sm:gap-10">
                
                {/* 1. Availability Filter */}
                <div className="space-y-4 flex-shrink-0">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.4em] ml-1 flex items-center gap-2 h-5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    DISPONIBILIDAD
                  </label>
                  <div className="flex items-center gap-2.5 overflow-x-auto scrollbar-hide h-[52px]">
                    {[
                      { label: 'Todo', value: '', icon: Package },
                      { label: 'Bajo', value: 'low', icon: AlertTriangle },
                      { label: 'Agotado', value: 'out', icon: AlertCircle },
                    ].map(s => {
                      const Icon = s.icon;
                      const isActive = stockStatus === s.value;
                      return (
                        <button 
                          key={s.value} 
                          onClick={() => { setStockStatus(s.value); setPage(1); }}
                          className={`h-full whitespace-nowrap flex items-center gap-3 px-6 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border-2 shadow-sm ${
                            isActive 
                              ? `bg-primary border-primary text-white shadow-lg shadow-primary/20` 
                              : `bg-surface-low border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary`
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'opacity-40'}`} />
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Controls Row - Takes remaining space */}
                <div className="flex flex-col sm:flex-row items-end gap-5 flex-1 w-full">
                  {/* Category Selector */}
                  <div className="space-y-4 w-full sm:w-[300px]">
                    <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] ml-1 h-5 flex items-center">LÍNEA DE PRODUCTO</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none transition-colors group-focus-within:text-primary z-10">
                        <SlidersHorizontal className="w-4 h-4 opacity-40 group-focus-within:opacity-100" />
                      </div>
                      <select 
                        value={categoryId} 
                        onChange={e => { setCategoryId(e.target.value); setPage(1); }}
                        className="h-[52px] w-full pl-14 pr-12 bg-surface-low border-2 border-outline-variant/20 rounded-[24px] text-[11px] font-black uppercase tracking-[0.1em] text-foreground focus:border-primary transition-all outline-none shadow-sm appearance-none cursor-pointer hover:shadow-md"
                      >
                        <option value="">TODAS LAS CATEGORÍAS</option>
                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-20">
                         <ChevronRight className="w-4 h-4 rotate-90 text-primary" />
                      </div>
                    </div>
                  </div>

                  {/* Search Input */}
                  <div className="space-y-4 flex-1 w-full">
                    <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.4em] ml-1 h-5 flex items-center">BÚSQUEDA INTELIGENTE</label>
                    <div className="relative group flex items-center">
                      <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none z-10">
                        <Search className="w-5 h-5 text-on-surface-variant/20 group-focus-within:text-primary transition-all" />
                      </div>
                      <input 
                        placeholder="NOMBRE, SKU O CÓDIGO..." 
                        value={searchInput}
                        onChange={e => setSearchInput(e.target.value)}
                        className="h-[52px] w-full pl-14 pr-12 bg-surface-low border-2 border-outline-variant/20 rounded-[24px] text-[11px] font-black text-foreground placeholder:text-on-surface-variant/20 focus:border-primary transition-all outline-none shadow-sm placeholder:font-bold hover:shadow-md placeholder:uppercase placeholder:tracking-widest" 
                      />
                      {searchInput && (
                        <button 
                          onClick={() => setSearchInput('')}
                          className="absolute right-4 p-2 hover:bg-surface-low rounded-xl transition-all text-on-surface-variant/40 hover:text-rose-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Sync Action */}
                  <div className="space-y-4 flex-shrink-0">
                    <div className="h-5" /> {/* Spacer for label alignment */}
                    <div className="h-[52px] flex items-center">
                      <button 
                        onClick={() => fetchData()} 
                        className="h-full flex items-center justify-center gap-3 px-8 bg-card border-2 border-outline-variant/30 rounded-[24px] text-[10px] font-black text-on-surface-variant hover:text-primary hover:border-primary transition-all uppercase tracking-[0.2em] active:scale-95 shadow-sm"
                      >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary' : 'opacity-30'}`} /> 
                        <span className="hidden xl:inline">SINCRONIZAR</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area: Table (Desktop) / Cards (Mobile) */}
            <div className="overflow-x-auto scrollbar-hide">
              {/* DESKTOP TABLE */}
              <table className="hidden md:table w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-low/30">
                    <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] border-b border-outline-variant/30">Producto</th>
                    <th className="px-6 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] border-b border-outline-variant/30">Categoría</th>
                    <th className="px-6 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] border-b border-outline-variant/30">Estado</th>
                    <th className="px-6 py-7 border-b border-outline-variant/30">
                      <button onClick={() => toggleSort('stock')} className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] hover:text-primary transition-colors group/sort">
                        Stock Actual <ArrowUpDown className="w-3.5 h-3.5 transition-transform group-hover/sort:scale-125" />
                      </button>
                    </th>
                    <th className="px-10 py-7 text-right text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] border-b border-outline-variant/30">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td colSpan={5} className="px-10 py-8"><div className="h-12 bg-surface-low rounded-2xl" /></td>
                      </tr>
                    ))
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <div className="w-24 h-24 bg-surface-low rounded-[40px] flex items-center justify-center mx-auto mb-6">
                           <Package className="w-10 h-10 text-on-surface-variant/20" />
                        </div>
                        <p className="font-black text-on-surface-variant uppercase tracking-[0.2em] text-xs">No se encontraron productos</p>
                      </td>
                    </tr>
                  ) : (
                    products.map(product => (
                      <tr key={product.id} className="hover:bg-primary/[0.02] transition-all group">
                        <td className="px-10 py-7">
                          <div className="flex items-center gap-5">
                            <div className="w-16 h-16 rounded-[22px] bg-card border border-outline-variant/30 overflow-hidden flex-shrink-0 group-hover:border-primary/20 transition-colors shadow-sm relative">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-surface-low/30">
                                  <Package className="w-7 h-7 text-on-surface-variant/10" />
                                </div>
                              )}
                            </div>
                            <div>
                              <p className="font-black text-[15px] text-foreground tracking-tight leading-tight">{product.name}</p>
                              <p className="text-[10px] font-black text-primary uppercase tracking-[0.1em] mt-2 opacity-60">S/ {Number(product.price).toFixed(2)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-7">
                          {product.category ? (
                            <span className="px-4 py-2 bg-surface-low border border-outline-variant/20 rounded-xl text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                              {product.category.name}
                            </span>
                          ) : (
                            <span className="text-on-surface-variant/20 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-7"><StockBadge stock={product.stock} /></td>
                        <td className="px-6 py-7">
                          <span className={`text-2xl font-black tracking-tighter ${product.stock === 0 ? 'text-rose-500' : product.stock < 10 ? 'text-amber-500' : 'text-foreground'}`}>
                            {product.stock.toLocaleString('es-PE')} <span className="text-[10px] font-black uppercase opacity-20 ml-1">Unid</span>
                          </span>
                        </td>
                        <td className="px-10 py-7 text-right">
                          <button
                            onClick={() => setAdjustProduct(product)}
                            className="px-6 py-3 bg-surface-low hover:bg-primary hover:text-on-primary border border-outline-variant/30 hover:border-primary rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm group-hover:shadow-md">
                            Ajustar Stock
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
              {/* MOBILE CARD VIEW */}
              <div className="md:hidden p-6 space-y-6 bg-surface-low/10">
                 {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="h-48 bg-surface-low rounded-[40px] animate-pulse" />
                    ))
                 ) : products.length === 0 ? (
                    <div className="py-20 text-center">
                       <Package className="w-16 h-16 text-on-surface-variant/10 mx-auto mb-4" />
                       <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">Sin resultados</p>
                    </div>
                 ) : (
                    products.map(product => (
                      <div key={product.id} className="bg-card border border-outline-variant/20 rounded-[40px] p-6 shadow-sm active:scale-[0.98] transition-all">
                         <div className="flex items-start gap-5 mb-6">
                            <div className="w-20 h-20 rounded-[28px] bg-surface-low border border-outline-variant/10 overflow-hidden flex-shrink-0 shadow-inner">
                               {product.imageUrl ? (
                                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                               ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-surface-low/20">
                                     <Package className="w-8 h-8 text-on-surface-variant/20" />
                                  </div>
                               )}
                            </div>
                            <div className="flex-1 min-w-0 pt-1">
                               <div className="flex items-start justify-between gap-2">
                                  <h3 className="font-black text-lg text-foreground tracking-tight leading-tight truncate">{product.name}</h3>
                               </div>
                               <div className="flex items-center gap-2 mt-2">
                                  <StockBadge stock={product.stock} />
                                  {product.category && (
                                     <span className="text-[9px] font-black text-primary uppercase tracking-widest px-2 py-1 bg-primary/5 rounded-lg border border-primary/10">{product.category.name}</span>
                                  )}
                               </div>
                               <p className="text-[11px] font-black text-foreground/40 uppercase tracking-widest mt-2.5">S/ {Number(product.price).toFixed(2)}</p>
                            </div>
                         </div>
                         
                         <div className="flex items-center justify-between pt-6 border-t border-outline-variant/10">
                            <div>
                               <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-1">Disponibilidad</p>
                               <span className={`text-2xl font-black tracking-tighter ${product.stock === 0 ? 'text-rose-500' : product.stock < 10 ? 'text-amber-500' : 'text-foreground'}`}>
                                  {product.stock.toLocaleString('es-PE')} <span className="text-[10px] opacity-20 ml-1 uppercase">Unid</span>
                               </span>
                            </div>
                            <button
                               onClick={() => setAdjustProduct(product)}
                               className="px-6 py-4 bg-primary text-on-primary rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 active:scale-95 transition-all">
                               Ajustar
                            </button>
                         </div>
                      </div>
                    ))
                 )}
              </div>
            </div>

            {/* Pagination & Status Footer - Correct placement at the very bottom */}
            <div className="px-6 py-6 sm:px-10 sm:py-8 bg-surface-low/10 border-t border-outline-variant/30 flex flex-col md:flex-row items-center justify-between gap-6">
              
              {/* Simplified Status Label (Photo 2) */}
              <div className="order-2 md:order-1">
                <p className="text-sm font-bold text-on-surface-variant/60 tracking-tight">
                  Mostrando <span className="text-foreground">{Math.min((page - 1) * LIMIT + 1, total)}–{Math.min(page * LIMIT, total)}</span> de <span className="text-foreground">{total}</span> productos
                </p>
              </div>

              {/* Center/Right Side: Pagination Controls */}
              <div className="flex items-center gap-2 sm:gap-3 order-1 md:order-2">
                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 mr-2">Página {page} / {totalPages}</p>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-12 h-12 rounded-2xl border border-outline-variant/30 bg-card text-on-surface-variant hover:bg-surface-low disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm flex items-center justify-center">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="hidden sm:flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-12 h-12 rounded-2xl text-xs font-black transition-all active:scale-90 shadow-sm ${p === page ? 'bg-primary text-on-primary shadow-primary/30 border border-primary' : 'bg-card border border-outline-variant/30 text-on-surface-variant hover:border-primary/40 hover:text-primary'}`}>
                        {p}
                      </button>
                    );
                  })}
                </div>

                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-12 h-12 rounded-2xl border border-outline-variant/30 bg-card text-on-surface-variant hover:bg-surface-low disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm flex items-center justify-center">
                  <ChevronRight className="w-5 h-5" />
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

