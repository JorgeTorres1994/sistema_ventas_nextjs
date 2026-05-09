"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import {
  ArrowLeft, Download, Plus, ChevronLeft, ChevronRight,
  Package, TrendingUp, TrendingDown, BarChart3, Calendar, Filter,
  ArrowDownCircle, ArrowUpCircle, Activity
} from 'lucide-react';
import { getInventoryMovements } from '@/lib/api';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ── Type Badge ────────────────────────────────────────────────────────────────
function TypeBadge({ type }: { type: string }) {
  if (type === 'IN')
    return (
      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> ENTRADA
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-black bg-rose-500/10 text-rose-500 border border-rose-500/20 uppercase tracking-widest">
      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> SALIDA
    </span>
  );
}

// ── Reason Badge ──────────────────────────────────────────────────────────────
function ReasonBadge({ reason }: { reason: string }) {
  const map: Record<string, { label: string; color: string }> = {
    SALE:            { label: 'Venta a Cliente',     color: 'bg-primary/10 text-primary border-primary/20' },
    PURCHASE:        { label: 'Orden de Compra',    color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20' },
    ADJUSTMENT:      { label: 'Ajuste Stock',  color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
    SALE_CANCELLED:  { label: 'Venta Anulada',    color: 'bg-surface-low text-on-surface-variant border-outline-variant/30' },
    RETURN:          { label: 'Devolución',   color: 'bg-teal-500/10 text-teal-500 border-teal-500/20' },
    DAMAGE:          { label: 'Daño / Desmedro',  color: 'bg-rose-500/10 text-rose-500 border-rose-500/20' },
  };
  const cfg = map[reason] ?? { label: reason, color: 'bg-surface-low text-on-surface-variant border-outline-variant/30' };
  return (
    <span className={`px-2.5 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-widest ${cfg.color}`}>
      {cfg.label}
    </span>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function MovementHistoryPage() {
  const router = useRouter();
  const [movements, setMovements] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState({ totalIn: 0, totalOut: 0 });

  // Filters
  const [type, setType] = useState('');
  const [reason, setReason] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const LIMIT = 10;
  const totalPages = Math.max(1, Math.ceil(total / LIMIT));

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getInventoryMovements({ page, limit: LIMIT, type, reason, startDate, endDate });
      setMovements(res.data);
      setTotal(res.total);
      setInsights(res.insights || { totalIn: 0, totalOut: 0 });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [page, type, reason, startDate, endDate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('es-PE', { month: 'short', day: 'numeric', year: 'numeric' });
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: false });

  const handleExportPDF = async () => {
    if (movements.length === 0) {
      toast.error('No hay movimientos para exportar');
      return;
    }

    const toastId = toast.loading('Procesando imágenes y generando PDF...');

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
      const imagePromises = movements.map(async (mv) => {
        if (mv.product?.imageUrl) {
          return { id: mv.id, base64: await getBase64Image(mv.product.imageUrl) };
        }
        return { id: mv.id, base64: null };
      });

      const images = await Promise.all(imagePromises);
      const imageMap = new Map(images.map(img => [img.id, img.base64]));
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text('Historial de Movimientos de Stock', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generado el: ${format(new Date(), "d 'de' MMMM, yyyy HH:mm", { locale: es })}`, 14, 28);
      
      const tableData = movements.map(mv => [
        '', // Space for image
        `${format(new Date(mv.createdAt), 'dd/MM/yyyy')} ${formatTime(mv.createdAt)}`,
        mv.product?.name ?? '—',
        mv.type === 'IN' ? 'ENTRADA' : 'SALIDA',
        mv.reason ?? 'AJUSTE',
        `${mv.type === 'IN' ? '+' : '-'}${mv.quantity}`,
        mv.referenceId?.substring(0,10).toUpperCase() ?? 'MANUAL'
      ]);

      autoTable(doc, {
        startY: 35,
        head: [['Foto', 'Fecha/Hora', 'Producto', 'Tipo', 'Motivo', 'Cantidad', 'Referencia']],
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
          5: { halign: 'center', fontStyle: 'bold' },
          6: { halign: 'right' }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 0) {
            const mvId = movements[data.row.index].id;
            const base64 = imageMap.get(mvId);
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

      // Preview in new tab
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
      
      toast.success('Previsualización generada', { id: toastId });
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

        {/* Optimized Header for all screens */}
        <header className="px-6 py-6 lg:px-10 lg:py-10 bg-card border-b border-outline-variant/30 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shrink-0">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] mb-3 opacity-60">
              <button onClick={() => router.push('/dashboard/inventory')} className="flex items-center gap-1.5 hover:text-primary transition-colors">
                <ArrowLeft className="w-3.5 h-3.5" /> INVENTARIO
              </button>
              <span className="text-primary font-black">/ HISTORIAL</span>
            </nav>
            <h1 className="text-3xl lg:text-5xl font-black text-foreground tracking-tighter leading-none">Movimientos</h1>
          </div>

          <div className="flex items-center gap-3">
             <button 
              onClick={handleExportPDF}
              className="p-4 bg-surface-low border border-outline-variant/30 rounded-2xl text-on-surface-variant hover:text-primary hover:border-primary transition-all active:scale-95 shadow-sm">
                <Download className="w-5 h-5" />
             </button>
             <button 
              onClick={() => router.push('/dashboard/inventory')}
              className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4.5 bg-primary rounded-[22px] text-[11px] font-black uppercase tracking-widest text-on-primary hover:opacity-90 shadow-xl shadow-primary/20 transition-all active:scale-95">
              <Plus className="w-5 h-5" /> 
              <span>Ajuste Manual</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-10 space-y-8 lg:space-y-12 overflow-y-auto scroll-smooth pb-20">

          {/* Premium Filter Bar - Responsive Layout */}
          <div className="bg-card rounded-[40px] shadow-sm border border-outline-variant/30 p-6 lg:p-10">
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8">
              
              {/* Date Range Group */}
              <div className="space-y-4 flex-1">
                <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-1 flex items-center gap-2 h-5">
                  <Calendar className="w-3.5 h-3.5" /> RANGO DE FECHAS
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative group">
                    <input 
                      type="date" 
                      value={startDate} 
                      onChange={e => { setStartDate(e.target.value); setPage(1); }}
                      className="w-full h-[54px] pl-5 pr-4 bg-surface-low border-2 border-outline-variant/20 rounded-[20px] text-[11px] font-black text-foreground focus:border-primary transition-all outline-none shadow-sm" 
                    />
                  </div>
                  <div className="relative group">
                    <input 
                      type="date" 
                      value={endDate} 
                      onChange={e => { setEndDate(e.target.value); setPage(1); }}
                      className="w-full h-[54px] pl-5 pr-4 bg-surface-low border-2 border-outline-variant/20 rounded-[20px] text-[11px] font-black text-foreground focus:border-primary transition-all outline-none shadow-sm" 
                    />
                  </div>
                </div>
              </div>

              {/* Selectors Group */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 flex-[1.5]">
                <div className="space-y-4">
                  <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-1 h-5 flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5" /> NATURALEZA
                  </label>
                  <div className="relative group">
                    <select 
                      value={type} 
                      onChange={e => { setType(e.target.value); setPage(1); }}
                      className="w-full h-[54px] pl-6 pr-10 bg-surface-low border-2 border-outline-variant/20 rounded-[20px] text-[11px] font-black uppercase tracking-widest text-foreground focus:border-primary transition-all outline-none shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="">TODOS LOS FLUJOS</option>
                      <option value="IN">ENTRADAS</option>
                      <option value="OUT">SALIDAS</option>
                    </select>
                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 rotate-90 w-4 h-4" />
                  </div>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-1 h-5 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> JUSTIFICACIÓN
                  </label>
                  <div className="relative group">
                    <select 
                      value={reason} 
                      onChange={e => { setReason(e.target.value); setPage(1); }}
                      className="w-full h-[54px] pl-6 pr-10 bg-surface-low border-2 border-outline-variant/20 rounded-[20px] text-[11px] font-black uppercase tracking-widest text-foreground focus:border-primary transition-all outline-none shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="">TODAS LAS RAZONES</option>
                      <option value="SALE">VENTA A CLIENTE</option>
                      <option value="PURCHASE">ORDEN DE COMPRA</option>
                      <option value="ADJUSTMENT">AJUSTE MANUAL</option>
                      <option value="SALE_CANCELLED">VENTA ANULADA</option>
                      <option value="RETURN">DEVOLUCIÓN</option>
                      <option value="DAMAGE">DAÑO / DESMEDRO</option>
                    </select>
                    <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none opacity-20 rotate-90 w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Reset Action */}
              <div className="pt-4 lg:pt-0">
                <button 
                  onClick={() => { setType(''); setReason(''); setStartDate(''); setEndDate(''); setPage(1); }}
                  className="w-full lg:w-auto h-[54px] px-8 bg-surface-low border-2 border-outline-variant/20 rounded-[20px] text-[10px] font-black text-on-surface-variant hover:text-rose-500 hover:border-rose-500/20 transition-all uppercase tracking-widest active:scale-95"
                >
                  Limpiar Filtros
                </button>
              </div>
            </div>
          </div>

          {/* Movements Data Container */}
          <div className="bg-card rounded-[40px] shadow-sm border border-outline-variant/30 overflow-hidden">
            
            <div className="px-6 py-6 lg:px-10 lg:py-8 bg-surface-low/30 border-b border-outline-variant/10 flex items-center justify-between">
              <p className="text-sm font-bold text-on-surface-variant/60 tracking-tight">
                Mostrando <span className="text-foreground">{(page - 1) * LIMIT + 1}–{Math.min(page * LIMIT, total)}</span> de <span className="text-foreground">{total}</span> movimientos
              </p>
              <div className="hidden sm:flex items-center gap-2.5">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Sincronizado</span>
              </div>
            </div>

            {/* MOBILE CARD VIEW (Visible only on small screens) */}
            <div className="md:hidden divide-y divide-outline-variant/10">
              {loading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="p-6 space-y-4 animate-pulse">
                    <div className="flex justify-between"><div className="h-4 bg-surface-low rounded w-1/3" /><div className="h-4 bg-surface-low rounded w-1/4" /></div>
                    <div className="h-12 bg-surface-low rounded-2xl w-full" />
                  </div>
                ))
              ) : movements.map(mv => (
                <div key={mv.id} className="p-6 space-y-5 hover:bg-primary/[0.02] transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-black text-foreground">{formatDate(mv.createdAt)}</p>
                      <p className="text-[10px] font-medium text-on-surface-variant opacity-40 uppercase tracking-widest">{formatTime(mv.createdAt)}</p>
                    </div>
                    <TypeBadge type={mv.type} />
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-surface-low border border-outline-variant/30 flex items-center justify-center overflow-hidden">
                      {mv.product?.imageUrl ? <img src={mv.product.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 opacity-20" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-black text-foreground truncate">{mv.product?.name ?? '—'}</p>
                      <div className="mt-1"><ReasonBadge reason={mv.reason ?? 'ADJUSTMENT'} /></div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-2xl font-black ${mv.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {mv.type === 'IN' ? '+' : '-'}{mv.quantity}
                      </span>
                      <span className="text-[10px] font-black opacity-20 uppercase tracking-widest">unid</span>
                    </div>
                    <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest border border-outline-variant/30 px-3 py-1.5 rounded-lg bg-surface-low">
                      #{mv.referenceId?.substring(0,6).toUpperCase() ?? 'MANUAL'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* DESKTOP TABLE VIEW (Hidden on mobile) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-low/10">
                      <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em] border-b border-outline-variant/30">Registro Temporal</th>
                      <th className="px-6 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em] border-b border-outline-variant/30">Producto / SKU</th>
                      <th className="px-6 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em] border-b border-outline-variant/30 text-center">Naturaleza</th>
                      <th className="px-6 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em] border-b border-outline-variant/30">Justificación</th>
                      <th className="px-6 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em] border-b border-outline-variant/30">Magnitud</th>
                      <th className="px-10 py-7 text-right text-[10px] font-black text-on-surface-variant uppercase tracking-[0.25em] border-b border-outline-variant/30">Referencia</th>
                    </tr>
                  </thead>
                <tbody className="divide-y divide-outline-variant/10">
                  {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i}><td colSpan={6} className="px-10 py-10"><div className="h-10 bg-surface-low rounded-2xl animate-pulse" /></td></tr>
                    ))
                  ) : movements.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-32 text-center">
                        <BarChart3 className="w-16 h-16 text-on-surface-variant/10 mx-auto mb-6" />
                        <p className="font-black text-on-surface-variant/40 uppercase tracking-widest text-xs">Sin registros que mostrar</p>
                      </td>
                    </tr>
                  ) : (
                    movements.map(mv => (
                      <tr key={mv.id} className="hover:bg-primary/[0.02] transition-all group">
                        <td className="px-10 py-8">
                          <p className="text-[14px] font-black text-foreground leading-none mb-1.5">{formatDate(mv.createdAt)}</p>
                          <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-40">{formatTime(mv.createdAt)}</p>
                        </td>
                        <td className="px-6 py-8">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-[20px] bg-card border border-outline-variant/30 flex-shrink-0 flex items-center justify-center overflow-hidden group-hover:border-primary/30 transition-colors shadow-sm">
                              {mv.product?.imageUrl ? <img src={mv.product.imageUrl} className="w-full h-full object-cover" /> : <Package className="w-6 h-6 text-on-surface-variant/20" />}
                            </div>
                            <div className="min-w-0">
                              <p className="text-[14px] font-black text-foreground truncate max-w-[220px] leading-tight mb-1">{mv.product?.name ?? '—'}</p>
                              <p className="text-[9px] text-primary font-black uppercase tracking-widest opacity-60">{mv.product?.category?.name ?? 'General'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-8 text-center"><TypeBadge type={mv.type} /></td>
                        <td className="px-6 py-8"><ReasonBadge reason={mv.reason ?? 'ADJUSTMENT'} /></td>
                        <td className="px-6 py-8">
                          <div className="flex items-baseline gap-1.5">
                            <span className={`text-2xl font-black tracking-tighter ${mv.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                              {mv.type === 'IN' ? '+' : '-'}{mv.quantity}
                            </span>
                            <span className="text-[10px] text-on-surface-variant font-black uppercase opacity-20">UNID</span>
                          </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                          <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest px-4 py-2 bg-surface-low border border-outline-variant/30 rounded-xl group-hover:border-primary/20 transition-all">
                            {mv.referenceId?.substring(0,10).toUpperCase() ?? 'MANUAL'}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Premium Pagination Footer */}
            <div className="px-6 py-8 lg:px-10 lg:py-10 bg-surface-low/10 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-8">
              <div className="flex items-center gap-2 order-2 sm:order-1">
                 <p className="text-xs font-black text-on-surface-variant/40 uppercase tracking-widest">Página {page} de {totalPages}</p>
              </div>
              <div className="flex items-center gap-3 order-1 sm:order-2">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                  className="w-14 h-14 rounded-2xl border-2 border-outline-variant/20 bg-card text-on-surface-variant hover:bg-surface-low disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm flex items-center justify-center">
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="hidden lg:flex items-center gap-2.5">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i;
                    if (p < 1 || p > totalPages) return null;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`w-12 h-12 rounded-2xl border-2 font-black text-[11px] transition-all active:scale-90 ${
                          page === p ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'border-outline-variant/20 bg-card text-on-surface-variant hover:bg-surface-low'
                        }`}>
                        {p}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="w-14 h-14 rounded-2xl border-2 border-outline-variant/20 bg-card text-on-surface-variant hover:bg-surface-low disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90 shadow-sm flex items-center justify-center">
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>

          {/* Insights & Recent Activity - More Compact */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

            {/* Main Insight Card - Optimized Size */}
            <div className="lg:col-span-2 bg-primary rounded-[40px] p-8 lg:p-10 shadow-2xl shadow-primary/20 relative overflow-hidden group min-h-[320px] flex flex-col justify-between">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-black text-white tracking-tight">Inteligencia de Flujo</h3>
                </div>
                <p className="text-[13px] text-on-primary font-medium max-w-md opacity-80 leading-relaxed">
                  Balance estratégico entre ingresos y egresos para determinar la salud financiera de su stock.
                </p>
              </div>
              
              <div className="relative z-10 grid grid-cols-2 gap-8 lg:gap-16 mt-8">
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5 opacity-70">
                    <ArrowDownCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-[9px] font-black text-on-primary uppercase tracking-[0.2em]">Ingresos Brutos</span>
                  </div>
                  <p className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
                    {insights.totalIn.toLocaleString('es-PE')}
                  </p>
                </div>
                <div className="space-y-2 border-l border-white/10 pl-8 lg:pl-16">
                  <div className="flex items-center gap-2.5 opacity-70">
                    <ArrowUpCircle className="w-4 h-4 text-rose-400" />
                    <span className="text-[9px] font-black text-on-primary uppercase tracking-[0.2em]">Egresos Totales</span>
                  </div>
                  <p className="text-4xl lg:text-5xl font-black text-white tracking-tighter">
                    {insights.totalOut.toLocaleString('es-PE')}
                  </p>
                </div>
              </div>
              <TrendingUp className="absolute -bottom-16 -right-16 w-64 h-64 text-white opacity-[0.03] group-hover:scale-110 transition-transform duration-1000 select-none pointer-events-none" />
            </div>

            {/* Sidebar Activity Feed - More Compact */}
            <div className="bg-card rounded-[40px] p-8 lg:p-10 shadow-sm border border-outline-variant/30 flex flex-col group min-h-[320px]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em]">Últimos Registros</h3>
                <Activity className="w-4 h-4 text-primary opacity-40 group-hover:opacity-100 transition-all" />
              </div>
              <div className="space-y-6 flex-1">
                {movements.slice(0, 4).map(mv => (
                  <div key={mv.id} className="flex items-center gap-4 hover:translate-x-1 transition-transform">
                    <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${mv.type === 'IN' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]'}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-black text-foreground uppercase tracking-tight truncate">{mv.product?.name ?? '—'}</p>
                      <p className="text-[9px] text-on-surface-variant font-medium opacity-40 uppercase tracking-widest">{mv.type === 'IN' ? 'Entrada' : 'Salida'}</p>
                    </div>
                    <span className={`text-sm font-black ${mv.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {mv.type === 'IN' ? '+' : '-'}{mv.quantity}
                    </span>
                  </div>
                ))}
                {movements.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-30">Sin logs recientes</p>
                  </div>
                )}
              </div>
              <button onClick={() => { setType(''); setReason(''); setPage(1); }}
                className="mt-8 w-full py-4 bg-surface-low hover:bg-primary/5 hover:text-primary rounded-[22px] text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] transition-all border border-outline-variant/30 active:scale-95">
                Ver Todo el Historial
              </button>
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

