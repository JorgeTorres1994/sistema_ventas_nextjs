"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import {
  ArrowLeft, User, Hash, Mail, Phone, MapPin,
  Save, CheckCircle, AlertCircle, Loader2, Search
} from 'lucide-react';
import { createCustomer, updateCustomer, getCustomerById } from '@/lib/api';

interface FormData {
  name: string;
  dni: string;
  email: string;
  phone: string;
  address: string;
}

interface FormErrors {
  name?: string;
  dni?: string;
  email?: string;
}

function validate(data: FormData): FormErrors {
  const errors: FormErrors = {};
  if (!data.name.trim()) errors.name = 'El nombre es obligatorio';
  if (!data.dni.trim()) errors.dni = 'El documento es obligatorio';
  else if (data.dni.length !== 8 && data.dni.length !== 11) errors.dni = 'El documento debe tener 8 (DNI) u 11 (RUC) dígitos';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Formato de correo inválido';
  }
  return errors;
}

export default function EditCustomerPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string;

  const [form, setForm] = useState<FormData>({ name: '', dni: '', email: '', phone: '', address: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (customerId) {
      setFetchLoading(true);
      getCustomerById(customerId)
        .then(c => {
          setForm({
            name: c.name ?? '',
            dni: c.dni ?? '',
            email: c.email ?? '',
            phone: c.phone ?? '',
            address: c.address ?? '',
          });
        })
        .catch(() => router.push('/dashboard/customers'))
        .finally(() => setFetchLoading(false));
    }
  }, [customerId, router]);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    let value = e.target.value;
    if (field === 'dni') value = value.replace(/\D/g, '').slice(0, 11);
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setServerError('');
  };

  const handleConsultarDocumento = async () => {
    const isDNI = form.dni.length === 8;
    const isRUC = form.dni.length === 11;
    if (!isDNI && !isRUC) return;
    
    setIsSearching(true);
    setServerError('');
    try {
      const type = isDNI ? 'dni' : 'ruc';
      const endpoint = `/api/decolecta?type=${type}&numero=${form.dni}`;
        
      const response = await fetch(endpoint);

      if (!response.ok) {
        throw new Error(isDNI ? 'DNI no encontrado' : 'RUC no encontrado o inválido');
      }

      const data = await response.json();
      
      if (isDNI) {
        setForm(prev => ({ ...prev, name: data.full_name || '' }));
      } else {
        setForm(prev => ({ 
          ...prev, 
          name: data.razon_social || '',
          address: data.direccion || ''
        }));
      }
      setErrors(prev => ({ ...prev, name: undefined, dni: undefined }));
    } catch (err: any) {
      setServerError(err.message || 'Error al consultar documento');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');
    try {
      await updateCustomer(customerId, form);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/customers'), 1200);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Ocurrió un error. Por favor, intente de nuevo.';
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 w-full lg:w-[calc(100%-256px)] overflow-y-auto">

        <header className="px-8 py-6 bg-white border-b border-gray-100 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => router.push('/dashboard/customers')}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              <span>Clientes</span><span>/</span>
              <span className="text-indigo-600">Editar Cliente</span>
            </nav>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Editar Cliente</h1>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8">
          {fetchLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">Actualizar información del cliente</h2>
                      <p className="text-sm text-gray-400 font-medium">Modifique los detalles a continuación y guarde sus cambios</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-4 lg:p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">Nombre Completo <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input type="text" placeholder="ej. Elena Rodriguez" value={form.name} onChange={set('name')}
                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all ${errors.name ? 'ring-2 ring-rose-300 bg-rose-50' : 'focus:ring-indigo-300'}`} />
                    </div>
                    {errors.name && <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">DNI / Documento de Identidad <span className="text-rose-500">*</span></label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input type="text" placeholder="ej. 76543210" value={form.dni} onChange={set('dni')}
                          className={`w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all font-mono ${errors.dni ? 'ring-2 ring-rose-300 bg-rose-50' : 'focus:ring-indigo-300'}`} />
                      </div>
                      <button
                        type="button"
                        onClick={handleConsultarDocumento}
                        disabled={isSearching || (form.dni.length !== 8 && form.dni.length !== 11)}
                        className="px-6 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-black text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md shadow-gray-200"
                      >
                        {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        <span className="hidden sm:inline">Consultar</span>
                      </button>
                    </div>
                    {errors.dni && <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.dni}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={set('email')}
                          className={`w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all ${errors.email ? 'ring-2 ring-rose-300 bg-rose-50' : 'focus:ring-indigo-300'}`} />
                      </div>
                      {errors.email && <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Número de Teléfono</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input type="text" placeholder="+51 987 654 321" value={form.phone} onChange={set('phone')}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">Dirección</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-300" />
                      <textarea rows={3} placeholder="Dirección, ciudad, estado..." value={form.address} onChange={set('address')}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all resize-none" />
                    </div>
                  </div>

                  {serverError && (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm font-bold">{serverError}</p>
                    </div>
                  )}
                  {success && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" />
                      <p className="text-sm font-bold">¡Cliente actualizado correctamente!</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    <button type="button" onClick={() => router.push('/dashboard/customers')}
                      className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-black text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={loading || success}
                      className="flex-1 py-3 bg-indigo-600 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Guardar Cambios
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
