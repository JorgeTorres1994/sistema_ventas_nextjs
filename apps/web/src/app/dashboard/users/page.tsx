'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { getUsers, createUser, updateUser, toggleUserStatus } from '@/lib/api';
import { 
    Users, 
    UserPlus, 
    Search, 
    Filter, 
    MoreVertical, 
    Shield, 
    UserCheck,
    UserX,
    Mail,
    Calendar,
    ArrowUpDown,
    Download,
    LogOut,
    ShieldCheck,
    Key,
    User as UserIcon,
    AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    // Modal states
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'USER' });
    const [formError, setFormError] = useState('');

    // Metrics (Static for UI fidelity)
    const activeStaff = 42;
    const pendingAccess = 5;

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getUsers({
                search: searchQuery,
                role: roleFilter || undefined,
                isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined
            });
            setUsers(data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, roleFilter, statusFilter]);

    useEffect(() => {
        // Simple security check
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const loggedUser = JSON.parse(userStr);
            if (loggedUser.role !== 'ADMIN') {
                router.push('/dashboard');
                return;
            }
        } else {
            router.push('/login');
            return;
        }

        const timer = setTimeout(() => fetchUsers(), 300);
        return () => clearTimeout(timer);
    }, [fetchUsers]);

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        try {
            await createUser(formData);
            setIsAddModalOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'USER' });
            fetchUsers();
        } catch (error: any) {
            setFormError(error.response?.data?.message || 'Failed to create user');
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        try {
            await updateUser(selectedUser.id, {
                name: formData.name,
                role: formData.role
            });
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            setFormError(error.response?.data?.message || 'Failed to update user');
        }
    };

    const handleToggleStatus = async (id: string) => {
        try {
            await toggleUserStatus(id);
            fetchUsers();
        } catch (error) {
            console.error('Failed to toggle status:', error);
        }
    };

    const openEditModal = (user: any) => {
        setSelectedUser(user);
        setFormData({ name: user.name, email: user.email, password: '', role: user.role });
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
                                <p className="text-[#6B7280]">Gestione niveles de acceso y monitoree la actividad del personal de la terminal de servicio.</p>
                            </div>
                            
                            <div className="flex gap-4">
                                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4 min-w-[200px]">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                                        <Users className="text-blue-600 w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Personal Activo</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold">{users.filter(u => u.isActive).length}</span>
                                            <span className="text-xs font-semibold text-green-600">+3 este mes</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm flex items-center gap-4 min-w-[200px]">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                                        <UserIcon className="text-gray-400 w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">Miembros Totales</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-2xl font-bold">{users.length}</span>
                                            <span className="text-xs font-semibold text-blue-600">Sincronizando...</span>
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
                                        placeholder="Buscar miembros del equipo..."
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
                                        <option value="ADMIN">Admin</option>
                                        <option value="USER">Usuario</option>
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
                            
                            <div className="flex gap-3">
                                <button className="flex items-center gap-2 px-4 py-2.5 bg-gray-50 text-gray-600 border border-gray-100 rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">
                                    <Download className="w-4 h-4" />
                                    Exportar Lista
                                </button>
                                <button 
                                    onClick={() => {
                                        setFormData({ name: '', email: '', password: '', role: 'USER' });
                                        setIsAddModalOpen(true);
                                    }}
                                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
                                >
                                    <UserPlus className="w-4 h-4" />
                                    Agregar Usuario
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-3xl border border-[#E5E7EB] shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/50">
                                        <th className="px-8 py-5 text-[11px] font-bold text-[#6B7280] uppercase tracking-widest border-b border-[#E5E7EB]">Nombre del Miembro</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-[#6B7280] uppercase tracking-widest border-b border-[#E5E7EB]">Rol</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-[#6B7280] uppercase tracking-widest border-b border-[#E5E7EB]">Estado</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-[#6B7280] uppercase tracking-widest border-b border-[#E5E7EB]">Fecha Creación</th>
                                        <th className="px-8 py-5 text-[11px] font-bold text-[#6B7280] uppercase tracking-widest border-b border-[#E5E7EB] text-right text-gray-900">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {isLoading ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                                            </td>
                                        </tr>
                                    ) : users.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="px-8 py-20 text-center text-gray-400">
                                                No se encontraron miembros del equipo que coincidan con sus criterios.
                                            </td>
                                        </tr>
                                    ) : (
                                        users.map((user) => (
                                            <tr key={user.id} className="group hover:bg-gray-50/50 transition-colors border-b border-gray-50 last:border-0">
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold uppercase text-xs border-2 border-white shadow-sm ring-1 ring-blue-50">
                                                            {user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-gray-900">{user.name}</div>
                                                            <div className="text-xs text-gray-400 font-medium">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                                                        user.role === 'ADMIN' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                                                    }`}>
                                                        {user.role}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                                                        <span className={`text-xs font-bold ${user.isActive ? 'text-green-700' : 'text-gray-400'}`}>
                                                            {user.isActive ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5">
                                                    <div className="text-sm font-medium text-gray-500">
                                                        {new Date(user.createdAt).toLocaleDateString()}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button 
                                                            onClick={() => openEditModal(user)}
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar Permisos"
                                                        >
                                                            <Shield className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleToggleStatus(user.id)}
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

            {/* Modals Implementation skipped for brevity, implementing critical parts */}
            {(isAddModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/20 animate-in zoom-in-95 duration-200">
                        <div className="px-8 pt-8 pb-4">
                            <h3 className="text-xl font-bold mb-2">{isAddModalOpen ? 'Crear Nuevo Miembro' : 'Editar Detalles del Miembro'}</h3>
                            <p className="text-sm text-gray-400">Asegúrese de que los detalles de la cuenta coincidan con el registro de la terminal.</p>
                        </div>
                        
                        <form onSubmit={isAddModalOpen ? handleCreateUser : handleUpdateUser} className="p-8 space-y-5">
                            {formError && (
                                <div className="bg-rose-50 text-rose-600 p-3 rounded-xl text-xs font-bold flex gap-2 items-center">
                                    <AlertCircle className="w-4 h-4" />
                                    {formError}
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Nombre del Miembro</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                    placeholder="Ingrese nombre completo"
                                    required
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>

                            {isAddModalOpen && (
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Correo de Trabajo</label>
                                    <input 
                                        type="email" 
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                        placeholder="usuario@lumenledger.com"
                                        required
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                    />
                                </div>
                            )}

                            {isAddModalOpen && (
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Contraseña Temporal</label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 w-4 h-4" />
                                        <input 
                                            type="password" 
                                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                                            placeholder="••••••••"
                                            required={isAddModalOpen}
                                            value={formData.password}
                                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                                        />
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Rol del Sistema</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, role: 'ADMIN'})}
                                        className={`px-4 py-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.role === 'ADMIN' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                                    >
                                        <ShieldCheck className={`w-5 h-5 ${formData.role === 'ADMIN' ? 'text-blue-600' : 'text-gray-300'}`} />
                                        <span className="text-xs font-bold">Admin</span>
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setFormData({...formData, role: 'USER'})}
                                        className={`px-4 py-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${formData.role === 'USER' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 bg-gray-50 text-gray-400'}`}
                                    >
                                        <UserIcon className={`w-5 h-5 ${formData.role === 'USER' ? 'text-white' : 'text-gray-300'}`} />
                                        <span className="text-xs font-bold">Usuario</span>
                                    </button>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button 
                                    type="button"
                                    onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }}
                                    className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-2xl transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button 
                                    type="submit"
                                    className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-colors"
                                >
                                    {isAddModalOpen ? 'Crear Cuenta' : 'Guardar Cambios'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

