"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import TopBar from '@/components/layout/TopBar';
import { 
    Shield, ShieldCheck, Lock, CheckCircle2, 
    X, Plus, Save, Trash2, Edit2, Search,
    ChevronRight, Settings, XCircle
} from 'lucide-react';
import { getRoles, getPermissions, createRole, updateRole, deleteRole, toggleRoleStatus } from '@/lib/api';
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
            <div className="w-full h-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase">
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

    const handleToggleStatus = async (id: string) => {
        const toastId = toast.loading('Actualizando estado del rol...');
        try {
            await toggleRoleStatus(id);
            toast.success('Estado actualizado correctamente', { id: toastId });
            fetchData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error al actualizar el estado', { id: toastId });
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
        <div className="flex h-screen bg-background overflow-hidden font-sans text-foreground transition-colors">
            <Sidebar />
            
            <div className="flex-1 flex flex-col lg:ml-64 overflow-hidden">
                <TopBar />
                
                <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-8 scrollbar-hide">
                    <div className="max-w-7xl mx-auto">
                        
                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 sm:mb-12">
                            <div>
                                <nav className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-2">
                                    <span>Seguridad</span><span>/</span>
                                    <span className="text-on-surface-variant">Roles</span>
                                </nav>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tighter mb-2">Seguridad y Privilegios</h1>
                                <p className="text-xs sm:text-sm text-on-surface-variant font-medium">Defina niveles de acceso granulares para cada módulo del ecosistema Nexus.</p>
                            </div>
                            
                            <button 
                                onClick={openCreateModal}
                                className="flex items-center justify-center gap-3 px-8 py-4 bg-primary text-on-primary rounded-[22px] text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-primary/20 active:scale-95 w-full md:w-auto shrink-0"
                            >
                                <Plus className="w-5 h-5" />
                                Nuevo Perfil de Acceso
                            </button>
                        </div>

                        {/* Roles Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <div key={i} className="bg-card rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-outline-variant shadow-sm animate-pulse">
                                        <div className="h-10 w-10 bg-surface-low rounded-2xl mb-8"></div>
                                        <div className="h-6 w-32 bg-surface-low rounded mb-4"></div>
                                        <div className="h-4 w-48 bg-surface-low rounded mb-10 opacity-50"></div>
                                        <div className="flex gap-2">
                                            <div className="h-10 w-24 bg-surface-low rounded-xl"></div>
                                        </div>
                                    </div>
                                ))
                            ) : filteredRoles.map((role) => (
                                <div key={role.id} className={`bg-card rounded-[32px] sm:rounded-[40px] p-6 sm:p-10 border border-outline-variant shadow-sm hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all group relative border-t-4 border-t-primary/20 flex flex-col h-full ${!role.isActive ? 'opacity-60 grayscale' : ''}`}>
                                    <div className="flex justify-between items-start mb-8">
                                        <div className={`p-4 rounded-[22px] border ${role.isActive ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-surface-low border-outline-variant/30 text-on-surface-variant'}`}>
                                            <Shield className="w-7 h-7" />
                                        </div>
                                        <div className="flex gap-2 sm:gap-3 transition-all">
                                            <button 
                                                onClick={() => openEditModal(role)}
                                                className="p-2.5 sm:p-3 bg-primary/10 text-primary hover:bg-primary hover:text-on-primary rounded-xl sm:rounded-2xl transition-all active:scale-90"
                                                title="Editar Perfil"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleToggleStatus(role.id)}
                                                className={`p-2.5 sm:p-3 rounded-xl sm:rounded-2xl transition-all active:scale-90 ${role.isActive ? 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-white' : 'bg-primary/10 text-primary hover:bg-primary hover:text-on-primary'}`}
                                                title={role.isActive ? "Desactivar Perfil" : "Activar Perfil"}
                                            >
                                                <XCircle className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-2xl font-black text-foreground mb-3 tracking-tighter">{role.name}</h3>
                                    <p className="text-[13px] font-medium text-on-surface-variant opacity-60 mb-10 leading-relaxed min-h-[48px] line-clamp-2">
                                        {role.description || 'Perfil de acceso estándar sin descripción especificada.'}
                                    </p>
                                    
                                    <div className="pt-8 mt-auto border-t border-outline-variant/30 flex items-center justify-between">
                                        <div className="flex items-center gap-3 sm:gap-4">
                                            <div className="flex -space-x-3">
                                                {role.users && role.users.length > 0 ? (
                                                    role.users.slice(0, 3).map((user: any) => (
                                                        <div key={user.id} className="w-9 h-9 rounded-full bg-card border-2 border-card flex items-center justify-center overflow-hidden shadow-sm transition-transform duration-500 hover:scale-110 hover:z-10 ring-1 ring-outline-variant/30">
                                                            <SafeAvatar src={user.avatarUrl} name={user.name} />
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-surface-low border-2 border-card flex items-center justify-center text-[10px] font-black text-on-surface-variant/20 uppercase tracking-tighter">
                                                        0
                                                    </div>
                                                )}
                                                {role._count.users > 3 && (
                                                    <div className="w-9 h-9 rounded-full bg-surface-low border-2 border-card flex items-center justify-center text-[10px] font-black text-on-surface-variant/60 uppercase">
                                                        +{role._count.users - 3}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black text-foreground leading-none uppercase tracking-widest">
                                                    {role._count.users} {role._count.users === 1 ? 'MIEMBRO' : 'MIEMBROS'}
                                                </span>
                                                <span className="text-[8px] font-black text-on-surface-variant/40 uppercase tracking-[0.2em] mt-1">Activos</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                            <Lock className="w-3.5 h-3.5" />
                                            {role.permissions.length}
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
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/40 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-300">
                    <div className="bg-card rounded-[24px] sm:rounded-[32px] shadow-[0_40px_100px_rgba(0,0,0,0.4)] w-full max-w-4xl max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col border border-outline-variant animate-in zoom-in-95 duration-300">
                        <div className="px-5 sm:px-8 pt-6 sm:pt-8 pb-4 border-b border-outline-variant/30 flex items-center justify-between bg-surface-low/30 shrink-0">
                            <div>
                                <h3 className="text-xl sm:text-2xl font-black tracking-tighter mb-1 sm:mb-1.5">{isEditing ? 'Sincronizar Privilegios' : 'Generar Nuevo Rol'}</h3>
                                <p className="text-[9px] sm:text-[10px] font-black text-on-surface-variant uppercase tracking-[0.3em] opacity-60">Configuración avanzada de seguridad Nexus</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 sm:p-3 bg-surface-low text-on-surface-variant hover:text-foreground rounded-[16px] sm:rounded-[20px] transition-all active:scale-95">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleSave} className="flex-1 overflow-hidden flex flex-col">
                            <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6 sm:space-y-8 scrollbar-hide">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Etiqueta del Perfil</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-5 py-4 bg-surface-low border border-transparent rounded-[16px] focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-foreground shadow-inner text-sm"
                                            placeholder="ej. Arquitecto de Almacén"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[9px] font-black text-on-surface-variant uppercase tracking-[0.3em] ml-2">Contexto de Operación</label>
                                        <input 
                                            type="text" 
                                            className="w-full px-5 py-4 bg-surface-low border border-transparent rounded-[16px] focus:bg-card focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all outline-none font-black text-foreground shadow-inner text-sm"
                                            placeholder="Responsabilidades asignadas..."
                                            value={formData.description}
                                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        />
                                    </div>
                                </div>

                                {/* Permissions Matrix */}
                                <div className="space-y-8">
                                    <div className="flex items-center justify-between border-b border-outline-variant/30 pb-4">
                                        <h4 className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.4em] flex items-center gap-3">
                                            <Settings className="w-5 h-5 text-primary" /> Matriz de Permisos Granulares
                                        </h4>
                                        <div className="flex items-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded bg-primary"></div>
                                                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Autorizado</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded bg-surface-low border border-outline-variant/30"></div>
                                                <span className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">Denegado</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                                        {Object.entries(groupedPermissions).map(([moduleName, actions]: [string, any]) => (
                                            <div key={moduleName} className="bg-surface-low/20 border border-outline-variant/30 rounded-[24px] sm:rounded-[32px] p-5 sm:p-7 hover:border-primary/30 transition-all group/row relative overflow-hidden">
                                                <div className="flex items-center justify-between gap-4 mb-5 sm:mb-6">
                                                    <div className="flex items-center gap-3 sm:gap-4">
                                                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-[12px] sm:rounded-2xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                                                        </div>
                                                        <h5 className="font-black text-foreground text-[10px] sm:text-[11px] uppercase tracking-[0.2em]">{moduleTranslations[moduleName] || moduleName}</h5>
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => toggleModule(moduleName, actions)}
                                                        className="p-2 text-on-surface-variant/20 hover:text-primary transition-colors active:scale-90"
                                                        title="Marcar todo el módulo"
                                                    >
                                                        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                                    </button>
                                                </div>

                                                <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:gap-3">
                                                    {actions.map((action: any) => {
                                                        const isSelected = formData.permissionIds.includes(action.id);
                                                        return (
                                                            <button
                                                                key={action.id}
                                                                type="button"
                                                                onClick={() => togglePermission(action.id)}
                                                                className={`flex-1 sm:min-w-[80px] py-2.5 sm:py-3 rounded-[12px] sm:rounded-2xl text-[8px] sm:text-[9px] font-black uppercase tracking-widest border transition-all active:scale-95 ${
                                                                    isSelected 
                                                                    ? 'bg-primary border-primary text-on-primary shadow-lg shadow-primary/20' 
                                                                    : 'bg-card border-outline-variant/30 text-on-surface-variant/40 hover:border-primary/30'
                                                                }`}
                                                            >
                                                                {action.action === 'read' ? 'Vista' : 
                                                                 action.action === 'create' ? 'Alta' :
                                                                 action.action === 'update' ? 'Modif' : 'Baja'}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="px-5 sm:px-8 py-4 sm:py-6 bg-surface-low/50 border-t border-outline-variant/30 flex flex-row gap-3 sm:gap-6 shrink-0 pb-5 sm:pb-8">
                                <button 
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3.5 sm:py-4 bg-surface-low sm:bg-transparent border sm:border-transparent border-outline-variant/30 text-on-surface-variant font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:text-foreground hover:bg-outline-variant/10 rounded-[16px] transition-colors active:scale-95"
                                >
                                    Cancelar Operación
                                </button>
                                <button 
                                    type="submit"
                                    disabled={loadingAction}
                                    className="flex-[2] py-3.5 sm:py-4 bg-primary text-on-primary font-black text-[9px] sm:text-[10px] uppercase tracking-widest rounded-[16px] shadow-xl shadow-primary/30 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2 sm:gap-3"
                                >
                                    {loadingAction ? (
                                        <div className="w-4 h-4 border-2 border-on-primary border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        <Save className="w-4 h-4 sm:w-5 sm:h-5" />
                                    )}
                                    {isEditing ? 'Sincronizar' : 'Desplegar Rol'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

