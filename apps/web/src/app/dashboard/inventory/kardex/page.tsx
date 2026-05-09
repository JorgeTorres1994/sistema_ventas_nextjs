"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
  Boxes, 
  Search, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Printer, 
  Download, 
  Filter,
  ChevronRight,
  TrendingUp,
  Package,
  Info,
  DollarSign,
  History,
  Tag,
  BarChart3
} from 'lucide-react';
import { getKardex, getProducts } from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileText } from 'lucide-react';

export default function KardexPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [kardexData, setKardexData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await getProducts({ limit: 1000 });
        setProducts(response.data);
        if (response.data.length > 0) {
          setSelectedProductId(response.data[0].id);
        }
      } catch (error) {
        toast.error('Error al cargar productos');
      }
    };
    fetchProducts();
  }, []);

  const fetchKardex = useCallback(async () => {
    if (!selectedProductId) return;
    setLoading(true);
    try {
      const data = await getKardex(selectedProductId, filters);
      setKardexData(data);
    } catch (error) {
      toast.error('Error al cargar el Kardex');
    } finally {
      setLoading(false);
    }
  }, [selectedProductId, filters]);

  useEffect(() => {
    fetchKardex();
  }, [fetchKardex]);

  const getReasonBadge = (reason: string) => {
    const colors: any = {
      'SALE': 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      'PURCHASE': 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      'ADJUSTMENT': 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      'SALE_CANCELLED': 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };
    return (
      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border ${colors[reason] || 'bg-surface-low text-on-surface-variant border-outline-variant'}`}>
        {reason === 'SALE' ? 'Venta' : 
         reason === 'PURCHASE' ? 'Compra' : 
         reason === 'ADJUSTMENT' ? 'Ajuste' : 
         reason === 'SALE_CANCELLED' ? 'Venta Anulada' : reason}
      </span>
    );
  };

  const handleExportExcel = async () => {
    if (!kardexData || kardexData.movements.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const toastId = toast.loading('Preparando Excel...');

    try {
      // Dynamic import to ensure library is available in client context
      const XLSX = await import('xlsx');
      
      const data = kardexData.movements.map((move: any) => ({
        'FECHA': format(new Date(move.createdAt), 'dd/MM/yyyy HH:mm'),
        'MOTIVO': move.reason || 'S/D',
        'TIPO': move.type === 'IN' ? 'ENTRADA' : 'SALIDA',
        'CANTIDAD': move.quantity,
        'COSTO UNITARIO': Number(move.unitCost || 0).toFixed(2),
        'COSTO TOTAL': Number(move.totalCost || 0).toFixed(2),
        'STOCK FINAL': move.nextStock || 0,
        'VALOR TOTAL': Number(move.nextValue || 0).toFixed(2)
      }));

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Kardex');

      const fileName = `Kardex_Report.xlsx`;
      
      // Use the library's native write file
      XLSX.writeFile(wb, fileName);
      
      toast.success('Excel descargado', { id: toastId });
    } catch (error: any) {
      console.error('EXPORT ERROR:', error);
      toast.error('Error: ' + error.message, { id: toastId });
    }
  };

  const handleExportPDF = async () => {
    if (!kardexData || kardexData.movements.length === 0) {
      toast.error('No hay datos para exportar');
      return;
    }

    const toastId = toast.loading('Procesando reporte PDF con imagen...');

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

      let base64Photo = null;
      if (kardexData.product?.imageUrl) {
        base64Photo = await getBase64Image(kardexData.product.imageUrl);
      }
      
      // Header
      doc.setFontSize(22);
      doc.setTextColor(40, 40, 40);
      doc.text('Kardex de Inventario Valorizado', 14, 20);
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`PRODUCTO: ${kardexData.product.name.toUpperCase()}`, 14, 28);
      doc.text(`FECHA DE REPORTE: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 33);

      if (base64Photo) {
        // Draw image in the top right corner
        doc.addImage(base64Photo, 'JPEG', 250, 8, 28, 28);
      }

      const tableData = kardexData.movements.map((move: any) => [
        format(new Date(move.createdAt), 'dd/MM/yyyy HH:mm'),
        move.reason === 'SALE' ? 'VENTA' : move.reason === 'PURCHASE' ? 'COMPRA' : move.reason === 'ADJUSTMENT' ? 'AJUSTE' : move.reason,
        move.type === 'IN' ? move.quantity : '-',
        move.type === 'IN' ? `S/ ${Number(move.unitCost).toFixed(2)}` : '-',
        move.type === 'IN' ? `S/ ${Number(move.totalCost).toFixed(2)}` : '-',
        move.type === 'OUT' ? move.quantity : '-',
        move.type === 'OUT' ? `S/ ${Number(move.unitCost).toFixed(2)}` : '-',
        move.type === 'OUT' ? `S/ ${Number(move.totalCost).toFixed(2)}` : '-',
        (move.nextStock ?? 0).toLocaleString(),
        `S/ ${move.nextStock > 0 ? (Number(move.nextValue) / move.nextStock).toFixed(2) : '0.00'}`,
        `S/ ${Number(move.nextValue).toFixed(2)}`
      ]);

      autoTable(doc, {
        startY: 40,
        head: [['FECHA', 'MOTIVO', 'ENT. CANT', 'ENT. CU', 'ENT. TOT', 'SAL. CANT', 'SAL. CU', 'SAL. TOT', 'STOCK', 'C.P.', 'VALOR T.']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [37, 99, 235], 
          textColor: 255, 
          fontSize: 8, 
          fontStyle: 'bold',
          halign: 'center'
        },
        styles: { 
          fontSize: 7, 
          cellPadding: 3,
          valign: 'middle'
        },
        columnStyles: {
          2: { halign: 'center' },
          3: { halign: 'right' },
          4: { halign: 'right' },
          5: { halign: 'center' },
          6: { halign: 'right' },
          7: { halign: 'right' },
          8: { halign: 'center', fontStyle: 'bold' },
          9: { halign: 'right' },
          10: { halign: 'right', fontStyle: 'bold' }
        }
      });

      // Preview
      const blobUrl = doc.output('bloburl');
      window.open(blobUrl, '_blank');
      
      toast.success('Reporte Kardex generado correctamente', { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error('Error al generar reporte PDF', { id: toastId });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden w-full">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-10 pb-20">
          <div className="max-w-7xl mx-auto space-y-8 lg:space-y-12">
            
            {/* Optimized Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
              <div>
                <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Análisis de Costos</p>
                <h1 className="text-3xl lg:text-5xl font-black text-foreground tracking-tighter leading-none">Kardex Valorizado</h1>
                <p className="text-sm text-on-surface-variant font-medium mt-2 max-w-lg">Seguimiento detallado de costos y existencias bajo el método de Promedio Ponderado.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={handleExportPDF}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-6 py-4 bg-card border border-outline-variant/30 text-on-surface-variant rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-surface-low transition-all shadow-sm active:scale-95"
                >
                  <FileText className="w-5 h-5 text-rose-500" />
                  <span>PDF</span>
                </button>
                <button 
                  onClick={handleExportExcel}
                  className="flex-1 lg:flex-none flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-emerald-600/20 active:scale-95"
                >
                  <Download className="w-5 h-5" />
                  <span>Excel</span>
                </button>
              </div>
            </div>

            {/* Product Selector & Filters - Premium & Responsive */}
            <div className="bg-card rounded-[40px] border border-outline-variant/30 shadow-sm overflow-hidden">
               <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 p-6 lg:p-10">
                  <div className="lg:col-span-2 space-y-4">
                     <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-1">Seleccionar Producto</label>
                     <div className="relative group">
                        <Package className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-primary transition-transform group-focus-within:scale-110" />
                        <select 
                          className="w-full h-[64px] pl-16 pr-10 bg-surface-low border-2 border-outline-variant/20 rounded-[24px] focus:bg-card focus:border-primary transition-all outline-none font-black text-foreground appearance-none cursor-pointer text-xs uppercase tracking-wider shadow-inner"
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} — STOCK: {p.stock}</option>
                          ))}
                        </select>
                        <ChevronRight className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 pointer-events-none rotate-90" />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-1 h-5 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> INICIO
                     </label>
                     <div className="relative">
                        <input 
                          type="date" 
                          className="w-full h-[64px] px-6 bg-surface-low border-2 border-outline-variant/20 rounded-[24px] focus:bg-card focus:border-primary transition-all outline-none font-black text-foreground text-xs uppercase shadow-inner"
                          value={filters.startDate}
                          onChange={e => setFilters({...filters, startDate: e.target.value})}
                        />
                     </div>
                  </div>

                  <div className="space-y-4">
                     <label className="block text-[10px] font-black text-on-surface-variant/40 uppercase tracking-[0.3em] ml-1 h-5 flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" /> FINAL
                     </label>
                     <div className="relative">
                        <input 
                          type="date" 
                          className="w-full h-[64px] px-6 bg-surface-low border-2 border-outline-variant/20 rounded-[24px] focus:bg-card focus:border-primary transition-all outline-none font-black text-foreground text-xs uppercase shadow-inner"
                          value={filters.endDate}
                          onChange={e => setFilters({...filters, endDate: e.target.value})}
                        />
                     </div>
                  </div>
               </div>
            </div>

            {/* Product Summary Mini Cards - Grid Scaling */}
            {kardexData?.product && (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8">
                <div className="bg-card p-6 lg:p-8 rounded-[32px] border border-outline-variant/30 shadow-sm group hover:shadow-xl hover:border-primary/20 transition-all">
                   <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-3">Costo Promedio</p>
                   <h4 className="text-xl lg:text-3xl font-black text-primary tracking-tighter">S/ {Number(kardexData.product.purchasePrice).toFixed(2)}</h4>
                </div>
                <div className="bg-card p-6 lg:p-8 rounded-[32px] border border-outline-variant/30 shadow-sm group hover:shadow-xl hover:border-foreground/10 transition-all">
                   <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-3">Stock Actual</p>
                   <h4 className="text-xl lg:text-3xl font-black text-foreground tracking-tighter">{kardexData.product.stock.toLocaleString()} <span className="text-[10px] opacity-20">UNID</span></h4>
                </div>
                <div className="bg-card p-6 lg:p-8 rounded-[32px] border border-outline-variant/30 shadow-sm group hover:shadow-xl hover:border-emerald-500/20 transition-all">
                   <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-3">Valor Total</p>
                   <h4 className="text-xl lg:text-3xl font-black text-emerald-500 tracking-tighter">S/ {(kardexData.product.stock * Number(kardexData.product.purchasePrice)).toFixed(2)}</h4>
                </div>
                <div className="bg-card p-6 lg:p-8 rounded-[32px] border border-outline-variant/30 shadow-sm group hover:shadow-xl hover:border-amber-500/20 transition-all">
                   <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mb-3">Precio Venta</p>
                   <h4 className="text-xl lg:text-3xl font-black text-amber-500 tracking-tighter">S/ {Number(kardexData.product.price).toFixed(2)}</h4>
                </div>
              </div>
            )}

            {/* Valued Kardex Table & Mobile Cards */}
            <div className="bg-card rounded-[48px] border border-outline-variant/30 shadow-sm overflow-hidden mb-12">
               
               {/* MOBILE KARDEX VIEW (lg:hidden) */}
               <div className="lg:hidden divide-y divide-outline-variant/10">
                 {loading ? (
                   Array(4).fill(0).map((_, i) => (
                     <div key={i} className="p-6 space-y-4 animate-pulse">
                       <div className="h-6 bg-surface-low rounded-xl w-1/3" />
                       <div className="grid grid-cols-3 gap-2"><div className="h-10 bg-surface-low rounded-xl" /><div className="h-10 bg-surface-low rounded-xl" /><div className="h-10 bg-surface-low rounded-xl" /></div>
                     </div>
                   ))
                 ) : !kardexData || kardexData.movements.length === 0 ? (
                    <div className="p-16 text-center">
                      <History className="w-16 h-16 text-on-surface-variant/10 mx-auto mb-4" />
                      <p className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Sin movimientos registrados</p>
                    </div>
                 ) : kardexData.movements.map((move: any) => (
                   <div key={move.id} className="p-6 space-y-6 hover:bg-primary/[0.02] transition-colors">
                     <div className="flex justify-between items-start">
                        <div>
                           <p className="text-xs font-black text-foreground">{format(new Date(move.createdAt), 'dd MMM yyyy, HH:mm', { locale: es })}</p>
                           <div className="mt-2">{getReasonBadge(move.reason)}</div>
                        </div>
                        <div className="text-right">
                           <p className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Stock Final</p>
                           <p className="text-2xl font-black text-primary tracking-tighter">{(move.nextStock ?? 0).toLocaleString()}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-3 gap-3">
                        <div className="bg-surface-low p-3 rounded-2xl border border-outline-variant/30">
                           <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">{move.type === 'IN' ? 'Entrada' : 'Salida'}</p>
                           <p className={`text-sm font-black ${move.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>{move.quantity}</p>
                        </div>
                        <div className="bg-surface-low p-3 rounded-2xl border border-outline-variant/30">
                           <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Costo U.</p>
                           <p className="text-sm font-black text-foreground">S/ {Number(move.unitCost).toFixed(2)}</p>
                        </div>
                        <div className="bg-surface-low p-3 rounded-2xl border border-outline-variant/30">
                           <p className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-widest mb-1">Valor T.</p>
                           <p className="text-sm font-black text-foreground">S/ {Number(move.nextValue).toFixed(2)}</p>
                        </div>
                     </div>
                   </div>
                 ))}
               </div>

               {/* DESKTOP TABLE VIEW (lg:block) */}
               <div className="hidden lg:block overflow-x-auto scrollbar-hide">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-surface-low/30">
                        <th className="px-8 py-10 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] border-b border-outline-variant/30">Movimiento</th>
                        <th colSpan={3} className="px-8 py-10 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] text-center border-b border-outline-variant bg-emerald-500/10">Entradas</th>
                        <th colSpan={3} className="px-8 py-10 text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] text-center border-b border-outline-variant bg-rose-500/10">Salidas</th>
                        <th colSpan={3} className="px-8 py-10 text-[10px] font-black text-primary uppercase tracking-[0.2em] text-center border-b border-outline-variant bg-primary/10">Saldos Finales</th>
                      </tr>
                      <tr className="bg-surface-low/50">
                        <th className="px-8 py-5 text-[9px] font-black text-on-surface-variant uppercase tracking-widest border-b border-outline-variant/30">Descripción</th>
                        {/* Entradas */}
                        <th className="px-4 py-5 text-[9px] font-black text-emerald-500 uppercase text-center border-l border-outline-variant/30 border-b border-outline-variant/30">Cant</th>
                        <th className="px-4 py-5 text-[9px] font-black text-emerald-500 uppercase text-center border-b border-outline-variant/30">Costo U.</th>
                        <th className="px-4 py-5 text-[9px] font-black text-emerald-500 uppercase text-center border-b border-outline-variant/30">Total</th>
                        {/* Salidas */}
                        <th className="px-4 py-5 text-[9px] font-black text-rose-500 uppercase text-center border-l border-outline-variant/30 border-b border-outline-variant/30">Cant</th>
                        <th className="px-4 py-5 text-[9px] font-black text-rose-500 uppercase text-center border-b border-outline-variant/30">Costo U.</th>
                        <th className="px-4 py-5 text-[9px] font-black text-rose-500 uppercase text-center border-b border-outline-variant/30">Total</th>
                        {/* Saldos */}
                        <th className="px-4 py-5 text-[9px] font-black text-primary uppercase text-center border-l border-outline-variant/30 border-b border-outline-variant/30">Cant</th>
                        <th className="px-4 py-5 text-[9px] font-black text-primary uppercase text-center border-b border-outline-variant/30">Costo P.</th>
                        <th className="px-4 py-5 text-[9px] font-black text-primary uppercase text-center border-b border-outline-variant/30">Valor T.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                      {loading ? (
                        Array(8).fill(0).map((_, i) => (
                          <tr key={i} className="animate-pulse">
                            <td colSpan={10} className="px-8 py-8"><div className="h-6 bg-surface-low rounded-xl w-full"></div></td>
                          </tr>
                        ))
                      ) : !kardexData || kardexData.movements.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="px-8 py-32 text-center">
                             <History className="w-20 h-20 text-on-surface-variant/10 mx-auto mb-6" />
                             <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-40">No se detectaron movimientos para el rango seleccionado</p>
                          </td>
                        </tr>
                      ) : kardexData.movements.map((move: any) => (
                        <tr key={move.id} className="hover:bg-primary/[0.02] transition-all group">
                          <td className="px-8 py-8">
                             <div className="flex flex-col gap-2">
                               <span className="text-[11px] font-black text-foreground tracking-tight">
                                 {format(new Date(move.createdAt), 'dd MMM yyyy, HH:mm', { locale: es })}
                               </span>
                               <div className="w-fit">{getReasonBadge(move.reason)}</div>
                             </div>
                          </td>
                          
                          {/* Entradas column */}
                          <td className="px-4 py-8 text-center border-l border-outline-variant/30">
                             {move.type === 'IN' ? <span className="text-sm font-black text-emerald-500 tracking-tighter">{move.quantity}</span> : '-'}
                          </td>
                          <td className="px-4 py-8 text-center">
                             {move.type === 'IN' ? <span className="text-[10px] font-black text-on-surface-variant opacity-60">S/ {Number(move.unitCost).toFixed(2)}</span> : '-'}
                          </td>
                          <td className="px-4 py-8 text-center">
                             {move.type === 'IN' ? <span className="text-sm font-black text-emerald-600 tracking-tighter">S/ {Number(move.totalCost).toFixed(2)}</span> : '-'}
                          </td>

                          {/* Salidas column */}
                          <td className="px-4 py-8 text-center border-l border-outline-variant/30">
                             {move.type === 'OUT' ? <span className="text-sm font-black text-rose-500 tracking-tighter">{move.quantity}</span> : '-'}
                          </td>
                          <td className="px-4 py-8 text-center">
                             {move.type === 'OUT' ? <span className="text-[10px] font-black text-on-surface-variant opacity-60">S/ {Number(move.unitCost).toFixed(2)}</span> : '-'}
                          </td>
                          <td className="px-4 py-8 text-center">
                             {move.type === 'OUT' ? <span className="text-sm font-black text-rose-600 tracking-tighter">S/ {Number(move.totalCost).toFixed(2)}</span> : '-'}
                          </td>

                          {/* Saldos column */}
                          <td className="px-4 py-8 text-center border-l border-outline-variant/30 bg-primary/[0.02] group-hover:bg-primary/[0.05]">
                             <span className="text-sm font-black text-foreground tracking-tighter">{(move.nextStock ?? 0).toLocaleString()}</span>
                          </td>
                          <td className="px-4 py-8 text-center bg-primary/[0.02] group-hover:bg-primary/[0.05]">
                               <span className="text-[10px] font-black text-primary uppercase">
                                 S/ {move.nextStock > 0 ? (Number(move.nextValue) / move.nextStock).toFixed(2) : '0.00'}
                               </span>
                          </td>
                          <td className="px-4 py-8 text-center bg-primary/[0.02] group-hover:bg-primary/[0.05]">
                             <span className="text-sm font-black text-primary tracking-tighter">S/ {Number(move.nextValue).toFixed(2)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

