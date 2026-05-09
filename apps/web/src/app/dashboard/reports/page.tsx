"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
    BarChart3, TrendingUp, ShoppingBag, DollarSign, 
    Calendar, Download, FileText, Search, 
    ChevronDown, MoreHorizontal, Table as TableIcon,
    Loader2, AlertCircle, ArrowUpRight, ArrowDownRight,
    Trophy, Zap, Activity, Box, History, Check,
    Clock, CalendarDays, BarChart, PieChart, Layers,
    Eye, X, Printer
} from 'lucide-react';
import { 
    getReportsSummary, 
    getReportsCharts, 
    getReportsTopProducts, 
    getReportsTransactions 
} from '@/lib/api';
import { 
    BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Cell, PieChart as RePieChart, Pie 
} from 'recharts';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

// ── Helpers ──────────────────────────────────────────────────────────────────

const fmtCurrency = (n: number) => `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
const parseSafeDate = (d: any) => {
    try {
        if (!d) return 'N/A';
        const date = new Date(d);
        if (isNaN(date.getTime())) return 'N/A';
        return date.toLocaleDateString('es-PE');
    } catch (e) {
        return 'N/A';
    }
};

const KPICard = ({ title, value, growth, icon: Icon, isCurrency }: any) => (
  <div className="bg-card p-10 rounded-[48px] border border-outline-variant shadow-sm flex-1 group hover:border-primary/20 transition-all relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700 opacity-50" />
    <div className="flex items-start justify-between mb-8 relative z-10">
       <div className="w-16 h-16 bg-surface-low rounded-[28px] flex items-center justify-center text-on-surface-variant group-hover:text-primary group-hover:bg-primary/10 border border-outline-variant/50 transition-all shadow-inner">
          <Icon className="w-8 h-8" />
       </div>
       <div className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1 ${
           growth >= 0 ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
       }`}>
          {growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(growth)}%
       </div>
    </div>
    <div className="space-y-1 relative z-10">
       <p className="text-[11px] font-black text-on-surface-variant uppercase tracking-[3px] opacity-60">{title}</p>
       <h3 className="text-4xl font-black text-foreground tracking-tighter">
          {isCurrency ? fmtCurrency(value) : value}
       </h3>
    </div>
  </div>
);

