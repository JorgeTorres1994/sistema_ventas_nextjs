"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
  FileText, Search, Download, RefreshCw, 
  CheckCircle2, AlertCircle, Clock, ExternalLink,
  ChevronLeft, ChevronRight, Hash, Calendar
} from 'lucide-react';
import { getSales, reSendInvoice } from '@/lib/api';
import { toast } from 'sonner';

export default function InvoicingLogPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [invoiceStatus, setInvoiceStatus] = useState('All');
  const [documentType, setDocumentType] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSales({ 
        search, 
        invoiceStatus: invoiceStatus !== 'All' ? invoiceStatus : undefined,
        documentType: documentType !== 'All' ? documentType : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined
      });
      setDocuments(data);
    } catch (error) {
      toast.error('Error al cargar logs de facturación');
    } finally {
      setLoading(false);
    }
  }, [search, invoiceStatus, documentType, startDate, endDate]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleRetry = async (id: string) => {
    const tid = toast.loading('Re-sincronizando con SUNAT...');
    try {
      await reSendInvoice(id);
      toast.success('Documento sincronizado correctamente', { id: tid });
      fetchDocuments();
    } catch (error: any) {
      toast.error('Error: ' + (error.response?.data?.message || 'Error de conexión'), { id: tid });
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8 scrollbar-hide">
          <div className="max-w-7xl mx-auto pb-20">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
              <div>
                <nav className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                  <span>Facturación</span><span>/</span>
                  <span className="text-on-surface-variant">Registro Electrónico</span>
                </nav>
                <h1 className="text-4xl font-black tracking-tighter mb-2">Comprobantes Electrónicos</h1>
                <p className="text-sm font-medium text-on-surface-variant max-w-xl">Gestión y monitoreo en tiempo real de la sincronización tributaria con SUNAT y OSE.</p>
              </div>
              
              <div className="flex items-center gap-4">
                 <div className="bg-emerald-500/10 px-6 py-3 rounded-[22px] border border-emerald-500/20 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Servicio OSE: Sincronizado</span>
                 </div>
              </div>
            </div>

            {/* Filters Bar - Optimized for breakpoints */}
            <div className="bg-card p-6 lg:p-10 rounded-[40px] border border-outline-variant shadow-sm mb-12 space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:scale-110 transition-transform"></div>
               
               <div className="flex flex-col lg:flex-row lg:items-center gap-6 relative z-10">
                  <div className="flex-1 relative">
                     <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant/40" />
                     <input 
                       type="text"
                       placeholder="Buscar por serie, número o cliente..."
                       value={search}
                       onChange={(e) => setSearch(e.target.value)}
                       className="w-full pl-16 pr-6 py-5 bg-surface-low border border-transparent rounded-[24px] text-sm focus:bg-card focus:border-primary/50 transition-all outline-none font-black text-foreground shadow-inner"
                     />
                  </div>

                  <div className="grid grid-cols-2 lg:flex items-center gap-4">
                     <select 
                        value={invoiceStatus}
                        onChange={(e) => setInvoiceStatus(e.target.value)}
                        className="w-full lg:w-fit px-6 py-5 bg-surface-low border border-transparent rounded-[24px] text-[10px] font-black uppercase tracking-widest outline-none focus:bg-card focus:border-primary/50 transition-all text-foreground shadow-inner cursor-pointer"
                     >
                        <option value="All">Todos los Estados</option>
                        <option value="SENT">Aceptados</option>
                        <option value="PENDING">Pendientes</option>
                        <option value="ERROR">Errores</option>
                     </select>

                     <select 
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full lg:w-fit px-6 py-5 bg-surface-low border border-transparent rounded-[24px] text-[10px] font-black uppercase tracking-widest outline-none focus:bg-card focus:border-primary/50 transition-all text-foreground shadow-inner cursor-pointer"
                     >
                        <option value="All">Todos los Tipos</option>
                        <option value="FACTURA">Factura</option>
                        <option value="BOLETA">Boleta</option>
                     </select>
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pt-8 border-t border-outline-variant/30 relative z-10">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                     <div className="relative group/input w-full sm:w-auto">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within/input:text-primary transition-colors" />
                        <input 
                           type="date"
                           value={startDate}
                           onChange={(e) => setStartDate(e.target.value)}
                           className="w-full sm:w-auto pl-11 pr-6 py-3 bg-surface-low border border-transparent rounded-2xl text-[11px] font-black outline-none focus:bg-card focus:border-primary/30 transition-all text-foreground shadow-inner"
                        />
                     </div>
                     <span className="hidden sm:block text-on-surface-variant/30 font-black text-[10px] uppercase tracking-widest">al</span>
                     <div className="relative group/input w-full sm:w-auto">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 group-focus-within/input:text-primary transition-colors" />
                        <input 
                           type="date"
                           value={endDate}
                           onChange={(e) => setEndDate(e.target.value)}
                           className="w-full sm:w-auto pl-11 pr-6 py-3 bg-surface-low border border-transparent rounded-2xl text-[11px] font-black outline-none focus:bg-card focus:border-primary/30 transition-all text-foreground shadow-inner"
                        />
                     </div>
                  </div>

                  <button 
                     onClick={() => {
                        setSearch('');
                        setInvoiceStatus('All');
                        setDocumentType('All');
                        setStartDate('');
                        setEndDate('');
                     }}
                     className="px-6 py-3 text-[10px] font-black text-on-surface-variant hover:text-rose-500 uppercase tracking-widest transition-all hover:bg-rose-500/5 rounded-xl active:scale-95"
                  >
                     Limpiar Filtros
                  </button>
               </div>
            </div>

            {/* Content Display: Responsive Hybrid System */}
            <div className="space-y-4 lg:space-y-0">
               {/* Mobile View: Cards (Hidden on Large Screens) */}
               <div className="lg:hidden space-y-6">
                  {loading ? (
                     Array(3).fill(0).map((_, i) => (
                        <div key={i} className="bg-card rounded-[32px] p-6 border border-outline-variant animate-pulse h-48"></div>
                     ))
                  ) : documents.length === 0 ? (
                     <div className="bg-card rounded-[32px] p-12 border border-outline-variant text-center">
                        <FileText className="w-12 h-12 text-on-surface-variant/20 mx-auto mb-4" />
                        <p className="text-on-surface-variant font-black uppercase tracking-widest text-[10px]">Sin resultados</p>
                     </div>
                  ) : (
                     documents.map((doc) => (
                        <div key={doc.id} className="bg-card rounded-[32px] p-6 border border-outline-variant shadow-sm active:scale-[0.98] transition-transform">
                           <div className="flex justify-between items-start mb-6">
                              <div className="flex items-center gap-4">
                                 <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white ${doc.documentType === 'FACTURA' ? 'bg-indigo-600 shadow-lg shadow-indigo-500/20' : 'bg-primary shadow-lg shadow-primary/20'}`}>
                                    <FileText className="w-6 h-6" />
                                 </div>
                                 <div>
                                    <p className="text-lg font-black text-foreground tracking-tight">
                                       {doc.series}-{doc.correlative?.toString().padStart(8, '0')}
                                    </p>
                                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{doc.documentType}</p>
                                 </div>
                              </div>
                              <div className="flex gap-2">
                                 {doc.pdfUrl && (
                                    <a href={doc.pdfUrl} target="_blank" rel="noreferrer" className="w-10 h-10 bg-surface-low rounded-xl flex items-center justify-center text-on-surface-variant border border-outline-variant">
                                       <ExternalLink className="w-5 h-5" />
                                    </a>
                                 )}
                              </div>
                           </div>
                           
                           <div className="space-y-4 mb-6">
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Cliente</span>
                                 <span className="text-xs font-black text-foreground">{doc.customer?.name || 'Consumidor Final'}</span>
                              </div>
                              <div className="flex justify-between items-center">
                                 <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Estado SUNAT</span>
                                 {doc.invoiceStatus === 'SENT' ? (
                                    <span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">Aceptado</span>
                                 ) : (
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${doc.invoiceStatus === 'ERROR' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                                       {doc.invoiceStatus === 'ERROR' ? 'Error' : 'Pendiente'}
                                    </span>
                                 )}
                              </div>
                           </div>

                           <button 
                              onClick={() => doc.invoiceStatus !== 'SENT' && handleRetry(doc.id)}
                              disabled={doc.invoiceStatus === 'SENT'}
                              className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black text-[10px] uppercase tracking-widest transition-all ${
                                 doc.invoiceStatus === 'SENT' 
                                 ? 'bg-surface-low text-on-surface-variant/20 border border-outline-variant' 
                                 : 'bg-primary text-on-primary shadow-xl shadow-primary/20'
                              }`}
                           >
                              <RefreshCw className={`w-4 h-4 ${doc.invoiceStatus !== 'SENT' && 'animate-spin-slow'}`} />
                              {doc.invoiceStatus === 'SENT' ? 'Sincronizado' : 'Sincronizar ahora'}
                           </button>
                        </div>
                     ))
                  )}
               </div>

               {/* Desktop View: Premium Table (Hidden on Mobile) */}
               <div className="hidden lg:block bg-card rounded-[48px] border border-outline-variant shadow-sm overflow-x-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                     <thead>
                        <tr className="bg-surface-low/30 border-b border-outline-variant/30">
                           <th className="px-6 xl:px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Identificación de Documento</th>
                           <th className="px-6 xl:px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Información del Cliente</th>
                           <th className="px-6 xl:px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Estado SUNAT/OSE</th>
                           <th className="px-6 xl:px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Archivos</th>
                           <th className="px-6 xl:px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-right">Gestión Operativa</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y divide-outline-variant/30">
                        {loading ? (
                           Array(6).fill(0).map((_, i) => (
                              <tr key={i} className="animate-pulse">
                                 <td colSpan={5} className="px-6 xl:px-10 py-8 h-24 bg-surface-low/10"></td>
                              </tr>
                           ))
                        ) : documents.length === 0 ? (
                           <tr>
                              <td colSpan={5} className="px-6 xl:px-10 py-32 text-center">
                                 <FileText className="w-16 h-16 text-on-surface-variant/10 mx-auto mb-6" />
                                 <p className="text-on-surface-variant font-black uppercase tracking-widest text-[11px] opacity-40">No se detectaron registros en este periodo</p>
                              </td>
                           </tr>
                        ) : (
                           documents.map((doc) => (
                              <tr key={doc.id} className="hover:bg-primary/[0.02] transition-colors group">
                                 <td className="px-6 xl:px-10 py-8">
                                    <div className="flex items-center gap-4 xl:gap-6">
                                       <div className={`w-12 h-12 xl:w-14 xl:h-14 rounded-[20px] xl:rounded-[22px] flex items-center justify-center text-white transition-transform group-hover:scale-110 flex-shrink-0 ${doc.documentType === 'FACTURA' ? 'bg-indigo-600 shadow-xl shadow-indigo-500/30' : 'bg-primary shadow-xl shadow-primary/30'}`}>
                                          <FileText className="w-5 h-5 xl:w-6 xl:h-6" />
                                       </div>
                                       <div className="min-w-0">
                                          <p className="text-base xl:text-lg font-black text-foreground tracking-tighter leading-tight truncate">
                                             {doc.series || 'S/S'}-{doc.correlative ? doc.correlative.toString().padStart(8, '0') : '00000000'}
                                          </p>
                                          <div className="flex items-center gap-2 xl:gap-3 mt-1.5">
                                             <span className={`px-2 py-0.5 rounded-full text-[8px] xl:text-[9px] font-black uppercase tracking-widest border ${doc.documentType === 'FACTURA' ? 'text-indigo-600 border-indigo-200 bg-indigo-50' : 'text-primary border-primary/20 bg-primary/5'}`}>
                                                {doc.documentType}
                                             </span>
                                             <span className="text-[8px] xl:text-[9px] text-on-surface-variant/40 font-black uppercase tracking-[0.1em] flex items-center gap-1">
                                                <Calendar className="w-2.5 h-2.5 xl:w-3 xl:h-3" /> {new Date(doc.createdAt).toLocaleDateString()}
                                             </span>
                                          </div>
                                       </div>
                                    </div>
                                 </td>
                                 <td className="px-6 xl:px-10 py-8">
                                    <p className="text-xs xl:text-sm font-black text-foreground tracking-tight truncate max-w-[150px]">{doc.customer?.name || 'Consumidor Final'}</p>
                                    <p className="text-[9px] xl:text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest mt-1">{doc.customer?.dni || '88888888'}</p>
                                 </td>
                                 <td className="px-6 xl:px-10 py-8">
                                     <div className="flex flex-col gap-2">
                                        {doc.invoiceStatus === 'SENT' ? (
                                           <span className="flex w-fit items-center gap-2 px-3 xl:px-4 py-1.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-[9px] xl:text-[10px] font-black uppercase tracking-widest">
                                              <CheckCircle2 className="w-3 h-3 xl:w-3.5 xl:h-3.5" /> Aceptado
                                           </span>
                                        ) : (
                                           <>
                                              <span className={`flex w-fit items-center gap-2 px-3 xl:px-4 py-1.5 rounded-xl text-[9px] xl:text-[10px] font-black uppercase tracking-widest border ${doc.invoiceStatus === 'ERROR' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' : 'bg-amber-500/10 text-amber-600 border-amber-500/20'}`}>
                                                 {doc.invoiceStatus === 'ERROR' ? <AlertCircle className="w-3 h-3 xl:w-3.5 xl:h-3.5" /> : <Clock className="w-3 h-3 xl:w-3.5 xl:h-3.5" />}
                                                 {doc.invoiceStatus === 'ERROR' ? 'Error' : 'Pendiente'}
                                              </span>
                                           </>
                                        )}
                                     </div>
                                 </td>
                                 <td className="px-6 xl:px-10 py-8">
                                    <div className="flex items-center justify-center gap-2 xl:gap-3">
                                       {doc.pdfUrl && (
                                          <a href={doc.pdfUrl} target="_blank" rel="noreferrer" className="w-10 h-10 xl:w-11 xl:h-11 bg-surface-low text-on-surface-variant hover:text-primary hover:bg-primary/10 border border-outline-variant/50 rounded-xl flex items-center justify-center transition-all hover:scale-110 shadow-sm" title="Imprimir Comprobante">
                                             <Download className="w-4 h-4 xl:w-5 xl:h-5" />
                                          </a>
                                       )}
                                    </div>
                                 </td>
                                 <td className="px-6 xl:px-10 py-8 text-right">
                                    <button 
                                      onClick={() => doc.invoiceStatus !== 'SENT' && handleRetry(doc.id)}
                                      disabled={doc.invoiceStatus === 'SENT'}
                                      className={`w-10 h-10 xl:w-12 xl:h-12 rounded-[18px] xl:rounded-[20px] flex items-center justify-center transition-all ml-auto ${
                                         doc.invoiceStatus === 'SENT' 
                                           ? 'bg-surface-low text-on-surface-variant/10 cursor-not-allowed border border-outline-variant/30' 
                                           : 'bg-primary text-on-primary shadow-xl shadow-primary/30 hover:scale-110 active:scale-95 border border-primary/20'
                                      }`}
                                      title={doc.invoiceStatus === 'SENT' ? "Procesado" : "Forzar Sincronización"}
                                    >
                                       <RefreshCw className={`w-4 h-4 xl:w-5 xl:h-5 ${doc.invoiceStatus !== 'SENT' && 'animate-spin-slow'}`} />
                                    </button>
                                 </td>
                              </tr>
                           ))
                        )}
                     </tbody>
                  </table>
               </div>
            </div>

            {/* Pagination Optimized */}
            <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
               <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                  Analizando <span className="text-foreground">{documents.length}</span> registros operativos
               </p>
               <div className="flex gap-4">
                  <button className="flex items-center gap-3 px-6 py-4 bg-card border border-outline-variant rounded-[20px] text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:bg-surface-low transition-all active:scale-95 shadow-sm">
                     <ChevronLeft className="w-4 h-4" /> Anterior
                  </button>
                  <button className="flex items-center gap-3 px-6 py-4 bg-card border border-outline-variant rounded-[20px] text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:bg-surface-low transition-all active:scale-95 shadow-sm">
                     Siguiente <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}

