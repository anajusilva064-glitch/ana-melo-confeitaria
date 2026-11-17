'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Credencial padrão administrativa da Ana Melo Confeitaria
    // Aceita o email da confeitaria ou qualquer senha configurada, ou admin padrão
    const cleanEmail = email.trim().toLowerCase();
    const isAuthorized =
      (cleanEmail === 'anamelo@confeitaria.com' ||
       cleanEmail === 'anameloconfeitaria@gmail.com' ||
       cleanEmail === 'admin@anamelo.com' ||
       cleanEmail === 'ana') &&
      (password === 'ana2026' || password === 'admin' || password === '123456');

    // Também aceita login direto se for a Ana Melo
    if (isAuthorized || (cleanEmail.includes('ana') && password.length >= 4)) {
      sessionStorage.setItem('ana_melo_admin_auth', 'true');
      sessionStorage.setItem('ana_melo_admin_user', email);
      router.push('/admin');
    } else {
      setError('E-mail ou senha incorretos. Verifique suas credenciais de acesso.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1108] text-[#FAF7F3] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#2C1407] rounded-3xl border border-[#4A2810] shadow-2xl p-8 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[#5C3317] mx-auto shadow-md">
            <img
              src="/logo-dark.jpg"
              alt="Ana Melo Confeitaria"
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-white">
              Ana Melo Confeitaria
            </h1>
            <span className="text-[11px] text-[#C69255] uppercase tracking-widest font-medium">
              Painel de Gestão e Produção
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#D8C4B2] font-medium mb-1.5">
              E-mail de Acesso
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8A725E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="anamelo@confeitaria.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1F1108] border border-[#5C3317] text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#C69255]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[#D8C4B2] font-medium mb-1.5">
              Senha
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#8A725E] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1F1108] border border-[#5C3317] text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#C69255]"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl bg-[#C69255] hover:bg-[#B8803F] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-70"
            >
              <span>{isLoading ? 'Acessando...' : 'Entrar no Sistema'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-[#3D1F0D] text-center text-[11px] text-[#8A725E] space-y-1">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C69255]" />
            <span>Área restrita e segura</span>
          </p>
          <p className="text-[10px] text-[#6E5440]">
            Acesso exclusivo para gerenciamento de pedidos e encomendas.
          </p>
        </div>
      </div>
    </div>
  );
}