// Custom Dropdown Component
const ModernSelect = ({ label, value, onChange, options, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedOption = options.find((opt: any) => opt.value === value) || options[0];

  return (
    <div className="flex-1 relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-full bg-card rounded-[28px] border transition-all duration-300 px-7 py-4 flex items-center justify-between group shadow-sm ${
          isOpen ? 'border-primary shadow-2xl shadow-primary/10' : 'border-outline-variant hover:border-primary/30'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isOpen ? 'bg-primary text-on-primary rotate-[360deg]' : 'bg-primary/10 text-primary'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-0.5 opacity-60">{label}</p>
            <p className="text-[13px] font-black text-foreground tracking-tight">{selectedOption.label}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-primary transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-4 bg-card border border-outline-variant rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.3)] z-[100] p-3 animate-in fade-in zoom-in-95 duration-200 origin-top backdrop-blur-md bg-card/95">
          <div className="space-y-1">
            {options.map((opt: any) => (
              <button
                key={opt.value}
                onClick={() => {
                  onChange(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-[22px] transition-all group ${
                  value === opt.value 
                  ? 'bg-primary text-on-primary shadow-xl shadow-primary/20' 
                  : 'hover:bg-surface-low text-on-surface-variant'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    value === opt.value ? 'bg-white/20' : 'bg-surface-low group-hover:bg-card group-hover:shadow-sm'
                  }`}>
                    {opt.icon ? <opt.icon className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <p className={`text-[12px] font-black tracking-tight ${value === opt.value ? 'text-on-primary' : 'text-foreground'}`}>{opt.label}</p>
                    {opt.desc && <p className={`text-[9px] font-bold uppercase tracking-wider ${value === opt.value ? 'text-white/60' : 'text-on-surface-variant/60'}`}>{opt.desc}</p>}
                  </div>
                </div>
                {value === opt.value && <Check className="w-5 h-5 text-on-primary animate-in zoom-in duration-300" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('Últimos 30 Días');
  const [filters, setFilters] = useState({ startDate: '', endDate: '', type: 'Ingresos Consolidados' });
  const [data, setData] = useState<any>({ summary: null, charts: { performance: [], categoryDistribution: [], paymentDistribution: [] }, products: [], transactions: [] });
  const [isGenerating, setIsGenerating] = useState(false);

  const chartAreaRef = useRef<HTMLDivElement>(null);

  const handlePeriodChange = (val: string) => {
    setPeriod(val);
    const now = new Date();
    let start = '', end = '';
    switch (val) {
      case 'Hoy': start = end = now.toISOString().split('T')[0]; break;
      case 'Este Mes': start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]; end = now.toISOString().split('T')[0]; break;
      case 'Mes Pasado': 
        start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
        end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
        break;
      case 'Últimos 30 Días': default: start = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; end = now.toISOString().split('T')[0]; break;
    }
    if (val !== 'Personalizado') setFilters(prev => ({ ...prev, startDate: start, endDate: end }));
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summary, charts, products, transactions] = await Promise.all([
        getReportsSummary(filters), getReportsCharts(filters), getReportsTopProducts(filters), getReportsTransactions(filters)
      ]);
      setData({ summary, charts, products, transactions });
    } catch (e) { toast.error('Error al sincronizar datos'); } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // PATRON PRODUCTOS: Captura de SVG para incluir en reporte de impresión
  const captureSVGToImage = async (container: HTMLElement) => {
      const svg = container.querySelector('svg');
      if (!svg) return null;
      try {
          const clonedSvg = svg.cloneNode(true) as SVGSVGElement;
          const inlineStyles = (el: Element, clonedEl: Element) => {
              const styles = window.getComputedStyle(el);
              const props = ['fill', 'stroke', 'stroke-width', 'font-size', 'font-family', 'font-weight', 'opacity'];
              props.forEach(prop => {
                  const val = styles.getPropertyValue(prop);
                  if (val) (clonedEl as any).style[prop] = val;
              });
              for (let i = 0; i < el.children.length; i++) {
                  inlineStyles(el.children[i], clonedEl.children[i]);
              }
          };
          inlineStyles(svg, clonedSvg);
          const serializer = new XMLSerializer();
          let source = serializer.serializeToString(clonedSvg);
          if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
              source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
          }
          const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(source);
          return new Promise<string>((resolve) => {
              const img = new Image();
              img.onload = () => {
                  const canvas = document.createElement('canvas');
                  canvas.width = svg.clientWidth * 2;
                  canvas.height = svg.clientHeight * 2;
                  const ctx = canvas.getContext('2d');
                  if (ctx) {
                      ctx.scale(2, 2);
                      ctx.fillStyle = '#FFFFFF';
                      ctx.fillRect(0, 0, svg.clientWidth, svg.clientHeight);
                      ctx.drawImage(img, 0, 0, svg.clientWidth, svg.clientHeight);
                      resolve(canvas.toDataURL('image/jpeg', 0.9));
                  }
              };
              img.src = url;
          });
      } catch (e) { return null; }
  };

  const exportExcel = () => {
    const toastId = toast.loading('Generando libro Excel de auditoría...');
    try {
      if (!data.transactions) return;
      const excelData = data.transactions.map((t: any) => ({
        'ID OPERACIÓN': t.id?.slice(-8).toUpperCase(),
        'FECHA': parseSafeDate(t.date),
        'CLIENTE': t.customer || 'PÚBLICO GENERAL',
        'MONTO BRUTO (S/)': Number(t.amount || 0).toFixed(2),
        'MÉTODO DE PAGO': (t.paymentMethod || 'EFECTIVO').toUpperCase(),
        'ESTADO': (t.status === 'PAID' ? 'COMPLETADO' : 'PENDIENTE').toUpperCase()
      }));
      const ws = XLSX.utils.json_to_sheet(excelData);
      ws['!cols'] = [{ wch: 18 }, { wch: 15 }, { wch: 35 }, { wch: 20 }, { wch: 20 }, { wch: 15 }];
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Auditoría Nexus");
      
      // MANUAL ROBUST TRIGGER: Bypasses browser blocks by creating a direct link
      const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Nexus_Auditoria_${new Date().getTime()}.xlsx`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast.success('Excel descargado correctamente', { id: toastId });
    } catch (e) { 
      console.error(e);
      toast.error('Error al procesar formato Excel', { id: toastId }); 
    }
  };

  // 🚀 PATRON PRODUCTOS: Impresión Nativa de Alta Fidelidad
  const handlePrintReport = async () => {
    setIsGenerating(true);
    const toastId = toast.loading('Preparando lienzo de impresión...');
    
    try {
        const chartImg = chartAreaRef.current ? await captureSVGToImage(chartAreaRef.current) : null;
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            toast.error('Bloqueador de ventanas activo', { id: toastId });
            return;
        }

        const html = `
          <html>
            <head>
              <title>Reporte Analítico - Nexus Genesis ERP</title>
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                body { font-family: 'Inter', sans-serif; padding: 50px; color: #1f2937; background: white; }
                .header { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 4px solid #4f46e5; padding-bottom: 25px; margin-bottom: 40px; }
                .brand h1 { margin: 0; color: #4f46e5; font-size: 32px; font-weight: 900; letter-spacing: -0.04em; }
                .brand p { margin: 0; font-size: 11px; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.2em; }
                .meta { text-align: right; }
                .meta h2 { margin: 0; font-size: 16px; font-weight: 900; color: #111827; text-transform: uppercase; }
                .meta p { margin: 2px 0; font-size: 11px; color: #6b7280; font-weight: 600; }
                
                .kpi-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
                .kpi-box { padding: 25px; border-radius: 24px; background: #f8fafc; border: 1px solid #f1f5f9; }
                .kpi-box span { font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 0.1em; }
                .kpi-box h3 { margin: 10px 0 0 0; font-size: 24px; font-weight: 900; color: #1e293b; }
                
                .chart-section { margin-bottom: 40px; padding: 30px; border: 1px solid #f1f5f9; border-radius: 32px; }
                .chart-section h4 { margin: 0 0 20px 0; font-size: 12px; font-weight: 900; color: #64748b; text-transform: uppercase; }
                .chart-img { width: 100%; height: auto; border-radius: 16px; }

                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th { background: #1e293b; color: white; text-align: left; padding: 15px; font-size: 10px; font-weight: 900; text-transform: uppercase; }
                td { padding: 15px; border-bottom: 1px solid #f1f5f9; font-size: 12px; font-weight: 600; color: #475569; }
                tr:nth-child(even) { background: #fcfdfe; }
                .footer { margin-top: 60px; padding-top: 30px; border-top: 1px solid #f1f5f9; text-align: center; font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; }
                
                @media print { body { padding: 0; } @page { margin: 1.5cm; } .no-print { display: none; } }
              </style>
            </head>
            <body>
              <div class="header">
                <div class="brand">
                  <h1>NEXUS GENESIS</h1>
                  <p>Elite ERP Intelligence</p>
                </div>
                <div class="meta">
                  <h2>Auditoría Operativa</h2>
                  <p>Emisión: ${new Date().toLocaleString('es-PE')}</p>
                  <p>Periodo: ${period.toUpperCase()}</p>
                </div>
              </div>

              <div class="kpi-grid">
                <div className="kpi-box">
                  <span>Facturación Bruta</span>
                  <h3>${fmtCurrency(data.summary?.totalRevenue || 0)}</h3>
                </div>
                <div className="kpi-box">
                  <span>Margen de Beneficio</span>
                  <h3>${fmtCurrency(data.summary?.totalProfit || 0)}</h3>
                </div>
                <div className="kpi-box">
                  <span>Ticket Promedio</span>
                  <h3>${fmtCurrency(data.summary?.avgTicket || 0)}</h3>
                </div>
              </div>

              ${chartImg ? `
                <div class="chart-section">
                  <h4>Rendimiento Comercial</h4>
                  <img src="${chartImg}" class="chart-img" />
                </div>
              ` : ''}

              <table>
                <thead>
                  <tr>
                    <th>Operación</th>
                    <th>Fecha</th>
                    <th>Cliente</th>
                    <th>MÉTODO</th>
                    <th style="text-align: right;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${data.transactions.slice(0, 30).map((t: any) => `
                    <tr>
                      <td style="font-family: monospace; font-weight: 900;">#${t.id?.slice(-8).toUpperCase()}</td>
                      <td>${parseSafeDate(t.date)}</td>
                      <td style="font-weight: 800; color: #1e293b;">${t.customer || 'PÚBLICO GENERAL'}</td>
                      <td style="font-size: 10px; font-weight: 900;">${(t.paymentMethod || 'EFECTIVO').toUpperCase()}</td>
                      <td style="text-align: right; font-weight: 900; font-family: monospace;">${fmtCurrency(t.amount)}</td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>

              <div class="footer">
                Documento de Auditoría Certificado • Nexus Genesis ERP Systems 2026
              </div>

              <script>
                window.onload = () => {
                  setTimeout(() => { window.print(); window.close(); }, 800);
                };
              </script>
            </body>
          </html>
        `;

        printWindow.document.write(html);
        printWindow.document.close();
        toast.success('Reporte de ingeniería listo', { id: toastId });
    } catch (e) {
        toast.error('Error en el motor de impresión', { id: toastId });
    } finally {
        setIsGenerating(false);
    }
  };

  if (loading && !data.summary) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 w-full lg:w-full lg:w-[calc(100%-256px)] overflow-hidden">
        <TopBar />

        <main className="flex-1 overflow-y-auto scrollbar-hide pb-20 space-y-8 sm:space-y-12">
           {/* Action Header - Responsive */}
           <div className="px-4 sm:px-12 pt-8 sm:pt-12 pb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between shrink-0 gap-6">
             <div>
               <nav className="flex items-center gap-2 text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">
                 <span>Inteligencia</span><span>/</span>
                 <span className="text-primary">Auditoría</span>
               </nav>
               <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-1">Análisis Estratégico</h1>
               <p className="text-xs sm:text-sm text-on-surface-variant font-medium">Gestión de Auditoría Nexus Genesis</p>
             </div>
             <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <button onClick={handlePrintReport} disabled={isGenerating} className="flex-1 sm:flex-none px-6 py-4 bg-card border border-outline-variant rounded-[24px] text-[10px] font-black text-foreground hover:bg-surface-low shadow-sm flex items-center justify-center gap-3 transition-all active:scale-95 uppercase tracking-widest">
                   {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Printer className="w-4 h-4 text-rose-500" />}
                   Imprimir PDF
                </button>
                <button onClick={exportExcel} className="flex-1 sm:flex-none px-8 py-4 bg-primary text-on-primary rounded-[24px] text-[10px] font-black uppercase tracking-widest hover:opacity-90 shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 transition-all active:scale-95">
                   <TableIcon className="w-4 h-4" /> Exportar Excel
                </button>
             </div>
           </div>

           {/* Filters - Responsive */}
           <div className="px-4 sm:px-12 flex flex-col lg:flex-row gap-6 py-4">
              <ModernSelect 
                label="Periodo de Evaluación" 
                value={period} 
                onChange={handlePeriodChange} 
                icon={CalendarDays} 
                options={[
                  { value: 'Hoy', label: 'Cierre del Día', desc: 'Sincronización en tiempo real' },
                  { value: 'Últimos 30 Días', label: 'Últimos 30 Días', desc: 'Tendencia mensual actual' },
                  { value: 'Este Mes', label: 'Mensual Actual', desc: 'Acumulado del periodo' },
                  { value: 'Mes Pasado', label: 'Periodo Anterior', desc: 'Auditoría retroactiva' }
                ]} 
              />
              <ModernSelect 
                label="Enfoque Analítico" 
                value={filters.type} 
                onChange={(val: string) => setFilters(prev => ({ ...prev, type: val }))} 
                icon={Layers} 
                options={[
                  { value: 'Ingresos Consolidados', label: 'Ventas y Facturación', desc: 'Análisis de liquidez' },
                  { value: 'Rendimiento de Productos', label: 'Ingeniería de Producto', desc: 'Rotación y márgenes' },
                  { value: 'Flujo de Caja', label: 'Flujo de Efectivo', desc: 'Conciliación de pagos' }
                ]} 
              />
           </div>

           {/* Metrics Grid - Responsive */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-10">
              <KPICard title="Facturación" value={data.summary?.totalRevenue || 0} growth={15} icon={DollarSign} isCurrency />
              <KPICard title="Beneficio" value={data.summary?.totalProfit || 0} growth={9} icon={TrendingUp} isCurrency />
              <div className="sm:col-span-2 lg:col-span-1">
                <KPICard title="Operaciones" value={data.summary?.totalSales || 0} growth={6} icon={Activity} />
              </div>
           </div>

           {/* Chart visualization - Responsive */}
           <div className="bg-card p-6 sm:p-12 rounded-[40px] sm:rounded-[56px] border border-outline-variant shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 sm:p-12 opacity-5 hidden sm:block">
                 <BarChart3 className="w-24 h-24 sm:w-40 h-40" />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 sm:mb-12 relative z-10 gap-4">
                 <div>
                    <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Rendimiento Operativo</h3>
                    <p className="text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-widest mt-1 opacity-60">Evolución de ingresos diarios</p>
                 </div>
                 <div className="bg-primary/10 px-4 py-2 rounded-full flex items-center gap-3 border border-primary/20 shadow-inner">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-widest">Real-time S/ Data</span>
                 </div>
              </div>
              <div className="h-[250px] sm:h-[350px] relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                   <ReBarChart data={data.charts.performance}>
                      <CartesianGrid strokeDasharray="8 8" vertical={false} stroke="currentColor" className="text-outline-variant/10" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 10, fontWeight: 800}} className="text-on-surface-variant/40" />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 10, fontWeight: 800}} className="text-on-surface-variant/40" />
                      <Tooltip cursor={{fill: 'currentColor', opacity: 0.05}} contentStyle={{backgroundColor: 'var(--card)', borderRadius: '24px', border: '1px solid var(--outline-variant)', boxShadow: '0 20px 50px rgba(0,0,0,0.3)', fontWeight: 900, padding: '20px', color: 'var(--foreground)'}} />
                      <Bar dataKey="revenue" fill="currentColor" radius={[16, 16, 0, 0]} barSize={40} className="text-primary" />
                   </ReBarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Data Table / Cards - Responsive */}
           <div className="bg-card p-6 sm:p-12 rounded-[40px] sm:rounded-[56px] border border-outline-variant shadow-sm overflow-hidden mb-12">
              <div className="flex items-center justify-between mb-8 sm:mb-12">
                <h3 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">Bitácora de Transacciones</h3>
                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40 hidden sm:block">Total {data.transactions.length}</span>
              </div>

              {/* MOBILE CARDS VIEW */}
              <div className="sm:hidden space-y-4">
                 {data.transactions.slice(0, 10).map((t: any) => (
                   <div key={t.id} className="p-6 bg-surface-low rounded-[28px] border border-outline-variant/30 space-y-4">
                      <div className="flex justify-between items-start">
                         <span className="text-[10px] font-black text-primary font-mono tracking-tighter">#PO-{t.id?.slice(-8).toUpperCase()}</span>
                         <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full text-[8px] font-black uppercase tracking-widest">PAGADO</span>
                      </div>
                      <div>
                         <p className="text-base font-black text-foreground tracking-tight">{t.customer || 'Público General'}</p>
                         <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest opacity-60">{t.paymentMethod || 'Contado'}</p>
                      </div>
                      <div className="flex justify-between items-end pt-2 border-t border-outline-variant/10">
                         <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-40">{parseSafeDate(t.date)}</span>
                         <span className="text-xl font-black text-foreground tracking-tighter">{fmtCurrency(t.amount)}</span>
                      </div>
                   </div>
                 ))}
              </div>

              {/* DESKTOP TABLE VIEW */}
              <div className="hidden sm:block overflow-x-auto scrollbar-hide">
                <table className="w-full text-left">
                  <thead>
                      <tr className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] border-b border-outline-variant/30">
                          <th className="pb-8 px-6">Identificador</th>
                          <th className="pb-8 px-6">Socio Comercial</th>
                          <th className="pb-8 px-6">Monto Bruto</th>
                          <th className="pb-8 px-6 text-center">Estado Operativo</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/30">
                      {data.transactions.slice(0, 10).map((t: any) => (
                        <tr key={t.id} className="group hover:bg-primary/5 transition-all cursor-pointer">
                            <td className="py-7 px-6">
                                <span className="text-[11px] font-black text-on-surface-variant/40 group-hover:text-primary transition-colors tracking-tighter">
                                    #PO-{t.id?.slice(-8).toUpperCase()}
                                </span>
                            </td>
                            <td className="py-7 px-6">
                                <div className="flex flex-col">
                                    <span className="text-base font-black text-foreground tracking-tight">{t.customer || 'Público General'}</span>
                                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">{t.paymentMethod || 'Liquidación Contado'}</span>
                                </div>
                            </td>
                            <td className="py-7 px-6 font-black text-foreground text-xl tracking-tighter group-hover:scale-110 transition-transform origin-left">{fmtCurrency(t.amount)}</td>
                            <td className="py-7 px-6 text-center">
                                <span className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-inner">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    Completado
                                </span>
                            </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
           </div>
        </main>
      </div>
    </div>
  );
}

