"use client";

import React, { useState, useEffect } from 'react';
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
  ArrowUpDown
} from 'lucide-react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
    module: '',
    action: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchLogs();
  }, [filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await api.get('/audit', { 
        params: { 
          ...filters,
          search 
        } 
      });
      setLogs(res.data);
    } catch (error) {
      toast.error('Error al cargar logs de auditoría');
    } finally {
      setLoading(false);
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'CREATE': return 'text-emerald-600 bg-emerald-50 border-emerald-100';
      case 'UPDATE': return 'text-amber-600 bg-amber-50 border-amber-100';
      case 'DELETE': return 'text-rose-600 bg-rose-50 border-rose-100';
      case 'LOGIN': return 'text-blue-600 bg-blue-50 border-blue-100';
      default: return 'text-gray-600 bg-gray-50 border-gray-100';
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'SALES': return <Activity className="w-4 h-4" />;
      case 'PRODUCTS': return <Database className="w-4 h-4" />;
      case 'AUTH': return <ShieldAlert className="w-4 h-4" />;
      default: return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans text-[#111827]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB] p-8">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Auditoría y Seguridad</h1>
                <p className="text-[#6B7280]">Historial detallado de todas las acciones críticas realizadas en el sistema.</p>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-xs font-black text-gray-900 uppercase tracking-widest">Monitoreo en Vivo</span>
                 </div>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-8 flex flex-wrap items-center gap-4">
               <div className="flex-1 min-w-[300px] relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Buscar por descripción o usuario..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && fetchLogs()}
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  />
               </div>

               <select 
                 value={filters.module}
                 onChange={(e) => setFilters({...filters, module: e.target.value})}
                 className="px-4 py-3 bg-gray-50 border-transparent rounded-2xl text-sm font-bold text-gray-700 outline-none hover:bg-gray-100 transition-all cursor-pointer"
               >
                  <option value="">Todos los Módulos</option>
                  <option value="SALES">Ventas</option>
                  <option value="PRODUCTS">Productos</option>
                  <option value="INVENTORY">Inventario</option>
                  <option value="AUTH">Seguridad</option>
               </select>

               <div className="flex items-center gap-2">
                  <input 
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="px-4 py-3 bg-gray-50 border-transparent rounded-2xl text-sm font-bold text-gray-700 outline-none"
                  />
                  <ArrowRight className="w-4 h-4 text-gray-300" />
                  <input 
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="px-4 py-3 bg-gray-50 border-transparent rounded-2xl text-sm font-bold text-gray-700 outline-none"
                  />
               </div>
            </div>

            {/* Logs Timeline Table */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead>
                     <tr className="bg-gray-50/50 border-b border-gray-50">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Evento</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Usuario</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Acción</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Fecha y Hora</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {loading ? (
                        Array(8).fill(0).map((_, i) => (
                           <tr key={i} className="animate-pulse">
                              <td colSpan={4} className="px-8 py-6 h-16 bg-gray-50/30"></td>
                           </tr>
                        ))
                     ) : logs.length === 0 ? (
                        <tr>
                           <td colSpan={4} className="px-8 py-20 text-center">
                              <History className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                              <p className="text-gray-400 font-bold">No se encontraron registros de auditoría</p>
                           </td>
                        </tr>
                     ) : (
                        logs.map((log) => (
                           <tr key={log.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className="p-3 bg-gray-100 rounded-xl text-gray-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                       {getModuleIcon(log.module)}
                                    </div>
                                    <div>
                                       <p className="text-sm font-bold text-gray-900">{log.description}</p>
                                       <div className="flex items-center gap-3 mt-1">
                                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{log.module}</span>
                                          {log.ipAddress && (
                                            <span className="flex items-center gap-1 text-[10px] font-bold text-gray-300">
                                              <Globe className="w-2.5 h-2.5" /> {log.ipAddress}
                                            </span>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-black">
                                       {log.user?.name?.charAt(0) || 'S'}
                                    </div>
                                    <div>
                                       <p className="text-sm font-bold text-gray-900">{log.user?.name || 'Sistema'}</p>
                                       <p className="text-[10px] text-gray-400 font-medium">{log.user?.email || 'automated@nexus.com'}</p>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <span className={`px-3 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${getActionColor(log.action)}`}>
                                    {log.action}
                                 </span>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <div className="flex flex-col items-end">
                                    <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                       <Calendar className="w-3.5 h-3.5 text-blue-600" />
                                       {format(new Date(log.createdAt), 'dd MMM, yyyy', { locale: es })}
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-1">
                                       <Clock className="w-3 h-3" />
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

          </div>
        </main>
      </div>
    </div>
  );
}
