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
    <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans text-[#111827]">
      <Sidebar />
      
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden transition-all duration-300">
        <TopBar />
        
        <main className="flex-1 overflow-y-auto bg-[#F9FAFB] px-4 lg:px-8 py-6 lg:py-8">
          <div className="max-w-7xl mx-auto">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight mb-2">Comprobantes Electrónicos</h1>
                <p className="text-xs lg:text-sm text-[#6B7280]">Panel de control y monitoreo de facturación.</p>
              </div>
              
              <div className="flex items-center gap-3">
                 <div className="bg-white px-4 py-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-3">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                    <span className="text-[10px] lg:text-xs font-black text-gray-900 uppercase tracking-widest">OSE: Activo</span>
                 </div>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm mb-8 space-y-6">
               <div className="flex flex-col lg:flex-row items-center gap-4">
                  <div className="w-full lg:flex-1 relative">
                     <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                     <input 
                       type="text"
                       placeholder="Buscar por serie, número o cliente..."
                       value={search}
                       onChange={(e) => setSearch(e.target.value)}
                       className="w-full pl-11 pr-4 py-3 bg-gray-50 border-transparent rounded-2xl text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none font-bold"
                     />
                  </div>

                  <div className="flex items-center gap-3 w-full lg:w-auto">
                     <select 
                        value={invoiceStatus}
                        onChange={(e) => setInvoiceStatus(e.target.value)}
                        className="flex-1 lg:flex-none px-4 py-3 bg-gray-50 border-transparent rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                     >
                        <option value="All">Estados</option>
                        <option value="SENT">Aceptados</option>
                        <option value="PENDING">Pendientes</option>
                        <option value="ERROR">Errores</option>
                     </select>

                     <select 
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="flex-1 lg:flex-none px-4 py-3 bg-gray-50 border-transparent rounded-2xl text-[10px] lg:text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                     >
                        <option value="All">Tipos</option>
                        <option value="FACTURA">Factura</option>
                        <option value="BOLETA">Boleta</option>
                     </select>
                  </div>
               </div>

               <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                     <div className="relative flex-1 sm:flex-none">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                           type="date"
                           value={startDate}
                           onChange={(e) => setStartDate(e.target.value)}
                           className="w-full pl-11 pr-4 py-2 bg-gray-50 border-transparent rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                        />
                     </div>
                     <span className="text-gray-300 font-bold text-xs uppercase">al</span>
                     <div className="relative flex-1 sm:flex-none">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                           type="date"
                           value={endDate}
                           onChange={(e) => setEndDate(e.target.value)}
                           className="w-full pl-11 pr-4 py-2 bg-gray-50 border-transparent rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-blue-100 transition-all"
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
                     className="sm:ml-auto w-full sm:w-auto px-4 py-2 text-[10px] font-black text-gray-400 hover:text-rose-500 uppercase tracking-widest transition-colors"
                  >
                     Limpiar Filtros
                  </button>
               </div>
            </div>

            {/* Invoicing Table */}
            <div className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden">
               <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                     <tr className="bg-gray-50/50 border-b border-gray-50">
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Documento</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Cliente</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estado SUNAT</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Documentos</th>
                        <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Acción</th>
                     </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                     {loading ? (
                        Array(6).fill(0).map((_, i) => (
                           <tr key={i} className="animate-pulse">
                              <td colSpan={5} className="px-8 py-6 h-20 bg-gray-50/30"></td>
                           </tr>
                        ))
                     ) : documents.length === 0 ? (
                        <tr>
                           <td colSpan={5} className="px-8 py-20 text-center">
                              <FileText className="w-12 h-12 text-gray-100 mx-auto mb-4" />
                              <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No hay comprobantes registrados</p>
                           </td>
                        </tr>
                     ) : (
                        documents.map((doc) => (
                           <tr key={doc.id} className="hover:bg-gray-50/50 transition-colors group">
                              <td className="px-8 py-6">
                                 <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl text-white ${doc.documentType === 'FACTURA' ? 'bg-indigo-600' : 'bg-blue-600'}`}>
                                       <FileText className="w-4 h-4" />
                                    </div>
                                    <div>
                                       <p className="text-sm font-black text-gray-900">
                                          {doc.series || 'S/S'}-{doc.correlative ? doc.correlative.toString().padStart(8, '0') : '00000000'}
                                       </p>
                                       <div className="flex items-center gap-2 mt-1">
                                          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{doc.documentType}</span>
                                          <span className="text-[10px] text-gray-300 font-bold flex items-center gap-1">
                                             <Calendar className="w-2.5 h-2.5" /> {new Date(doc.createdAt).toLocaleDateString()}
                                          </span>
                                       </div>
                                    </div>
                                 </div>
                              </td>
                              <td className="px-8 py-6">
                                 <p className="text-sm font-bold text-gray-900">{doc.customer?.name || 'Consumidor Final'}</p>
                                 <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{doc.customer?.dni || '00000000'}</p>
                              </td>
                              <td className="px-8 py-6">
                                  <div className="flex flex-col gap-1">
                                     {doc.invoiceStatus === 'SENT' ? (
                                        <span className="flex w-fit items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                           <CheckCircle2 className="w-3 h-3" /> Aceptado
                                        </span>
                                     ) : doc.invoiceStatus === 'ERROR' ? (
                                        <>
                                           <span className="flex w-fit items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                              <AlertCircle className="w-3 h-3" /> Error
                                           </span>
                                           {doc.sunatResponse && (
                                              <p className="text-[9px] font-bold text-rose-400 mt-1 max-w-[200px] leading-tight italic">
                                                 {doc.sunatResponse.length > 60 ? doc.sunatResponse.substring(0, 60) + '...' : doc.sunatResponse}
                                              </p>
                                           )}
                                        </>
                                     ) : (
                                        <>
                                           <span className="flex w-fit items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 border border-amber-100 rounded-lg text-[10px] font-black uppercase tracking-widest">
                                              <Clock className="w-3 h-3" /> Pendiente
                                           </span>
                                           <p className="text-[9px] font-bold text-amber-400 mt-1 uppercase tracking-tighter">Sin sincronizar</p>
                                        </>
                                     )}
                                  </div>
                              </td>
                              <td className="px-8 py-6">
                                 <div className="flex items-center justify-center gap-2">
                                    {doc.pdfUrl && (
                                       <a href={doc.pdfUrl} target="_blank" rel="noreferrer" className="p-2 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Ver Comprobante">
                                          <ExternalLink className="w-4 h-4" />
                                       </a>
                                    )}
                                 </div>
                              </td>
                              <td className="px-8 py-6 text-right">
                                 <button 
                                   onClick={() => doc.invoiceStatus !== 'SENT' && handleRetry(doc.id)}
                                   disabled={doc.invoiceStatus === 'SENT'}
                                   className={`p-3 rounded-xl transition-all ${
                                      doc.invoiceStatus === 'SENT' 
                                        ? 'bg-gray-50 text-gray-200 cursor-not-allowed' 
                                        : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white shadow-lg shadow-blue-100 animate-pulse'
                                   }`}
                                   title={doc.invoiceStatus === 'SENT' ? "Documento ya sincronizado" : "Re-sincronizar con SUNAT"}
                                 >
                                    <RefreshCw className="w-4 h-4" />
                                 </button>
                              </td>
                           </tr>
                        ))
                     )}
                  </tbody>
               </table>
               </div>
            </div>

            {/* Pagination Mock */}
            <div className="mt-8 flex items-center justify-between">
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Mostrando {documents.length} comprobantes</p>
               <div className="flex gap-2">
                  <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:bg-gray-50 transition-all"><ChevronLeft className="w-4 h-4" /></button>
                  <button className="p-3 bg-white border border-gray-100 rounded-xl text-gray-400 hover:bg-gray-50 transition-all"><ChevronRight className="w-4 h-4" /></button>
               </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}
