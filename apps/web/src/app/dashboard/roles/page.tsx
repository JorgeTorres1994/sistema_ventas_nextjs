"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
    Shield, ShieldCheck, Lock, CheckCircle2, 
    X, Plus, Save, Trash2, Edit2, Search,
    ChevronRight, Settings
} from 'lucide-react';
import { getRoles, getPermissions, createRole, updateRole, deleteRole } from '@/lib/api';
import { toast } from 'sonner';

const moduleTranslations: Record<string, string> = {
    dashboard: 'Tablero / Resumen',
    pos: 'Terminal de Ventas (POS)',
    cash: 'Caja y Movimientos',
    sales: 'Ventas y Comprobantes',
    customers: 'Gestión de Clientes',
    products: 'Catálogo de Productos',
    categories: 'Categorías de Productos',
    inventory: 'Control de Inventario',
    suppliers: 'Gestión de Proveedores',
    purchases: 'Compras y Abastecimiento',
    reports: 'Reportes y Analítica',
    users: 'Gestión de Usuarios',
    roles: 'Roles y Seguridad',
    settings: 'Configuración General',
    expenses: 'Gastos y Egresos',
    credits: 'Créditos y Cobranzas',
    promotions: 'Promociones y Cupones',
    audit: 'Auditoría y Seguridad',
    quotations: 'Cotizaciones / Proformas',
    invoicing: 'Facturación Electrónica'
};

const SafeAvatar = ({ src, name }: { src?: string; name: string }) => {
    const [error, setError] = React.useState(false);
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005';
    
    const fullSrc = src ? (src.startsWith('http') ? src : `${apiUrl}${src}`) : null;

    if (error || !fullSrc) {
        return (
            <div className="w-full h-full bg-blue-50 flex items-center justify-center text-[10px] font-black text-blue-600 uppercase">
                {name?.charAt(0) || 'U'}
            </div>
        );
    }

    return (
        <img 
            src={fullSrc} 
            alt={name} 
            className="w-full h-full object-cover" 
            onError={() => setError(true)}
        />
    );
};

