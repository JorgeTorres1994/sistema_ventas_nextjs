"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { getMe, updateMyProfile, uploadAvatar } from '@/lib/api';
import { 
  User, Mail, Lock, Camera, Save, 
  CheckCircle2, AlertCircle, Loader2,
  Trash2, ShieldCheck
} from 'lucide-react';

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
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
      setMessage({ type: 'success', text: 'Imagen cargada. Guarda los cambios para aplicar.' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al subir la imagen' });
    } finally {
      setUploading(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password && formData.password !== formData.confirmPassword) {
      setMessage({ type: 'error', text: 'Las contraseñas no coinciden' });
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
      
      setMessage({ type: 'success', text: 'Perfil actualizado con éxito' });
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      
      // Refresh TopBar by triggering a storage event or similar if needed
      window.dispatchEvent(new Event('storage'));
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(null), 3000);
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
    ? (formData.avatarUrl.startsWith('http') ? formData.avatarUrl : `http://localhost:3005${formData.avatarUrl}`)
    : null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64 overflow-y-auto">
        <TopBar />

        <main className="flex-1 p-8 max-w-4xl mx-auto w-full">
          <header className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Mi Perfil</h1>
            <p className="text-gray-500 font-bold mt-1 uppercase text-xs tracking-widest">Gestiona tu identidad en Nexus Genesis</p>
          </header>

          <form onSubmit={handleSave} className="space-y-8 pb-12">
            {/* Profile Card */}
            <section className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
                <div className="absolute -bottom-16 left-8 flex items-end gap-6">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-3xl bg-white p-1.5 shadow-xl">
                      <div className="w-full h-full rounded-2xl bg-gray-100 overflow-hidden flex items-center justify-center relative">
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
                    <label className="absolute bottom-2 -right-2 w-10 h-10 bg-white rounded-xl shadow-lg border border-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-all group-hover:scale-110">
                      <Camera className="w-5 h-5 text-blue-600" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                    </label>
                  </div>
                  <div className="mb-4">
                    <h2 className="text-2xl font-black text-white drop-shadow-sm">{user?.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="px-2 py-0.5 bg-white/20 backdrop-blur-md rounded-md text-[10px] font-black text-white uppercase tracking-wider border border-white/20">
                        {user?.role}
                      </span>
                      <span className="text-white/80 text-xs font-bold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Cuenta Verificada
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-24 p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Info */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <User className="w-4 h-4" /> Información Personal
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nombre Completo</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-700" 
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Correo Electrónico</label>
                        <div className="relative">
                          <input 
                            type="email" 
                            value={formData.email}
                            disabled
                            className="w-full pl-4 pr-10 py-3 bg-gray-100 border border-transparent rounded-2xl font-bold text-gray-400 cursor-not-allowed outline-none" 
                          />
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 ml-1 italic">* El correo electrónico no puede ser modificado por seguridad.</p>
                      </div>
                    </div>
                  </div>

                  {/* Security */}
                  <div className="space-y-6">
                    <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                       <Lock className="w-4 h-4" /> Seguridad
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Nueva Contraseña</label>
                        <input 
                          type="password" 
                          name="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-700" 
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2 ml-1">Confirmar Nueva Contraseña</label>
                        <input 
                          type="password" 
                          name="confirmPassword"
                          placeholder="••••••••"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-700" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {message && (
                  <div className={`mt-8 p-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    <p className="text-sm font-bold">{message.text}</p>
                  </div>
                )}
              </div>

              {/* Action Footer */}
              <div className="bg-gray-50 p-6 px-8 border-t border-gray-100 flex items-center justify-between">
                <button 
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, avatarUrl: user?.avatarUrl || '' }))}
                  className="px-6 py-2.5 text-rose-600 font-black text-xs uppercase tracking-widest hover:bg-rose-100/50 rounded-xl transition-all"
                >
                  Restaurar Cambios
                </button>
                <button 
                  type="submit"
                  disabled={saving}
                  className="px-10 py-3 bg-blue-600 text-white font-black text-sm rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Guardar Perfil
                </button>
              </div>
            </section>
          </form>
        </main>
      </div>
    </div>
  );
}
