"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getQuotations, getQuotationById, convertQuotationToSale } from '@/lib/api';
import {
    FileText, Search, Eye, CheckCircle2, XCircle,
    ShoppingCart, Calendar, ArrowRightLeft, Clock, Plus, Menu, X,
    Hash, User, AlertCircle
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ── Quotation Detail Drawer ────────────────────────────────────────────────────────
const QuotationDetailDrawer = ({ quotationId, onClose, onConvert }: any) => {
    const [quotation, setQuotation] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (quotationId) {
            setLoading(true);
            getQuotationById(quotationId)
                .then(setQuotation)
                .catch(() => toast.error('Error al cargar detalle de cotización'))
                .finally(() => setLoading(false));
        } else {
            setQuotation(null);
        }
    }, [quotationId]);

    if (!quotationId) return null;

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'CONVERTED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'PENDING':   return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'EXPIRED':   return 'bg-rose-50 text-rose-600 border-rose-100';
            default:          return 'bg-gray-50 text-gray-400 border-gray-100';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end" onClick={onClose}>
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" />
            <div 
                className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 ease-out"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-10 py-8 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Detalle de Cotización</h2>
                            {quotation && (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(quotation.status)}`}>
                                    {quotation.status === 'CONVERTED' ? 'Convertida' : quotation.status === 'EXPIRED' ? 'Expirada' : 'Pendiente'}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-gray-400 font-medium flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5" /> {quotation?.number || quotationId.toUpperCase()}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl hover:bg-gray-50 flex items-center justify-center transition-all group">
                        <X className="w-6 h-6 text-gray-300 group-hover:text-gray-900 transition-colors" />
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">Cargando presupuesto...</p>
                    </div>
                ) : quotation ? (
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {/* Main Info */}
                        <div className="px-10 py-8 grid grid-cols-2 gap-8 border-b border-gray-50 bg-gray-50/30">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100 text-blue-600">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Cliente</p>
                                        <p className="text-sm font-black text-gray-900">{quotation.customer?.name || 'Cliente de Mostrador'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100 text-amber-600">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Fecha Emisión</p>
                                        <p className="text-sm font-black text-gray-900">{format(new Date(quotation.createdAt), 'dd MMM, yyyy', { locale: es })}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100 text-indigo-600">
                                        <Hash className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Serie/Número</p>
                                        <p className="text-sm font-black text-gray-900">{quotation.number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center border border-gray-100 text-rose-600">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5">Vencimiento</p>
                                        <p className="text-sm font-black text-gray-900">{format(new Date(quotation.expirationDate), 'dd MMM, yyyy', { locale: es })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="px-10 py-8">
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6">Artículos Cotizados</h3>
                            <div className="space-y-4">
                                {quotation.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-blue-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 font-black text-xs">
                                                {item.product?.name?.[0] || 'P'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-900">{item.product?.name || 'Producto Desconocido'}</p>
                                                <p className="text-xs text-gray-400 font-bold">{item.quantity} unidades × S/ {Number(item.price).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-gray-900">S/ {(Number(item.price) * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="mx-10 my-6 p-8 bg-blue-600 rounded-[32px] text-white shadow-2xl shadow-blue-100">
                            <div className="space-y-4 border-b border-white/10 pb-6 mb-6">
                                <div className="flex justify-between items-center opacity-60">
                                    <span className="text-xs font-bold uppercase tracking-widest">Subtotal Gravado</span>
                                    <span className="text-sm font-black">S/ {(Number(quotation.total) / 1.18).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center opacity-60">
                                    <span className="text-xs font-bold uppercase tracking-widest">I.G.V (18%)</span>
                                    <span className="text-sm font-black">S/ {(Number(quotation.total) - (Number(quotation.total) / 1.18)).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-blue-100 opacity-80 uppercase tracking-[0.2em] mb-1">Total Presupuestado</p>
                                    <h4 className="text-3xl font-black tracking-tighter">S/ {Number(quotation.total).toFixed(2)}</h4>
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-10 py-10">
                            {quotation.status === 'PENDING' ? (
                                <button 
                                    onClick={() => onConvert(quotation.id)}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-100"
                                >
                                    <ShoppingCart className="w-4 h-4" /> Convertir a Venta Real
                                </button>
                            ) : quotation.status === 'CONVERTED' ? (
                                <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                    <div>
                                        <p className="text-sm font-black text-emerald-900">Esta cotización ya es una venta</p>
                                        <p className="text-xs text-emerald-600 font-medium">Puedes ver la transacción en el historial de ventas.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-4">
                                    <AlertCircle className="w-6 h-6 text-rose-600" />
                                    <div>
                                        <p className="text-sm font-black text-rose-900">Esta cotización ha expirado</p>
                                        <p className="text-xs text-rose-600 font-medium">No se puede convertir a venta por vencimiento de precios.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-400 font-black uppercase tracking-widest">
                        No se pudo recuperar la información
                    </div>
                )}
            </div>
        </div>
    );
};

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [selectedQuotationId, setSelectedQuotationId] = useState<string | null>(null);

    useEffect(() => { fetchQuotations(); }, [search, statusFilter]);

    const fetchQuotations = async () => {
        setIsLoading(true);
        try {
            const data = await getQuotations({
                search,
                status: statusFilter === 'All' ? undefined : statusFilter
            });
            setQuotations(data);
        } catch {
            toast.error('Error al cargar cotizaciones');
        } finally {
            setIsLoading(false);
        }
    };

    const handleConvert = async (id: string) => {
        toast('¿Deseas convertir esta cotización en una venta real?', {
            description: 'Esta acción creará una venta y afectará el inventario.',
            action: {
                label: 'Confirmar Conversión',
                onClick: async () => {
                    const tid = toast.loading('Procesando conversión...');
                    try {
                        await convertQuotationToSale(id);
                        toast.success('¡Cotización convertida en venta exitosamente!', { id: tid });
                        fetchQuotations();
                        setSelectedQuotationId(null);
                    } catch (error: any) {
                        const message = error.response?.data?.message || 'Error al convertir cotización';
                        if (message.includes('ACTIVA_CAJA')) {
                            toast.error('CAJA CERRADA: Debes abrir tu caja antes de realizar ventas.', { id: tid });
                        } else {
                            toast.error(message, { id: tid });
                        }
                    }
                }
            },
            duration: 5000,
        });
    };

    const getStatusStyle = (status: string) => {
        const isExpired = (q: any) => q.status === 'PENDING' && new Date(q.expirationDate) < new Date();
        
        switch (status) {
            case 'CONVERTED': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING':   return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'EXPIRED':   return 'bg-red-100 text-red-700 border-red-200';
            default:          return 'bg-gray-100 text-gray-400 border-gray-100';
        }
    };

    const getStatusLabel = (q: any) => {
        if (q.status === 'PENDING' && new Date(q.expirationDate) < new Date()) return 'Expirada';
        switch (q.status) {
            case 'CONVERTED': return 'Convertida';
            case 'PENDING':   return 'Pendiente';
            case 'EXPIRED':   return 'Expirada';
            default:          return q.status;
        }
    };

    const totalEmitido = quotations.reduce((acc, q) => acc + Number(q.total), 0);
    const stats = [
        { label: 'Total Emitido',  value: `S/ ${totalEmitido.toFixed(2)}`, icon: FileText,    color: 'text-blue-600',  bg: 'bg-blue-50'  },
        { label: 'Pendientes',     value: quotations.filter(q => q.status === 'PENDING' && new Date(q.expirationDate) >= new Date()).length,   icon: Clock,        color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Convertidas',    value: quotations.filter(q => q.status === 'CONVERTED').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Expiradas',      value: quotations.filter(q => q.status === 'EXPIRED' || (q.status === 'PENDING' && new Date(q.expirationDate) < new Date())).length,   icon: XCircle,      color: 'text-red-600',   bg: 'bg-red-50'   },
    ];

    const filters = [
        { label: 'Todos',       value: 'All' },
        { label: 'Pendientes',  value: 'PENDING' },
        { label: 'Convertidas', value: 'CONVERTED' },
        { label: 'Expiradas',   value: 'EXPIRED' },
    ];

    return (
        <div className="flex h-screen bg-[#F8F9FC] overflow-hidden font-sans">
            {/* Mobile sidebar overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <Sidebar />
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:ml-64 w-full overflow-hidden">
                <TopBar />

                {/* Module Header */}
                <div className="px-4 sm:px-6 lg:px-10 py-5 lg:py-8 flex items-center justify-between shrink-0 gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 rounded-xl bg-white border border-gray-200 text-gray-500 hover:bg-gray-50 shrink-0"
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <div className="min-w-0">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight leading-none mb-1 flex items-center gap-2 lg:gap-3">
                                <FileText className="w-6 h-6 sm:w-8 sm:h-8 lg:w-9 lg:h-9 text-blue-600 shrink-0" />
                                <span className="truncate">Cotizaciones</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-gray-400 font-medium hidden sm:block">
                                Gestiona presupuestos y conviértelos en ventas • Nexus Genesis
                            </p>
                        </div>
                    </div>
                    <Link href="/dashboard/pos" className="shrink-0">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 lg:px-8 py-3 lg:py-4 rounded-2xl font-black text-xs sm:text-sm transition-all shadow-xl shadow-blue-100 flex items-center gap-2 lg:gap-3">
                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="hidden sm:inline">Nueva Cotización</span>
                            <span className="sm:hidden">Nueva</span>
                        </button>
                    </Link>
                </div>

                <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-10 pb-8 space-y-5 lg:space-y-8 scroll-smooth">

                    {/* Controls Bar */}
                    <div className="bg-white p-4 sm:p-6 rounded-2xl lg:rounded-[24px] shadow-sm border border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por número o cliente..."
                                className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none text-sm font-bold text-gray-700"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <div className="flex overflow-x-auto gap-1 bg-gray-50 p-1.5 rounded-xl border border-gray-100 sm:rounded-2xl scrollbar-hide shrink-0">
                            {filters.map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setStatusFilter(item.value)}
                                    className={`whitespace-nowrap px-4 py-2 rounded-lg sm:rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                        statusFilter === item.value
                                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                            : 'text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
                        {stats.map((stat, i) => (
                            <div key={i} className="bg-white p-4 sm:p-6 lg:p-8 rounded-2xl lg:rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-3 lg:gap-5 hover:border-blue-100 transition-all">
                                <div className={`${stat.bg} ${stat.color} p-2 sm:p-3 rounded-lg sm:rounded-xl shrink-0`}>
                                    <stat.icon className="w-4 h-4 sm:w-6 sm:h-6" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest truncate">{stat.label}</p>
                                    <h3 className="text-lg sm:text-2xl font-black text-gray-900 leading-none truncate">{stat.value}</h3>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl lg:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50/50 border-b border-gray-100">
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Nº Cotización</th>
                                        <th className="px-8  py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cliente</th>
                                        <th className="px-8  py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Fecha Emisión</th>
                                        <th className="px-8  py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Vencimiento</th>
                                        <th className="px-8  py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Total</th>
                                        <th className="px-8  py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estado</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-center">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50">
                                    {isLoading ? (
                                        <tr><td colSpan={7} className="py-24 text-center text-gray-300 font-black animate-pulse text-xs uppercase tracking-widest">Cargando cotizaciones...</td></tr>
                                    ) : quotations.length === 0 ? (
                                        <tr><td colSpan={7} className="py-24 text-center"><p className="font-black uppercase tracking-widest text-xs text-gray-400">No se encontraron cotizaciones</p></td></tr>
                                    ) : quotations.map((q) => (
                                        <tr key={q.id} className="hover:bg-blue-50/20 transition-all">
                                            <td className="px-10 py-6 font-black text-blue-600 text-sm">{q.number}</td>
                                            <td className="px-8 py-6 text-sm font-black text-gray-900">{q.customer?.name || 'Consumidor Final'}</td>
                                            <td className="px-8 py-6 text-sm text-gray-500">{format(new Date(q.createdAt), 'dd MMM, yyyy', { locale: es })}</td>
                                            <td className="px-8 py-6 text-sm text-gray-500">{format(new Date(q.expirationDate), 'dd MMM, yyyy', { locale: es })}</td>
                                            <td className="px-8 py-6 font-black text-gray-900">S/ {Number(q.total).toFixed(2)}</td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(getStatusLabel(q) === 'Expirada' ? 'EXPIRED' : q.status)}`}>
                                                    {getStatusLabel(q)}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button onClick={() => setSelectedQuotationId(q.id)} className="p-3 bg-gray-100 hover:bg-blue-600 rounded-xl text-gray-400 hover:text-white transition-all"><Eye className="w-4 h-4" /></button>
                                                    {q.status === 'PENDING' && getStatusLabel(q) !== 'Expirada' && (
                                                        <button onClick={() => handleConvert(q.id)} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all">Convertir</button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </main>
            </div>
            <QuotationDetailDrawer 
                quotationId={selectedQuotationId} 
                onClose={() => setSelectedQuotationId(null)} 
                onConvert={(id: string) => handleConvert(id)} 
            />
        </div>
    );
}
