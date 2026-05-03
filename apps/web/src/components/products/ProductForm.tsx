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
    <form onSubmit={handleSubmit} className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl">
          
          {/* Left Column: Image & Tips */}
          <div className="col-span-1 space-y-6">
             <div>
                <h3 className="text-sm font-black text-gray-900 mb-4">Imagen del Producto</h3>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageUpload}
                />

                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`w-full aspect-square bg-indigo-50/30 border-2 border-dashed ${formData.imageUrl ? 'border-transparent' : 'border-indigo-100 hover:border-indigo-300'} rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all relative overflow-hidden group`}
                >
                  {uploading ? (
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  ) : formData.imageUrl ? (
                    <img src={formData.imageUrl} alt="Vista previa" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center mb-4 text-gray-400 group-hover:text-indigo-600 transition-colors">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-black text-gray-700 text-center px-6">Click para subir imagen del producto</p>
                      <p className="text-[10px] font-bold text-gray-400 mt-2">PNG, JPG o WEBP (Máx 5MB)</p>
                    </>
                  )}
                  {formData.imageUrl && (
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <p className="text-white font-bold text-sm">Cambiar Imagen</p>
                    </div>
                  )}
                </div>

                <button 
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full mt-4 py-3 bg-white border border-gray-100 shadow-sm rounded-xl text-sm font-black text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all"
                >
                   <Upload className="w-4 h-4" /> Subir Nueva
                </button>

                <div className="flex items-center gap-4 my-4">
                  <div className="h-px bg-gray-100 flex-1"></div>
                  <span className="text-xs font-bold text-gray-400">O USA URL</span>
                  <div className="h-px bg-gray-100 flex-1"></div>
                </div>

                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                  <input
                    type="url"
                    placeholder="https://ejemplo.com/imagen.jpg"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 shadow-sm rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none text-sm font-medium text-gray-900"
                  />
                </div>
             </div>

             <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
               <h4 className="text-sm font-black text-gray-900 flex items-center gap-2 mb-4">
                 <Info className="w-4 h-4 text-gray-400" /> Consejos Rápidos
               </h4>
               <ul className="space-y-3">
                 <li className="flex items-start gap-2 text-xs font-semibold text-gray-600">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                   Use imágenes de alta resolución con fondos limpios.
                 </li>
                 <li className="flex items-start gap-2 text-xs font-semibold text-gray-600">
                   <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                   Descripciones detalladas mejoran la búsqueda.
                 </li>
               </ul>
             </div>
          </div>

          {/* Right Column: Details */}
          <div className="col-span-1 lg:col-span-2 space-y-8">
             
             {/* Header Status Toggle */}
             <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div>
                   <h2 className="text-xl font-black text-gray-900">Estado del Producto</h2>
                   <p className="text-xs font-medium text-gray-500 mt-1">Visibilidad de este producto en su catálogo</p>
                </div>
                <button 
                  type="button" 
                  onClick={() => setFormData({...formData, isActive: !formData.isActive})}
                  className="flex items-center gap-3"
                >
                  {formData.isActive ? (
                    <ToggleRight className="w-10 h-10 text-indigo-600" />
                  ) : (
                    <ToggleLeft className="w-10 h-10 text-gray-300" />
                  )}
                  <span className={`text-sm font-black ${formData.isActive ? 'text-indigo-600' : 'text-gray-400'}`}>
                    {formData.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </button>
             </div>

             {/* Basic Info */}
             <div className="space-y-6">
                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">Nombre del Producto <span className="text-rose-500">*</span></label>
                  <input
                    type="text"
                    required
                    placeholder="ej. Reloj Minimalista de Titanio"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none font-medium text-gray-900"
                  />
                </div>

                <div>
                  <label className="block text-sm font-black text-gray-900 mb-2">Descripción</label>
                  <textarea
                    rows={4}
                    placeholder="Describa las características clave, materiales y valor de este producto..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none font-medium text-gray-900 resize-y"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">Categoría</label>
                    <div className="relative">
                      <select
                        value={formData.categoryId}
                        onChange={(e) => setFormData({...formData, categoryId: e.target.value})}
                        className="w-full px-4 py-3 appearance-none bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none font-medium text-gray-900"
                      >
                        <option value="">Seleccionar Categoría</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">Marca (Opcional)</label>
                    <input
                      type="text"
                      placeholder="ej. Sony, Nike"
                      className="w-full px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none font-medium text-gray-900"
                    />
                  </div>
                </div>
             </div>

             {/* Inventory & Pricing */}
             <div className="pt-6 border-t border-gray-100 space-y-6">
                <h3 className="text-lg font-black text-gray-900">Inventario y Precios</h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">Precio de Venta <span className="text-rose-500">*</span></label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">S/</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        required
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none font-bold text-gray-900"
                      />
                    </div>
                    {Number(margin) > 0 && (
                      <div className="mt-3 inline-block bg-blue-50 text-blue-600 px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest">
                        Margen Estimado: {margin}%
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">Precio de Compra</label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">S/</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={formData.purchasePrice}
                        onChange={(e) => setFormData({...formData, purchasePrice: e.target.value})}
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none font-bold text-gray-900"
                      />
                    </div>
                  </div>
                </div>

                <div>
                    <label className="block text-sm font-black text-gray-900 mb-2">Stock Disponible <span className="text-rose-500">*</span></label>
                    <input
                      type="number"
                      min="0"
                      required
                      placeholder="0"
                      value={formData.stock}
                      onChange={(e) => setFormData({...formData, stock: e.target.value})}
                      className="w-1/2 px-4 py-3 bg-gray-50 border-transparent rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-100 focus:border-indigo-600 transition-all outline-none font-bold text-gray-900"
                    />
                    {isEdit && (
                      <p className="text-xs font-semibold text-gray-400 mt-2">
                        Cambiar este valor manualmente creará un registro de ajuste de inventario.
                      </p>
                    )}
                </div>
             </div>

          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="px-8 py-5 bg-white border-t border-gray-100 flex items-center justify-between shrink-0 sticky bottom-0 z-10">
        <div className="flex items-center gap-2 text-xs font-bold text-gray-400 flex-1">
          {isEdit ? 'Última actualización reciente' : 'Cambios sin guardar'}
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.back()}
            disabled={loading}
            className="px-6 py-3 bg-white border border-gray-200 rounded-xl font-black text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button 
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-indigo-600 border border-transparent rounded-xl font-black text-sm text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading && <div className="w-4 h-4 rounded-full border-2 border-white/50 border-t-white animate-spin" />}
            Guardar Producto
          </button>
        </div>
      </div>
    </form>
  );
}
