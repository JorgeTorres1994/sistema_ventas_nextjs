"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    Cell, PieChart, Pie, Sector, AreaChart, Area
} from 'recharts';
import { 
    Calendar, Download, FileText, Table as TableIcon, 
    ArrowUpRight, ArrowDownRight, Printer, Filter,
    ChevronDown, Search, Loader2, Package, User, Clock,
    DollarSign, Briefcase, TrendingUp, ShoppingBag, 
    Maximize2, MoreHorizontal, CheckCircle2, AlertCircle,
    BarChart3
} from 'lucide-react';
import { 
    getReportsSummary, 
    getReportsCharts, 
    getReportsTopProducts, 
    getReportsTransactions 
} from '@/lib/api';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// ── Helpers ────────────────────────────────────────────────────────────────────
const fmtCurrency = (n: number) => `S/ ${Number(n).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const fmtCompact = (n: number) => Intl.NumberFormat('es-PE', { notation: 'compact', maximumFractionDigits: 1 }).format(n);

// ── Components ─────────────────────────────────────────────────────────────────

const KPICard = ({ title, value, growth, icon: Icon, isCurrency = false }: any) => (
  <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex-1 group hover:border-blue-100 transition-all duration-500">
    <div className="flex items-center justify-between mb-5">
       <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
          <Icon className="w-6 h-6" />
       </div>
       {growth !== undefined && (
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase ${growth >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
             {growth >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
             {Math.abs(growth).toFixed(1)}%
          </div>
       )}
    </div>
    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[2px] mb-1">{title}</p>
    <h4 className="text-3xl font-black text-gray-900 tracking-tight leading-none">
       {isCurrency ? fmtCurrency(value) : value.toLocaleString()}
    </h4>
    <p className="text-[11px] font-bold text-gray-400 mt-3 flex items-center gap-1.5">
       <Clock className="w-3 h-3" /> vs periodo anterior
    </p>
  </div>
);

export default function ReportsPage() {
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ startDate: '', endDate: '', type: 'Consolidated Revenue' });
  const [data, setData] = useState<any>({ summary: null, charts: null, products: [], transactions: [] });
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
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Generators ──────────────────────────────────────────────────────────────────
  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data.transactions);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reporte de Ventas");
    XLSX.writeFile(wb, `Reporte_Ventas_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Reporte_Ventas_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  if (loading && !data.summary) {
    return (
      <div className="flex h-screen bg-[#F9FAFB] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
           <p className="text-sm font-black text-gray-900 uppercase tracking-widest">Agregando Métricas Globales...</p>
        </div>
      </div>
    );
  }

  const isEmpty = (data.summary?.totalSales === 0);

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-y-auto" ref={reportRef}>
        
        {/* Header */}
        <header className="px-12 pt-10 pb-6 bg-transparent flex items-start justify-between">
          <div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight mb-2">Reportes de Ventas</h1>
            <p className="text-base text-gray-500 font-medium tracking-tight">Espacio analítico en tiempo real para la Tienda #402</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={exportPDF} className="px-6 py-3.5 bg-white border border-gray-100 rounded-2xl text-sm font-black text-gray-900 hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2">
                <FileText className="w-4 h-4 text-rose-500" /> PDF
             </button>
             <button onClick={exportExcel} className="px-8 py-3.5 bg-[#0052FF] rounded-2xl text-sm font-black text-white hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all flex items-center gap-2">
                <TableIcon className="w-4 h-4" /> Excel
             </button>
          </div>
        </header>

        {/* Filters Top Bar */}
        <div className="px-12 pb-8 flex items-center gap-4 sticky top-0 bg-[#F9FAFB] z-20 pt-2">
           <div className="flex-1 flex gap-4">
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 px-5 py-2 group focus-within:border-blue-200 transition-all">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Rango de Fechas</p>
                 <div className="flex items-center justify-between">
                    <select className="bg-transparent text-sm font-black text-gray-900 focus:outline-none w-full appearance-none cursor-pointer">
                       <option>Últimos 30 Días</option>
                       <option>Hoy</option>
                       <option>Este Trimestre</option>
                       <option>Año a la Fecha</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                 </div>
              </div>
              <div className="flex-1 bg-white rounded-2xl border border-gray-100 px-5 py-2 group focus-within:border-blue-200 transition-all">
                 <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Tipo de Reporte</p>
                 <div className="flex items-center justify-between">
                    <select 
                       value={filters.type}
                       onChange={e => setFilters({...filters, type: e.target.value})}
                       className="bg-transparent text-sm font-black text-gray-900 focus:outline-none w-full appearance-none cursor-pointer"
                    >
                       <option value="Consolidated Revenue">Ingresos Consolidados</option>
                       <option value="Product Performance">Rendimiento de Productos</option>
                       <option value="Inventory Health">Salud de Inventario</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                 </div>
              </div>
              <div className="w-[300px] flex items-center bg-gray-100 px-5 rounded-2xl">
                 <Search className="w-4 h-4 text-gray-400 mr-2" />
                 <input className="bg-transparent border-none focus:ring-0 text-sm font-bold text-gray-600 w-full" placeholder="Buscar parámetros..." />
              </div>
           </div>
        </div>

        <main className="flex-1 px-12 pb-12 space-y-8">
          
          {(isEmpty || !data.summary) ? (
             <div className="flex flex-col items-center justify-center py-20 animate-in fade-in slide-in-from-bottom-4">
                <div className="w-32 h-32 bg-gray-50 rounded-[40px] flex items-center justify-center mb-8 border border-dashed border-gray-200">
                   <BarChart3 className="w-16 h-16 text-gray-300" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-2">No hay datos disponibles para este periodo</h2>
                <p className="text-gray-500 font-medium mb-10 max-w-md text-center">Intente ajustar sus filtros o rango de fechas para ver los resultados de las operaciones activas.</p>
                <div className="flex gap-4">
                   <button onClick={() => setFilters({startDate:'', endDate:'', type:'Consolidated Revenue'})} className="px-8 py-4 bg-blue-600 rounded-2xl text-white font-black hover:bg-blue-700 transition-all flex items-center gap-2">
                       <Calendar className="w-5 h-5" /> Ajustar Fechas
                   </button>
                   <button onClick={() => fetchData()} className="px-8 py-4 bg-white border border-gray-100 rounded-2xl text-gray-900 font-black hover:bg-gray-50 transition-all flex items-center gap-2">
                       <Loader2 className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /> Limpiar Filtros
                   </button>
                </div>
             </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="flex gap-8">
                <KPICard title="Ventas Totales" value={data.summary?.totalRevenue ?? 0} growth={12.5} icon={ShoppingBag} isCurrency />
                <KPICard title="Ganancia Total" value={data.summary?.totalProfit ?? 0} growth={8.2} icon={TrendingUp} isCurrency />
                <KPICard title="Ticket Promedio" value={data.summary?.avgTicket ?? 0} growth={-1.4} icon={DollarSign} isCurrency />
              </div>

              {/* Row 1: Charts */}
              <div className="grid grid-cols-12 gap-8">
                <div className="col-span-8 bg-white p-10 rounded-[48px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                  <div className="flex items-center justify-between mb-8">
                     <div>
                        <h3 className="text-xl font-black text-gray-900 tracking-tight">Rendimiento de Ventas</h3>
                        <p className="text-sm font-medium text-gray-400">Tendencias de ingresos diarios en el periodo seleccionado</p>
                     </div>
                     <div className="flex bg-gray-50 p-1.5 rounded-2xl gap-1">
                        <button className="px-5 py-2 bg-white text-blue-600 rounded-xl text-xs font-black shadow-sm">Ingresos</button>
                        <button className="px-5 py-2 text-gray-400 rounded-xl text-xs font-black hover:text-gray-900 transition-all">Volumen</button>
                     </div>
                  </div>
                  <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.charts.performance}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                        <XAxis dataKey="date" 
                               axisLine={false} 
                               tickLine={false} 
                               tick={{fill: '#9CA3AF', fontWeight: 900, fontSize: 10}} 
                               tickFormatter={val => val.split('-').slice(1).join('/')}
                               dy={10} />
                        <YAxis axisLine={false} 
                               tickLine={false} 
                               tick={{fill: '#9CA3AF', fontWeight: 900, fontSize: 10}} 
                               tickFormatter={val => `S/ ${fmtCompact(val)}`}
                               dx={-10} />
                        <Tooltip cursor={{fill: '#F9FAFB'}} 
                                 contentStyle={{borderRadius: '20px', border:'none', boxShadow:'0 10px 30px rgba(0,0,0,0.1)', padding:'20px'}} />
                        <Bar dataKey="revenue" radius={[6, 6, 0, 0]} barSize={28}>
                            {data.charts.performance.map((entry: any, i: number) => (
                                <Cell key={i} fill={i % 2 === 0 ? '#E0E7FF' : '#0052FF'} />
                            ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="col-span-4 bg-white p-10 rounded-[48px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col">
                  <h3 className="text-xl font-black text-gray-900 tracking-tight mb-8">Distribución de Ingresos</h3>
                  <div className="flex-1 min-h-[300px] relative flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.charts.distribution}
                          cx="50%"
                          cy="50%"
                          innerRadius={90}
                          outerRadius={120}
                          paddingAngle={8}
                          dataKey="value"
                        >
                          <Cell fill="#0052FF" />
                          <Cell fill="#6366F1" />
                          <Cell fill="#E0E7FF" />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                       <p className="text-4xl font-black text-gray-900 tracking-tighter">100%</p>
                       <p className="text-[9px] font-black text-gray-400 tracking-widest uppercase mt-1">Participación Total</p>
                    </div>
                  </div>
                  <div className="space-y-4 mt-8">
                     {data.charts.distribution.map((d: any, i: number) => (
                        <div key={i} className="flex items-center justify-between bg-gray-50/50 p-4 rounded-2xl">
                           <div className="flex items-center gap-3">
                              <div className={`w-3 h-3 rounded-full ${i === 0 ? 'bg-blue-600' : i === 1 ? 'bg-indigo-500' : 'bg-blue-100'}`} />
                              <span className="text-sm font-bold text-gray-600">{
                                d.name === 'POS Terminal' ? 'Terminal POS' :
                                d.name === 'Online Shop' ? 'Tienda Online' :
                                d.name === 'Mobile App' ? 'App Móvil' : d.name
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

              {/* Section 2: Details */}
              <div className="grid grid-cols-12 gap-8">
                 <div className="col-span-5 bg-white p-10 rounded-[48px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)] flex flex-col">
                    <div className="flex items-center justify-between mb-10">
                       <h3 className="text-xl font-black text-gray-900 tracking-tight">Productos más Vendidos</h3>
                       <button className="text-[10px] font-black text-blue-600 hover:text-blue-800 uppercase tracking-widest decoration-2 underline underline-offset-4 transition-all">Ver detalles de inventario</button>
                    </div>
                    <div className="space-y-10">
                       {data.products.map((p: any, i: number) => (
                          <div key={i} className="group cursor-default">
                             <div className="flex items-center justify-between mb-3">
                                <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{p.name}</span>
                                <span className="text-sm font-black text-gray-900">{fmtCurrency(p.revenue)}</span>
                             </div>
                             <div className="w-full h-2 by-gray-100 rounded-full overflow-hidden relative">
                                <div className="absolute inset-0 bg-gray-50" />
                                <div className="absolute inset-0 bg-blue-600 transition-all duration-1000" style={{ width: `${(p.revenue / data.products[0].revenue) * 100}%` }} />
                             </div>
                          </div>
                       ))}
                    </div>
                 </div>

                 <div className="col-span-7 bg-white p-10 rounded-[48px] border border-gray-100 shadow-[0_20px_50px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center justify-between mb-8">
                       <h3 className="text-xl font-black text-gray-900 tracking-tight">Transacciones Recientes de Alto Valor</h3>
                       <button className="p-2 text-gray-300 hover:text-gray-900 transition-all"><MoreHorizontal className="w-6 h-6"/></button>
                    </div>
                    <div className="overflow-x-auto">
                       <table className="w-full text-left">
                          <thead>
                             <tr className="bg-gray-50/50 text-[10px] font-black text-gray-400 uppercase tracking-[2px] border-b border-gray-50">
                                <th className="px-6 py-5">ID Transacción</th>
                                <th className="px-6 py-5">Cliente</th>
                                <th className="px-6 py-5">Categoría</th>
                                <th className="px-6 py-5">Monto</th>
                                <th className="px-6 py-5 text-right">Estado</th>
                             </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                             {data.transactions.map((t: any) => (
                                <tr key={t.id} className="group hover:bg-gray-50/50 transition-all">
                                   <td className="px-6 py-6 text-sm font-black text-gray-900 leading-tight">#{t.id.slice(0,8).toUpperCase()}</td>
                                   <td className="px-6 py-6 flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">{t.customer.split(' ').map((n:any)=>n[0]).join('')}</div>
                                      <span className="text-sm font-bold text-gray-600">{t.customer}</span>
                                   </td>
                                   <td className="px-6 py-6 text-sm font-bold text-gray-400">{t.category}</td>
                                   <td className="px-6 py-6 text-sm font-black text-gray-900">{fmtCurrency(t.amount)}</td>
                                   <td className="px-6 py-6 text-right">
                                      <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                          t.status === 'PAID' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'
                                      }`}>
                                         {t.status === 'PAID' ? 'PAGADO' : t.status === 'PENDING' ? 'PENDIENTE' : t.status}
                                      </span>
                                   </td>
                                </tr>
                             ))}
                          </tbody>
                        </table>
                     </div>
                     <button className="w-full py-6 mt-4 text-xs font-black text-blue-600 uppercase tracking-widest bg-white border-2 border-dashed border-gray-100 rounded-[32px] hover:bg-gray-50 hover:border-blue-100 transition-all">
                        Cargar más Transacciones
                     </button>
                  </div>
               </div>
            </>
          )}

        </main>
      </div>
    </div>
  );
}