export default function RolesPage() {
    const router = useRouter();
    const [roles, setRoles] = useState<any[]>([]);
    const [permissions, setPermissions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    
    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedRole, setSelectedRole] = useState<any>(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        permissionIds: [] as string[]
    });
    const [loadingAction, setLoadingAction] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [rolesData, permsData] = await Promise.all([
                getRoles(),
                getPermissions()
            ]);
            setRoles(rolesData);
            setPermissions(permsData);
        } catch (error) {
            toast.error('Error al cargar datos de seguridad');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const loggedUser = JSON.parse(userStr);
            // Temporary check until backend permissions are fully enforced
            const roleName = typeof loggedUser.role === 'object' ? loggedUser.role?.name : loggedUser.role;
            if (roleName !== 'Administrador' && roleName !== 'ADMIN') {
                router.push('/dashboard');
                return;
            }
        } else {
            router.push('/login');
            return;
        }
        fetchData();
    }, [fetchData, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) return toast.error('El nombre del rol es obligatorio');
        if (formData.permissionIds.length === 0) return toast.error('Seleccione al menos un permiso');

        setLoadingAction(true);
        const toastId = toast.loading(isEditing ? 'Actualizando rol...' : 'Creando rol...');
        try {
            if (isEditing) {
                await updateRole(selectedRole.id, formData);
                toast.success('Rol actualizado correctamente', { id: toastId });
            } else {
                await createRole(formData);
                toast.success('Rol creado correctamente', { id: toastId });
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al guardar el rol', { id: toastId });
        } finally {
            setLoadingAction(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Está seguro de eliminar este rol? Esta acción no se puede deshacer si tiene usuarios asignados.')) return;
        
        const toastId = toast.loading('Eliminando rol...');
        try {
            await deleteRole(id);
            toast.success('Rol eliminado correctamente', { id: toastId });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al eliminar el rol', { id: toastId });
        }
    };

    const openCreateModal = () => {
        setIsEditing(false);
        setSelectedRole(null);
        setFormData({ name: '', description: '', permissionIds: [] });
        setIsModalOpen(true);
    };

    const openEditModal = (role: any) => {
        setIsEditing(true);
        setSelectedRole(role);
        setFormData({
            name: role.name,
            description: role.description || '',
            permissionIds: role.permissions.map((rp: any) => rp.permissionId)
        });
        setIsModalOpen(true);
    };

    const togglePermission = (id: string) => {
        setFormData(prev => {
            const exists = prev.permissionIds.includes(id);
            if (exists) {
                return { ...prev, permissionIds: prev.permissionIds.filter(pid => pid !== id) };
            } else {
                return { ...prev, permissionIds: [...prev.permissionIds, id] };
            }
        });
    };

    const toggleModule = (moduleName: string, actions: any[]) => {
        const modulePermIds = actions.map(a => a.id);
        const allSelected = modulePermIds.every(id => formData.permissionIds.includes(id));
        
        if (allSelected) {
            setFormData(prev => ({
                ...prev,
                permissionIds: prev.permissionIds.filter(id => !modulePermIds.includes(id))
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                permissionIds: Array.from(new Set([...prev.permissionIds, ...modulePermIds]))
            }));
        }
    };

    // Group permissions by module
    const groupedPermissions = permissions.reduce((acc: any, curr: any) => {
        if (!acc[curr.module]) acc[curr.module] = [];
        acc[curr.module].push(curr);
        return acc;
    }, {});

    const filteredRoles = roles.filter(role => 
        role.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-screen bg-[#F9FAFB] overflow-hidden font-sans text-[#111827]">
            <Sidebar />
            
            <div className="flex-1 flex flex-col ml-64 overflow-hidden">
                <TopBar />
                
                <main className="flex-1 overflow-y-auto bg-[#F9FAFB] p-8">
                    <div className="max-w-7xl mx-auto">
                        
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-tight mb-2">Roles y Permisos</h1>
                                <p className="text-[#6B7280]">Defina niveles de acceso granulares para cada módulo del sistema.</p>
                            </div>
                            
                            <button 
                                onClick={openCreateModal}
                                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95"
                            >
                                <Plus className="w-5 h-5" />
                                Nuevo Rol de Usuario
                            </button>
                        </div>

                        {/* Roles Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm animate-pulse">
                                        <div className="h-6 w-32 bg-gray-100 rounded mb-4"></div>
                                        <div className="h-4 w-48 bg-gray-50 rounded mb-8"></div>
                                        <div className="flex gap-2">
                                            <div className="h-8 w-8 bg-gray-50 rounded-lg"></div>
                                            <div className="h-8 w-8 bg-gray-50 rounded-lg"></div>
                                        </div>
                                    </div>
                                ))
                            ) : filteredRoles.map((role) => (
                                <div key={role.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all group relative">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="p-3 bg-blue-50 rounded-2xl">
                                            <Shield className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div className="flex gap-2 transition-opacity">
                                            <button 
                                                onClick={() => openEditModal(role)}
                                                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(role.id)}
                                                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-xl font-black text-gray-900 mb-2">{role.name}</h3>
                                    <p className="text-sm text-gray-400 mb-6 leading-relaxed min-h-[40px] line-clamp-2">
                                        {role.description || 'Sin descripción detallada.'}
                                    </p>
                                    
                                    <div className="pt-6 border-t border-gray-50 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex -space-x-2.5">
                                                {role.users && role.users.length > 0 ? (
                                                    role.users.map((user: any) => (
                                                        <div key={user.id} className="w-8 h-8 rounded-full bg-white border-2 border-white flex items-center justify-center overflow-hidden shadow-sm group-hover:scale-110 transition-transform duration-500">
                                                            <SafeAvatar src={user.avatarUrl} name={user.name} />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[10px] font-bold text-gray-300 uppercase italic">
                                                        0
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-gray-900 leading-none">
                                                    {role._count.users} MIEMBROS
                                                </span>
                                                <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">Asignados</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50/50 rounded-xl text-[9px] font-black text-blue-600 uppercase tracking-widest">
                                            <Lock className="w-3 h-3" />
                                            {role.permissions.length} Permisos
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>

            {/* Modal de Rol */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-200">
                        <div className="px-10 pt-10 pb-6 border-b border-gray-50 flex items-center justify-between">
                            <div>
                                <h3 className="text-2xl font-black mb-1">{isEditing ? 'Editar Nivel de Acceso' : 'Crear Nuevo Rol'}</h3>
                                <p className="text-sm text-gray-400">Seleccione los módulos y acciones permitidas para este perfil.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-gray-50 rounded-2xl transition-colors">
                                <X className="w-6 h-6 text-gray-400" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-y-auto p-10 space-y-10 scrollbar-hide">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Nombre del Rol</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-700 shadow-sm"
                                            placeholder="ej. Supervisor de Almacén"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">Descripción Breve</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-6 py-4 bg-gray-50 border border-transparent rounded-[20px] focus:bg-white focus:border-blue-500 transition-all outline-none font-bold text-gray-700 shadow-sm"
                                            placeholder="Describe las responsabilidades..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {/* Permissions Matrix */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h4 className="text-[11px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Settings className="w-4 h-4 text-blue-600" /> Matriz de Permisos por Módulo
                                        </h4>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded bg-blue-600"></div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Activo</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded bg-gray-100 border border-gray-200"></div>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase">Inactivo</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(groupedPermissions).map(([moduleName, actions]: [string, any]) => (
                                            <div key={moduleName} className="bg-white border border-gray-100 rounded-3xl p-5 hover:border-blue-200 transition-all group/row relative overflow-hidden">
                                                <div className="flex items-center justify-between gap-4 mb-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                            <ShieldCheck className="w-4 h-4" />
                                                        </div>
                                                        <h5 className="font-black text-gray-900 text-[11px] uppercase tracking-wider">{moduleTranslations[moduleName] || moduleName}</h5>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleModule(moduleName, actions)}
                                                        className="p-1.5 text-gray-300 hover:text-blue-600 transition-colors"
                                                        title="Marcar todo el módulo"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </button>
                                                </div>

                                                <div className="flex flex-wrap gap-2">
                                                    {actions.map((action: any) => {
                                                        const isSelected = formData.permissionIds.includes(action.id);
                                                        return (
                                                            <button
                                                                key={action.id}
                                                                type="button"
                                                                onClick={() => togglePermission(action.id)}
                                                                className={`flex-1 min-w-[70px] py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border-2 transition-all ${
                                                                    isSelected 
                                                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-100' 
                                                                    : 'bg-white border-gray-100 text-gray-400 hover:border-gray-200'
                                                                }`}
                                                            >
                                                                {action.action === 'read' ? 'Ver' : 
                                                                 action.action === 'create' ? 'Crear' :
                                                                 action.action === 'update' ? 'Edit' : 'Borr'}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 py-8 bg-gray-50/50 border-t border-gray-50 flex gap-4">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-4 text-gray-500 font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 rounded-[22px] transition-colors"
                                >
                                    Cancelar Operación
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loadingAction}
                                    className="flex-[2] py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-[22px] shadow-xl shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                                >
                                    {loadingAction ? <span className="animate-spin text-lg">⌛</span> : <Save className="w-5 h-5" />}
                                    {isEditing ? 'Actualizar Roles y Permisos' : 'Confirmar Nuevo Rol'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
