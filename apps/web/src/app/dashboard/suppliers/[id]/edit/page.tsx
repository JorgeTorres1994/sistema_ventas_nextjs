"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import {
  ArrowLeft, Building2, Hash, Mail, Phone, MapPin,
  Save, CheckCircle, AlertCircle, Loader2
} from 'lucide-react';
import { updateSupplier, getSupplierById } from '@/lib/api';

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
  if (!data.name.trim()) errors.name = 'Company Name is required';
  if (!data.dniRuc.trim()) errors.dniRuc = 'DNI/RUC is required';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
  }
  return errors;
}

export default function EditSupplierPage() {
  const router = useRouter();
  const params = useParams();
  const supplierId = params?.id as string;

  const [form, setForm] = useState<FormData>({ name: '', dniRuc: '', email: '', phone: '', address: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (supplierId) {
      setFetchLoading(true);
      getSupplierById(supplierId)
        .then(s => {
          setForm({
            name: s.name ?? '',
            dniRuc: s.dniRuc ?? '',
            email: s.email ?? '',
            phone: s.phone ?? '',
            address: s.address ?? '',
          });
        })
        .catch(() => router.push('/dashboard/suppliers'))
        .finally(() => setFetchLoading(false));
    }
  }, [supplierId, router]);

  const set = (field: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
    setErrors(prev => ({ ...prev, [field]: undefined }));
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setServerError('');
    try {
      await updateSupplier(supplierId, form);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/suppliers'), 1200);
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'An error occurred. Please try again.';
      setServerError(Array.isArray(msg) ? msg.join(', ') : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 w-[calc(100%-256px)] overflow-y-auto">

        <header className="px-8 py-6 bg-white border-b border-gray-100 flex items-center gap-4 sticky top-0 z-20">
          <button
            onClick={() => router.push('/dashboard/suppliers')}
            className="w-9 h-9 rounded-xl border border-gray-100 hover:bg-gray-50 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-4 h-4 text-gray-500" />
          </button>
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
              <span>Suppliers</span><span>/</span>
              <span className="text-blue-600">Edit Supplier</span>
            </nav>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Edit Supplier</h1>
          </div>
        </header>

        <main className="flex-1 p-8">
          {fetchLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">

                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">Update vendor details</h2>
                      <p className="text-sm text-gray-500 font-medium">Modify the details below and save your changes</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  
                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Company Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input type="text" placeholder="e.g. Lumina Tech Solutions" value={form.name} onChange={set('name')}
                        className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/80 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 transition-all border border-transparent ${errors.name ? 'ring-2 ring-rose-200 bg-rose-50' : 'focus:ring-blue-100 focus:border-blue-300 focus:bg-white'}`} />
                    </div>
                    {errors.name && <p className="mt-2 text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Tax ID / RUC <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                      <input type="text" placeholder="e.g. 20543219876" value={form.dniRuc} onChange={set('dniRuc')}
                        className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/80 rounded-xl font-bold text-gray-900 font-mono focus:outline-none focus:ring-2 transition-all border border-transparent ${errors.dniRuc ? 'ring-2 ring-rose-200 bg-rose-50' : 'focus:ring-blue-100 focus:border-blue-300 focus:bg-white'}`} />
                    </div>
                    {errors.dniRuc && <p className="mt-2 text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.dniRuc}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input type="email" placeholder="contact@company.com" value={form.email} onChange={set('email')}
                          className={`w-full pl-12 pr-4 py-3.5 bg-gray-50/80 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 transition-all border border-transparent ${errors.email ? 'ring-2 ring-rose-200 bg-rose-50' : 'focus:ring-blue-100 focus:border-blue-300 focus:bg-white'}`} />
                      </div>
                      {errors.email && <p className="mt-2 text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                        <input type="text" placeholder="+1 (555) 000-0000" value={form.phone} onChange={set('phone')}
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-50/80 rounded-xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:bg-white transition-all border border-transparent" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Corporate Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-300" />
                      <textarea rows={3} placeholder="Street, building, city..." value={form.address} onChange={set('address')}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50/80 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:bg-white transition-all border border-transparent resize-none leading-relaxed" />
                    </div>
                  </div>

                  {serverError && (
                    <div className="flex items-center gap-3 p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 font-bold text-sm">
                      <AlertCircle className="w-5 h-5 flex-shrink-0" /> {serverError}
                    </div>
                  )}
                  {success && (
                    <div className="flex items-center gap-3 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-bold text-sm">
                      <CheckCircle className="w-5 h-5 flex-shrink-0" /> Supplier updated successfully!
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                    <button type="button" onClick={() => router.push('/dashboard/suppliers')}
                      className="flex-1 py-3.5 bg-white border border-gray-200 rounded-xl font-black text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading || success}
                      className="flex-1 py-3.5 bg-blue-600 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 hover:bg-blue-700 shadow-lg shadow-blue-200/50 transition-all disabled:opacity-50 disabled:shadow-none">
                      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                      Save Details
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
