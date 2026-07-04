"use client";// Trigger redeploy from owner account


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
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col lg:ml-64">
          <TopBar />
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-12 h-12 text-primary animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  const userInitial = user?.name?.charAt(0) || 'U';
  const roleName = typeof user?.role === 'object' ? user?.role?.name : user?.role;
  const isAdmin = roleName === 'Administrador' || roleName === 'ADMIN';

  const displayAvatar = formData.avatarUrl
    ? (formData.avatarUrl.startsWith('http') ? formData.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}${formData.avatarUrl}`)
    : null;

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans transition-colors">
      <Sidebar />
      <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-background scrollbar-hide">
          <div className="max-w-4xl mx-auto w-full pb-20">
            <header className="mb-6 sm:mb-12">
              <nav className="flex flex-wrap items-center gap-2 text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2 sm:mb-3">
                <span>Cuenta</span><span>/</span>
                <span className="text-on-surface-variant">Seguridad</span>
              </nav>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-foreground tracking-tighter">Gestión de Identidad</h1>
              <p className="text-on-surface-variant font-bold mt-1 sm:mt-2 uppercase text-[9px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] opacity-40">Protocolos de seguridad y personalización Nexus</p>
            </header>

            <form onSubmit={handleSave} className="space-y-8 sm:space-y-12">
              <section className="bg-card rounded-[32px] sm:rounded-[48px] shadow-sm border border-outline-variant overflow-hidden">
                <div className="h-24 sm:h-40 bg-gradient-to-r from-primary to-indigo-900"></div>
                
                <div className="px-6 sm:px-12 -mt-16 sm:-mt-20 relative z-10 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-8 text-center sm:text-left">
                  <div className="relative group">
                    <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-[32px] sm:rounded-[44px] bg-card p-1.5 sm:p-2 shadow-2xl ring-2 sm:ring-4 ring-background/10">
                      <div className="w-full h-full rounded-[26px] sm:rounded-[36px] bg-surface-low overflow-hidden flex items-center justify-center relative border border-outline-variant/30">
                        {displayAvatar ? (
                          <img 
                            src={displayAvatar} 
                            alt="Avatar" 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              const parent = e.currentTarget.parentElement;
                              if (parent && !parent.querySelector('.fallback-text')) {
                                 const span = document.createElement('span');
                                 span.className = 'text-4xl sm:text-5xl font-black text-on-surface-variant/20 uppercase fallback-text';
                                 span.innerText = userInitial;
                                 parent.appendChild(span);
                              }
                            }}
                          />
                        ) : (
                          <span className="text-4xl sm:text-5xl font-black text-on-surface-variant/20 uppercase fallback-text">{userInitial}</span>
                        )}
                        {uploading && (
                          <div className="absolute inset-0 bg-background/60 backdrop-blur-md flex items-center justify-center">
                            <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 text-primary animate-spin" />
                          </div>
                        )}
                      </div>
                    </div>
                    <label className={`absolute bottom-1 right-1 sm:bottom-3 sm:-right-3 w-10 h-10 sm:w-12 sm:h-12 bg-card rounded-[16px] sm:rounded-[20px] shadow-xl border border-outline-variant flex items-center justify-center transition-all group-hover:scale-110 group-hover:rotate-6 active:scale-95 ${!isAdmin ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-surface-low hover:text-primary'}`}>
                      <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                      <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={!isAdmin} />
                    </label>
                  </div>
                  <div className="pb-2 sm:pb-4">
                    <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tighter mb-1.5 sm:mb-2">{user?.name}</h2>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-3">
                      <span className="px-3 py-1 bg-primary/10 rounded-xl text-[9px] sm:text-[10px] font-black text-primary uppercase tracking-[0.2em] border border-primary/20">
                        {String(user?.role?.name || user?.role || 'Usuario')}
                      </span>
                      <span className="text-on-surface-variant/40 text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] flex items-center gap-1 sm:gap-2">
                        <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary" /> Identidad Verificada
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-6 sm:p-8 lg:p-12 pt-10 sm:pt-16">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 lg:gap-20">
                    <div className="space-y-6 sm:space-y-10">
                      <h3 className="text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] sm:tracking-[0.4em] flex items-center gap-2 sm:gap-3">
                        <User className="w-4 h-4 sm:w-5 sm:h-5 text-primary" /> Credenciales de Operador
                      </h3>
                      <div className="space-y-5 sm:space-y-8">
                        <div className="space-y-2 sm:space-y-3">
                          <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Nombre de Usuario</label>
                          <div className="relative">
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              disabled={!isAdmin}
                              className={`w-full px-5 sm:px-8 py-3.5 sm:py-5 border border-transparent rounded-[16px] sm:rounded-[24px] focus:outline-none transition-all font-black text-foreground shadow-inner text-sm ${!isAdmin ? 'bg-surface-low cursor-not-allowed opacity-40' : 'bg-surface-low focus:bg-card focus:border-primary/30'}`}
                              placeholder="Su nombre de acceso"
                            />
                          </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Correo Electrónico Principal</label>
                          <div className="relative">
                            <input
                              type="email"
                              value={formData.email}
                              disabled
                              className="w-full pl-5 sm:pl-8 pr-12 sm:pr-16 py-3.5 sm:py-5 bg-surface-low border border-transparent rounded-[16px] sm:rounded-[24px] font-black text-on-surface-variant/40 cursor-not-allowed outline-none shadow-inner text-sm"
                            />
                            <Lock className="absolute right-5 sm:right-8 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-on-surface-variant/20" />
                          </div>
                          <p className="text-[8px] sm:text-[9px] text-on-surface-variant/40 mt-3 sm:mt-4 ml-2 sm:ml-3 font-black uppercase tracking-widest flex items-center gap-1.5 sm:gap-2">
                            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" /> El correo está bloqueado por el administrador del sistema.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6 sm:space-y-10">
                      <h3 className="text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] sm:tracking-[0.4em] flex items-center gap-2 sm:gap-3">
                        <Lock className="w-4 h-4 sm:w-5 h-5 text-indigo-500" /> Seguridad y Cifrado
                      </h3>
                      <div className="space-y-5 sm:space-y-8">
                        <div className="space-y-2 sm:space-y-3">
                          <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Nueva Frase de Acceso</label>
                          <input
                            type="password"
                            name="password"
                            placeholder="••••••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={!isAdmin}
                            className={`w-full px-5 sm:px-8 py-3.5 sm:py-5 border border-transparent rounded-[16px] sm:rounded-[24px] focus:outline-none transition-all font-black text-foreground shadow-inner text-sm ${!isAdmin ? 'bg-surface-low cursor-not-allowed opacity-40' : 'bg-surface-low focus:bg-card focus:border-primary/30'}`}
                          />
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                          <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Confirmación de Frase</label>
                          <input
                            type="password"
                            name="confirmPassword"
                            placeholder="••••••••••••"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            disabled={!isAdmin}
                            className={`w-full px-5 sm:px-8 py-3.5 sm:py-5 border border-transparent rounded-[16px] sm:rounded-[24px] focus:outline-none transition-all font-black text-foreground shadow-inner text-sm ${!isAdmin ? 'bg-surface-low cursor-not-allowed opacity-40' : 'bg-surface-low focus:bg-card focus:border-primary/30'}`}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-surface-low/30 p-6 sm:p-8 lg:p-12 border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-0">
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="w-full sm:w-auto justify-center px-6 sm:px-8 py-3.5 sm:py-4 text-on-surface-variant/40 font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] hover:text-rose-500 transition-all flex items-center gap-2 sm:gap-3 active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" /> Descartar
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !isAdmin}
                    className={`w-full sm:w-auto justify-center px-8 sm:px-14 py-3.5 sm:py-5 text-on-primary font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] rounded-[16px] sm:rounded-[24px] shadow-2xl transition-all flex items-center gap-3 sm:gap-4 active:scale-95 shrink-0 ${(!isAdmin || saving) ? 'bg-on-surface-variant/20 cursor-not-allowed shadow-none' : 'bg-primary hover:opacity-90 shadow-primary/30'}`}
                  >
                    {saving ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin shrink-0" /> : (!isAdmin ? <Lock className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" /> : <Save className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />)}
                    {isAdmin ? 'Sincronizar Identidad' : 'Acceso Restringido'}
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

