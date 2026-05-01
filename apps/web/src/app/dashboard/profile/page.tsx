"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { getMe, updateMyProfile, uploadAvatar } from '@/lib/api';
import {
  User, Mail, Lock, Camera, Save,
  CheckCircle2, AlertCircle, Loader2,
  ShieldCheck, RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    avatarUrl: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await getMe();
        setUser(data);
        setFormData({
          name: data.name || '',
          email: data.email || '',
          password: '',
          confirmPassword: '',
          avatarUrl: data.avatarUrl || ''
        });
      } catch (error) {
        console.error('Failed to fetch user:', error);
        toast.error('Error al cargar datos del perfil');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];

    setUploading(true);
    try {
      const { url } = await uploadAvatar(file);
      setFormData(prev => ({ ...prev, avatarUrl: url }));
      toast.info('Imagen cargada. Guarde los cambios para aplicar.');
    } catch (error) {
      toast.error('Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setSaving(true);
    try {
      const updateData: any = {
        name: formData.name,
        avatarUrl: formData.avatarUrl
      };
      if (formData.password) {
        updateData.password = formData.password;
      }

      const updatedUser = await updateMyProfile(updateData);
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      toast.success('Perfil actualizado correctamente');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));

      // Update global user state (TopBar etc)
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col ml-64">
          <TopBar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const userInitial = user?.name?.charAt(0) || 'U';
  const displayAvatar = formData.avatarUrl
    ? (formData.avatarUrl.startsWith('http') ? formData.avatarUrl : `https://nexus-api.onrender.com${formData.avatarUrl}`)
    : null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto w-full">
            <header className="mb-8">
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mi Perfil</h1>
              <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest leading-relaxed">Configuraciones de identidad y seguridad corporativa</p>
            </header>

            <form onSubmit={handleSave} className="space-y-8 pb-12">
              <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                  <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                    <div className="relative group">
                      <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl">
                        <div className="w-full h-full rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center relative border border-gray-50">
                          {displayAvatar ? (
                            <img src={displayAvatar} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-4xl font-black text-gray-300 uppercase">{userInitial}</span>
                          )}
                          {uploading && (
                            <div className="absolute inset-0 bg-white/60 backdrop-blur-sm flex items-center justify-center">
                              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                            </div>
                          )}
                        </div>
                      </div>
                      <label className="absolute bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all group-hover:scale-110 active:scale-95">
                        <Camera className="w-5 h-5 text-blue-600" />
                        <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                      </label>
                    </div>
                    <div className="mb-4">
                      <h2 className="text-2xl font-black text-white drop-shadow-sm">{user?.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-black text-white uppercase tracking-wider border border-white/20">
                          {typeof user?.role === 'object' ? user?.role?.name : user?.role}
                        </span>
                        <span className="text-white/80 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-200" /> Cuenta Verificada
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-24 p-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" /> Información de Cuenta
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2.5 ml-1">Nombre Completo</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-700 shadow-sm"
                              placeholder="Ingrese su nombre"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2.5 ml-1">Email Institucional</label>
                          <div className="relative">
                            <input
                              type="email"
                              value={formData.email}
                              disabled
                              className="w-full pl-5 pr-12 py-4 bg-gray-100 border border-transparent rounded-[20px] font-bold text-gray-400 cursor-not-allowed outline-none"
                            />
                            <Lock className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-3 ml-2 font-medium flex items-center gap-1.5">
                            <AlertCircle className="w-3 h-3" /> El email se mantiene vinculado a la cuenta raíz.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Lock className="w-4 h-4 text-indigo-600" /> Autenticación
                      </h3>
                      <div className="space-y-6">
                        <div>
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2.5 ml-1">Nueva Contraseña</label>
                          <input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-700 shadow-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-black text-gray-400 uppercase tracking-wider mb-2.5 ml-1">Confirmar Contraseña</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full px-5 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-700 shadow-sm"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50/50 p-8 px-10 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 text-gray-400 font-black text-[10px] uppercase tracking-[0.2em] hover:text-rose-600 transition-all flex items-center gap-2"
                  >
                    <RefreshCw className="w-4 h-4" /> Descartar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-12 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[22px] hover:bg-blue-700 shadow-xl shadow-blue-100 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-3"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Actualizar Perfil
                  </button>
                </div>
            </section>
          </form>
          </div>
        </main>
      </div>
    </div>
  );
}