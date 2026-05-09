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
    const base = "px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest transition-all";
    switch (action) {
      case 'CREATE': return `${base} text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-sm`;
      case 'UPDATE': return `${base} text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-sm`;
      case 'DELETE': return `${base} text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-sm`;
      case 'LOGIN': return `${base} text-primary bg-primary/10 border-primary/20 shadow-sm`;
      case 'LOGOUT': return `${base} text-on-surface-variant bg-surface-low border-outline-variant shadow-sm`;
      default: return `${base} text-on-surface-variant bg-surface-low border-outline-variant shadow-sm`;
    }
  };

  const getModuleIcon = (module: string) => {
    const base = "p-2.5 rounded-xl transition-all border border-transparent";
    switch (module) {
      case 'SALES': return <div className={`${base} bg-primary/10 text-primary border-primary/20`}><Activity className="w-4 h-4" /></div>;
      case 'PRODUCTS': return <div className={`${base} bg-emerald-500/10 text-emerald-500 border-emerald-500/20`}><Database className="w-4 h-4" /></div>;
      case 'AUTH': return <div className={`${base} bg-rose-500/10 text-rose-500 border-rose-500/20`}><ShieldAlert className="w-4 h-4" /></div>;
      default: return <div className={`${base} bg-surface-low text-on-surface-variant border-outline-variant`}><Monitor className="w-4 h-4" /></div>;
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 lg:p-12 scrollbar-hide">
          <div className="max-w-7xl mx-auto space-y-8">
            
            {/* Header Pro */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-1">
                <nav className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                  <span>Seguridad de Élite</span>
                  <span className="text-on-surface-variant/40">/</span>
                  <span className="text-on-surface-variant">Auditoría de Logs</span>
                </nav>
                <h1 className="text-4xl font-black tracking-tighter leading-none">Bitácora Global</h1>
                <p className="text-sm font-medium text-on-surface-variant mt-3 opacity-80">Monitoreo inalterable de cada interacción con el núcleo del sistema.</p>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="bg-card px-6 py-4 rounded-2xl border border-outline-variant shadow-sm flex items-center gap-4">
                    <div className="relative">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                      <div className="absolute inset-0 w-3 h-3 bg-emerald-500 rounded-full animate-ping opacity-60"></div>
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Sistema de Vigilancia Activo</span>
                 </div>
              </div>
            </div>

            {/* Advanced Filters */}
            <div className="bg-card p-4 md:p-5 rounded-[24px] md:rounded-[32px] border border-outline-variant shadow-sm flex flex-col xl:flex-row items-stretch xl:items-center gap-4 xl:gap-6">
               <div className="w-full xl:flex-1 relative group">
                  <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40 group-focus-within:text-primary transition-colors" />
                  <input 
                    type="text"
                    placeholder="Rastrear por descripción, evento o identidad..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-14 pr-5 py-3.5 md:py-4 bg-surface-low border border-transparent rounded-2xl text-sm font-black text-foreground placeholder:text-on-surface-variant/30 focus:bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary/30 transition-all outline-none"
                  />
               </div>

               <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-surface-low p-2 md:p-1.5 rounded-2xl border border-outline-variant/30">
                 <select 
                   value={filters.module}
                   onChange={(e) => setFilters({...filters, module: e.target.value})}
                   className="bg-transparent px-4 py-3 md:px-5 text-[10px] font-black text-on-surface-variant uppercase tracking-widest outline-none cursor-pointer focus:text-primary transition-colors w-full sm:w-auto appearance-none"
                 >
                    <option value="">Módulos Nexus</option>
                    <option value="SALES">Operaciones Ventas</option>
                    <option value="PRODUCTS">Catálogo Productos</option>
                    <option value="INVENTORY">Gestión Inventario</option>
                    <option value="AUTH">Seguridad Núcleo</option>
                 </select>
                 <div className="hidden sm:block w-px h-8 bg-outline-variant/30"></div>
                 <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 px-3 sm:px-4 py-2 sm:py-3 text-[10px] font-black text-on-surface-variant">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <input 
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                      className="bg-transparent border-none focus:ring-0 p-0 text-foreground cursor-pointer flex-1 sm:flex-none text-center sm:text-left"
                    />
                    <ArrowRight className="w-3 h-3 text-on-surface-variant/30 shrink-0" />
                    <input 
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                      className="bg-transparent border-none focus:ring-0 p-0 text-foreground cursor-pointer flex-1 sm:flex-none text-center sm:text-left"
                    />
                 </div>
               </div>
            </div>

            {/* Main Content Table & Mobile Cards */}
            <div className="bg-card rounded-[24px] md:rounded-[40px] border border-outline-variant shadow-sm overflow-hidden transition-all">
               {/* Mobile Cards View */}
               <div className="lg:hidden flex flex-col divide-y divide-outline-variant/20">
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="p-5 h-32 bg-surface-low/10 animate-pulse"></div>
                    ))
                  ) : logs.length === 0 ? (
                    <div className="py-16 text-center px-4">
                       <div className="w-20 h-20 bg-surface-low rounded-3xl flex items-center justify-center mx-auto mb-6 border border-outline-variant/30">
                         <AlertCircle className="w-8 h-8 text-on-surface-variant/20" />
                       </div>
                       <h3 className="text-xl font-black tracking-tight">Sin hallazgos</h3>
                       <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mt-2">No se detectaron eventos</p>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className="p-5 flex flex-col gap-4 hover:bg-primary/5 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                           <div className="flex items-center gap-3">
                              <div className="shrink-0">{getModuleIcon(log.module)}</div>
                              <div className="flex flex-col gap-1">
                                <span className="text-[12px] font-black leading-tight text-foreground">{log.description}</span>
                                <div className="flex items-center gap-2 mt-0.5">
                                   <span className={getActionBadge(log.action)}>{log.action}</span>
                                   <span className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest">{log.module}</span>
                                </div>
                              </div>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3 pt-3 border-t border-outline-variant/20">
                           <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0">
                                  {log.user?.avatarUrl ? (
                                    <img 
                                      src={log.user.avatarUrl.startsWith('http') ? log.user.avatarUrl : `http://localhost:3005${log.user.avatarUrl}`} 
                                      alt="" 
                                      className="w-full h-full object-cover"
                                      onError={(e: any) => {
                                        e.target.style.display = 'none';
                                        e.target.parentElement.innerHTML = `<span class="text-[10px] font-black text-primary uppercase">${log.user?.name?.charAt(0) || 'S'}</span>`;
                                      }}
                                    />
                                  ) : (
                                    <span className="text-[10px] font-black text-primary uppercase">{log.user?.name?.charAt(0) || 'S'}</span>
                                  )}
                              </div>
                              <div className="flex flex-col overflow-hidden">
                                <span className="text-[11px] font-black truncate">{log.user?.name || 'Sistema Nucleus'}</span>
                                {log.ipAddress && <span className="text-[8px] font-black text-on-surface-variant/40 uppercase truncate"><Globe className="w-2.5 h-2.5 inline mr-0.5" />{log.ipAddress}</span>}
                              </div>
                           </div>
                           
                           <div className="flex flex-col items-end justify-center">
                              <span className="text-[11px] font-black">{format(new Date(log.createdAt), 'dd MMM, yyyy', { locale: es })}</span>
                              <span className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-[0.2em] mt-0.5 flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> {format(new Date(log.createdAt), 'HH:mm:ss')}
                              </span>
                           </div>
                        </div>
                      </div>
                    ))
                  )}
               </div>

               {/* Desktop Table View */}
               <div className="hidden lg:block overflow-x-auto scrollbar-hide w-full">
                <table className="w-full text-left table-fixed">
                    <thead>
                        <tr className="bg-surface-low/30 border-b border-outline-variant/30">
                          <th className="w-2/5 px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Evento</th>
                          <th className="w-1/4 px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Responsable</th>
                          <th className="w-1/6 px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Estado Operativo</th>
                          <th className="w-[18%] px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] text-right">Registro Temporal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-outline-variant/20">
                        {loading ? (
                          Array(10).fill(0).map((_, i) => (
                              <tr key={i} className="animate-pulse">
                                <td colSpan={4} className="px-6 py-5 h-24 bg-surface-low/10"></td>
                              </tr>
                          ))
                        ) : logs.length === 0 ? (
                          <tr>
                              <td colSpan={4} className="px-6 py-24 text-center">
                                <div className="w-24 h-24 bg-surface-low rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-outline-variant/30">
                                  <AlertCircle className="w-10 h-10 text-on-surface-variant/20" />
                                </div>
                                <h3 className="text-2xl font-black tracking-tight">Sin hallazgos</h3>
                                <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mt-3">No se detectaron eventos bajo estos parámetros</p>
                              </td>
                          </tr>
                        ) : (
                          logs.map((log) => (
                              <tr key={log.id} className="hover:bg-primary/5 transition-all group cursor-default">
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-4">
                                      {getModuleIcon(log.module)}
                                      <div className="min-w-0">
                                          <p className="text-sm font-black tracking-tight group-hover:text-primary transition-colors truncate">{log.description}</p>
                                          <div className="flex items-center gap-3 mt-2">
                                            <span className="text-[9px] font-black text-primary bg-primary/10 px-2 py-1 rounded-md uppercase tracking-wider border border-primary/20 shrink-0">{log.module}</span>
                                            {log.ipAddress && (
                                              <span className="flex items-center gap-1.5 text-[9px] font-black text-on-surface-variant/40 uppercase tracking-tighter truncate">
                                                <Globe className="w-3 h-3 shrink-0" /> {log.ipAddress}
                                              </span>
                                            )}
                                          </div>
                                      </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-110 transition-transform">
                                          {log.user?.avatarUrl ? (
                                            <img 
                                              src={log.user.avatarUrl.startsWith('http') ? log.user.avatarUrl : `http://localhost:3005${log.user.avatarUrl}`} 
                                              alt="" 
                                              className="w-full h-full object-cover"
                                              onError={(e: any) => {
                                                e.target.style.display = 'none';
                                                const fallback = document.createElement('span');
                                                fallback.className = "text-[12px] font-black text-primary uppercase";
                                                fallback.innerText = log.user?.name?.charAt(0) || 'S';
                                                e.target.parentElement.appendChild(fallback);
                                              }}
                                            />
                                          ) : (
                                            <span className="text-[12px] font-black text-primary uppercase">{log.user?.name?.charAt(0) || 'S'}</span>
                                          )}
                                      </div>
                                      <div className="min-w-0">
                                          <p className="text-sm font-black tracking-tight truncate">{log.user?.name || 'Sistema Nucleus'}</p>
                                          <p className="text-[10px] text-on-surface-variant/60 font-black mt-1 tracking-widest uppercase truncate">{log.user?.email || 'automated@nexus.sys'}</p>
                                      </div>
                                    </div>
                                </td>
                                <td className="px-6 py-5">
                                    <span className={getActionBadge(log.action)}>
                                      {log.action}
                                    </span>
                                </td>
                                <td className="px-6 py-5 text-right">
                                    <div className="flex flex-col items-end">
                                      <div className="flex items-center gap-2 text-sm font-black tracking-tight">
                                          {format(new Date(log.createdAt), 'dd MMM, yyyy', { locale: es })}
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant/40 mt-1 uppercase tracking-[0.2em]">
                                          <Clock className="w-3.5 h-3.5 text-primary" />
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
               <div className="px-5 lg:px-10 py-5 lg:py-7 bg-surface-low/30 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-5">
                  <div className="flex flex-col text-center sm:text-left">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Control de flujo de datos</span>
                    <span className="text-xs font-black mt-1">{logs.length} de {total} registros certificados</span>
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto justify-between sm:justify-start">
                    <button 
                      disabled={page === 1}
                      onClick={() => setPage(p => p - 1)}
                      className="p-3 bg-card border border-outline-variant rounded-xl sm:rounded-2xl text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                    >
                      <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                    </button>
                    
                    <div className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2">
                       {Array.from({ length: Math.min(3, Math.ceil(total / 10)) }).map((_, i) => {
                          const pageNum = i + 1;
                          return (
                            <button
                              key={pageNum}
                              onClick={() => setPage(pageNum)}
                              className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl text-[10px] sm:text-xs font-black transition-all active:scale-95 ${
                                page === pageNum 
                                ? 'bg-primary text-on-primary shadow-lg sm:shadow-xl shadow-primary/30 scale-105 sm:scale-110' 
                                : 'bg-card border border-outline-variant text-on-surface-variant hover:bg-surface-low'
                              }`}
                            >
                              {pageNum}
                            </button>
                          );
                       })}
                       {Math.ceil(total / 10) > 3 && <span className="px-2 text-on-surface-variant/30 font-black tracking-tighter">...</span>}
                    </div>

                    <button 
                      disabled={page * 10 >= total}
                      onClick={() => setPage(p => p + 1)}
                      className="p-3 bg-card border border-outline-variant rounded-xl sm:rounded-2xl text-on-surface-variant hover:text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm active:scale-90"
                    >
                      <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
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

