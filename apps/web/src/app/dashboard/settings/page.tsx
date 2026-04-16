'use client';

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { useSettings } from '@/components/SettingsProvider';
import { 
    updateSettings, 
    togglePaymentMethod, 
    uploadSettingsLogo 
} from '@/lib/api';
import { 
    Building2, 
    Info, 
    CreditCard, 
    Briefcase,
    Globe,
    Calendar,
    CheckCircle2,
    XCircle,
    Upload,
    Save
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { settings, paymentMethods, refreshSettings, loading: initialLoading } = useSettings();
    const [formData, setFormData] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('business');

    useEffect(() => {
        if (settings) {
            setFormData(settings);
        }
    }, [settings]);

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
                        {/* Header & Success Alert */}
                        <div className="mb-8">
                            <h1 className="text-2xl font-bold text-[#111827] mb-2">Configuración del Sistema</h1>
                            <div className="bg-[#EEF2FF] border border-[#E0E7FF] rounded-lg p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <CheckCircle2 className="text-blue-600 w-5 h-5" />
                                    <p className="text-blue-700 text-sm font-medium">Auto-guardado: Todos los cambios se sincronizan en la nube.</p>
                                </div>
                                <button className="text-blue-400 hover:text-blue-600 transition-colors">
                                    <span className="material-symbols-outlined text-md">close</span>
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                            {/* Left Column: Forms */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Business Info */}
                                <section className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                                    <div className="p-6 border-b border-[#E5E7EB]">
                                        <h2 className="text-lg font-bold text-[#111827]">Información del Negocio</h2>
                                        <p className="text-sm text-[#6B7280]">Actualiza tu perfil público y detalles de contacto.</p>
                                    </div>
                                    <div className="p-8 space-y-8">
                                        {/* Logo Section */}
                                        <div className="flex items-center gap-6">
                                            <div className="w-24 h-24 rounded-xl bg-gray-100 border border-[#E5E7EB] flex items-center justify-center overflow-hidden relative group">
                                                {formData.logoUrl ? (
                                                    <img src={`http://localhost:3005${formData.logoUrl}`} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Building2 className="w-8 h-8 text-gray-400" />
                                                )}
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <Upload className="text-white w-6 h-6" />
                                                </div>
                                                <input 
                                                    type="file" 
                                                    onChange={handleLogoUpload}
                                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                                    accept="image/*"
                                                />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-[#111827] mb-1">Logo de la Empresa</h3>
                                                <p className="text-xs text-[#6B7280] mb-3">PNG, JPG o SVG. Máx 2MB.</p>
                                                <div className="flex gap-2">
                                                    <label className="px-4 py-2 bg-[#F3F4F6] text-[#374151] rounded-lg text-xs font-semibold cursor-pointer hover:bg-gray-200 transition-colors">
                                                        Reemplazar
                                                        <input type="file" className="hidden" onChange={handleLogoUpload} />
                                                    </label>
                                                    <button 
                                                        onClick={() => setFormData({ ...formData, logoUrl: null })}
                                                        className="px-4 py-2 text-rose-600 text-xs font-semibold hover:bg-rose-50 rounded-lg transition-colors"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Form Fields */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2">Nombre del Negocio</label>
                                                <input 
                                                    type="text"
                                                    name="businessName"
                                                    value={formData.businessName}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827] focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2">Teléfono de contacto</label>
                                                <input 
                                                    type="text"
                                                    name="phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827] focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                />
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2">Dirección del Establecimiento</label>
                                                <input 
                                                    type="text"
                                                    name="address"
                                                    value={formData.address}
                                                    onChange={handleInputChange}
                                                    className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827] focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                {/* Preferences */}
                                <section className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                                    <div className="p-6 border-b border-[#E5E7EB]">
                                        <h2 className="text-lg font-bold text-[#111827]">Preferencias</h2>
                                    </div>
                                    <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2">Moneda Base</label>
                                            <select 
                                                name="currency"
                                                value={formData.currency}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827] focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                                            >
                                                <option value="USD">USD - Dólar Estadounidense</option>
                                                <option value="PEN">PEN - Sol Peruano</option>
                                                <option value="EUR">EUR - Euro</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-gray-500 tracking-wider uppercase mb-2">Formato de Fecha</label>
                                            <select 
                                                name="dateFormat"
                                                value={formData.dateFormat}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-[#F9FAFB] border border-[#E5E7EB] rounded-lg text-[#111827] focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                                            >
                                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Column: Tax & Payments */}
                            <div className="space-y-8">
                                {/* Tax Settings */}
                                <section className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                                    <div className="p-6 border-b border-[#E5E7EB] flex items-center justify-between">
                                        <h2 className="text-lg font-bold text-[#111827]">Impuestos</h2>
                                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">Cálculo en Tiempo Real</span>
                                    </div>
                                    <div className="p-8">
                                        <p className="text-sm text-[#6B7280] mb-6">Configure las tasas de impuestos primarias para las transacciones.</p>
                                        <div className="bg-[#F9FAFB] rounded-xl p-4 flex items-center justify-between border border-[#E5E7EB]">
                                            <div>
                                                <h4 className="text-sm font-semibold text-[#111827]">Impuesto General</h4>
                                                <p className="text-xs text-[#6B7280]">Aplicado a todas las ventas</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <input 
                                                    type="number"
                                                    name="taxRate"
                                                    value={formData.taxRate}
                                                    onChange={handleInputChange}
                                                    className="w-16 px-2 py-1 bg-white border border-[#E5E7EB] rounded font-bold text-right outline-none"
                                                />
                                                <span className="text-gray-400 font-medium">%</span>
                                            </div>
                                        </div>
                                        <div className="mt-6 p-4 bg-orange-50 rounded-xl flex gap-3">
                                            <Info className="w-5 h-5 text-orange-500 shrink-0" />
                                            <p className="text-xs text-orange-700 leading-relaxed">
                                                Los cambios en los impuestos surten efecto inmediato para todas las nuevas facturas y ventas.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Payment Methods */}
                                <section className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
                                    <div className="p-6 border-b border-[#E5E7EB]">
                                        <h2 className="text-lg font-bold text-[#111827]">Métodos de Pago</h2>
                                    </div>
                                    <div className="p-4 space-y-2">
                                        {paymentMethods.map((method) => (
                                            <div key={method.id} className="p-4 rounded-xl flex items-center justify-between hover:bg-gray-50 transition-colors">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center">
                                                        {method.name === 'Efectivo' ? <Briefcase className="w-5 h-5 text-[#6B7280]" /> : 
                                                         method.name === 'Tarjeta' ? <CreditCard className="w-5 h-5 text-[#6B7280]" /> : 
                                                         <Globe className="w-5 h-5 text-[#6B7280]" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-[#111827]">{method.name === 'Billetera Digital' ? 'Billeteras Digitales' : method.name === 'Tarjeta' ? 'Pagos con Tarjeta' : 'Pagos en Efectivo'}</h4>
                                                        <p className="text-[11px] text-[#6B7280]">
                                                            {method.name === 'Efectivo' ? 'Habilitar acciones de efectivo en caja' : 
                                                             method.name === 'Tarjeta' ? 'Visa, Mastercard, AMEX' : 
                                                             'Yape, Plin, Transferencias'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleTogglePayment(method.id)}
                                                    className={`w-12 h-6 rounded-full relative transition-colors ${method.isActive ? 'bg-blue-600' : 'bg-gray-200'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${method.isActive ? 'left-7' : 'left-1'}`}></div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                {/* Support Promo */}
                                <div className="bg-blue-600 rounded-xl p-6 text-white overflow-hidden relative group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                                        <CheckCircle2 className="w-24 h-24" />
                                    </div>
                                    <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center mb-4">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">¿Necesitas personalización avanzada?</h3>
                                    <p className="text-blue-100 text-sm mb-6 leading-relaxed">
                                        Nuestro soporte técnico puede ayudarte con integraciones de API y flujos de impuestos personalizados.
                                    </p>
                                    <button className="w-full py-3 bg-white text-blue-700 font-bold rounded-lg text-sm hover:bg-blue-50 transition-colors shadow-lg">
                                        Contactar Soporte
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="fixed bottom-0 left-64 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-[#E5E7EB] flex justify-end gap-3 z-50">
                            <button 
                                onClick={refreshSettings}
                                className="px-6 py-2.5 text-[#4B5563] font-semibold hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSave}
                                disabled={isSaving}
                                className="px-8 py-2.5 bg-blue-600 text-white font-bold rounded-lg transition-all hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-blue-200"
                            >
                                {isSaving ? <span className="animate-spin text-lg">⌛</span> : <Save className="w-4 h-4" />}
                                Guardar todos los cambios
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}

