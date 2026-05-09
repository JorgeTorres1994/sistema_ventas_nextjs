"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import {
  ArrowLeft, Building2, Hash, Mail, Phone, MapPin,
  Save, AlertCircle, Loader2
} from 'lucide-react';
import { createSupplier } from '@/lib/api';
import { toast } from 'sonner';

interface FormData {
  name: string;
  dniRuc: string;
  email: string;
  phone: string;
  address: string;
}

interface FormErrors {
  name?: string;
  dniRuc?: string;
  email?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = 'El nombre de la empresa es obligatorio';
  if (!data.dniRuc.trim()) errors.dniRuc = 'El DNI/RUC es obligatorio';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Formato de correo electrónico inválido';
  }
  return errors;
}

export default function NewSupplierPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({ name: '', dniRuc: '', email: '', phone: '', address: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { 
        setErrors(errs); 
        toast.error('Por favor, revise los errores en el formulario');
        return; 
    }

    setLoading(true);
    const toastId = toast.loading('Registrando proveedor...');
    
    try {
      await createSupplier(form);
      toast.success('Proveedor registrado con éxito', { id: toastId });
      setTimeout(() => router.push('/dashboard/suppliers'), 800);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Ocurrió un error inesperado.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 w-full overflow-hidden">
        <TopBar />

        <header className="px-4 lg:px-10 py-6 border-b border-outline-variant/30 flex items-center gap-6 sticky top-0 z-20 bg-background/80 backdrop-blur-xl">
          <button
            onClick={() => router.push('/dashboard/suppliers')}
            className="w-12 h-12 rounded-2xl border border-outline-variant/30 hover:bg-surface-low flex items-center justify-center transition-all active:scale-90 shadow-sm"
          >
            <ArrowLeft className="w-5 h-5 text-on-surface-variant" />
          </button>
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mb-1">
              <span>Proveedores</span><span>/</span>
              <span className="text-primary">Nuevo Registro</span>
            </nav>
            <h1 className="text-2xl lg:text-3xl font-black text-foreground tracking-tighter">Registrar Proveedor</h1>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-10 pb-32">
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-card rounded-[40px] shadow-sm border border-outline-variant/30 overflow-hidden">

              <div className="px-8 py-10 border-b border-outline-variant/30 bg-gradient-to-br from-primary/[0.03] to-transparent">
                <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-[24px] flex items-center justify-center border border-primary/20">
                    <Building2 className="w-8 h-8 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-xl font-black text-foreground tracking-tight">Detalles de la Empresa</h2>
                    <p className="text-sm text-on-surface-variant font-medium opacity-60">Complete el perfil corporativo para iniciar el abastecimiento</p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 lg:p-10 space-y-8">
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Razón Social <span className="text-rose-500">*</span></label>
                    <div className="relative group">
                      <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary transition-transform group-focus-within:scale-110" />
                      <input type="text" placeholder="Ej. Lumina Tech Solutions" value={form.name} onChange={set('name')}
                        className={`w-full h-[64px] pl-16 pr-6 bg-surface-low border-2 border-outline-variant/20 rounded-[24px] font-bold text-foreground focus:outline-none focus:bg-card transition-all ${errors.name ? 'border-rose-500/50 bg-rose-500/5' : 'focus:border-primary focus:shadow-xl focus:shadow-primary/5'}`} />
                    </div>
                    {errors.name && <p className="mt-2 text-[10px] font-black text-rose-500 flex items-center gap-2 uppercase tracking-widest ml-1"><AlertCircle className="w-3.5 h-3.5" />{errors.name}</p>}
                  </div>

                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">DNI / RUC <span className="text-rose-500">*</span></label>
                    <div className="relative group">
                      <Hash className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary transition-transform group-focus-within:scale-110" />
                      <input type="text" placeholder="Ej. 20543219876" value={form.dniRuc} onChange={set('dniRuc')}
                        className={`w-full h-[64px] pl-16 pr-6 bg-surface-low border-2 border-outline-variant/20 rounded-[24px] font-black text-foreground font-mono focus:outline-none focus:bg-card transition-all ${errors.dniRuc ? 'border-rose-500/50 bg-rose-500/5' : 'focus:border-primary focus:shadow-xl focus:shadow-primary/5'}`} />
                    </div>
                    {errors.dniRuc && <p className="mt-2 text-[10px] font-black text-rose-500 flex items-center gap-2 uppercase tracking-widest ml-1"><AlertCircle className="w-3.5 h-3.5" />{errors.dniRuc}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Correo Corporativo</label>
                    <div className="relative group">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary transition-transform group-focus-within:scale-110" />
                      <input type="email" placeholder="contacto@empresa.com" value={form.email} onChange={set('email')}
                        className={`w-full h-[64px] pl-16 pr-6 bg-surface-low border-2 border-outline-variant/20 rounded-[24px] font-bold text-foreground focus:outline-none focus:bg-card transition-all ${errors.email ? 'border-rose-500/50 bg-rose-500/5' : 'focus:border-primary focus:shadow-xl focus:shadow-primary/5'}`} />
                    </div>
                    {errors.email && <p className="mt-2 text-[10px] font-black text-rose-500 flex items-center gap-2 uppercase tracking-widest ml-1"><AlertCircle className="w-3.5 h-3.5" />{errors.email}</p>}
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Teléfono Móvil</label>
                    <div className="relative group">
                      <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-primary transition-transform group-focus-within:scale-110" />
                      <input type="text" placeholder="+51 987 654 321" value={form.phone} onChange={set('phone')}
                        className="w-full h-[64px] pl-16 pr-6 bg-surface-low border-2 border-outline-variant/20 rounded-[24px] font-bold text-foreground focus:outline-none focus:border-primary focus:bg-card focus:shadow-xl focus:shadow-primary/5 transition-all" />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] ml-1">Dirección Corporativa</label>
                  <div className="relative group">
                    <MapPin className="absolute left-6 top-6 w-5 h-5 text-primary transition-transform group-focus-within:scale-110" />
                    <textarea rows={3} placeholder="Calle, edificio, ciudad..." value={form.address} onChange={set('address')}
                      className="w-full pl-16 pr-6 py-6 bg-surface-low border-2 border-outline-variant/20 rounded-[32px] font-medium text-foreground focus:outline-none focus:border-primary focus:bg-card focus:shadow-xl focus:shadow-primary/5 transition-all resize-none leading-relaxed" />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 pt-8 border-t border-outline-variant/30">
                  <button type="button" onClick={() => router.push('/dashboard/suppliers')}
                    className="w-full sm:flex-1 h-[64px] bg-card border-2 border-outline-variant/30 rounded-[24px] font-black text-xs text-on-surface-variant uppercase tracking-widest hover:bg-surface-low transition-all active:scale-95 shadow-sm">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading}
                    className="w-full sm:flex-1 h-[64px] bg-primary rounded-[24px] font-black text-xs text-on-primary flex items-center justify-center gap-3 hover:opacity-90 shadow-2xl shadow-primary/30 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none">
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                    Registrar Proveedor
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

