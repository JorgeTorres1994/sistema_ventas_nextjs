"use client";

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMe } from '@/lib/api';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      
      // Obtener datos del usuario antes de redirigir
      getMe().then(() => {
        router.push('/dashboard');
      }).catch((err) => {
        console.error('Error fetching user data after social login:', err);
        router.push('/login?error=oauth_failed');
      });
    } else {
      router.push('/login?error=no_token');
    }
  }, [token, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-bold text-gray-900">Sincronizando con Google...</h2>
        <p className="text-gray-500 mt-2 font-medium uppercase tracking-widest text-[10px]">Espera un momento por favor.</p>
      </div>
    </div>
  );
}
