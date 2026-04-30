"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
    Users, User as UserIcon, Search, Download, 
    UserPlus, Shield, ShieldCheck, UserX, UserCheck, Key, 
    Trash2, X, MoreVertical, Building2
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
        roleId: '' 
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
            if (loggedUser.role !== 'Administrador' && loggedUser.role !== 'ADMIN') {
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
        if (formData.password.length < 6) return toast.error('La contraseña debe tener al menos 6 caracteres');

        setLoadingAction(true);
        const toastId = toast.loading('Registrando nuevo usuario...');
        try {
            await createUser(formData);
            toast.success('Usuario creado correctamente', { id: toastId });
            setIsAddModalOpen(false);
            setFormData({ name: '', email: '', password: '', roleId: '' });
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
            await updateUser(selectedUser.id, {
                name: formData.name,
                roleId: formData.roleId
            });
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
            roleId: user.roleId || '' 
        });
        setIsEditModalOpen(true);
    };

    return (
        <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans text-[#111827]">
            <Sidebar />
            
            <div className="flex-1 flex flex-col ml-64 overflow-hidden">
                <TopBar />
                
                <main className="flex-1 overflow-y-auto bg-[#F9FAFB] p-8">
                    <div className="max-w-7xl mx-auto">
                        
                        {/* Header & Metrics */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Directorio del Equipo</h1>
                                <p className="text-[#6B7280]">Gestione niveles de acceso y asigne roles a su personal administrativo.</p>
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4 min-w-[200px]">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Users className="text-blue-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Miembros Activos</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold">{users.filter(u => u.isActive).length}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4 min-w-[200px]">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                                        <ShieldCheck className="text-gray-400 w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Roles Configurados</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold">{roles.length}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Search & Actions Bar */}
                        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between p-4 gap-4">
                            <div className="flex items-center gap-4 flex-1 w-full max-w-lg">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input 
                                        type="text"
                                        placeholder="Buscar por nombre o correo..."
                                        className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <select 
                                        className="bg-gray-50 border border-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                                        value={roleFilter}
                                        onChange={(e) => setRoleFilter(e.target.value)}
                                    >
                                        <option value="">Todos los Roles</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                    <select 
                                        className="bg-gray-50 border border-gray-100 px-3 py-2.5 rounded-xl text-xs font-bold text-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
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
                                    setFormData({ name: '', email: '', password: '', roleId: '' });
                                    setIsAddModalOpen(true);
                                }}
                                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                            >
                                <UserPlus className="w-4 h-4" />
                                Crear Miembro
                            </button>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-5 text-[11px] font-bold text-[#6B7280] uppercase tracking-widest border-b border-[#E5E7EB]">Nombre del Miembro</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-[#6B7280] uppercase tracking-widest border-b border-[#E5E7EB]">Rol Asignado</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-[#6B7280] uppercase tracking-widest border-b border-[#E5E7EB]">Estado</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-[#6B7280] uppercase tracking-widest border-b border-[#E5E7EB] text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                                                No se encontraron resultados
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase text-xs">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{user.name}</div>
                                                            <div className="text-xs text-gray-400 font-medium">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                        user.role?.name === 'Administrador' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {user.role?.name || 'Sin Rol'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]' : 'bg-gray-300'}`}></div>
                                                        <span className={`text-[10px] font-black uppercase tracking-widest ${user.isActive ? 'text-green-700' : 'text-gray-400'}`}>
                                                            {user.isActive ? 'Acceso Activo' : 'Suspendido'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 text-right w-24" onClick={e => e.stopPropagation()}>
                                                    <div className="flex items-center justify-end gap-2 transition-all">
                                                        <button 
                                                            onClick={() => openEditModal(user)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar Miembro"
                                                        >
                                                            <Shield className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleToggleStatus(user.id, user.isActive)}
                                                            className={`p-2 rounded-lg transition-colors ${user.isActive ? 'text-gray-400 hover:text-rose-600 hover:bg-rose-50' : 'text-green-400 hover:text-green-600 hover:bg-green-50'}`}
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
                </main>
            </div>

            {/* Modals */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
                        <div className="px-10 pt-10 pb-4">
                            <h3 className="text-2xl font-black mb-1">{isAddModalOpen ? 'Nuevo Miembro' : 'Editar Miembro'}</h3>
                            <p className="text-sm text-gray-400">Configure los accesos para el personal administrativo.</p>
                        </div>
                        
                        <form onSubmit={isAddModalOpen ? handleCreateUser : handleUpdateUser} className="p-10 space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nombre Completo</label>
                                <input 
                                    type="text" 
                                    className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-bold shadow-sm"
                                    placeholder="Juan Pérez"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            {isAddModalOpen && (
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Correo Corporativo</label>
                                    <input 
                                        type="email" 
                                        className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-bold shadow-sm"
                                        placeholder="usuario@ventas.com"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            )}

                            {isAddModalOpen && (
                                <div className="space-y-2">
                                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Contraseña</label>
                                    <div className="relative">
                                        <Key className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input 
                                            type="password" 
                                            className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-bold shadow-sm"
                                            placeholder="••••••••"
                                            required={isAddModalOpen}
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Rol Asignado</label>
                                <div className="relative">
                                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                    <select 
                                        className="w-full pl-12 pr-6 py-4 bg-gray-50 border border-transparent rounded-2xl outline-none focus:bg-white focus:border-blue-500 transition-all text-sm font-bold shadow-sm appearance-none"
                                        required
                                        value={formData.roleId}
                                        onChange={(e) => setFormData({...formData, roleId: e.target.value})}
                                    >
                                        <option value="">Seleccione un rol...</option>
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button 
                                    type="button"
                                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                    className="flex-1 py-4 text-gray-500 font-black text-xs uppercase tracking-widest hover:bg-gray-50 rounded-2xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loadingAction}
                                    className="flex-[2] py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all disabled:opacity-50"
                                >
                                    {isAddModalOpen ? 'Crear Miembro' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
