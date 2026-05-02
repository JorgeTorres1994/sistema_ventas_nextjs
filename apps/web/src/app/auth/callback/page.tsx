"use client";

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getMe } from '@/lib/api';

function Auth() {
  const router = useRouter();
    const searchParams = useSearchParams();
      const token = searchParams.get('token');

        useEffect(() => {
            const syncSession = async () => {
                if (token) {
                    localStorage.setItem('token', token);
                    try {
                        // Fetch user data immediately to synchronize permissions and name
                        await getMe();
                        router.push('/dashboard');
                    } catch (error) {
                        console.error('Error syncing user data:', error);
                        router.push('/login?error=sync_failed');
                    }
                }
            };
            syncSession();
        }, [token, router]);

        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <h2 className="text-xl font-bold text-gray-900">Sincronizando sesión...</h2>
                <p className="text-gray-500">Preparando tu espacio de trabajo de élite.</p>
            </div>
        );
                                }

                                export default function Page() {
                                  return (
                                      <Suspense fallback={<div>Cargando...</div>}>
                                            <Auth />
                                                </Suspense>
                                                  );
                                                  }

                                                  