"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import AuthInput from '@/components/ui/AuthInput';
import AuthButton from '@/components/ui/AuthButton';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { forgotPassword, resetPassword } from '@/lib/api';
import { Mail, CheckCircle2, Lock, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [notificationMessage, setNotificationMessage] = useState('');

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setError(null);

    try {
      const res = await forgotPassword(email);
      if (res.status === 'NOTIFICATION_SENT') {
        setNotificationMessage(res.message);
        setStep(3); // Notification sent step
      } else if (res.status === 'CODE_SENT') {
        toast.success(res.message);
        setStep(2); // Code input step
      } else {
        // Generic success to avoid email enumeration
        toast.info(res.message);
      }
    } catch (err: any) {
      console.log('Forgot password error:', err);
      setError(err.response?.data?.message || 'Error al procesar la solicitud.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      await resetPassword({ email, code, newPassword });
      toast.success('Contraseña actualizada correctamente.');
      router.push('/login');
    } catch (err: any) {
      console.log('Reset password error:', err);
      setError(err.response?.data?.message || 'Código inválido o expirado.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex-grow flex items-center justify-center px-4 py-12 relative overflow-hidden bg-background">
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
              <p className="text-gray-400 text-sm font-bold uppercase tracking-widest">Recuperación de Acceso</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-shake">
                {error}
              </div>
            )}

            {step === 1 && (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900">¿Olvidaste tu contraseña?</h2>
                  <p className="text-gray-400 text-sm">Ingresa tu correo electrónico para buscar tu cuenta.</p>
                </div>
                <form onSubmit={handleRequestCode} className="space-y-6">
                  <AuthInput
                    id="email"
                    label="Correo Electrónico"
                    type="email"
                    placeholder="Ingresa tu correo"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <AuthButton type="submit" isLoading={isLoading}>
                    Buscar Cuenta
                  </AuthButton>
                </form>
              </>
            )}

            {step === 2 && (
              <>
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-gray-900">Verificación de Seguridad</h2>
                  <p className="text-gray-400 text-sm">Ingresa el código de 6 dígitos enviado a tu dispositivo/correo y tu nueva contraseña.</p>
                </div>
                <form onSubmit={handleResetPassword} className="space-y-6">
                  <AuthInput
                    id="code"
                    label="Código de Seguridad"
                    type="text"
                    placeholder="Ej. 123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                  />
                  <AuthInput
                    id="newPassword"
                    label="Nueva Contraseña"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  <AuthInput
                    id="confirmPassword"
                    label="Confirmar Contraseña"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <AuthButton type="submit" isLoading={isLoading}>
                    Restablecer Contraseña
                  </AuthButton>
                </form>
              </>
            )}

            {step === 3 && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-500" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Solicitud Enviada</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {notificationMessage}
                </p>
                <Link href="/login" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-100 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  Volver al inicio de sesión
                </Link>
              </div>
            )}
          </div>

          {/* Footer Link */}
          {step !== 3 && (
            <div className="bg-surface-low py-6 text-center px-8 border-t border-outline-variant/10">
              <Link href="/login" className="text-sm font-bold text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Volver al inicio de sesión
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
