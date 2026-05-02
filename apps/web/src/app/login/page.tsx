"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import AuthInput from '@/components/ui/AuthInput';
import AuthButton from '@/components/ui/AuthButton';
import { login } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('admin123');

  // Detectar errores en la URL (como el acceso denegado de Google)
  useEffect(() => {
    const urlError = searchParams.get('error');
    if (urlError) {
      setError(decodeURIComponent(urlError));
      // Limpiar la URL para que el error no se quede pegado al refrescar
      const newUrl = window.location.pathname;
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.response?.data?.message || 'Error al iniciar sesión. Verifica tus credenciales.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex-grow flex items-center justify-center px-4 relative overflow-hidden bg-background">
      {/* Abstract Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary opacity-20 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary opacity-20 blur-[120px] rounded-full"></div>

      <div className="w-full max-w-md z-10">
        <div className="bg-surface-lowest rounded-xl shadow-[0px_12px_32px_rgba(20,27,43,0.04)] overflow-hidden">
          <div className="p-8 md:p-10">
            {/* Brand Header */}
            <div className="mb-10 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4 shadow-xl border border-gray-100 p-2 overflow-hidden">
                <img src="/logo.png" alt="Nexus Genesis Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-gray-900 font-black text-3xl tracking-tight mb-2">Nexus Genesis</h1>
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Sincronía perfecta para empresas de élite.</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <AuthInput
                id="email"
                label="Correo Electrónico"
                type="email"
                placeholder="Ingresa tu correo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                successIcon={email === 'admin@admin.com'}
              />

              <AuthInput
                id="password"
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                rightElement={
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-on-surface-variant hover:text-primary transition-colors focus:outline-none"
                  >
                    <span className="material-symbols-outlined text-xl">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                }
              />

              <div className="flex justify-end -mt-4 px-1">
                <Link href="#" className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <AuthButton type="submit" icon="login" isLoading={isLoading}>
                Iniciar Sesión
              </AuthButton>
            </form>

            {/* Divider */}
            <div className="relative my-8 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant/30"></div>
              </div>
              <span className="relative bg-surface-lowest px-4 text-xs font-medium text-on-surface-variant uppercase tracking-widest">
                O continuar con
              </span>
            </div>

            {/* Social Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => window.location.href = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3005'}/auth/google`}
                className="flex items-center justify-center gap-2 h-11 border border-outline-variant/40 rounded-xl hover:bg-surface-low transition-colors duration-200 group"
              >
                <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuBt5pmd53KAQzwKqL8pzJb1N15hcDxI9iJtW_AKNIkjU8qbynrAkK6xXi41SgaXlufv_prrJPe_i_JwjrRS_-GOJc62i9EDaUjYXeLXo-8elyWJTsEHQkmMO1jvbwK4Y5LYNnTYqX7yXCSW7mE4a60zHy7gPaT-sCwlMB7muHRmnVuxF1AB8ndz_URLKyHo8Eyryx4ux3LVN43JurJpjDLxML0gxsf-lziMN3UkwTWqE6LzF91jxw3zmFjESRwU5w3I4gS11X47yP0" alt="Google" className="w-5 h-5 opacity-80 group-hover:opacity-100" />
                <span className="text-sm font-semibold text-foreground">Google</span>
              </button>
              <button className="flex items-center justify-center gap-2 h-11 border border-outline-variant/40 rounded-xl hover:bg-surface-low transition-colors duration-200 group">
                <span className="material-symbols-outlined text-xl text-on-surface-variant group-hover:text-foreground">terminal</span>
                <span className="text-sm font-semibold text-foreground">GitHub</span>
              </button>
            </div>
          </div>

          {/* Footer Link */}
          <div className="bg-surface-low py-6 text-center px-8 border-t border-outline-variant/10">
            <p className="text-sm font-medium text-on-surface-variant">
              ¿No tienes una cuenta? 
              <Link href="/register" className="text-primary font-bold hover:underline ml-1">Regístrate</Link>
            </p>
          </div>
        </div>

        {/* Accessibility/Legal Footer */}
        <div className="mt-8 flex justify-center gap-6">
          <Link href="#" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">Política de Privacidad</Link>
          <Link href="#" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">Términos de Servicio</Link>
          <Link href="#" className="text-xs font-medium text-on-surface-variant hover:text-primary transition-colors">Soporte Técnico</Link>
        </div>
      </div>
      
      {/* Global Copyright Footer */}
      <footer className="absolute bottom-8 w-full px-8 opacity-40">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-[0.75rem] text-on-surface-variant">
          <p>© 2024 Digital Architect. Todos los derechos reservados.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#">Privacidad</Link>
            <Link href="#">Términos</Link>
            <Link href="#">Contacto</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
