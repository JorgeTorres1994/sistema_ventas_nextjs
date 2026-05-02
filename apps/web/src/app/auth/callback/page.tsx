"use client";
import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMe } from '@/lib/api';

function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');
    useEffect(() => {
          if (token) {
                  localStorage.setItem('token', token);
                  getMe().then(() => { router.push('/dashboard'); })
                    .catch(() => { router.push('/login?error=oauth_failed'); });
          } else {
                  router.push('/login?error=no_token');
          }
    }, [token, router]);
    return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center">
                <div>
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>div>
                        <h2 className="text-xl font-bold text-gray-900">Sincronizando...</h2>h2>
                </div>div>
          </div>div>
        );
}

export default function AuthCallbackPage() {
    return (
          <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50">Cargando...</div>div>}>
                <AuthCallback />
          </Suspense>Suspense>
        );
}
</div>
