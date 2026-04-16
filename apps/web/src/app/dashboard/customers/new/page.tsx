"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import {
  ArrowLeft, User, Hash, Mail, Phone, MapPin,
  Save, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { createCustomer, updateCustomer, getCustomerById } from '@/lib/api';

import { toast } from 'sonner';

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
  if (!data.dni.trim()) errors.dni = 'El DNI es obligatorio';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Formato de correo inválido';
  }
  return errors;
}

export default function CustomerFormPage() {
  const router = useRouter();
  const params = useParams();
  const customerId = params?.id as string | undefined;
  const isEditing = !!customerId;

  const [form, setForm] = useState<FormData>({ name: '', dni: '', email: '', phone: '', address: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(isEditing);

  // Load existing customer if editing
  useEffect(() => {
    if (isEditing && customerId) {
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
        .catch(() => {
          toast.error('No se pudo cargar la información del cliente');
          router.push('/dashboard/customers');
        })
        .finally(() => setFetchLoading(false));
    }
  }, [customerId, isEditing, router]);

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
    const toastId = toast.loading(isEditing ? 'Actualizando cliente...' : 'Creando cliente...');
    
    try {
      if (isEditing) {
        await updateCustomer(customerId, form);
        toast.success('Cliente actualizado correctamente', { id: toastId });
      } else {
        await createCustomer(form);
        toast.success('Cliente registrado con éxito', { id: toastId });
      }
      setTimeout(() => router.push('/dashboard/customers'), 800);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Ocurrió un error inesperado.';
      toast.error(Array.isArray(msg) ? msg.join(', ') : msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-y-auto">

        {/* Header */}
        <header className="px-8 py-6 bg-white border-b border-gray-100 flex items-center gap-4 sticky top-0 z-20">
          <button
            onClick={() => router.push('/dashboard/customers')}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              <span>Clientes</span><span>/</span>
              <span className="text-indigo-600">{isEditing ? 'Editar Cliente' : 'Nuevo Cliente'}</span>
            </nav>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">
              {isEditing ? 'Modificar Cliente' : 'Registrar Nuevo Cliente'}
            </h1>
          </div>
        </header>

        <main className="flex-1 p-8">
          {fetchLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Form Header */}
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">{isEditing ? 'Información del Cliente' : 'Detalles de Registro'}</h2>
                      <p className="text-sm text-gray-400 font-medium">Complete los campos correspondientes del cliente.</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">

                  {/* Name */}
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">
                      Nombre Completo <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        type="text"
                        placeholder="ej. Elena Rodriguez"
                        value={form.name}
                        onChange={set('name')}
                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all ${errors.name ? 'ring-2 ring-rose-300 bg-rose-50' : 'focus:ring-indigo-300'}`}
                      />
                    </div>
                    {errors.name && <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                  </div>

                  {/* DNI */}
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">
                      DNI / Documento Identidad <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input
                        type="text"
                        placeholder="ej. 76543210"
                        value={form.dni}
                        onChange={set('dni')}
                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all font-mono ${errors.dni ? 'ring-2 ring-rose-300 bg-rose-50' : 'focus:ring-indigo-300'}`}
                      />
                    </div>
                    {errors.dni && <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.dni}</p>}
                  </div>

                  {/* Email & Phone (2 columns) */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Correo Electrónico</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="email"
                          placeholder="nombre@ejemplo.com"
                          value={form.email}
                          onChange={set('email')}
                          className={`w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all ${errors.email ? 'ring-2 ring-rose-300 bg-rose-50' : 'focus:ring-indigo-300'}`}
                        />
                      </div>
                      {errors.email && <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Número de Teléfono</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input
                          type="text"
                          placeholder="+51 987 654 321"
                          value={form.phone}
                          onChange={set('phone')}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">Dirección Domiliciaria</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-300" />
                      <textarea
                        rows={3}
                        placeholder="Calle, ciudad, distrito..."
                        value={form.address}
                        onChange={set('address')}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-2">
                    <button type="button" onClick={() => router.push('/dashboard/customers')}
                      className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-black text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={loading}
                      className="flex-1 py-3 bg-indigo-600 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {isEditing ? 'Guardar Cambios' : 'Registrar Cliente'}
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
