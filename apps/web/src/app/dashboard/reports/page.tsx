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
  const [data, setData] = useState<any>({ summary: null, charts: { performance: [], categoryDistribution: [], paymentDistribution: [] }, products: [], transactions: [] });
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
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden transition-all duration-300" ref={reportRef}>
        <TopBar />

        {/* Module Header */}
        <div className="px-4 lg:px-12 pt-8 lg:pt-12 pb-8 bg-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mb-2">Reportes</h1>
            <p className="text-sm lg:text-base text-gray-400 font-medium tracking-tight">Panel de Control Estadístico Global</p>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
             <button onClick={exportPDF} className="flex-1 sm:flex-none px-6 py-4 bg-white border border-gray-100 rounded-[20px] text-sm font-black text-gray-900 hover:bg-gray-50 shadow-sm transition-all flex items-center justify-center gap-3">
                <FileText className="w-5 h-5 text-rose-500" /> <span className="hidden sm:inline">Exportar PDF</span> <span className="sm:hidden">PDF</span>
             </button>
             <button onClick={exportExcel} className="flex-1 sm:flex-none px-8 py-4 bg-blue-600 rounded-[20px] text-sm font-black text-white hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3">
                <TableIcon className="w-5 h-5" /> <span className="hidden sm:inline">Excel</span> <span className="sm:hidden">XLSX</span>
             </button>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto">

        {/* Filters Top Bar */}
        <div className="px-4 lg:px-12 pb-10 flex flex-col lg:flex-row items-center gap-6 sticky top-0 bg-[#F8F9FC]/80 backdrop-blur-md z-30 pt-2">
           <div className="w-full flex flex-col sm:flex-row gap-4">
              <div className="flex-1 bg-white rounded-[24px] border border-gray-100 px-6 py-3.5 group focus-within:border-blue-300 transition-all shadow-sm">
                 <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Periodo</p>
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
              <div className="w-full lg:w-[350px] flex items-center bg-white border border-gray-100 px-6 py-3.5 rounded-[24px] shadow-sm">
                 <Search className="w-4 h-4 text-gray-400 mr-3" />
                 <input className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-700 w-full" placeholder="Buscar parámetros..." />
              </div>
           </div>
        </div>

        <div className="flex-1 px-4 lg:px-12 pb-16 space-y-10">
          
          {(isEmpty || !data.summary) ? (
             <div className="flex flex-col items-center justify-center py-20 lg:py-28 animate-in fade-in slide-in-from-bottom-4 bg-white rounded-[48px] border border-dashed border-gray-200 mx-4">
                <div className="w-24 lg:w-36 h-24 lg:h-36 bg-gray-50 rounded-[44px] flex items-center justify-center mb-10 border border-gray-100">
                   <BarChart3 className="w-12 lg:w-16 h-12 lg:h-16 text-gray-200" />
                </div>
                <h2 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight mb-3">Sin registros</h2>
                <p className="text-sm lg:text-base text-gray-400 font-medium mb-12 max-w-sm text-center">No se detectaron transacciones en el rango seleccionado.</p>
                <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto px-10">
                   <button onClick={() => setFilters({startDate:'', endDate:'', type:'Ingresos Consolidados'})} className="px-10 py-4 bg-blue-600 rounded-2xl text-white font-black hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100">
                       <Calendar className="w-5 h-5" /> Ajustar Fecha
                   </button>
                   <button onClick={() => fetchData()} className="px-10 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-black hover:bg-gray-50 transition-all flex items-center justify-center gap-3">
                       <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Refrescar
                   </button>
                </div>
             </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-10">
                <KPICard title="Facturación Bruta" value={data.summary?.totalRevenue ?? 0} growth={12.5} icon={ShoppingBag} isCurrency />
                <KPICard title="Margen de Utilidad" value={data.summary?.totalProfit ?? 0} growth={8.2} icon={TrendingUp} isCurrency />
                <KPICard title="Ticket Promedio" value={data.summary?.avgTicket ?? 0} growth={-1.4} icon={DollarSign} isCurrency />
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="col-span-1 lg:col-span-7 bg-white p-6 lg:p-10 rounded-[48px] border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Evolución de Ingresos</h3>
                        <p className="text-xs font-medium text-gray-400">Desempeño financiero diario</p>
                     </div>
                     <div className="flex bg-gray-50 p-1.5 rounded-xl gap-1 border border-gray-100">
                        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black shadow-lg shadow-blue-100">Ventas</button>
                        <button className="px-4 py-2 text-gray-400 rounded-lg text-[10px] font-black hover:text-gray-900 transition-all">Metas</button>
                     </div>
                  </div>
                  <div className="h-[320px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.charts.performance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#9CA3AF', fontWeight: 800, fontSize: 9}} 
                                tickFormatter={val => val.split('-').slice(2).join('/')}
                                dy={10} />
                        <YAxis axisLine={false} 
                                tickLine={false} 
                                tick={{fill: '#9CA3AF', fontWeight: 800, fontSize: 9}} 
                                tickFormatter={val => `${fmtCompact(val)}`} />
                        <Tooltip cursor={{fill: '#F9FAFB'}} 
                                 contentStyle={{borderRadius: '16px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.05)', padding:'12px', fontSize: '12px', fontWeight: 900}} />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={40}>
                            {(data.charts.performance || []).map((entry: any, i: number) => (
                                <Cell key={i} fill={i % 2 === 0 ? '#4F46E5' : '#818CF8'} fillOpacity={0.9} />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="col-span-5 bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm flex flex-col">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight mb-6">Origen de Ingresos</h3>
                  <div className="flex-1 min-h-[220px] relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.charts?.categoryDistribution || []}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          {(data.charts?.categoryDistribution || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={['#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.05)', fontSize: '11px', fontWeight: 900 }} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <p className="text-3xl font-black text-gray-900 tracking-tighter">100%</p>
                       <p className="text-[8px] font-black text-gray-400 tracking-[0.2em] uppercase">Distribución</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-6">
                     {(data.charts?.categoryDistribution || []).slice(0, 4).map((d: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                           <div className="flex items-center gap-2 overflow-hidden">
                              <div className={`w-2 h-2 rounded-full shrink-0 ${['bg-indigo-600', 'bg-indigo-500', 'bg-indigo-400', 'bg-indigo-300'][i % 4]}`} />
                              <span className="text-[9px] font-black text-gray-700 truncate uppercase tracking-tight">{d.name}</span>
                           </div>
                           <span className="text-[9px] font-black text-gray-900 shrink-0">
                             {data.summary ? ((d.value / data.summary.totalRevenue) * 100).toFixed(0) : 0}%
                           </span>
                        </div>
                     ))}
                  </div>
                </div>
              </div>

              {/* Details Row */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                 <div className="col-span-1 lg:col-span-5 bg-white p-6 lg:p-10 rounded-[48px] border border-gray-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-black text-gray-900 tracking-tight">Top Productos</h3>
                       <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors">Ver Almacén</button>
                    </div>
                    <div className="space-y-6 flex-1">
                       {data.products.slice(0, 5).map((p: any, i: number) => (
                          <div key={i} className="group">
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-black text-gray-800 uppercase tracking-tight truncate max-w-[180px]">{p.name}</span>
                                <span className="text-[11px] font-black text-blue-600">{fmtCurrency(p.revenue)}</span>
                             </div>
                             <div className="w-full h-1.5 bg-gray-50 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-600 rounded-full transition-all duration-1000" style={{ width: `${(p.revenue / (data.products[0]?.revenue || 1)) * 100}%` }} />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="col-span-1 lg:col-span-7 bg-white p-6 lg:p-10 rounded-[48px] border border-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-black text-gray-900 tracking-tight">Transacciones de Impacto</h3>
                       <button className="p-2 bg-gray-50 rounded-xl text-gray-400 hover:text-gray-900 transition-all"><MoreHorizontal className="w-5 h-5"/></button>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left min-w-[500px]">
                          <thead>
                             <tr className="bg-gray-50/50 text-[9px] font-black text-gray-400 uppercase tracking-[2px] border-b border-gray-50">
                                <th className="px-5 py-4">ID</th>
                                <th className="px-5 py-4">Titular</th>
                                <th className="px-5 py-4 text-right">Monto</th>
                                <th className="px-5 py-4 text-center">Auditoría</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {data.transactions.slice(0, 5).map((t: any) => (
                                <tr key={t.id} className="group hover:bg-indigo-50/30 transition-all cursor-default">
                                   <td className="px-5 py-3 text-[10px] font-black text-gray-400">#{t.id.slice(5,11).toUpperCase()}</td>
                                   <td className="px-5 py-3">
                                      <div className="flex items-center gap-3">
                                         <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-gray-500 text-[9px] uppercase border border-gray-200 shrink-0">{t.customer.split(' ').map((n:any)=>n[0]).join('')}</div>
                                         <span className="text-[11px] font-bold text-gray-700 truncate max-w-[150px]">{t.customer}</span>
                                      </div>
                                   </td>
                                   <td className="px-5 py-3 text-right text-[11px] font-black text-gray-900">{fmtCurrency(t.amount)}</td>
                                   <td className="px-5 py-3 text-center">
                                      <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${
                                          t.status === 'PAID' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                                      }`}>
                                         {t.status === 'PAID' ? 'OK' : 'WAIT'}
                                      </span>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                        </table>
                     </div>
                     <button className="w-full py-4 mt-6 text-[10px] font-black text-blue-600 uppercase tracking-widest bg-gray-50/50 border-2 border-dashed border-gray-100 rounded-2xl hover:bg-white hover:border-blue-100 transition-all">
                        Ver Historial Completo
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
