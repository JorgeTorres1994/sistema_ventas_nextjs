"use client";

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function Auth() {
  const router = useRouter();
    const searchParams = useSearchParams();
      const token = searchParams.get('token');

        useEffect(() => {
            if (token) {
                  localStorage.setItem('token', token);
                        router.push('/dashboard');
                            }
                              }, [token, router]);

                                return <div>Sincronizando...</div>;
                                }

                                export default function Page() {
                                  return (
                                      <Suspense fallback={<div>Cargando...</div>}>
                                            <Auth />
                                                </Suspense>
                                                  );
                                                  }

                                                  