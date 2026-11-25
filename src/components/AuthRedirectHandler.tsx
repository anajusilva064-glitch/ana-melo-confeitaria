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

    // Se for recuperação de senha, redireciona OBRIGATORIAMENTE para a tela de redefinir nova senha
    if (hash.includes('type=recovery') || search.includes('type=recovery')) {
      if (pathname !== '/admin/login' || !window.location.search.includes('mode=reset')) {
        router.push(`/admin/login?mode=reset${hash || search}`);
        return;
      }
    }

    // Outros callbacks de autenticação (ex: clique no link de confirmação de cadastro)
    const isSupabaseAuthCallback =
      hash.includes('access_token') ||
      hash.includes('type=signup') ||
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
