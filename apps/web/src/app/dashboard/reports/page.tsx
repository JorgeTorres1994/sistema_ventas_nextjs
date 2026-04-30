"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
    BarChart3, TrendingUp, ShoppingBag, DollarSign, 
    Calendar, Download, FileText, Search, 
    ChevronDown, MoreHorizontal, Table as TableIcon,
    Loader2
} from 'lucide-react';
import { 
    getReportsSummary, 
    getReportsCharts, 
    getReportsTopProducts, 
    getReportsTransactions 
} from '@/lib/api';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from 'recharts';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// ── Helpers & Sub-components ──────────────────────────────────────────────────

const fmtCurrency = (n: number) => `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;
const fmtCompact = (n: number) => Intl.NumberFormat('es-PE', { notation: 'compact' }).format(n);

const KPICard = ({ title, value, growth, icon: Icon, isCurrency }: any) => (
  <div className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex-1 group hover:border-blue-100 transition-all">
    <div className="flex items-start justify-between mb-8">
       <div className="w-16 h-16 bg-gray-50 rounded-[28px] flex items-center justify-center text-gray-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
          <Icon className="w-8 h-8" />
       </div>
       <div className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase ${
           growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
       }`}>
          {growth >= 0 ? '+' : ''}{growth}%
       </div>
    </div>
    <div className="space-y-1">
       <p className="text-[11px] font-black text-gray-400 uppercase tracking-[3px]">{title}</p>
       <h3 className="text-4xl font-black text-gray-900 tracking-tighter">
          {isCurrency ? fmtCurrency(value) : value}
       </h3>
    </div>
  </div>
);

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', type: 'Ingresos Consolidados' });
  const [data, setData] = useState<any>({ summary: null, charts: { performance: [], distribution: [] }, products: [], transactions: [] });
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [summary, charts, products, transactions] = await Promise.all([
        getReportsSummary(filters),
        getReportsCharts(filters),
        getReportsTopProducts(filters),
        getReportsTransactions(filters)
      ]);
      setData({ summary, charts, products, transactions });
    } catch (e) {
      toast.error('Error al generar el análisis de datos');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const exportExcel = () => {
    try {
      const ws = XLSX.utils.json_to_sheet(data.transactions);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Reporte de Ventas");
      XLSX.writeFile(wb, `Nexus_Reporte_Ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel exportado correctamente');
    } catch (err) {
      toast.error('Error al exportar Excel');
    }
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    const toastId = toast.loading('Generando PDF corporativo...');
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Nexus_Analisis_Financiero_${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Reporte PDF generado', { id: toastId });
    } catch (err) {
      toast.error('Error al generar PDF', { id: toastId });
    }
  };

  if (loading && !data.summary) {
    return (
      <div className="flex h-screen bg-[#F8F9FC] items-center justify-center">
        <div className="flex flex-col items-center gap-6">
           <Loader2 className="w-14 h-14 text-blue-600 animate-spin" />
           <p className="text-xs font-black text-gray-400 uppercase tracking-[0.3em] animate-pulse">Sincronizando Inteligencia de Negocio...</p>
        </div>
      </div>
    );
  }

  const isEmpty = (data.summary?.totalSales === 0);

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-hidden" ref={reportRef}>
        <TopBar />

        {/* Module Header */}
        <div className="px-12 pt-12 pb-8 bg-transparent flex items-start justify-between shrink-0">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Análisis de Operaciones</h1>
            <p className="text-base text-gray-400 font-medium tracking-tight">Nexus Genesis ERP • Panel de Control Estadístico Global</p>
          </div>
          <div className="flex items-center gap-4">
             <button onClick={exportPDF} className="px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-sm font-black text-gray-900 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-3">
                <FileText className="w-5 h-5 text-rose-500" /> Exportar PDF
             </button>
             <button onClick={exportExcel} className="px-8 py-4 bg-blue-600 rounded-[20px] text-sm font-black text-white hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center gap-3">
                <TableIcon className="w-5 h-5" /> Descargar Excel
             </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">

        {/* Filters Top Bar */}
        <div className="px-12 pb-10 flex items-center gap-6 sticky top-0 bg-[#F8F9FC]/80 backdrop-blur-md z-30 pt-2">
           <div className="flex-1 flex gap-6">
              <div className="flex-1 bg-white rounded-[24px] border border-gray-100 px-6 py-3.5 group focus-within:border-blue-300 transition-all shadow-sm">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Periodo de Análisis</p>
                 <div className="flex items-center justify-between">
                    <select className="bg-transparent text-sm font-black text-gray-900 focus:outline-none w-full appearance-none cursor-pointer">
                       <option>Últimos 30 Días</option>
                       <option>Hoy</option>
                       <option>Este Mes</option>
                       <option>Trimestre Actual</option>
                       <option>Anual</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                 </div>
              </div>
              <div className="flex-1 bg-white rounded-[24px] border border-gray-100 px-6 py-3.5 group focus-within:border-blue-300 transition-all shadow-sm">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Tipo de Reporte</p>
                 <div className="flex items-center justify-between">
                    <select 
                       value={filters.type}
                       onChange={e => setFilters({...filters, type: e.target.value})}
                       className="bg-transparent text-sm font-black text-gray-900 focus:outline-none w-full appearance-none cursor-pointer"
                    >
                       <option value="Ingresos Consolidados">Ingresos Consolidados</option>
                       <option value="Rendimiento de Productos">Rendimiento de Productos</option>
                       <option value="Salud de Inventario">Movimiento de Almacén</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-blue-600" />
                 </div>
              </div>
              <div className="w-[350px] flex items-center bg-white border border-gray-100 px-6 rounded-[24px] shadow-sm">
                 <Search className="w-4 h-4 text-gray-400 mr-3" />
                 <input className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 w-full" placeholder="Buscar parámetros de auditoría..." />
              </div>
           </div>
        </div>

        <div className="flex-1 px-12 pb-16 space-y-10">
          
          {(isEmpty || !data.summary) ? (
             <div className="flex flex-col items-center justify-center py-28 animate-in fade-in slide-in-from-bottom-4 bg-white rounded-[48px] border border-dashed border-gray-200 mx-4">
                <div className="w-36 h-36 bg-gray-50 rounded-[44px] flex items-center justify-center mb-10 border border-gray-100">
                   <BarChart3 className="w-16 h-16 text-gray-200" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Sin registros para procesar</h2>
                <p className="text-gray-400 font-medium mb-12 max-w-sm text-center">No se detectaron transacciones en el rango seleccionado. Intente ampliar el periodo de búsqueda.</p>
                <div className="flex gap-6">
                   <button onClick={() => setFilters({startDate:'', endDate:'', type:'Ingresos Consolidados'})} className="px-10 py-4 bg-blue-600 rounded-2xl text-white font-black hover:bg-blue-700 transition-all flex items-center gap-3 shadow-xl shadow-blue-100">
                       <Calendar className="w-5 h-5" /> Ajustar Fecha
                   </button>
                   <button onClick={() => fetchData()} className="px-10 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-black hover:bg-gray-50 transition-all flex items-center gap-3">
                       <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Refrescar Panel
                   </button>
                </div>
             </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="flex gap-10">
                <KPICard title="Facturación Bruta" value={data.summary?.totalRevenue ?? 0} growth={12.5} icon={ShoppingBag} isCurrency />
                <KPICard title="Margen de Utilidad" value={data.summary?.totalProfit ?? 0} growth={8.2} icon={TrendingUp} isCurrency />
                <KPICard title="Ticket Promedio" value={data.summary?.avgTicket ?? 0} growth={-1.4} icon={DollarSign} isCurrency />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-12 gap-10">
                <div className="col-span-8 bg-white p-12 rounded-[56px] border border-gray-100 shadow-[0_30px_60px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between mb-10">
                     <div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Evolución de Ingresos</h3>
                        <p className="text-base font-medium text-gray-400">Fluctuación diaria de entradas de capital</p>
                     </div>
                     <div className="flex bg-gray-50 p-2 rounded-2xl gap-1 border border-gray-100">
                        <button className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-black shadow-lg shadow-blue-100">Cifra de Venta</button>
                        <button className="px-6 py-2.5 text-gray-400 rounded-xl text-xs font-black hover:text-gray-900 transition-all">Transacciones</button>
                     </div>
                  </div>
                  <div className="h-[400px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.charts.performance}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F9FAFB" />
                        <XAxis dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#9CA3AF', fontWeight: 900, fontSize: 10}} 
                                tickFormatter={val => val.split('-').slice(2).join('/')}
                                dy={15} />
                        <YAxis axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#9CA3AF', fontWeight: 900, fontSize: 10}} 
                                tickFormatter={val => `S/ ${fmtCompact(val)}`}
                                dx={-15} />
                        <Tooltip cursor={{fill: '#F8F9FC'}} 
                                 contentStyle={{borderRadius: '24px', border:'none', boxShadow:'0 20px 50px rgba(0,0,0,0.1)', padding:'24px', fontWeight: 900}} />
                        <Bar dataKey="revenue" radius={[10, 10, 0, 0]} barSize={32}>
                            {data.charts.performance.map((entry: any, i: number) => (
                                <Cell key={i} fill={i % 2 === 0 ? '#E0E7FF' : '#0052FF'} />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="col-span-4 bg-white p-12 rounded-[56px] border border-gray-100 shadow-[0_30px_60px_rgba(0,0,0,0.02)] flex flex-col">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-10">Origen de Ingresos</h3>
                  <div className="flex-1 min-h-[300px] relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.charts.distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={100}
                          outerRadius={135}
                          paddingAngle={10}
                          dataKey="value"
                        >
                          <Cell fill="#0052FF" />
                          <Cell fill="#6366F1" />
                          <Cell fill="#C7D2FE" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <p className="text-5xl font-black text-gray-900 tracking-tighter">100%</p>
                       <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase mt-2">Cuota Total</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-10">
                     {data.charts.distribution.map((d: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                           <div className="flex items-center gap-4">
                              <div className={`w-4 h-4 rounded-full ${i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-indigo-500' : 'bg-blue-200'}`} />
                              <span className="text-sm font-black text-gray-700">{
                                d.name === 'POS Terminal' ? 'Terminal Presencial' :
                                d.name === 'Online Shop' ? 'Canal Digital' :
                                d.name === 'Mobile App' ? 'App Negocio' : d.name
                              }</span>
                           </div>
                           <span className="text-sm font-black text-gray-900">
                             {data.summary ? ((d.value / data.summary.totalRevenue) * 100).toFixed(0) : 0}%
                           </span>
                        </div>
                     ))}
                  </div>
                </div>
              </div>

              {/* Details Row */}
              <div className="grid grid-cols-12 gap-10">
                 <div className="col-span-5 bg-white p-12 rounded-[56px] border border-gray-100 shadow-[0_30px_60px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between mb-12">
                       <h3 className="text-2xl font-black text-gray-900 tracking-tight">Top Productos</h3>
                       <button className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">Auditar Stock</button>
                    </div>
                    <div className="space-y-12">
                       {data.products.slice(0, 5).map((p: any, i: number) => (
                          <div key={i} className="group">
                             <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-black text-gray-800 uppercase tracking-tight">{p.name}</span>
                                <span className="text-sm font-black text-blue-600">{fmtCurrency(p.revenue)}</span>
                             </div>
                             <div className="w-full h-2.5 bg-gray-50 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${(p.revenue / (data.products[0]?.revenue || 1)) * 100}%` }} />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="col-span-7 bg-white p-12 rounded-[56px] border border-gray-100 shadow-[0_30px_60px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between mb-10">
                       <h3 className="text-2xl font-black text-gray-900 tracking-tight">Operaciones de Alto Impacto</h3>
                       <button className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-gray-900 transition-all"><MoreHorizontal className="w-6 h-6"/></button>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[3px] border-b border-gray-50">
                                <th className="px-6 py-6">Operación</th>
                                <th className="px-6 py-6">Titular</th>
                                <th className="px-6 py-6">Segmento</th>
                                <th className="px-6 py-6 text-right">Monto Neto</th>
                                <th className="px-6 py-6 text-center">Auditoría</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {data.transactions.slice(0, 5).map((t: any) => (
                                <tr key={t.id} className="group hover:bg-blue-50/30 transition-all cursor-default">
                                   <td className="px-6 py-7 text-sm font-black text-gray-900">#{t.id.slice(0,6).toUpperCase()}</td>
                                   <td className="px-6 py-7">
                                      <div className="flex items-center gap-4">
                                         <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-black text-gray-500 text-[10px] uppercase border border-gray-200">{t.customer.split(' ').map((n:any)=>n[0]).join('')}</div>
                                         <span className="text-sm font-black text-gray-700">{t.customer}</span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-7">
                                      <span className="px-3 py-1 bg-gray-100 rounded-lg text-[10px] font-black text-gray-400 uppercase tracking-widest">{t.category}</span>
                                   </td>
                                   <td className="px-6 py-7 text-right text-sm font-black text-gray-900">{fmtCurrency(t.amount)}</td>
                                   <td className="px-6 py-7 text-center">
                                      <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                                          t.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                      }`}>
                                         {t.status === 'PAID' ? 'CONCILIADO' : 'PENDIENTE'}
                                      </span>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                        </table>
                     </div>
                     <button className="w-full py-6 mt-8 text-[11px] font-black text-blue-600 uppercase tracking-[0.2em] bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-[32px] hover:bg-white hover:border-blue-100 transition-all">
                        Visualizar Historial Completo
                     </button>
                  </div>
               </div>
            </>
          )}
        </div>
      </main>
    </div>
  </div>
);
}
