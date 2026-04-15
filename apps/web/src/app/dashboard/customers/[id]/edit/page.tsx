"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import {
  ArrowLeft, User, Hash, Mail, Phone, MapPin,
  Save, CheckCircle, AlertCircle, Loader2
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
  if (!data.name.trim()) errors.name = 'Name is required';
  if (!data.dni.trim()) errors.dni = 'DNI is required';
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = 'Invalid email format';
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
      await updateCustomer(customerId, form);
      setSuccess(true);
      setTimeout(() => router.push('/dashboard/customers'), 1200);
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
          <button onClick={() => router.push('/dashboard/customers')}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-500" />
          </button>
          <div>
            <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
              <span>Customers</span><span>/</span>
              <span className="text-indigo-600">Edit Customer</span>
            </nav>
            <h1 className="text-2xl font-black text-gray-900 leading-tight">Edit Customer</h1>
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
                <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-indigo-50 to-white">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
                      <User className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-gray-900">Update customer information</h2>
                      <p className="text-sm text-gray-400 font-medium">Modify the details below and save your changes</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">Full Name <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input type="text" placeholder="e.g. Elena Rodriguez" value={form.name} onChange={set('name')}
                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all ${errors.name ? 'ring-2 ring-rose-300 bg-rose-50' : 'focus:ring-indigo-300'}`} />
                    </div>
                    {errors.name && <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">DNI / Identity Number <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                      <input type="text" placeholder="e.g. 48.291.002-K" value={form.dni} onChange={set('dni')}
                        className={`w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all font-mono ${errors.dni ? 'ring-2 ring-rose-300 bg-rose-50' : 'focus:ring-indigo-300'}`} />
                    </div>
                    {errors.dni && <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.dni}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input type="email" placeholder="name@example.com" value={form.email} onChange={set('email')}
                          className={`w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 transition-all ${errors.email ? 'ring-2 ring-rose-300 bg-rose-50' : 'focus:ring-indigo-300'}`} />
                      </div>
                      {errors.email && <p className="mt-1.5 text-xs font-bold text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        <input type="text" placeholder="+1 555 123 4567" value={form.phone} onChange={set('phone')}
                          className="w-full pl-11 pr-4 py-3 bg-gray-50 rounded-xl font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all" />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">Address</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-3.5 w-4 h-4 text-gray-300" />
                      <textarea rows={3} placeholder="Street address, city, state..." value={form.address} onChange={set('address')}
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
                      <p className="text-sm font-bold">Customer updated successfully!</p>
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    <button type="button" onClick={() => router.push('/dashboard/customers')}
                      className="flex-1 py-3 bg-white border border-gray-200 rounded-xl font-black text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                    <button type="submit" disabled={loading || success}
                      className="flex-1 py-3 bg-indigo-600 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50">
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save Changes
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
