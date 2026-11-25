'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export function AuthRedirectHandler() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hash = window.location.hash || '';
    const search = window.location.search || '';

    // Detecta se a URL contém tokens de retorno do Supabase Auth (ex: clique no link de e-mail)
    const isSupabaseAuthCallback =
      hash.includes('access_token') ||
      hash.includes('type=signup') ||
      hash.includes('type=recovery') ||
      hash.includes('type=invite') ||
      search.includes('code=');

    if (isSupabaseAuthCallback && !pathname.startsWith('/admin')) {
      // Redireciona instantaneamente para o painel administrativo
      router.push(`/admin${hash || search}`);
      return;
    }

    const client = supabase;
    if (client && isSupabaseConfigured && !pathname.startsWith('/admin')) {
      const { data: authListener } = client.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session?.user && (hash.includes('access_token') || hash.includes('type=signup'))) {
          router.push('/admin');
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [router, pathname]);

  return null;
}
