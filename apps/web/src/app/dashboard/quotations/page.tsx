"use client";

import React, { useState, useEffect } from 'react';
import { getQuotations, convertQuotationToSale } from '@/lib/api';
import {
    FileText, Search, Eye, CheckCircle2, XCircle,
    ShoppingCart, Calendar, ArrowRightLeft, Clock, Plus, Menu, X
} from 'lucide-react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import Link from 'next/link';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function QuotationsPage() {
    const [quotations, setQuotations] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [sidebarOpen, setSidebarOpen] = useState(false);

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
        if (!confirm('¿Deseas convertir esta cotización en una venta real?')) return;
        try {
            await convertQuotationToSale(id);
            toast.success('¡Cotización convertida en venta exitosamente!');
            fetchQuotations();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al convertir cotización');
        }
    };

    const getStatusStyle = (status: string) => {
        switch (status) {
            case 'CONVERTED': return 'bg-green-100 text-green-700 border-green-200';
            case 'PENDING':   return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'EXPIRED':   return 'bg-red-100 text-red-700 border-red-200';
            case 'REJECTED':  return 'bg-gray-100 text-gray-700 border-gray-200';
            default:          return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'CONVERTED': return 'Convertida';
            case 'PENDING':   return 'Pendiente';
            case 'EXPIRED':   return 'Expirada';
            case 'REJECTED':  return 'Rechazada';
            default:          return status;
        }
    };

    const totalEmitido = quotations.reduce((acc, q) => acc + Number(q.total), 0);
    const stats = [
        { label: 'Total Emitido',  value: `S/ ${totalEmitido.toFixed(2)}`, icon: FileText,    color: 'text-blue-600',  bg: 'bg-blue-50'  },
        { label: 'Pendientes',     value: quotations.filter(q => q.status === 'PENDING').length,   icon: Clock,        color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Convertidas',    value: quotations.filter(q => q.status === 'CONVERTED').length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Expiradas',      value: quotations.filter(q => q.status === 'EXPIRED').length,   icon: XCircle,      color: 'text-red-600',   bg: 'bg-red-50'   },
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
                        {/* Mobile hamburger */}
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
                        {/* Filter pills — scrollable on mobile */}
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

                    {/* Stats Cards — 2 cols on mobile, 4 on desktop */}
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

                    {/* Desktop Table / Mobile Cards */}
                    <div className="bg-white rounded-2xl lg:rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">

                        {/* ── Desktop Table (hidden on mobile) ── */}
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
                                        <tr>
                                            <td colSpan={7} className="py-24 text-center text-gray-300 font-black uppercase tracking-widest animate-pulse text-xs">
                                                Cargando cotizaciones...
                                            </td>
                                        </tr>
                                    ) : quotations.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="py-24 text-center">
                                                <FileText className="w-12 h-12 mb-4 opacity-10 mx-auto text-gray-400" />
                                                <p className="font-black uppercase tracking-widest text-xs text-gray-400">No se encontraron cotizaciones</p>
                                            </td>
                                        </tr>
                                    ) : quotations.map((q) => (
                                        <tr key={q.id} className="hover:bg-blue-50/20 transition-all">
                                            <td className="px-10 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs border border-blue-100">
                                                        {q.number.split('-')[0]}
                                                    </div>
                                                    <span className="font-black text-blue-600 text-sm">{q.number}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500 font-black text-[10px] border border-gray-200">
                                                        {q.customer?.name?.[0] || 'C'}
                                                    </div>
                                                    <span className="text-sm font-black text-gray-900">{q.customer?.name || 'Consumidor Final'}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6 text-sm text-gray-500 font-medium">
                                                {format(new Date(q.createdAt), 'dd MMM, yyyy', { locale: es })}
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                                                    <Calendar className="w-3 h-3" />
                                                    {format(new Date(q.expirationDate), 'dd MMM, yyyy', { locale: es })}
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className="font-black text-gray-900">S/ {Number(q.total).toFixed(2)}</span>
                                            </td>
                                            <td className="px-8 py-6">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusStyle(q.status)}`}>
                                                    {getStatusLabel(q.status)}
                                                </span>
                                            </td>
                                            <td className="px-10 py-6">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="p-3 bg-gray-100 hover:bg-blue-600 rounded-xl text-gray-400 hover:text-white transition-all" title="Ver Detalles">
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                    {q.status === 'PENDING' && (
                                                        <button
                                                            onClick={() => handleConvert(q.id)}
                                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-700 shadow-md shadow-blue-100 transition-all active:scale-95"
                                                        >
                                                            <ArrowRightLeft className="w-3.5 h-3.5" />
                                                            Convertir
                                                        </button>
                                                    )}
                                                    {q.status === 'CONVERTED' && (
                                                        <div className="text-green-600 flex items-center gap-1 font-black text-[10px] uppercase tracking-widest bg-green-50 px-3 py-2 rounded-xl border border-green-100">
                                                            <ShoppingCart className="w-3.5 h-3.5" />
                                                            Vendido
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* ── Mobile Cards (hidden on desktop) ── */}
                        <div className="lg:hidden divide-y divide-gray-50">
                            {isLoading ? (
                                <div className="py-20 text-center text-gray-300 font-black uppercase tracking-widest animate-pulse text-xs">
                                    Cargando cotizaciones...
                                </div>
                            ) : quotations.length === 0 ? (
                                <div className="py-20 text-center px-6">
                                    <FileText className="w-10 h-10 mb-3 opacity-10 mx-auto text-gray-400" />
                                    <p className="font-black uppercase tracking-widest text-xs text-gray-400">Sin cotizaciones</p>
                                </div>
                            ) : quotations.map((q) => (
                                <div key={q.id} className="p-4 sm:p-5 hover:bg-gray-50/50 transition-all">
                                    <div className="flex items-start justify-between gap-3 mb-3">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center font-black text-xs border border-blue-100 shrink-0">
                                                {q.number.split('-')[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-black text-blue-600 text-sm truncate">{q.number}</p>
                                                <p className="text-xs text-gray-500 font-medium">{q.customer?.name || 'Consumidor Final'}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border shrink-0 ${getStatusStyle(q.status)}`}>
                                            {getStatusLabel(q.status)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-500">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3 h-3 shrink-0" />
                                            <span className="truncate">{format(new Date(q.createdAt), 'dd MMM yyyy', { locale: es })}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="w-3 h-3 shrink-0" />
                                            <span className="truncate">Vence: {format(new Date(q.expirationDate), 'dd MMM yyyy', { locale: es })}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="font-black text-gray-900 text-base">S/ {Number(q.total).toFixed(2)}</span>
                                        <div className="flex items-center gap-2">
                                            <button className="p-2 bg-gray-100 hover:bg-blue-600 rounded-lg text-gray-400 hover:text-white transition-all">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {q.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleConvert(q.id)}
                                                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95"
                                                >
                                                    <ArrowRightLeft className="w-3 h-3" />
                                                    Convertir
                                                </button>
                                            )}
                                            {q.status === 'CONVERTED' && (
                                                <div className="text-green-600 flex items-center gap-1 font-black text-[9px] uppercase tracking-widest bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-100">
                                                    <ShoppingCart className="w-3 h-3" />
                                                    Vendido
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
