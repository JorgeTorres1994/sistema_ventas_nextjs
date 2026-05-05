"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
  History, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  User as UserIcon, 
  ShieldAlert, 
  Activity,
  ArrowRight,
  Monitor,
  Globe,
  Database,
  ChevronLeft,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    module: '',
    action: '',
    startDate: '',
    endDate: ''
  });

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit', { 
        params: { 
          ...filters,
          search,
          page,
          limit: 10
        } 
      });
      // El backend ahora devuelve { data, total }
      setLogs(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch (error) {
      toast.error('Error al cargar logs de auditoría');
    } finally {
      setLoading(false);
    }
  }, [filters, search, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Reset page on filter change
  useEffect(() => {
    setPage(1);
  }, [filters, search]);

  const getActionBadge = (action: string) => {
    const base = "px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest";
    switch (action) {
      case 'CREATE': return `${base} text-emerald-600 bg-emerald-50 border-emerald-100`;
      case 'UPDATE': return `${base} text-amber-600 bg-amber-50 border-amber-100`;
      case 'DELETE': return `${base} text-rose-600 bg-rose-50 border-rose-100`;
      case 'LOGIN': return `${base} text-blue-600 bg-blue-50 border-blue-100`;
      case 'LOGOUT': return `${base} text-gray-500 bg-gray-50 border-gray-100`;
      default: return `${base} text-gray-600 bg-gray-50 border-gray-100`;
    }
  };

  const getModuleIcon = (module: string) => {
    const base = "p-2.5 rounded-xl transition-all";
    switch (module) {
      case 'SALES': return <div className={`${base} bg-indigo-50 text-indigo-600`}><Activity className="w-4 h-4" /></div>;
      case 'PRODUCTS': return <div className={`${base} bg-emerald-50 text-emerald-600`}><Database className="w-4 h-4" /></div>;
      case 'AUTH': return <div className={`${base} bg-rose-50 text-rose-600`}><ShieldAlert className="w-4 h-4" /></div>;
      default: return <div className={`${base} bg-gray-50 text-gray-400`}><Monitor className="w-4 h-4" /></div>;
    }
  };

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden font-sans text-[#111827]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden transition-all duration-300">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto px-4 lg:px-12 py-6 lg:py-12">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Pro */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
              <div className="space-y-1">
                <nav className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] mb-2">
                  <span>Seguridad</span>
                  <span>/</span>
                  <span className="text-gray-400">Auditoría</span>
                </nav>
                <h1 className="text-3xl lg:text-4xl font-black text-gray-900 tracking-tighter leading-none">Bitácora</h1>
                <p className="text-xs lg:text-sm font-medium text-gray-500 mt-2">Monitoreo de interacciones con el núcleo.</p>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="relative">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <div className="absolute inset-0 w-2 h-2 bg-emerald-500 rounded-full animate-ping"></div>
                    </div>
                    <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">Activo</span>
                 </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-white p-4 rounded-[32px] border border-gray-100 shadow-sm flex flex-col lg:flex-row items-center gap-4">
               <div className="w-full lg:flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300 group-focus-within:text-blue-600 transition-colors" />
                  <input 
                    type="text"
                    placeholder="Buscar evento..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-200 transition-all outline-none"
                  />
               </div>

               <div className="flex flex-col sm:flex-row items-center gap-2 w-full lg:w-auto bg-gray-50 p-1 lg:p-1 rounded-2xl">
                 <select 
                   value={filters.module}
                   onChange={(e) => setFilters({...filters, module: e.target.value})}
                   className="w-full sm:w-auto bg-transparent px-4 py-2.5 text-[10px] font-black text-gray-600 uppercase tracking-wider outline-none cursor-pointer"
                 >
                    <option value="">Módulos</option>
                    <option value="SALES">Ventas</option>
                    <option value="PRODUCTS">Productos</option>
                    <option value="INVENTORY">Inventario</option>
                    <option value="AUTH">Seguridad</option>
                 </select>
                 <div className="hidden sm:block w-px h-6 bg-gray-200"></div>
                 <div className="flex items-center justify-between gap-2 px-3 py-2 w-full sm:w-auto text-[10px] font-black text-gray-400">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5" />
                        <input 
                          type="date"
                          value={filters.startDate}
                          onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                          className="bg-transparent border-none focus:ring-0 p-0 text-gray-700 cursor-pointer"
                        />
                    </div>
                    <ArrowRight className="w-3 h-3 mx-1" />
                    <input 
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                      className="bg-transparent border-none focus:ring-0 p-0 text-gray-700 cursor-pointer"
                    />
                 </div>
               </div>
            </div>

            {/* Main Content Table */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[1000px]">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-50">
                          <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Evento</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Responsable</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Acción</th>
                          <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Registro Temporal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                          Array(10).fill(0).map((_, i) => (
                              <tr key={i} className="animate-pulse">
                                <td colSpan={4} className="px-8 py-6 h-20 bg-gray-50/10"></td>
                              </tr>
                          ))
                        ) : logs.length === 0 ? (
                          <tr>
                              <td colSpan={4} className="px-8 py-24 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-[30px] flex items-center justify-center mx-auto mb-6">
                                  <AlertCircle className="w-8 h-8 text-gray-200" />
                                </div>
                                <h3 className="text-xl font-black text-gray-900 tracking-tight">Sin hallazgos</h3>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-2">No se detectaron eventos para los filtros aplicados</p>
                              </td>
                          </tr>
                        ) : (
                          logs.map((log) => (
                              <tr key={log.id} className="hover:bg-blue-50/30 transition-all group cursor-default">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-5">
                                      {getModuleIcon(log.module)}
                                      <div>
                                          <p className="text-sm font-black text-gray-900 leading-none">{log.description}</p>
                                          <div className="flex items-center gap-3 mt-1.5">
                                            <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md uppercase tracking-wider">{log.module}</span>
                                            {log.ipAddress && (
                                              <span className="flex items-center gap-1 text-[9px] font-bold text-gray-400 uppercase tracking-tight">
                                                <Globe className="w-2.5 h-2.5" /> {log.ipAddress}
                                              </span>
                                            )}
                                          </div>
                                      </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                                          {log.user?.avatarUrl ? (
                                            <img 
                                              src={log.user.avatarUrl.startsWith('http') ? log.user.avatarUrl : `http://localhost:3005${log.user.avatarUrl}`} 
                                              alt="" 
                                              className="w-full h-full object-cover"
                                              onError={(e: any) => {
                                                e.target.style.display = 'none';
                                                const fallback = document.createElement('span');
                                                fallback.className = "text-[10px] font-black text-indigo-600 uppercase";
                                                fallback.innerText = log.user?.name?.charAt(0) || 'S';
                                                e.target.parentElement.appendChild(fallback);
                                              }}
                                            />
                                          ) : (
                                            <span className="text-[10px] font-black text-indigo-600 uppercase">{log.user?.name?.charAt(0) || 'S'}</span>
                                          )}
                                      </div>
                                      <div>
                                          <p className="text-sm font-black text-gray-900 leading-none">{log.user?.name || 'Sistema'}</p>
                                          <p className="text-[10px] text-gray-400 font-bold mt-1 tracking-tight">{log.user?.email || 'nexus@automated.sys'}</p>
                                      </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={getActionBadge(log.action)}>
                                      {log.action}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <div className="flex flex-col items-end">
                                      <div className="flex items-center gap-2 text-sm font-black text-gray-900 tracking-tight">
                                          {format(new Date(log.createdAt), 'dd MMM, yyyy', { locale: es })}
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">
                                          <Clock className="w-3 h-3 text-blue-600" />
                                          {format(new Date(log.createdAt), 'HH:mm:ss')}
                                      </div>
                                    </div>
                                </td>
                              </tr>
                          ))
                        )}
                    </tbody>
                </table>
               </div>

               {/* Pagination Footer */}
               <div className="px-8 py-5 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Mostrando registros de auditoría</span>
                    <span className="text-xs font-black text-gray-900 mt-0.5">{logs.length} de {total} eventos totales</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <div className="flex items-center gap-1.5 px-1">
                       {Array.from({ length: Math.min(3, Math.ceil(total / 10)) }).map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`w-10 h-10 rounded-xl text-xs font-black transition-all ${
                                page === pageNum 
                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                                : 'bg-white border border-gray-100 text-gray-500 hover:bg-gray-50'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                       })}
                       {Math.ceil(total / 10) > 3 && <span className="px-2 text-gray-400 font-bold">...</span>}
                    </div>

                    <button 
                      disabled={page * 10 >= total}
                      onClick={() => setPage(p => p + 1)}
                      className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-400 hover:text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-95"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
