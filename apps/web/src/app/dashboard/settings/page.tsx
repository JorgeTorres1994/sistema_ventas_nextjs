'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useSettings } from '@/components/SettingsProvider';
import { 
    updateSettings, 
    togglePaymentMethod, 
    uploadSettingsLogo,
    getDocumentSeries,
    updateDocumentSeries,
    createDocumentSeries
} from '@/lib/api';
import { 
    Building2, Info, CreditCard, Briefcase, Globe,
    Calendar, CheckCircle2, Upload, Save, FileText,
    Hash, Settings as SettingsIcon, Plus, Edit2, Play
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { settings, paymentMethods, refreshSettings, loading: initialLoading } = useSettings();
    const [formData, setFormData] = useState<any>(null);
    const [series, setSeries] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('business');
    const [isSeriesModalOpen, setIsSeriesModalOpen] = useState(false);
    const [selectedSeries, setSelectedSeries] = useState<any>(null);
    const [seriesFormData, setSeriesFormData] = useState({
        documentType: 'FACTURA',
        prefix: '',
        startNumber: 1,
        description: ''
    });

    const fetchSeries = useCallback(async () => {
        try {
            const data = await getDocumentSeries();
            setSeries(data);
        } catch (error) {
            console.error('Error fetching series');
        }
    }, []);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            const roleName = typeof user.role === 'object' ? user.role?.name : user.role;
            if (roleName !== 'Administrador' && roleName !== 'ADMIN') {
                window.location.href = '/dashboard';
                return;
            }
        } else {
            window.location.href = '/login';
            return;
        }

        if (settings) {
            setFormData(settings);
        }
        fetchSeries();
    }, [settings, fetchSeries]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev: any) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettings(formData);
            await refreshSettings();
            toast.success('Configuración actualizada correctamente');
        } catch (error) {
            toast.error('Error al guardar la configuración');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTogglePayment = async (id: string) => {
        try {
            await togglePaymentMethod(id);
            await refreshSettings();
            toast.success('Método de pago actualizado');
        } catch (error) {
            toast.error('Error al actualizar método de pago');
        }
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        try {
            const result = await uploadSettingsLogo(file);
            setFormData((prev: any) => ({ ...prev, logoUrl: result.url }));
            await updateSettings({ logoUrl: result.url });
            await refreshSettings();
            toast.success('Logotipo corporativo actualizado');
        } catch (error) {
            toast.error('Error al subir el logotipo');
        }
    };

    const handleSeriesSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (selectedSeries) {
                await updateDocumentSeries(selectedSeries.id, seriesFormData);
                toast.success('Serie actualizada');
            } else {
                await createDocumentSeries(seriesFormData);
                toast.success('Nueva serie creada');
            }
            setIsSeriesModalOpen(false);
            fetchSeries();
        } catch (error) {
            toast.error('Error al guardar la serie');
        }
    };

    if (initialLoading || !formData) {
        return (
            <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col ml-64 overflow-hidden">
                    <TopBar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans">
            <Sidebar />
            
            <div className="flex-1 flex flex-col ml-64 overflow-hidden">
                <TopBar />
                
                <main className="flex-1 overflow-y-auto bg-[#F9FAFB] p-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="mb-8">
                            <h1 className="text-3xl font-extrabold text-[#111827] mb-2">Configuración del Sistema</h1>
                            <p className="text-[#6B7280]">Gestione la identidad de su negocio, métodos de pago y facturación electrónica.</p>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex gap-1 mb-8 bg-white p-1 rounded-2xl border border-gray-100 shadow-sm w-fit">
                            {[
                                { id: 'business', label: 'Negocio', icon: Building2 },
                                { id: 'billing', label: 'Facturación', icon: FileText },
                                { id: 'payments', label: 'Pagos e Impuestos', icon: CreditCard }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
                                        activeTab === tab.id 
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' 
                                        : 'text-gray-500 hover:bg-gray-50'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'business' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-8">
                                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-24 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden relative group">
                                                {formData.logoUrl ? (
                                                    <img src={`http://localhost:3005${formData.logoUrl}`} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 className="w-8 h-8 text-gray-300" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Upload className="text-white w-6 h-6" />
                                                </div>
                                                <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900 mb-1">Identidad Visual</h3>
                                                <p className="text-xs text-gray-400 mb-4">Recomendado: Cuadrado, min 400x400px.</p>
                                                <div className="flex gap-2">
                                                    <label className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-xs font-bold cursor-pointer hover:bg-blue-100 transition-all">
                                                        Subir Logo
                                                        <input type="file" className="hidden" onChange={handleLogoUpload} />
                                                    </label>
                                                    {formData.logoUrl && (
                                                        <button onClick={() => setFormData({ ...formData, logoUrl: null })} className="px-4 py-2 text-rose-600 text-xs font-bold hover:bg-rose-50 rounded-xl transition-all">
                                                            Remover
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Razón Social / Nombre</label>
                                                <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-700 transition-all shadow-sm" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Teléfono Central</label>
                                                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-700 transition-all shadow-sm" />
                                            </div>
                                            <div className="md:col-span-2 space-y-2">
                                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Dirección Fiscal / Local</label>
                                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-700 transition-all shadow-sm" />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                                <div className="space-y-8">
                                    <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                                        <h2 className="text-lg font-black text-gray-900">Regionalización</h2>
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Moneda Principal</label>
                                                <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-700 transition-all shadow-sm">
                                                    <option value="PEN">Soles (S/)</option>
                                                    <option value="USD">Dólares ($)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest">Zona Horaria</label>
                                                <select name="timezone" className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-blue-500 rounded-2xl outline-none font-bold text-gray-700 transition-all shadow-sm">
                                                    <option value="America/Lima">(GMT-05:00) Lima, Bogotá</option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}

                        {activeTab === 'billing' && (
                            <div className="space-y-8">
                                <section className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                                    <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-black text-gray-900">Series y Correlativos</h2>
                                            <p className="text-sm text-gray-400">Administre la numeración automática para sus comprobantes de pago.</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setSelectedSeries(null);
                                                setSeriesFormData({ documentType: 'FACTURA', prefix: '', startNumber: 1, description: '' });
                                                setIsSeriesModalOpen(true);
                                            }}
                                            className="flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-2xl text-sm font-bold hover:bg-gray-800 transition-all active:scale-95"
                                        >
                                            <Plus className="w-4 h-4" />
                                            Nueva Serie
                                        </button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50/50">
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tipo Documento</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Serie / Prefijo</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">N° Actual</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Estado</th>
                                                    <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {series.map((s) => (
                                                    <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50/30 transition-colors">
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                                                                    <FileText className="w-4 h-4 text-blue-600" />
                                                                </div>
                                                                <span className="font-bold text-gray-900 capitalize">{s.documentType.replace('_', ' ')}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5 font-mono font-black text-blue-600 text-lg">{s.prefix}</td>
                                                        <td className="px-8 py-5">
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-xl font-black text-gray-900">{s.currentNumber.toString().padStart(8, '0')}</span>
                                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Procesados</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-8 py-5">
                                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${s.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>
                                                                {s.isActive ? 'Activo' : 'Pausado'}
                                                            </span>
                                                        </td>
                                                        <td className="px-8 py-5 text-right">
                                                            <button 
                                                                onClick={() => {
                                                                    setSelectedSeries(s);
                                                                    setSeriesFormData({ 
                                                                        documentType: s.documentType, 
                                                                        prefix: s.prefix, 
                                                                        startNumber: s.startNumber, 
                                                                        description: s.description || '' 
                                                                    });
                                                                    setIsSeriesModalOpen(true);
                                                                }}
                                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-lg font-black text-gray-900">Impuestos y Tasas</h2>
                                        <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center">
                                            <Hash className="w-4 h-4 text-orange-600" />
                                        </div>
                                    </div>
                                    <div className="p-6 bg-gray-50 rounded-2xl flex items-center justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">IGV / Impuesto General</p>
                                            <p className="text-[10px] text-gray-400">Aplicado automáticamente al total</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <input type="number" name="taxRate" value={formData.taxRate} onChange={handleInputChange} className="w-20 px-3 py-2 bg-white border border-gray-100 rounded-xl font-black text-right outline-none focus:ring-2 focus:ring-blue-500" />
                                            <span className="font-black text-gray-400">%</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 space-y-6">
                                    <h2 className="text-lg font-black text-gray-900">Pasarelas Activas</h2>
                                    <div className="space-y-3">
                                        {paymentMethods.map((method) => (
                                            <div key={method.id} className="p-4 rounded-2xl flex items-center justify-between hover:bg-gray-50 transition-all border border-transparent hover:border-gray-100">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                                                        {method.name === 'Efectivo' ? <Briefcase className="w-5 h-5 text-gray-400" /> : <CreditCard className="w-5 h-5 text-gray-400" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-gray-900">{method.name}</h4>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">{method.isActive ? 'Habilitado' : 'Desactivado'}</p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleTogglePayment(method.id)}
                                                    className={`w-12 h-6 rounded-full relative transition-all duration-300 ${method.isActive ? 'bg-blue-600 shadow-md shadow-blue-100' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-300 ${method.isActive ? 'left-7' : 'left-1'}`}></div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="fixed bottom-0 left-64 right-0 p-6 bg-white/80 backdrop-blur-xl border-t border-gray-100 flex justify-end gap-4 z-50">
                            <button onClick={refreshSettings} className="px-8 py-3 text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-all">Descartar</button>
                            <button onClick={handleSave} disabled={isSaving} className="px-10 py-3 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 disabled:opacity-50 flex items-center gap-3 transition-all active:scale-95">
                                {isSaving ? <span className="animate-spin text-lg">⌛</span> : <Save className="w-4 h-4" />}
                                Aplicar Cambios Globales
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Series Modal */}
            {isSeriesModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20 animate-in zoom-in-95">
                        <div className="px-10 pt-10 pb-6 border-b border-gray-50">
                            <h3 className="text-2xl font-black">{selectedSeries ? 'Configurar Serie' : 'Nueva Serie'}</h3>
                            <p className="text-sm text-gray-400">Defina el formato de numeración para sus comprobantes.</p>
                        </div>
                        <form onSubmit={handleSeriesSave} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Tipo de Comprobante</label>
                                <select 
                                    className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl outline-none font-bold text-gray-700 shadow-sm focus:bg-white focus:border-blue-500 transition-all appearance-none"
                                    value={seriesFormData.documentType}
                                    onChange={(e) => setSeriesFormData({...seriesFormData, documentType: e.target.value})}
                                >
                                    <option value="FACTURA">Factura Electrónica</option>
                                    <option value="BOLETA">Boleta de Venta</option>
                                    <option value="NOTA_CREDITO">Nota de Crédito</option>
                                    <option value="TICKET">Ticket POS</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Prefijo / Serie</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl outline-none font-black text-blue-600 text-lg shadow-sm focus:bg-white focus:border-blue-500 transition-all placeholder:text-gray-300"
                                        placeholder="ej. F001"
                                        required
                                        value={seriesFormData.prefix}
                                        onChange={(e) => setSeriesFormData({...seriesFormData, prefix: e.target.value.toUpperCase()})}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">N° de Inicio</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-6 py-4 bg-gray-50 border-transparent rounded-2xl outline-none font-black text-gray-700 text-lg shadow-sm focus:bg-white focus:border-blue-500 transition-all"
                                        required
                                        value={seriesFormData.startNumber}
                                        onChange={(e) => setSeriesFormData({...seriesFormData, startNumber: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-6">
                                <button type="button" onClick={() => setIsSeriesModalOpen(false)} className="flex-1 py-4 text-gray-400 font-black text-xs uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-all">Cerrar</button>
                                <button type="submit" className="flex-[2] py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all">Guardar Configuración</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
