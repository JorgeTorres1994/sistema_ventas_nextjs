"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { getQuotations, getQuotationById, convertQuotationToSale } from '@/lib/api';
import {
    FileText, Search, Eye, CheckCircle2, XCircle,
    ShoppingCart, Calendar, ArrowRightLeft, Clock, Plus, Menu, X,
    Hash, User, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// ── Quotation Detail Drawer ────────────────────────────────────────────────────────
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
            case 'CONVERTED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'PENDING':   return 'bg-primary/10 text-primary border-primary/20';
            case 'EXPIRED':   return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default:          return 'bg-surface-low text-on-surface-variant border-outline-variant';
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex justify-end" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300" />
            <div 
                className="relative w-full max-w-2xl bg-card h-full shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-500 ease-out border-l border-outline-variant"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-4 lg:px-10 py-6 lg:py-8 border-b border-outline-variant flex items-center justify-between bg-card sticky top-0 z-10">
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <h2 className="text-2xl font-black text-foreground tracking-tight">Detalle de Cotización</h2>
                            {quotation && (
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(quotation.status)}`}>
                                    {quotation.status === 'CONVERTED' ? 'Convertida' : quotation.status === 'EXPIRED' ? 'Expirada' : 'Pendiente'}
                                </span>
                            )}
                        </div>
                        <p className="text-sm text-on-surface-variant font-medium flex items-center gap-2">
                            <Hash className="w-3.5 h-3.5" /> {quotation?.number || quotationId.toUpperCase()}
                        </p>
                    </div>
                    <button onClick={onClose} className="w-12 h-12 rounded-2xl hover:bg-surface-low flex items-center justify-center transition-all group active:scale-90">
                        <X className="w-6 h-6 text-on-surface-variant group-hover:text-foreground transition-colors" />
                    </button>
                </div>
                
                {loading ? (
                    <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                        <div className="w-10 h-10 border-4 border-primary/10 border-t-primary rounded-full animate-spin" />
                        <p className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em]">Cargando presupuesto...</p>
                    </div>
                ) : quotation ? (
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        {/* Main Info */}
                        <div className="px-4 lg:px-10 py-6 lg:py-8 grid grid-cols-1 md:grid-cols-2 gap-4 lg:p-8 border-b border-outline-variant bg-surface-low">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-card rounded-xl shadow-sm flex items-center justify-center border border-outline-variant text-primary">
                                        <User className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Cliente</p>
                                        <p className="text-sm font-black text-foreground">{quotation.customer?.name || 'Cliente de Mostrador'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-card rounded-xl shadow-sm flex items-center justify-center border border-outline-variant text-amber-500">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Fecha Emisión</p>
                                        <p className="text-sm font-black text-foreground">{format(new Date(quotation.createdAt), 'dd MMM, yyyy', { locale: es })}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-card rounded-xl shadow-sm flex items-center justify-center border border-outline-variant text-primary/80">
                                        <Hash className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Serie/Número</p>
                                        <p className="text-sm font-black text-foreground">{quotation.number}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-card rounded-xl shadow-sm flex items-center justify-center border border-outline-variant text-rose-500">
                                        <Clock className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-0.5">Vencimiento</p>
                                        <p className="text-sm font-black text-foreground">{format(new Date(quotation.expirationDate), 'dd MMM, yyyy', { locale: es })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Items Table */}
                        <div className="px-4 lg:px-10 py-6 lg:py-8">
                            <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-[0.2em] mb-6">Artículos Cotizados</h3>
                            <div className="space-y-4">
                                {quotation.items?.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-5 bg-card rounded-2xl border border-outline-variant shadow-sm hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-surface-low rounded-xl flex items-center justify-center text-on-surface-variant font-black text-xs">
                                                {item.product?.name?.[0] || 'P'}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground">{item.product?.name || 'Producto Desconocido'}</p>
                                                <p className="text-xs text-on-surface-variant font-bold">{item.quantity} unidades × S/ {Number(item.price).toFixed(2)}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-foreground">S/ {(Number(item.price) * item.quantity).toFixed(2)}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="mx-10 my-6 p-4 lg:p-8 bg-primary rounded-[32px] text-on-primary shadow-2xl shadow-primary/20">
                            <div className="space-y-4 border-b border-on-primary/10 pb-6 mb-6">
                                <div className="flex justify-between items-center opacity-70">
                                    <span className="text-xs font-bold uppercase tracking-widest">Subtotal Gravado</span>
                                    <span className="text-sm font-black">S/ {(Number(quotation.total) / 1.18).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between items-center opacity-70">
                                    <span className="text-xs font-bold uppercase tracking-widest">I.G.V (18%)</span>
                                    <span className="text-sm font-black">S/ {(Number(quotation.total) - (Number(quotation.total) / 1.18)).toFixed(2)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div>
                                    <p className="text-[10px] font-black text-on-primary/80 uppercase tracking-[0.2em] mb-1">Total Presupuestado</p>
                                    <h4 className="text-3xl font-black tracking-tighter">S/ {Number(quotation.total).toFixed(2)}</h4>
                                </div>
                            </div>
                        </div>
                        
                        <div className="px-10 py-10">
                            {quotation.status === 'PENDING' ? (
                                <button 
                                    onClick={() => onConvert(quotation.id)}
                                    className="w-full py-4 bg-primary text-on-primary rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95"
                                >
                                    <ShoppingCart className="w-4 h-4" /> Convertir a Venta Real
                                </button>
                            ) : quotation.status === 'CONVERTED' ? (
                                <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                                    <div>
                                        <p className="text-sm font-black text-emerald-500">Esta cotización ya es una venta</p>
                                        <p className="text-xs text-on-surface-variant font-medium">Puedes ver la transacción en el historial de ventas.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-4">
                                    <AlertCircle className="w-6 h-6 text-rose-500" />
                                    <div>
                                        <p className="text-sm font-black text-rose-500">Esta cotización ha expirado</p>
                                        <p className="text-xs text-on-surface-variant font-medium">No se puede convertir a venta por vencimiento de precios.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center text-on-surface-variant font-black uppercase tracking-widest">
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
        switch (status) {
            case 'CONVERTED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
            case 'PENDING':   return 'bg-primary/10 text-primary border-primary/20';
            case 'EXPIRED':   return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
            default:          return 'bg-surface-low text-on-surface-variant border-outline-variant';
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
        { label: 'Total Emitido',  value: `S/ ${totalEmitido.toFixed(2)}`, icon: FileText,    color: 'text-primary',  bg: 'bg-primary/10'  },
        { label: 'Pendientes',     value: quotations.filter(q => q.status === 'PENDING' && new Date(q.expirationDate) >= new Date()).length,   icon: Clock,        color: 'text-amber-500', bg: 'bg-amber-500/10' },
        { label: 'Convertidas',    value: quotations.filter(q => q.status === 'CONVERTED').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Expiradas',      value: quotations.filter(q => q.status === 'EXPIRED' || (q.status === 'PENDING' && new Date(q.expirationDate) < new Date())).length,   icon: XCircle,      color: 'text-rose-500',   bg: 'bg-rose-500/10'   },
    ];

    const filters = [
        { label: 'Todos',       value: 'All' },
        { label: 'Pendientes',  value: 'PENDING' },
        { label: 'Convertidas', value: 'CONVERTED' },
        { label: 'Expiradas',   value: 'EXPIRED' },
    ];

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
                                    <span>Ventas</span><span>/</span>
                                    <span className="text-on-surface-variant">Cotizaciones</span>
                                </nav>
                                <h1 className="text-4xl font-black tracking-tighter mb-2">Gestión de Presupuestos</h1>
                                <p className="text-sm font-medium text-on-surface-variant max-w-xl">Administre cotizaciones activas, monitoree fechas de vencimiento y conviértalas en ventas reales.</p>
                            </div>
                            
                            <Link href="/dashboard/pos">
                                <button className="flex items-center gap-3 px-8 py-4 bg-primary text-on-primary rounded-[22px] text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95">
                                    <Plus className="w-5 h-5" />
                                    Generar Cotización
                                </button>
                            </Link>
                        </div>

                        {/* Stats Grid - Fully Responsive */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-12">
                            {stats.map((stat, i) => (
                                <div key={i} className="bg-card p-6 lg:p-8 rounded-[32px] border border-outline-variant shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-primary/30 transition-all group">
                                    <div className={`${stat.bg} ${stat.color} p-4 rounded-[22px] transition-transform group-hover:scale-110 shadow-lg shadow-black/5`}>
                                        <stat.icon className="w-6 h-6" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest truncate mb-1">{stat.label}</p>
                                        <h3 className="text-xl lg:text-2xl font-black text-foreground leading-none truncate tracking-tight">{stat.value}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Controls Bar */}
                        <div className="bg-card p-6 lg:p-8 rounded-[40px] border border-outline-variant shadow-sm mb-12 flex flex-col lg:flex-row items-stretch lg:items-center gap-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16"></div>
                            
                            <div className="flex-1 relative z-10">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Buscar por número o cliente..."
                                    className="w-full pl-16 pr-6 py-5 bg-surface-low border border-transparent rounded-[24px] focus:bg-card focus:border-primary/50 transition-all outline-none text-sm font-black text-foreground shadow-inner"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                            
                            <div className="flex overflow-x-auto gap-2 bg-surface-low p-2 rounded-[28px] border border-transparent shadow-inner relative z-10 scrollbar-hide shrink-0">
                                {filters.map((item) => (
                                    <button
                                        key={item.value}
                                        onClick={() => setStatusFilter(item.value)}
                                        className={`whitespace-nowrap px-6 py-3 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${
                                            statusFilter === item.value
                                                ? 'bg-primary text-on-primary shadow-xl shadow-primary/20'
                                                : 'text-on-surface-variant/60 hover:text-foreground'
                                        }`}
                                    >
                                        {item.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Content Display */}
                        <div className="space-y-4 lg:space-y-0">
                            {/* Mobile/Tablet View: Cards */}
                            <div className="lg:hidden space-y-6">
                                {isLoading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="bg-card rounded-[32px] p-6 border border-outline-variant animate-pulse h-48"></div>
                                    ))
                                ) : quotations.length === 0 ? (
                                    <div className="bg-card rounded-[32px] p-12 border border-outline-variant text-center">
                                        <FileText className="w-12 h-12 text-on-surface-variant/10 mx-auto mb-4" />
                                        <p className="text-on-surface-variant font-black uppercase tracking-widest text-[10px]">Sin resultados</p>
                                    </div>
                                ) : (
                                    quotations.map((q) => (
                                        <div key={q.id} className="bg-card rounded-[32px] p-6 border border-outline-variant shadow-sm active:scale-[0.98] transition-transform">
                                            <div className="flex justify-between items-start mb-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/5">
                                                        <FileText className="w-6 h-6" />
                                                    </div>
                                                    <div>
                                                        <p className="text-lg font-black text-foreground tracking-tight">{q.number}</p>
                                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">{format(new Date(q.createdAt), 'dd MMM, yyyy', { locale: es })}</p>
                                                    </div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(getStatusLabel(q) === 'Expirada' ? 'EXPIRED' : q.status)}`}>
                                                    {getStatusLabel(q)}
                                                </span>
                                            </div>
                                            
                                            <div className="space-y-4 mb-6 pt-4 border-t border-outline-variant/30">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Cliente</span>
                                                    <span className="text-xs font-black text-foreground">{q.customer?.name || 'Consumidor Final'}</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Monto Total</span>
                                                    <span className="text-sm font-black text-foreground">S/ {Number(q.total).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <button onClick={() => setSelectedQuotationId(q.id)} className="py-4 bg-surface-low text-on-surface-variant rounded-2xl font-black text-[10px] uppercase tracking-widest border border-outline-variant">Ver Detalle</button>
                                                {q.status === 'PENDING' && getStatusLabel(q) !== 'Expirada' && (
                                                    <button onClick={() => handleConvert(q.id)} className="py-4 bg-primary text-on-primary rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20">Convertir</button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Desktop View: Premium Table */}
                            <div className="hidden lg:block bg-card rounded-[48px] border border-outline-variant shadow-sm overflow-x-auto scrollbar-thin scrollbar-thumb-primary/10 scrollbar-track-transparent">
                                <table className="w-full text-left border-collapse min-w-[1100px]">
                                    <thead>
                                        <tr className="bg-surface-low/30 border-b border-outline-variant/30">
                                            <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Identificador</th>
                                            <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Cliente / Razón Social</th>
                                            <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Emisión y Vence</th>
                                            <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Inversión Total</th>
                                            <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Estado Operativo</th>
                                            <th className="px-10 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-widest text-center">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/30">
                                        {isLoading ? (
                                            Array(6).fill(0).map((_, i) => (
                                                <tr key={i} className="animate-pulse">
                                                    <td colSpan={6} className="px-10 py-8 h-24 bg-surface-low/10"></td>
                                                </tr>
                                            ))
                                        ) : quotations.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-10 py-32 text-center">
                                                    <FileText className="w-16 h-16 text-on-surface-variant/10 mx-auto mb-6" />
                                                    <p className="text-on-surface-variant font-black uppercase tracking-widest text-[11px] opacity-40">Sin cotizaciones registradas</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            quotations.map((q) => (
                                                <tr key={q.id} className="hover:bg-primary/[0.02] transition-colors group">
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center gap-6">
                                                            <div className="w-14 h-14 rounded-[22px] bg-primary/10 flex items-center justify-center text-primary transition-transform group-hover:scale-110 shadow-xl shadow-primary/5">
                                                                <Hash className="w-6 h-6" />
                                                            </div>
                                                            <p className="text-lg font-black text-foreground tracking-tighter leading-tight">{q.number}</p>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <p className="text-sm font-black text-foreground tracking-tight">{q.customer?.name || 'Consumidor Final'}</p>
                                                        <p className="text-[10px] text-on-surface-variant/60 font-bold uppercase tracking-widest mt-1">{q.customer?.dni || '88888888'}</p>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex flex-col gap-1">
                                                            <span className="text-[11px] font-black text-foreground">{format(new Date(q.createdAt), 'dd MMM, yyyy', { locale: es })}</span>
                                                            <span className="text-[9px] text-rose-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                                <Clock className="w-3 h-3" /> Vence {format(new Date(q.expirationDate), 'dd/MM/yyyy')}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <p className="text-lg font-black text-foreground tracking-tighter">S/ {Number(q.total).toFixed(2)}</p>
                                                        <p className="text-[9px] text-on-surface-variant/40 font-bold uppercase tracking-widest">Incl. I.G.V</p>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border flex items-center gap-2 w-fit ${getStatusStyle(getStatusLabel(q) === 'Expirada' ? 'EXPIRED' : q.status)}`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full ${q.status === 'CONVERTED' ? 'bg-emerald-500' : q.status === 'PENDING' ? 'bg-primary' : 'bg-rose-500'}`}></div>
                                                            {getStatusLabel(q)}
                                                        </span>
                                                    </td>
                                                    <td className="px-10 py-8">
                                                        <div className="flex items-center justify-center gap-3">
                                                            <button onClick={() => setSelectedQuotationId(q.id)} className="w-12 h-12 bg-surface-low text-on-surface-variant hover:text-primary hover:bg-primary/10 border border-outline-variant/50 rounded-[18px] flex items-center justify-center transition-all hover:scale-110 shadow-sm" title="Inspeccionar Detalle">
                                                                <Eye className="w-5 h-5" />
                                                            </button>
                                                            {q.status === 'PENDING' && getStatusLabel(q) !== 'Expirada' && (
                                                                <button onClick={() => handleConvert(q.id)} className="h-12 px-6 bg-primary text-on-primary rounded-[18px] text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
                                                                    <ShoppingCart className="w-4 h-4" /> Convertir
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Pagination Bar */}
                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 px-4">
                            <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">
                                Monitoreando <span className="text-foreground">{quotations.length}</span> cotizaciones operativas
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
            <QuotationDetailDrawer 
                quotationId={selectedQuotationId} 
                onClose={() => setSelectedQuotationId(null)} 
                onConvert={(id: string) => handleConvert(id)} 
            />
        </div>
    );
}

