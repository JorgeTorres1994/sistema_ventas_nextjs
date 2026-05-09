"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
    Users, User as UserIcon, Search, Download, 
    UserPlus, Shield, ShieldCheck, UserX, UserCheck, Key, 
    Trash2, X, MoreVertical, Building2, Mail, Globe
} from 'lucide-react';
import { getUsers, createUser, updateUser, toggleUserStatus, getRoles } from '@/lib/api';
import { toast } from 'sonner';

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [roles, setRoles] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [formData, setFormData] = useState({ 
        name: '', 
        email: '', 
        password: '', 
        roleId: '',
        authProvider: 'EMAIL'
    });
    const [loadingAction, setLoadingAction] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [usersData, rolesData] = await Promise.all([
                getUsers({
                    search: searchQuery,
                    roleId: roleFilter || undefined,
                    isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
                }),
                getRoles()
            ]);
            setUsers(usersData);
            setRoles(rolesData);
        } catch (error) {
            toast.error('Error al cargar datos');
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, roleFilter, statusFilter]);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const loggedUser = JSON.parse(userStr);
            const roleName = typeof loggedUser.role === 'object' ? loggedUser.role?.name : loggedUser.role;
            if (roleName !== 'Administrador' && roleName !== 'ADMIN') {
                router.push('/dashboard');
                return;
            }
        } else {
            router.push('/login');
            return;
        }

        const timer = setTimeout(() => fetchData(), 300);
        return () => clearTimeout(timer);
    }, [fetchData, router]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.name.trim()) return toast.error('El nombre es obligatorio');
        if (!formData.email.trim()) return toast.error('El correo es obligatorio');
        if (!formData.roleId) return toast.error('Debe asignar un rol');
        if (formData.authProvider === 'EMAIL' && formData.password.length < 6) {
            return toast.error('La contraseña debe tener al menos 6 caracteres');
        }

        setLoadingAction(true);
        const toastId = toast.loading('Registrando nuevo usuario...');
        try {
            await createUser(formData);
            toast.success('Usuario creado correctamente', { id: toastId });
            setIsAddModalOpen(false);
            setFormData({ name: '', email: '', password: '', roleId: '', authProvider: 'EMAIL' });
            fetchData();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al crear usuario';
            toast.error(Array.isArray(msg) ? msg.join(', ') : msg, { id: toastId });
        } finally {
            setLoadingAction(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error('El nombre es obligatorio');
        if (!formData.roleId) return toast.error('El rol es obligatorio');

        setLoadingAction(true);
        const toastId = toast.loading('Actualizando permisos...');
        try {
            const payload: any = {
                name: formData.name,
                roleId: formData.roleId
            };
            if (formData.password && formData.password.trim().length >= 6) {
                payload.password = formData.password;
            } else if (formData.password && formData.password.trim().length > 0 && formData.password.trim().length < 6) {
                toast.error('La nueva contraseña debe tener al menos 6 caracteres', { id: toastId });
                setLoadingAction(false);
                return;
            }
            
            await updateUser(selectedUser.id, payload);
            toast.success('Usuario actualizado correctamente', { id: toastId });
            setIsEditModalOpen(false);
            fetchData();
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Error al actualizar usuario';
            toast.error(Array.isArray(msg) ? msg.join(', ') : msg, { id: toastId });
        } finally {
            setLoadingAction(false);
        }
    };

    const handleToggleStatus = async (id: string, currentStatus: boolean) => {
        const toastId = toast.loading(currentStatus ? 'Desactivando acceso...' : 'Restaurando acceso...');
        try {
            await toggleUserStatus(id);
            toast.success(currentStatus ? 'Acceso suspendido' : 'Acceso restaurado', { id: toastId });
            fetchData();
        } catch (error) {
            toast.error('Error al cambiar el estado del usuario', { id: toastId });
        }
    };

    const openEditModal = (user: any) => {
        setSelectedUser(user);
        setFormData({ 
            name: user.name, 
            email: user.email, 
            password: '', 
            roleId: user.roleId || '',
            authProvider: user.authProvider || 'EMAIL'
        });
        setIsEditModalOpen(true);
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
            <Sidebar />
            
            <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                <TopBar />
                
                <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8 scrollbar-hide">
                    <div className="max-w-7xl mx-auto">
                        
                        {/* Header & Metrics */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div>
                                <nav className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                                    <span>Sistema</span><span>/</span>
                                    <span className="text-on-surface-variant">Equipo</span>
                                </nav>
                                <h1 className="text-4xl font-black tracking-tighter mb-2">Directorio del Equipo</h1>
                                <p className="text-on-surface-variant font-medium">Gestione niveles de acceso y asigne roles a su personal administrativo.</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <div className="bg-card p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-outline-variant shadow-sm flex items-center gap-4 sm:gap-5 flex-1 min-w-[220px]">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                                        <Users className="text-primary w-6 h-6 sm:w-7 sm:h-7" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Miembros Activos</p>
                                        <div className="flex items-baseline gap-2 mt-0.5 sm:mt-1">
                                            <span className="text-2xl sm:text-3xl font-black tracking-tighter">{users.filter(u => u.isActive).length}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-card p-5 sm:p-6 rounded-[24px] sm:rounded-[32px] border border-outline-variant shadow-sm flex items-center gap-4 sm:gap-5 flex-1 min-w-[220px]">
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-surface-low flex items-center justify-center border border-outline-variant/30 shrink-0">
                                        <ShieldCheck className="text-on-surface-variant/40 w-6 h-6 sm:w-7 sm:h-7" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Roles Configurados</p>
                                        <div className="flex items-baseline gap-2 mt-0.5 sm:mt-1">
                                            <span className="text-2xl sm:text-3xl font-black tracking-tighter">{roles.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search & Actions Bar */}
                        <div className="bg-card rounded-[24px] md:rounded-[32px] border border-outline-variant shadow-sm mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between p-4 md:p-5 gap-4 md:gap-6">
                            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1 w-full lg:max-w-none">
                                <div className="relative flex-1 group">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant/40 group-focus-within:text-primary transition-colors w-5 h-5" />
                                    <input 
                                        type="text"
                                        placeholder="Rastrear por nombre o correo institucional..."
                                        className="w-full pl-12 pr-5 py-3.5 bg-surface-low border border-transparent rounded-2xl text-sm font-black text-foreground placeholder:text-on-surface-variant/30 focus:bg-card focus:border-primary/30 focus:ring-4 focus:ring-primary/5 transition-all outline-none"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="grid grid-cols-2 sm:flex sm:flex-row gap-3">
                                    <select 
                                        className="bg-surface-low border border-outline-variant/30 px-3 sm:px-5 py-3.5 rounded-2xl text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-widest outline-none focus:border-primary/30 transition-all cursor-pointer appearance-none w-full sm:w-auto"
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                    >
                                        <option value="">Todos los Roles</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                    <select 
                                        className="bg-surface-low border border-outline-variant/30 px-3 sm:px-5 py-3.5 rounded-2xl text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-widest outline-none focus:border-primary/30 transition-all cursor-pointer appearance-none w-full sm:w-auto"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="">Todos los Estados</option>
                                        <option value="active">Activo</option>
                                        <option value="inactive">Inactivo</option>
                                    </select>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => {
                                    setFormData({ name: '', email: '', password: '', roleId: '', authProvider: 'EMAIL' });
                                    setIsAddModalOpen(true);
                                }}
                                className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-on-primary rounded-[22px] text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 shrink-0"
                            >
                                <UserPlus className="w-5 h-5" />
                                Crear Miembro
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-card rounded-[24px] md:rounded-[40px] border border-outline-variant shadow-sm overflow-hidden transition-all">
                            
                            {/* Mobile Cards View */}
                            <div className="lg:hidden flex flex-col divide-y divide-outline-variant/20">
                                {isLoading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="p-5 h-32 bg-surface-low/10 animate-pulse"></div>
                                    ))
                                ) : users.length === 0 ? (
                                    <div className="py-16 text-center px-4">
                                        <div className="w-20 h-20 bg-surface-low rounded-3xl flex items-center justify-center mx-auto mb-6 border border-outline-variant/30">
                                            <UserX className="w-8 h-8 text-on-surface-variant/20" />
                                        </div>
                                        <h3 className="text-xl font-black tracking-tight">Sin hallazgos</h3>
                                        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mt-2">No se detectaron miembros</p>
                                    </div>
                                ) : (
                                    users.map((user) => (
                                        <div key={user.id} className="p-5 flex flex-col gap-4 hover:bg-primary/5 transition-colors">
                                            <div className="flex justify-between items-start">
                                                <div className="flex items-center gap-4">
                                                    <div className="relative">
                                                        <div className="w-12 h-12 rounded-[18px] bg-surface-low p-0.5 shadow-inner overflow-hidden flex items-center justify-center border border-outline-variant/50">
                                                            {user.avatarUrl ? (
                                                                <img 
                                                                    src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}${user.avatarUrl}`} 
                                                                    alt={user.name} 
                                                                    className="w-full h-full object-cover rounded-[16px]"
                                                                    onError={(e: any) => {
                                                                        e.target.style.display = 'none';
                                                                        e.target.parentElement.innerHTML = `<div class="w-full h-full rounded-[16px] bg-primary/10 flex items-center justify-center text-primary font-black text-sm uppercase">${user.name.charAt(0)}</div>`;
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full rounded-[16px] bg-primary/10 flex items-center justify-center text-primary font-black text-sm uppercase">
                                                                    {user.name.charAt(0)}
                                                                </div>
                                                            )}
                                                        </div>
                                                        {user.isActive && (
                                                            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card shadow-sm"></div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-sm font-black text-foreground truncate max-w-[140px] sm:max-w-[200px]">{user.name}</span>
                                                        <span className="text-[9px] font-black text-on-surface-variant/50 uppercase tracking-widest truncate max-w-[140px] sm:max-w-[200px]">{user.email}</span>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 shrink-0">
                                                    <button onClick={() => openEditModal(user)} className="p-2.5 bg-primary/10 text-primary rounded-xl active:scale-90 transition-transform"><Shield className="w-4 h-4" /></button>
                                                    <button onClick={() => handleToggleStatus(user.id, user.isActive)} className={`p-2.5 rounded-xl active:scale-90 transition-transform ${user.isActive ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-outline-variant/20">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-60">Rol</span>
                                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border w-max truncate max-w-full ${
                                                        user.role?.name === 'Administrador' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-low text-on-surface-variant border-outline-variant/30'
                                                    }`}>
                                                        {user.role?.name || 'Sin Rol'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-60">Acceso</span>
                                                    <div className="flex items-center gap-1.5">
                                                        {user.authProvider === 'GOOGLE' ? (
                                                            <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div> Google</span>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest flex items-center gap-1"><Mail className="w-3 h-3" /> Email</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden lg:block overflow-x-auto scrollbar-hide w-full">
                                <table className="w-full text-left border-collapse table-fixed">
                                    <thead>
                                        <tr className="bg-surface-low/30 border-b border-outline-variant/30">
                                            <th className="w-1/3 px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Nombre del Miembro</th>
                                            <th className="w-1/6 px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Rol Asignado</th>
                                            <th className="w-1/6 px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Acceso</th>
                                            <th className="w-1/6 px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em]">Estado</th>
                                            <th className="w-[16%] px-6 py-5 text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] text-right">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-outline-variant/20">
                                        {isLoading ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-24 text-center">
                                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                                                </td>
                                            </tr>
                                        ) : users.length === 0 ? (
                                            <tr>
                                                <td colSpan={5} className="px-6 py-32 text-center">
                                                    <div className="w-24 h-24 bg-surface-low rounded-[32px] flex items-center justify-center mx-auto mb-8 border border-outline-variant/30">
                                                        <UserX className="w-10 h-10 text-on-surface-variant/20" />
                                                    </div>
                                                    <h3 className="text-2xl font-black tracking-tight">Sin hallazgos</h3>
                                                    <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mt-3">No se detectaron miembros bajo estos filtros</p>
                                                </td>
                                            </tr>
                                        ) : (
                                            users.map((user) => (
                                                <tr key={user.id} className="group hover:bg-primary/5 transition-all">
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="relative group shrink-0">
                                                                <div className="w-12 h-12 rounded-[20px] bg-surface-low p-0.5 shadow-inner overflow-hidden flex items-center justify-center border border-outline-variant/50 transition-transform group-hover:scale-110">
                                                                    {user.avatarUrl ? (
                                                                        <img 
                                                                            src={user.avatarUrl.startsWith('http') ? user.avatarUrl : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}${user.avatarUrl}`} 
                                                                            alt={user.name} 
                                                                            className="w-full h-full object-cover rounded-[18px]"
                                                                            onError={(e: any) => {
                                                                                e.target.style.display = 'none';
                                                                                e.target.parentElement.innerHTML = `<div class="w-full h-full rounded-[18px] bg-primary/10 flex items-center justify-center text-primary font-black text-base uppercase">${user.name.charAt(0)}</div>`;
                                                                            }}
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full rounded-[18px] bg-primary/10 flex items-center justify-center text-primary font-black text-base uppercase">
                                                                            {user.name.charAt(0)}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {user.isActive && (
                                                                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card shadow-sm animate-pulse"></div>
                                                                )}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <div className="font-black text-foreground text-sm sm:text-base tracking-tight leading-tight group-hover:text-primary transition-colors truncate">{user.name}</div>
                                                                <div className="text-[10px] text-on-surface-variant/40 font-black uppercase tracking-widest mt-0.5 truncate">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border truncate max-w-full inline-block ${
                                                            user.role?.name === 'Administrador' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-surface-low text-on-surface-variant border-outline-variant/30'
                                                        }`}>
                                                            {user.role?.name || 'Sin Rol'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-3">
                                                            {user.authProvider === 'GOOGLE' ? (
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-xl border border-amber-500/20 truncate">
                                                                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></div>
                                                                    <span className="text-[10px] font-black uppercase tracking-widest truncate">Google</span>
                                                                </div>
                                                            ) : (
                                                                <div className="flex items-center gap-2 px-3 py-1.5 bg-surface-low text-on-surface-variant rounded-xl border border-outline-variant/30 truncate">
                                                                    <Mail className="w-4 h-4 shrink-0" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest truncate">Email</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5">
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-2 h-2 shrink-0 rounded-full ${user.isActive ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]' : 'bg-on-surface-variant/20'}`}></div>
                                                            <span className={`text-[10px] font-black uppercase tracking-widest truncate ${user.isActive ? 'text-emerald-500' : 'text-on-surface-variant/40'}`}>
                                                                {user.isActive ? 'Activo' : 'Inactivo'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-5 text-right" onClick={e => e.stopPropagation()}>
                                                        <div className="flex items-center justify-end gap-2 transition-all">
                                                            <button 
                                                                onClick={() => openEditModal(user)}
                                                                className="p-2.5 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-xl transition-all shadow-sm active:scale-90"
                                                                title="Editar Miembro"
                                                            >
                                                                <Shield className="w-4 h-4" />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                                className={`p-2.5 rounded-xl transition-all shadow-sm active:scale-90 ${user.isActive ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-on-primary' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-on-primary'}`}
                                                                title={user.isActive ? 'Suspender Acceso' : 'Restaurar Acceso'}
                                                            >
                                                                {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
                    <div className="bg-card rounded-[32px] sm:rounded-[48px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] w-full max-w-xl max-h-[90vh] flex flex-col border border-outline-variant animate-in zoom-in-95 duration-300">
                        <div className="px-6 sm:px-12 pt-6 sm:pt-10 pb-4 border-b border-outline-variant/30 shrink-0">
                            <h3 className="text-2xl sm:text-3xl font-black tracking-tighter mb-1.5">{isAddModalOpen ? 'Nuevo Miembro' : 'Editar Miembro'}</h3>
                            <p className="text-[10px] sm:text-xs font-black text-on-surface-variant uppercase tracking-widest opacity-60">Configuración de seguridad y privilegios Nexus</p>
                        </div>
                        
                        <form onSubmit={isAddModalOpen ? handleCreateUser : handleUpdateUser} className="p-6 sm:p-12 space-y-5 sm:space-y-8 overflow-y-auto scrollbar-hide">
                            <div className="space-y-2.5">
                                <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Identidad Completa</label>
                                <input 
                                    type="text" 
                                    className="w-full px-5 sm:px-8 py-4 sm:py-5 bg-surface-low border border-transparent rounded-[16px] sm:rounded-[24px] outline-none focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-black text-foreground shadow-inner"
                                    placeholder="Nombre del operario..."
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            {isAddModalOpen && (
                                <div className="space-y-2.5">
                                    <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Correo Corporativo</label>
                                    <input 
                                        type="email" 
                                        className="w-full px-5 sm:px-8 py-4 sm:py-5 bg-surface-low border border-transparent rounded-[16px] sm:rounded-[24px] outline-none focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-black text-foreground shadow-inner"
                                        placeholder="nexus.user@enterprise.com"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            )}

                            <div className="space-y-2.5">
                                <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Protocolo de Acceso</label>
                                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, authProvider: 'EMAIL'})}
                                        className={`py-3.5 sm:py-5 rounded-[16px] sm:rounded-[24px] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border active:scale-95 flex flex-col items-center justify-center gap-1.5 ${
                                            formData.authProvider === 'EMAIL' 
                                            ? 'bg-foreground text-background border-foreground shadow-2xl' 
                                            : 'bg-surface-low text-on-surface-variant/40 border-transparent hover:bg-outline-variant/10'
                                        }`}
                                    >
                                        <Mail className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                                        Clave Dinámica
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, authProvider: 'GOOGLE'})}
                                        className={`py-3.5 sm:py-5 rounded-[16px] sm:rounded-[24px] text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all border active:scale-95 flex flex-col items-center justify-center gap-1.5 ${
                                            formData.authProvider === 'GOOGLE' 
                                            ? 'bg-amber-500 text-white border-amber-500 shadow-xl shadow-amber-500/20' 
                                            : 'bg-surface-low text-on-surface-variant/40 border-transparent hover:bg-outline-variant/10'
                                        }`}
                                    >
                                        <Globe className="w-4 h-4 sm:w-5 sm:h-5 mb-0.5" />
                                        Google OAuth
                                    </button>
                                </div>
                            </div>

                            {(isAddModalOpen || isEditModalOpen) && formData.authProvider === 'EMAIL' && (
                                <div className="space-y-2.5 animate-in slide-in-from-top-2 duration-200">
                                    <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">
                                        {isEditModalOpen ? 'Actualizar Encriptación' : 'Encriptación de Acceso'}
                                    </label>
                                    <div className="relative">
                                        <Key className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-4 h-4 sm:w-5 sm:h-5" />
                                        <input 
                                            type="password" 
                                            className="w-full pl-10 sm:pl-14 pr-5 sm:pr-8 py-4 sm:py-5 bg-surface-low border border-transparent rounded-[16px] sm:rounded-[24px] outline-none focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-sm font-black text-foreground shadow-inner"
                                            placeholder={isEditModalOpen ? '(Opcional) Nueva clave segura' : '••••••••••••'}
                                            required={isAddModalOpen}
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                    {isEditModalOpen && (
                                        <p className="text-[8px] sm:text-[9px] font-black text-on-surface-variant/40 ml-4 uppercase tracking-widest">Ignorar para mantener credenciales actuales.</p>
                                    )}
                                </div>
                            )}

                            <div className="space-y-2.5">
                                <label className="block text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Privilegios de Sistema</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 text-on-surface-variant/40 w-4 h-4 sm:w-5 sm:h-5" />
                                    <select 
                                        className="w-full pl-10 sm:pl-14 pr-5 sm:pr-8 py-4 sm:py-5 bg-surface-low border border-transparent rounded-[16px] sm:rounded-[24px] outline-none focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all text-[10px] sm:text-[11px] font-black text-foreground shadow-inner appearance-none uppercase tracking-widest cursor-pointer"
                                        required
                                        value={formData.roleId}
                                        onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                                    >
                                        <option value="">Seleccione Privilegios...</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex flex-row gap-3 sm:gap-6 pt-4 sm:pt-8 mt-auto sticky bottom-0 bg-card pb-2">
                                <button 
                                    type="button"
                                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                    className="flex-1 py-3.5 sm:py-5 bg-surface-low text-on-surface-variant font-black text-[9px] sm:text-[11px] uppercase tracking-widest rounded-[16px] sm:rounded-[24px] hover:bg-outline-variant/20 transition-colors active:scale-95"
                                >
                                    Abortar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loadingAction}
                                    className="flex-[2] py-3.5 sm:py-5 bg-primary text-on-primary font-black text-[9px] sm:text-[11px] uppercase tracking-widest rounded-[16px] sm:rounded-[24px] shadow-xl sm:shadow-2xl shadow-primary/30 hover:opacity-90 transition-all disabled:opacity-50 active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {loadingAction ? (
                                        <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        isAddModalOpen ? 'Certificar Miembro' : 'Sincronizar Datos'
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

