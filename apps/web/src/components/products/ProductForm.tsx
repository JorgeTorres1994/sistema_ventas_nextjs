import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { 
  Upload, Info, ToggleRight, ToggleLeft, 
  ChevronDown, Save, Loader2, Link as LinkIcon 
} from 'lucide-react';
import api, { createProduct, updateProduct, uploadProductImage, getActiveCategories } from '@/lib/api';

interface ProductFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export default function ProductForm({ initialData, isEdit }: ProductFormProps) {
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    categoryId: initialData?.categoryId || '',
    price: initialData?.price ? Number(initialData.price) : '',
    purchasePrice: initialData?.purchasePrice ? Number(initialData.purchasePrice) : '',
    stock: initialData?.stock !== undefined ? Number(initialData.stock) : '',
    imageUrl: initialData?.imageUrl || '',
    isActive: initialData?.isActive !== false,
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch ONLY active categories for products
    getActiveCategories()
       .then(data => setCategories(data))
       .catch(err => console.error("No se pudieron cargar las categorías", err));
  }, []);

  // Update initialData when it loads async (if edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        categoryId: initialData.categoryId || '',
        price: initialData.price ? Number(initialData.price) : '',
        purchasePrice: initialData.purchasePrice ? Number(initialData.purchasePrice) : '',
        stock: initialData.stock !== undefined ? Number(initialData.stock) : '',
        imageUrl: initialData.imageUrl || '',
        isActive: initialData.isActive !== false,
      });
    }
  }, [initialData]);

  const calculateMargin = () => {
    const s = Number(formData.price) || 0;
    const p = Number(formData.purchasePrice) || 0;
    if (s <= 0 || p < 0 || p >= s) return 0;
    return (((s - p) / s) * 100).toFixed(0);
  };

  const margin = calculateMargin();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El tamaño de la imagen debe ser inferior a 5MB');
      return;
    }

    setUploading(true);
    const uploadId = toast.loading('Subiendo imagen...');
    
    try {
      const res = await uploadProductImage(file);
      setFormData({ ...formData, imageUrl: res.url });
      toast.success('Imagen subida correctamente', { id: uploadId });
    } catch (err) {
      toast.error('Error al subir la imagen. Inténtelo de nuevo.', { id: uploadId });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validaciones avanzadas
    if (!formData.name.trim()) {
      toast.error('El nombre del producto es obligatorio');
      return;
    }
    if (Number(formData.price) <= 0) {
      toast.error('El precio de venta debe ser mayor a 0');
      return;
    }
    if (Number(formData.stock) < 0) {
      toast.error('El stock no puede ser negativo');
      return;
    }

    setLoading(true);
    const processId = toast.loading(isEdit ? 'Actualizando producto...' : 'Creando producto...');

    try {
      if (isEdit && initialData?.id) {
        await updateProduct(initialData.id, formData);
        toast.success('Producto actualizado exitosamente', { id: processId });
      } else {
        await createProduct(formData);
        toast.success('Producto creado exitosamente', { id: processId });
      }
      setTimeout(() => {
        router.push('/dashboard/products');
        router.refresh();
      }, 500);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Error al guardar el producto.';
      toast.error(msg, { id: processId });
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="h-full flex flex-col bg-card">
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 scrollbar-hide">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-10 max-w-6xl mx-auto">
          
          {/* Left Column: Image & Tips */}
          <div className="col-span-1 space-y-6">
             <div className="bg-surface-low/50 rounded-[32px] p-6 border border-outline-variant/30">
                <h3 className="text-xs font-black text-on-surface-variant uppercase tracking-widest mb-6">Imagen del Producto</h3>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageUpload}
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full aspect-square sm:aspect-auto sm:h-64 bg-card border-2 border-dashed ${formData.imageUrl ? 'border-transparent' : 'border-outline-variant hover:border-primary/40'} rounded-[24px] flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group shadow-inner`}
                >
                  {uploading ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                      <p className="text-[10px] font-black text-primary uppercase tracking-widest">Subiendo...</p>
                    </div>
                  ) : formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-center px-6">
                      <div className="w-14 h-14 bg-surface-low rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-on-surface-variant/40 group-hover:text-primary transition-colors">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-black text-foreground mb-1">Subir Imagen</p>
                      <p className="text-[9px] font-bold text-on-surface-variant/40 uppercase tracking-widest leading-relaxed">PNG, JPG o WEBP<br/>Hasta 5MB</p>
                    </div>
                  )}
                  {formData.imageUrl && (
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                      <p className="text-white font-black text-xs uppercase tracking-widest bg-primary/20 px-4 py-2 rounded-xl border border-white/20">Cambiar Imagen</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 py-3.5 bg-card border border-outline-variant rounded-2xl text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:bg-surface-low transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                  >
                     <Upload className="w-4 h-4" /> Subir Nueva
                  </button>
                </div>

                <div className="flex items-center gap-4 my-6">
                  <div className="h-px bg-outline-variant/30 flex-1"></div>
                  <span className="text-[9px] font-black text-on-surface-variant/30 uppercase tracking-widest">O USA URL</span>
                  <div className="h-px bg-outline-variant/30 flex-1"></div>
                </div>

                <div className="relative group">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/30 group-focus-within:text-primary transition-colors" />
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full pl-12 pr-4 py-4 bg-card border border-outline-variant rounded-2xl focus:border-primary/40 transition-all outline-none text-sm font-bold text-foreground placeholder:text-on-surface-variant/20 shadow-sm"
                  />
                </div>
             </div>

             <div className="bg-primary/5 rounded-[32px] p-6 border border-primary/10 hidden sm:block">
               <h4 className="text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-2 mb-4">
                 <Info className="w-4 h-4" /> Recomendaciones
               </h4>
               <ul className="space-y-4">
                 <li className="flex items-start gap-3 text-xs font-bold text-on-surface-variant/80">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                   Fondos limpios y alta resolución.
                 </li>
                 <li className="flex items-start gap-3 text-xs font-bold text-on-surface-variant/80">
                   <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                   Descripciones técnicas precisas.
                 </li>
               </ul>
             </div>
          </div>

          {/* Right Column: Details */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
             
             {/* Header Status Toggle */}
             <div className="bg-surface-low/30 rounded-[32px] p-6 sm:p-8 border border-outline-variant/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div>
                     <h2 className="text-xl font-black text-foreground tracking-tight">Estado de Comercialización</h2>
                     <p className="text-xs font-bold text-on-surface-variant mt-1">Control de visibilidad en el punto de venta</p>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                    className="flex items-center gap-4 bg-card px-5 py-3 rounded-2xl border border-outline-variant shadow-sm active:scale-95 transition-all self-start sm:self-auto"
                  >
                    <div className="relative">
                      {formData.isActive ? (
                        <div className="w-10 h-6 bg-emerald-500 rounded-full flex items-center justify-end px-1 transition-colors">
                           <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      ) : (
                        <div className="w-10 h-6 bg-on-surface-variant/20 rounded-full flex items-center justify-start px-1 transition-colors">
                           <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
                        </div>
                      )}
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${formData.isActive ? 'text-emerald-500' : 'text-on-surface-variant'}`}>
                      {formData.isActive ? 'Activo' : 'Pausado'}
                    </span>
                  </button>
                </div>
             </div>

             {/* Basic Info */}
             <div className="bg-card space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Nombre del Producto <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Reloj Minimalista de Titanio"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-6 py-4 bg-surface-low border border-transparent rounded-[20px] focus:bg-card focus:border-primary/40 transition-all outline-none font-black text-foreground text-sm shadow-inner placeholder:text-on-surface-variant/20"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Descripción Técnica</label>
                  <textarea
                    rows={4}
                    placeholder="Detalle los materiales, dimensiones y características..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-6 py-4 bg-surface-low border border-transparent rounded-[20px] focus:bg-card focus:border-primary/40 transition-all outline-none font-bold text-foreground text-sm shadow-inner placeholder:text-on-surface-variant/20 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Categoría</label>
                    <div className="relative group">
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                        className="w-full px-6 py-4 appearance-none bg-surface-low border border-transparent rounded-[20px] focus:bg-card focus:border-primary/40 transition-all outline-none font-black text-foreground text-sm shadow-inner cursor-pointer"
                      >
                        <option value="">Seleccionar Categoría</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant/40 pointer-events-none group-focus-within:text-primary" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-3">Marca Corporativa</label>
                    <input
                      type="text"
                      placeholder="ej. Sony, Nike"
                      className="w-full px-6 py-4 bg-surface-low border border-transparent rounded-[20px] focus:bg-card focus:border-primary/40 transition-all outline-none font-black text-foreground text-sm shadow-inner placeholder:text-on-surface-variant/20"
                    />
                  </div>
                </div>
             </div>

             {/* Inventory & Pricing */}
             <div className="bg-surface-low/20 rounded-[40px] p-6 sm:p-10 border border-outline-variant/30 space-y-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                    <Save className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">Finanzas e Inventario</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Precio de Venta (S/) <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full px-6 py-4 bg-card border border-outline-variant rounded-[20px] focus:border-primary/40 transition-all outline-none font-black text-foreground text-lg shadow-sm"
                      />
                    </div>
                    {Number(margin) > 0 && (
                      <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-lg text-[9px] font-black uppercase tracking-widest">
                         Margen: {margin}%
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Costo de Adquisición (S/)</label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                        className="w-full px-6 py-4 bg-card border border-outline-variant rounded-[20px] focus:border-primary/40 transition-all outline-none font-black text-foreground text-lg shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                    <label className="block text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Unidades en Almacén <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-full sm:w-1/2 px-6 py-4 bg-card border border-outline-variant rounded-[20px] focus:border-primary/40 transition-all outline-none font-black text-foreground text-lg shadow-sm"
                    />
                    {isEdit && (
                      <p className="text-[10px] font-bold text-on-surface-variant/40 uppercase tracking-widest mt-3">
                        El ajuste manual impactará directamente el Kardex.
                      </p>
                    )}
                </div>
             </div>

          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="px-6 py-6 sm:px-10 sm:py-8 bg-card border-t border-outline-variant/30 flex flex-col sm:flex-row items-center justify-between gap-6 shrink-0 relative z-20 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
        <div className="hidden sm:flex items-center gap-3 text-[10px] font-black text-on-surface-variant/30 uppercase tracking-widest">
          {isEdit ? (
            <>
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizado con inventario
            </>
          ) : (
             <>
               <div className="w-2 h-2 rounded-full bg-amber-500" />
               Borrador temporal
             </>
          )}
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button 
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="flex-1 sm:flex-none px-8 py-4 bg-surface-low border border-outline-variant/50 rounded-[22px] text-[11px] font-black text-on-surface-variant uppercase tracking-widest hover:bg-card transition-all disabled:opacity-50 active:scale-95 shadow-sm"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="flex-1 sm:flex-none px-10 py-4 bg-primary text-on-primary rounded-[22px] text-[11px] font-black uppercase tracking-widest hover:opacity-90 shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50 active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
            ) : (
              <Save className="w-5 h-5" />
            )}
            {isEdit ? 'Actualizar Producto' : 'Guardar Producto'}
          </button>
        </div>
      </div>
    </form>
  );
}
