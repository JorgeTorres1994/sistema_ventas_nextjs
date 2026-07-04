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
import { useTheme } from '@/context/ThemeContext';
import { 
    Building2, Info, CreditCard, Briefcase, Globe,
    Calendar, CheckCircle2, Upload, Save, FileText,
    Hash, Settings as SettingsIcon, Plus, Edit2, Play,
    Palette, Moon, Sun, Monitor
} from 'lucide-react';
import { toast } from 'sonner';

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();
    const { settings, paymentMethods, refreshSettings, loading: initialLoading } = useSettings();
    const [formData, setFormData] = useState<any>(null);
    const [series, setSeries] = useState<any[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
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
            let finalLogoUrl = formData.logoUrl;

            // 1. If there's a new logo file pending, upload it first
            if (logoFile) {
                const uploadResult = await uploadSettingsLogo(logoFile);
                finalLogoUrl = uploadResult.url;
            }

            // 2. Update all settings at once
            await updateSettings({
                ...formData,
                logoUrl: finalLogoUrl
            });
            
            await refreshSettings();
            setLogoFile(null);
            setLogoPreview(null);
            toast.success('Configuración global actualizada correctamente');
        } catch (error) {
            console.error('Save error:', error);
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

    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;
        const file = e.target.files[0];
        
        // Just create a local preview, don't upload yet!
        setLogoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        toast.info('Previsualización de logo cargada. Aplique los cambios para guardar.');
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
            <div className="flex h-screen bg-background overflow-hidden font-sans">
                <Sidebar />
                <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                    <TopBar />
                    <div className="flex-1 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors">
            <Sidebar />
            
            <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                <TopBar />
                
                <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8 scrollbar-hide">
                    <div className="max-w-7xl mx-auto pb-48">
                        <div className="mb-8 sm:mb-12">
                            <nav className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-3">
                                <span>Sistema</span><span>/</span>
                                <span className="text-on-surface-variant">Preferencias</span>
                            </nav>
                            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tighter leading-none mb-3">Configuración Global</h1>
                            <p className="text-xs sm:text-sm lg:text-base text-on-surface-variant font-medium opacity-60 tracking-tight">Personalice el núcleo operativo y la identidad visual del ecosistema Nexus.</p>
                        </div>

                        {/* Tabs Navigation */}
                        <div className="flex overflow-x-auto gap-2 mb-8 sm:mb-10 bg-card p-2 rounded-[24px] sm:rounded-[28px] border border-outline-variant shadow-sm w-full snap-x snap-mandatory scrollbar-hide">
                            {[
                                { id: 'business', label: 'Estructura Corporativa', icon: Building2 },
                                { id: 'appearance', label: 'Ecosistema Visual', icon: Palette },
                                { id: 'billing', label: 'Ciclo de Facturación', icon: FileText },
                                { id: 'payments', label: 'Finanzas e Impuestos', icon: CreditCard }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex items-center justify-center shrink-0 snap-start gap-2 sm:gap-3 px-5 py-3 sm:px-8 sm:py-4 rounded-[18px] sm:rounded-[22px] text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-all whitespace-nowrap active:scale-95 ${
                                        activeTab === tab.id 
                                        ? 'bg-primary text-on-primary shadow-xl shadow-primary/20' 
                                        : 'text-on-surface-variant/60 hover:bg-surface-low hover:text-foreground'
                                    }`}
                                >
                                    <tab.icon className="w-4 h-4 sm:w-4.5 sm:h-4.5 shrink-0" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>


                        {activeTab === 'appearance' && (
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 lg:p-4">
                                {[
                                    { id: 'light', name: 'Claro Neutro', icon: Sun, color: 'bg-blue-500', desc: 'Clásica' },
                                    { id: 'dark', name: 'Noche Profunda', icon: Moon, color: 'bg-slate-900', desc: 'Elegante' },
                                    { id: 'purple', name: 'Real Elite', icon: Palette, color: 'bg-purple-600', desc: 'Distinción' },
                                    { id: 'emerald', name: 'Bosque Fresco', icon: Palette, color: 'bg-emerald-600', desc: 'Vibrante' },
                                    { id: 'rose', name: 'Pasión Intensa', icon: Palette, color: 'bg-rose-600', desc: 'Audaz' },
                                    { id: 'sunset', name: 'Atardecer', icon: Palette, color: 'bg-orange-600', desc: 'Cálido' },
                                    { id: 'ocean', name: 'Océano Profundo', icon: Palette, color: 'bg-cyan-600', desc: 'Sereno' },
                                    { id: 'forest', name: 'Bosque Místico', icon: Palette, color: 'bg-emerald-800', desc: 'Estable' }
                                ].map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTheme(t.id as any)}
                                        className={`group relative p-4 sm:p-6 rounded-[24px] sm:rounded-[32px] border-2 transition-all text-left active:scale-95 flex flex-col justify-between ${
                                            theme === t.id 
                                            ? 'border-primary bg-primary/5' 
                                            : 'border-outline-variant/30 bg-card hover:border-primary/30 shadow-sm'
                                        }`}
                                    >
                                        <div className="flex items-start justify-between mb-4 w-full">
                                            <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-[16px] sm:rounded-[22px] flex items-center justify-center ${t.color} text-white shadow-xl group-hover:scale-110 transition-transform ring-2 sm:ring-4 ring-background shrink-0`}>
                                                <t.icon className="w-5 h-5 sm:w-7 sm:h-7" />
                                            </div>
                                            {theme === t.id && (
                                                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-primary rounded-full flex items-center justify-center animate-in zoom-in shadow-lg shrink-0">
                                                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-on-primary" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-sm sm:text-base font-black text-foreground mb-0.5 tracking-tight leading-tight">{t.name}</h3>
                                            <p className="text-[9px] sm:text-[10px] text-on-surface-variant font-bold uppercase tracking-widest opacity-50">{t.desc}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}

                        {activeTab === 'business' && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:p-4">
                                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                                    <section className="bg-card rounded-[32px] sm:rounded-[48px] shadow-sm border border-outline-variant p-6 sm:p-8 lg:p-12 space-y-8 sm:space-y-12">
                                        <div className="flex flex-col sm:flex-row items-center sm:items-start text-center sm:text-left gap-6 sm:gap-10">
                                            <div className="w-24 h-24 sm:w-32 sm:h-32 shrink-0 rounded-[24px] sm:rounded-[36px] bg-surface-low border-2 border-dashed border-outline-variant flex items-center justify-center overflow-hidden relative group transition-all hover:border-primary/50">
                                                {logoPreview || formData.logoUrl ? (
                                                    <img 
                                                      src={logoPreview || `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}${formData.logoUrl}`} 
                                                      alt="Logo" 
                                                      className="w-full h-full object-cover" 
                                                      onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                        const parent = e.currentTarget.parentElement;
                                                        if (parent && !parent.querySelector('.fallback-icon')) {
                                                           // Need to insert raw SVG or icon for Building2 fallback
                                                           parent.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-on-surface-variant/30 fallback-icon"><rect width="16" height="20" x="4" y="2" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>`;
                                                        }
                                                      }}
                                                    />
                                                ) : (
                                                    <Building2 className="w-8 h-8 sm:w-10 sm:h-10 text-on-surface-variant/20" />
                                                )}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <Upload className="text-white w-6 h-6 sm:w-8 sm:h-8 transform -translate-y-2 group-hover:translate-y-0 transition-transform" />
                                                </div>
                                                <input type="file" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl sm:text-2xl font-black text-foreground mb-2 tracking-tighter">Identidad Visual</h3>
                                                <p className="text-[10px] sm:text-xs text-on-surface-variant font-medium opacity-60 mb-5 sm:mb-6">El logo aparecerá en reportes, comprobantes y facturas electrónicas. Recomendado: Formato cuadrado (400x400px).</p>
                                                <div className="flex flex-wrap justify-center sm:justify-start gap-3">
                                                    <label className="px-5 py-3 sm:px-6 sm:py-3 bg-primary/10 text-primary rounded-[16px] sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest cursor-pointer hover:bg-primary hover:text-on-primary transition-all active:scale-95">
                                                        Cargar Nuevo Activo
                                                        <input type="file" className="hidden" onChange={handleLogoUpload} />
                                                    </label>
                                                    { (logoPreview || formData.logoUrl) && (
                                                        <button onClick={() => {
                                                            setFormData({ ...formData, logoUrl: null });
                                                            setLogoPreview(null);
                                                            setLogoFile(null);
                                                        }} className="px-5 py-3 sm:px-6 sm:py-3 text-rose-500 text-[9px] sm:text-[10px] font-black uppercase tracking-widest hover:bg-rose-500/10 rounded-[16px] sm:rounded-2xl transition-all active:scale-95">
                                                            Remover
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
                                            <div className="space-y-2 sm:space-y-3">
                                                <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Denominación / Razón Social</label>
                                                <input type="text" name="businessName" value={formData.businessName} onChange={handleInputChange} className="w-full px-5 sm:px-8 py-3.5 sm:py-4 bg-surface-low border border-transparent focus:bg-card focus:border-primary/30 rounded-[16px] sm:rounded-[24px] outline-none font-black text-foreground transition-all shadow-inner text-sm" />
                                            </div>
                                            <div className="space-y-2 sm:space-y-3">
                                                <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Central Telefónica</label>
                                                <input type="text" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-5 sm:px-8 py-3.5 sm:py-4 bg-surface-low border border-transparent focus:bg-card focus:border-primary/30 rounded-[16px] sm:rounded-[24px] outline-none font-black text-foreground transition-all shadow-inner text-sm" />
                                            </div>
                                            <div className="md:col-span-2 space-y-2 sm:space-y-3">
                                                <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Sede Fiscal / Dirección Principal</label>
                                                <input type="text" name="address" value={formData.address} onChange={handleInputChange} className="w-full px-5 sm:px-8 py-3.5 sm:py-4 bg-surface-low border border-transparent focus:bg-card focus:border-primary/30 rounded-[16px] sm:rounded-[24px] outline-none font-black text-foreground transition-all shadow-inner text-sm" />
                                            </div>
                                        </div>
                                    </section>
                                </div>
                                <div className="space-y-6 sm:space-y-8">
                                    <section className="bg-card rounded-[32px] sm:rounded-[48px] shadow-sm border border-outline-variant p-6 sm:p-8 lg:p-12 space-y-6 sm:space-y-8">
                                        <div className="flex items-center justify-between mb-2 sm:mb-4">
                                            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter">Localización</h2>
                                            <Globe className="w-6 h-6 sm:w-7 sm:h-7 text-primary/40" />
                                        </div>
                                        <div className="space-y-4 sm:space-y-6">
                                            <div className="space-y-2 sm:space-y-3">
                                                <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Divisa de Transacción</label>
                                                <select name="currency" value={formData.currency} onChange={handleInputChange} className="w-full px-5 sm:px-8 py-3.5 sm:py-4 bg-surface-low border border-transparent focus:bg-card focus:border-primary/30 rounded-[16px] sm:rounded-[24px] outline-none font-black text-foreground transition-all shadow-inner text-sm appearance-none cursor-pointer">
                                                    <option value="PEN">Soles Peruanos (S/)</option>
                                                    <option value="USD">Dólares Americanos ($)</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2 sm:space-y-3">
                                                <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Husos Horarios</label>
                                                <select name="timezone" className="w-full px-5 sm:px-8 py-3.5 sm:py-4 bg-surface-low border border-transparent focus:bg-card focus:border-primary/30 rounded-[16px] sm:rounded-[24px] outline-none font-black text-foreground transition-all shadow-inner text-sm appearance-none cursor-pointer">
                                                    <option value="America/Lima">(GMT-05:00) Lima, Bogotá, Quito</option>
                                                </select>
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </div>
                        )}

                        {activeTab === 'billing' && (
                            <div className="space-y-6 sm:space-y-8 lg:p-4">
                                <section className="bg-card rounded-[32px] sm:rounded-[48px] shadow-sm border border-outline-variant overflow-hidden">
                                    <div className="p-6 sm:p-8 lg:p-12 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between bg-surface-low/30 gap-4 sm:gap-0">
                                        <div>
                                            <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter mb-1.5 sm:mb-2">Series y Correlativos</h2>
                                            <p className="text-[9px] sm:text-[11px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Gestión de numeración para el cumplimiento fiscal</p>
                                        </div>
                                        <button 
                                            onClick={() => {
                                                setSelectedSeries(null);
                                                setSeriesFormData({ documentType: 'FACTURA', prefix: '', startNumber: 1, description: '' });
                                                setIsSeriesModalOpen(true);
                                            }}
                                            className="flex items-center justify-center gap-2 sm:gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-foreground text-background rounded-[18px] sm:rounded-[22px] text-[10px] sm:text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 w-full sm:w-auto shrink-0 shadow-xl shadow-foreground/10"
                                        >
                                            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                                            Añadir Serie
                                        </button>
                                    </div>

                                    {/* Mobile Cards View */}
                                    <div className="grid grid-cols-1 md:hidden gap-4 p-4 bg-surface-low/10">
                                        {series.map((s) => (
                                            <div key={s.id} className="bg-card rounded-[24px] p-5 border border-outline-variant/50 shadow-sm relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] -z-10 pointer-events-none"></div>
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-[14px] bg-primary/10 flex items-center justify-center border border-primary/20">
                                                            <FileText className="w-5 h-5 text-primary" />
                                                        </div>
                                                        <span className="font-black text-foreground text-base tracking-tight capitalize leading-tight w-24">{s.documentType.toLowerCase().replace('_', ' ')}</span>
                                                    </div>
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
                                                        className="p-2.5 bg-surface-low text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-[14px] transition-all active:scale-90 border border-outline-variant/30"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 p-3 bg-surface-low/30 rounded-[16px] border border-outline-variant/30">
                                                    <div>
                                                        <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest block mb-1">Prefijo</span>
                                                        <span className="px-3 py-1 inline-block bg-card rounded-lg font-black text-primary text-sm border border-outline-variant/30 tracking-widest shadow-sm">{s.prefix}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest block mb-1">Correlativo</span>
                                                        <span className="text-xl font-black text-foreground tracking-tighter leading-none">{s.currentNumber.toString().padStart(8, '0')}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2 pt-3 mt-1 px-1">
                                                    <div className={`w-2 h-2 rounded-full ${s.isActive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-on-surface-variant/20'}`}></div>
                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] ${s.isActive ? 'text-emerald-500' : 'text-on-surface-variant/40'}`}>
                                                        {s.isActive ? 'En Operación' : 'Inactivo'}
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Desktop Table View */}
                                    <div className="hidden md:block overflow-x-auto scrollbar-hide">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="bg-surface-low/20">
                                                    <th className="px-12 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.4em]">Documento</th>
                                                    <th className="px-12 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.4em]">Prefijo</th>
                                                    <th className="px-12 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.4em]">Numeración</th>
                                                    <th className="px-12 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.4em]">Estado</th>
                                                    <th className="px-12 py-7 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.4em] text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-outline-variant/20">
                                                {series.map((s) => (
                                                    <tr key={s.id} className="hover:bg-primary/5 transition-all group">
                                                        <td className="px-12 py-8">
                                                            <div className="flex items-center gap-4">
                                                                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                                                    <FileText className="w-6 h-6 text-primary" />
                                                                </div>
                                                                <span className="font-black text-foreground text-lg tracking-tight capitalize">{s.documentType.toLowerCase().replace('_', ' ')}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-12 py-8">
                                                            <span className="px-4 py-2 bg-surface-low rounded-xl font-black text-primary text-xl border border-outline-variant/30 tracking-widest">{s.prefix}</span>
                                                        </td>
                                                        <td className="px-12 py-8">
                                                            <div className="flex flex-col">
                                                                <span className="text-3xl font-black text-foreground tracking-tighter leading-none mb-1">{s.currentNumber.toString().padStart(8, '0')}</span>
                                                                <span className="text-[9px] font-black text-on-surface-variant/40 uppercase tracking-widest">Contador Dinámico</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-12 py-8">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-2.5 h-2.5 rounded-full ${s.isActive ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-on-surface-variant/20'}`}></div>
                                                                <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${s.isActive ? 'text-emerald-500' : 'text-on-surface-variant/40'}`}>
                                                                    {s.isActive ? 'Operativo' : 'Inactivo'}
                                                                </span>
                                                            </div>
                                                        </td>
                                                        <td className="px-12 py-8 text-right">
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
                                                                className="p-4 bg-surface-low text-on-surface-variant hover:text-primary hover:bg-primary/10 rounded-[20px] transition-all active:scale-90"
                                                            >
                                                                <Edit2 className="w-5 h-5" />
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 lg:p-4">
                                <section className="bg-card rounded-[32px] sm:rounded-[48px] shadow-sm border border-outline-variant p-6 sm:p-8 lg:p-12 space-y-8 sm:space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter mb-1">Fiscalidad</h2>
                                            <p className="text-[9px] sm:text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Tasas de impuestos nacionales</p>
                                        </div>
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[20px] sm:rounded-[22px] bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                                            <Hash className="w-6 h-6 sm:w-7 sm:h-7 text-amber-500" />
                                        </div>
                                    </div>
                                    <div className="p-6 sm:p-8 bg-surface-low rounded-[24px] sm:rounded-[32px] flex items-center justify-between border border-outline-variant/30">
                                        <div>
                                            <p className="text-[10px] sm:text-[11px] font-black text-foreground uppercase tracking-[0.2em] mb-2">Tasa IGV / IVA</p>
                                            <p className="text-[9px] sm:text-[10px] font-medium text-on-surface-variant opacity-60">Cálculo automático en órdenes</p>
                                        </div>
                                        <div className="flex items-center gap-2 sm:gap-3">
                                            <input type="number" name="taxRate" value={formData.taxRate} onChange={handleInputChange} className="w-24 sm:w-28 px-4 sm:px-5 py-3 sm:py-4 bg-card border border-primary/20 rounded-2xl font-black text-xl sm:text-2xl text-center text-primary outline-none focus:ring-4 focus:ring-primary/5 shadow-inner" />
                                            <span className="text-xl sm:text-2xl font-black text-on-surface-variant/20">%</span>
                                        </div>
                                    </div>
                                </section>

                                <section className="bg-card rounded-[32px] sm:rounded-[48px] shadow-sm border border-outline-variant p-6 sm:p-8 lg:p-12 space-y-8 sm:space-y-10">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tighter mb-1">Pasarelas de Pago</h2>
                                            <p className="text-[9px] sm:text-[10px] font-black text-on-surface-variant/40 uppercase tracking-widest">Canales de recaudación habilitados</p>
                                        </div>
                                        <CreditCard className="w-6 h-6 sm:w-8 sm:h-8 text-primary/40" />
                                    </div>
                                    <div className="space-y-4">
                                        {paymentMethods.map((method) => (
                                            <div key={method.id} className="p-5 sm:p-6 rounded-[24px] sm:rounded-[28px] flex items-center justify-between bg-surface-low/30 hover:bg-surface-low transition-all border border-transparent hover:border-outline-variant/30 group">
                                                <div className="flex items-center gap-4 sm:gap-6">
                                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-[22px] bg-card flex items-center justify-center border border-outline-variant/30 group-hover:scale-110 transition-transform">
                                                        {method.name === 'Efectivo' ? <Briefcase className="w-5 h-5 sm:w-6 sm:h-6 text-on-surface-variant/40" /> : <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-on-surface-variant/40" />}
                                                    </div>
                                                    <div>
                                                        <h4 className="text-base sm:text-lg font-black text-foreground tracking-tight">{method.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${method.isActive ? 'bg-emerald-500' : 'bg-on-surface-variant/20'}`}></div>
                                                            <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${method.isActive ? 'text-emerald-500' : 'text-on-surface-variant/40'}`}>{method.isActive ? 'Operativo' : 'Desconectado'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => handleTogglePayment(method.id)}
                                                    className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full relative transition-all duration-500 active:scale-90 ${method.isActive ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-on-surface-variant/20'}`}
                                                >
                                                    <div className={`absolute top-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white shadow-lg transition-all duration-500 ${method.isActive ? 'left-7 sm:left-8' : 'left-1'}`}></div>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Footer Actions */}
                        <div className="fixed bottom-0 left-0 lg:left-64 right-0 p-4 sm:p-6 lg:p-8 bg-card/80 backdrop-blur-2xl border-t border-outline-variant/30 flex flex-col sm:flex-row justify-end items-center gap-3 sm:gap-6 z-50">
                            <div className="mr-auto hidden md:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">Configuraciones Sincronizadas</span>
                                </div>
                            </div>
                            <button onClick={refreshSettings} className="w-full sm:w-auto px-6 sm:px-10 py-4 sm:py-4 bg-surface-low sm:bg-transparent text-on-surface-variant sm:text-on-surface-variant/40 font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:text-foreground transition-all active:scale-95 rounded-[16px] sm:rounded-none shrink-0">Descartar Cambios</button>
                            <button onClick={handleSave} disabled={isSaving} className="w-full sm:w-auto px-6 sm:px-12 py-4 sm:py-4 bg-primary text-on-primary font-black text-[10px] sm:text-[11px] uppercase tracking-widest rounded-[16px] sm:rounded-[22px] shadow-xl sm:shadow-2xl shadow-primary/30 hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-3 sm:gap-4 transition-all active:scale-95 shrink-0">
                                {isSaving ? <span className="animate-spin text-lg shrink-0">⌛</span> : <Save className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />}
                                Propagar Configuración
                            </button>
                        </div>
                    </div>
                </main>
            </div>

            {/* Series Modal */}
            {isSeriesModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-background/40 backdrop-blur-md p-3 sm:p-4 animate-in fade-in duration-300">
                    <div className="bg-card rounded-[32px] sm:rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] w-full max-w-xl overflow-hidden flex flex-col border border-outline-variant animate-in zoom-in-95 duration-300">
                        <div className="px-6 sm:px-12 pt-8 sm:pt-12 pb-6 sm:pb-8 border-b border-outline-variant/30 bg-surface-low/30 shrink-0">
                            <h3 className="text-2xl sm:text-3xl font-black tracking-tighter mb-1.5 sm:mb-2">{selectedSeries ? 'Sincronizar Serie' : 'Apertura de Serie'}</h3>
                            <p className="text-[9px] sm:text-[11px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-40">Defina el protocolo de numeración automática</p>
                        </div>
                        <form onSubmit={handleSeriesSave} className="flex-1 overflow-y-auto max-h-[75vh] p-6 sm:p-12 space-y-6 sm:space-y-8 scrollbar-hide">
                            <div className="space-y-2.5 sm:space-y-3">
                                <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Protocolo Documental</label>
                                <div className="relative">
                                    <select 
                                        className="w-full px-5 sm:px-8 py-4 sm:py-5 bg-surface-low border border-transparent rounded-[16px] sm:rounded-[24px] outline-none font-black text-foreground shadow-inner focus:bg-card focus:border-primary/50 transition-all appearance-none cursor-pointer text-sm"
                                        value={seriesFormData.documentType}
                                        onChange={(e) => setSeriesFormData({...seriesFormData, documentType: e.target.value})}
                                    >
                                        <option value="FACTURA">Factura Electrónica (SUNAT)</option>
                                        <option value="BOLETA">Boleta de Venta Simplificada</option>
                                        <option value="NOTA_CREDITO">Nota de Crédito Electrónica</option>
                                        <option value="TICKET">Ticket de Venta Directa</option>
                                    </select>
                                    <FileText className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 text-on-surface-variant/20 w-4 h-4 sm:w-5 sm:h-5 pointer-events-none" />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div className="space-y-2.5 sm:space-y-3">
                                    <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Identificador (Serie)</label>
                                    <input 
                                        type="text" 
                                        className="w-full px-5 sm:px-8 py-4 sm:py-5 bg-surface-low border border-transparent rounded-[16px] sm:rounded-[24px] outline-none font-black text-primary text-xl sm:text-2xl shadow-inner focus:bg-card focus:border-primary/50 transition-all placeholder:text-on-surface-variant/20 text-center uppercase"
                                        placeholder="ej. F001"
                                        required
                                        value={seriesFormData.prefix}
                                        onChange={(e) => setSeriesFormData({...seriesFormData, prefix: e.target.value.toUpperCase()})}
                                    />
                                </div>
                                <div className="space-y-2.5 sm:space-y-3">
                                    <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Contador Inicial</label>
                                    <input 
                                        type="number" 
                                        className="w-full px-5 sm:px-8 py-4 sm:py-5 bg-surface-low border border-transparent rounded-[16px] sm:rounded-[24px] outline-none font-black text-foreground text-xl sm:text-2xl shadow-inner focus:bg-card focus:border-primary/50 transition-all text-center"
                                        required
                                        value={seriesFormData.startNumber}
                                        onChange={(e) => setSeriesFormData({...seriesFormData, startNumber: parseInt(e.target.value)})}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 pt-6 sm:pt-10">
                                <button type="button" onClick={() => setIsSeriesModalOpen(false)} className="w-full sm:flex-1 py-4 sm:py-5 bg-surface-low sm:bg-transparent text-on-surface-variant sm:text-on-surface-variant/40 font-black text-[10px] sm:text-[11px] uppercase tracking-widest hover:text-foreground hover:bg-outline-variant/10 sm:hover:bg-transparent transition-all active:scale-95 rounded-[16px] sm:rounded-none">Cerrar</button>
                                <button type="submit" className="w-full sm:flex-[2] py-4 sm:py-5 bg-primary text-on-primary font-black text-[10px] sm:text-[11px] uppercase tracking-widest rounded-[16px] sm:rounded-[24px] shadow-xl sm:shadow-2xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95">Sincronizar Protocolo</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

