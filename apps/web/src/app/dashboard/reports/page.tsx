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
  <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex-1 group hover:border-blue-100 transition-all relative overflow-hidden">
    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50/30 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-700" />
    <div className="flex items-start justify-between mb-8 relative z-10">
       <div className="w-16 h-16 bg-gray-50 rounded-[28px] flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all shadow-inner">
          <Icon className="w-8 h-8" />
       </div>
       <div className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase flex items-center gap-1 ${
           growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
       }`}>
          {growth >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(growth)}%
       </div>
    </div>
    <div className="space-y-1 relative z-10">
       <p className="text-[11px] font-black text-gray-400 uppercase tracking-[3px]">{title}</p>
       <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
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
        className={`relative w-full bg-white rounded-[28px] border transition-all duration-300 px-7 py-4 flex items-center justify-between group shadow-sm ${
          isOpen ? 'border-blue-500 shadow-xl shadow-blue-50' : 'border-gray-100 hover:border-blue-200'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 ${
            isOpen ? 'bg-blue-600 text-white rotate-[360deg]' : 'bg-blue-50 text-blue-600'
          }`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-0.5">{label}</p>
            <p className="text-[13px] font-black text-gray-900 tracking-tight">{selectedOption.label}</p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-blue-600 transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-gray-100 rounded-[32px] shadow-[0_30px_90px_rgba(0,0,0,0.2)] z-[100] p-3 animate-in fade-in zoom-in-95 duration-200 origin-top">
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
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-100' 
                  : 'hover:bg-gray-50/80 text-gray-700'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    value === opt.value ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
                  }`}>
                    {opt.icon ? <opt.icon className="w-4 h-4" /> : <Layers className="w-4 h-4" />}
                  </div>
                  <div className="text-left">
                    <p className={`text-[12px] font-black tracking-tight ${value === opt.value ? 'text-white' : 'text-gray-900'}`}>{opt.label}</p>
                    {opt.desc && <p className={`text-[9px] font-bold uppercase tracking-wider ${value === opt.value ? 'text-blue-100' : 'text-gray-400'}`}>{opt.desc}</p>}
                  </div>
                </div>
                {value === opt.value && <Check className="w-5 h-5 text-white animate-in zoom-in duration-300" />}
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
      <div className="flex h-screen bg-[#F8F9FC] items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-hidden">
        <TopBar />

        {/* Action Header */}
        <div className="px-12 pt-12 pb-8 flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tighter mb-2">Análisis Estratégico</h1>
            <p className="text-gray-400 font-medium">Gestión de Auditoría Nexus Genesis</p>
          </div>
          <div className="flex gap-4">
             <button onClick={handlePrintReport} disabled={isGenerating} className="px-8 py-4 bg-white border border-gray-100 rounded-[28px] text-sm font-black text-gray-900 hover:bg-gray-50 shadow-sm flex items-center gap-3 transition-all">
                {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Printer className="w-5 h-5 text-rose-500" />}
                Imprimir PDF
             </button>
             <button onClick={exportExcel} className="px-10 py-4 bg-indigo-600 rounded-[28px] text-sm font-black text-white hover:bg-indigo-700 shadow-xl shadow-indigo-100 flex items-center gap-3 transition-all">
                <TableIcon className="w-5 h-5" /> Excel Luxury
             </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto scrollbar-hide px-12 pb-20 space-y-12">
           {/* Filters */}
           <div className="flex gap-6 sticky top-0 z-50 bg-[#F8F9FC]/80 backdrop-blur-md py-4">
              <ModernSelect 
                label="Periodo de Evaluación" 
                value={period} 
                onChange={handlePeriodChange} 
                icon={CalendarDays} 
                options={[
                  { value: 'Hoy', label: 'Cierre del Día' },
                  { value: 'Últimos 30 Días', label: 'Últimos 30 Días' },
                  { value: 'Este Mes', label: 'Mensual Actual' },
                  { value: 'Mes Pasado', label: 'Periodo Anterior' }
                ]} 
              />
              <div className="flex-1 bg-white border border-gray-100 px-8 rounded-[32px] shadow-sm flex items-center">
                 <Search className="w-4 h-4 text-gray-300 mr-4" />
                 <input className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-600 w-full" placeholder="Buscar por ID, Cliente o Monto..." />
              </div>
           </div>

           {/* Metrics Grid */}
           <div className="flex gap-10">
              <KPICard title="Facturación" value={data.summary?.totalRevenue || 0} growth={15} icon={DollarSign} isCurrency />
              <KPICard title="Beneficio" value={data.summary?.totalProfit || 0} growth={9} icon={TrendingUp} isCurrency />
              <KPICard title="Operaciones" value={data.summary?.totalSales || 0} growth={6} icon={Activity} />
           </div>

           {/* Chart visualization */}
           <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-sm" ref={chartAreaRef}>
              <div className="flex items-center justify-between mb-12">
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tight">Rendimiento Operativo</h3>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Evolución de ingresos diarios</p>
                 </div>
                 <div className="bg-indigo-50 px-5 py-2.5 rounded-full flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-600" />
                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Moneda Nacional (S/)</span>
                 </div>
              </div>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                   <ReBarChart data={data.charts.performance}>
                      <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F1F5F9" />
                      <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 800}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94A3B8', fontSize: 10, fontWeight: 800}} />
                      <Tooltip cursor={{fill: '#F8FAFC'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 900, padding: '20px'}} />
                      <Bar dataKey="revenue" fill="#4F46E5" radius={[12, 12, 0, 0]} barSize={50} />
                   </ReBarChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Data Table */}
           <div className="bg-white p-12 rounded-[56px] border border-gray-100 shadow-sm overflow-hidden mb-12">
              <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-12">Bitácora de Transacciones</h3>
              <table className="w-full text-left">
                 <thead>
                    <tr className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] border-b border-gray-100">
                       <th className="pb-8 px-6">Identificador</th>
                       <th className="pb-8 px-6">Cliente / Entidad</th>
                       <th className="pb-8 px-6">Monto Bruto</th>
                       <th className="pb-8 px-6 text-center">Estado Operativo</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50">
                    {data.transactions.slice(0, 10).map((t: any) => (
                       <tr key={t.id} className="group hover:bg-indigo-50/30 transition-all">
                          <td className="py-7 px-6 font-black text-gray-400 text-xs tracking-tighter group-hover:text-indigo-600">#{t.id?.slice(-8).toUpperCase()}</td>
                          <td className="py-7 px-6">
                             <div className="flex flex-col">
                                <span className="text-base font-black text-gray-800 tracking-tight">{t.customer || 'Público General'}</span>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{t.paymentMethod || 'Contado'}</span>
                             </div>
                          </td>
                          <td className="py-7 px-6 font-black text-gray-900 text-lg tracking-tighter">{fmtCurrency(t.amount)}</td>
                          <td className="py-7 px-6 text-center">
                             <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm">
                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                Completado
                             </span>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </main>
      </div>
    </div>
  );
}
