'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  Clock,
  AlertCircle,
  CheckCircle2,
  KeyRound,
  UserPlus,
  LogIn,
  Crown,
} from 'lucide-react';
import {
  loginAdmin,
  registerAdminRequest,
  sendPasswordReset,
} from '@/lib/supabase-auth';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

type Mode = 'login' | 'register' | 'forgot';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [isFirstSetup, setIsFirstSetup] = useState<boolean | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verifica se o banco de dados ainda não tem nenhum usuário cadastrado
  useEffect(() => {
    async function checkSetup() {
      if (supabase && isSupabaseConfigured) {
        try {
          const { count } = await supabase
            .from('admin_users')
            .select('*', { count: 'exact', head: true });

          if (count === 0) {
            setIsFirstSetup(true);
            setMode('register');
          } else {
            setIsFirstSetup(false);
          }
        } catch {
          // ignora falha silenciosa
        }
      }
    }
    checkSetup();
  }, []);

  const resetFeedback = () => {
    setError('');
    setSuccessMsg('');
    setIsPending(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetFeedback();

    const res = await loginAdmin(email, password);
    setIsLoading(false);

    if (res.success) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('ana_melo_admin_auth', 'true');
        sessionStorage.setItem('ana_melo_admin_user', res.user?.email || email);
      }
      router.push('/admin');
    } else {
      if (res.isPendingApproval) {
        setIsPending(true);
      } else {
        setError(res.message || 'Falha ao autenticar.');
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    setIsLoading(true);
    resetFeedback();

    const res = await registerAdminRequest(email, password, fullName);
    setIsLoading(false);

    if (res.success) {
      // Se for o primeiro usuário (Master Admin), entra na hora!
      if (res.isMasterAdmin) {
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('ana_melo_admin_auth', 'true');
          sessionStorage.setItem('ana_melo_admin_user', res.user?.email || email);
        }
        router.push('/admin');
        return;
      }

      setSuccessMsg(
        'Solicitação de acesso cadastrada com sucesso! O Administrador master precisa aprovar seu usuário antes do primeiro login.'
      );
      setMode('login');
      setPassword('');
    } else {
      setError(res.message || 'Falha ao registrar solicitação.');
    }
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    resetFeedback();

    const res = await sendPasswordReset(email);
    setIsLoading(false);

    if (res.success) {
      setSuccessMsg(res.message);
      setMode('login');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1108] text-[#FAF7F3] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#2C1407] rounded-3xl border border-[#4A2810] shadow-2xl p-6 sm:p-8 space-y-6">
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

        {/* Notificação de Primeiro Acesso (Nenhum Admin Cadastrado) */}
        {isFirstSetup && (
          <div className="p-4 rounded-2xl bg-amber-950/70 border border-amber-600/70 text-xs space-y-2 text-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-semibold text-[11px] border border-amber-500/40">
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Configuração Inicial do Sistema</span>
            </div>
            <p className="text-[#F5ECE1] font-semibold text-xs">
              Bem-vinda! Crie a conta do Administrador Master
            </p>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              O banco de dados está pronto no Supabase. Cadastre-se abaixo para assumir o controle total do painel.
            </p>
          </div>
        )}

        {/* Mode Selector Tabs */}
        <div className="flex bg-[#1F1108] p-1 rounded-xl border border-[#4A2810] text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              resetFeedback();
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-[#3D1F0D] text-[#C69255] shadow-xs'
                : 'text-[#B59F8B] hover:text-white'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Entrar</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              resetFeedback();
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-[#3D1F0D] text-[#C69255] shadow-xs'
                : 'text-[#B59F8B] hover:text-white'
            }`}
          >
            {isFirstSetup ? (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-amber-300 font-semibold">Criar Admin Master</span>
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5" />
                <span>Solicitar Acesso</span>
              </>
            )}
          </button>
        </div>

        {/* Supabase Status Alert (Se não configurado) */}
        {!isSupabaseConfigured && (
          <div className="p-3.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-200 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-amber-300">Supabase não conectado</p>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Configure as variáveis <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no seu arquivo <code>.env.local</code>.
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Pending Approval Card */}
        {isPending && (
          <div className="p-4 rounded-2xl bg-[#3D2514] border border-[#C69255]/40 text-xs space-y-2">
            <div className="flex items-center gap-2 text-[#C69255] font-semibold">
              <Clock className="w-4 h-4" />
              <span>Acesso Pendente de Aprovação</span>
            </div>
            <p className="text-[#D8C4B2] text-[11px] leading-relaxed">
              Sua conta está criada e segura no Supabase, porém o acesso ao sistema requer a <strong>autorização prévia do Administrador</strong>.
            </p>
            <p className="text-[11px] text-[#A68F7B]">
              Solicite ao administrador da confeitaria a liberação do seu usuário na aba de Configurações do painel.
            </p>
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            <div>
              <label className="block text-[#D8C4B2] font-medium mb-1.5">
                E-mail de Acesso
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A725E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1F1108] border border-[#5C3317] text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#C69255]"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[#D8C4B2] font-medium">Senha</label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    resetFeedback();
                  }}
                  className="text-[11px] text-[#C69255] hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A725E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
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
                <span>{isLoading ? 'Autenticando no Supabase...' : 'Entrar no Sistema'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* MODE: REGISTER / REQUEST ACCESS / MASTER ADMIN */}
        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4 text-xs">
            {!isFirstSetup && (
              <div className="p-3 rounded-xl bg-[#1F1108] border border-[#4A2810] text-[11px] text-[#D8C4B2] leading-relaxed">
                🛡️ <strong>Acesso Controlado:</strong> Novos cadastros são registrados com segurança no Supabase e ficam em espera até um administrador aprovar.
              </div>
            )}

            <div>
              <label className="block text-[#D8C4B2] font-medium mb-1.5">
                Nome Completo
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8A725E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1F1108] border border-[#5C3317] text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#C69255]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#D8C4B2] font-medium mb-1.5">
                E-mail
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A725E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1F1108] border border-[#5C3317] text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#C69255]"
                />
              </div>
            </div>

            <div>
              <label className="block text-[#D8C4B2] font-medium mb-1.5">
                Senha (Mínimo 6 caracteres)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8A725E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
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
                {isFirstSetup ? (
                  <>
                    <Crown className="w-4 h-4 text-amber-300" />
                    <span>{isLoading ? 'Cadastrando...' : 'Criar Administrador Master e Entrar'}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{isLoading ? 'Cadastrando...' : 'Enviar Solicitação de Acesso'}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* MODE: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4 text-xs">
            <div className="text-[11px] text-[#D8C4B2] leading-relaxed">
              Informe seu e-mail cadastrado para receber o link oficial de redefinição de senha do Supabase.
            </div>

            <div>
              <label className="block text-[#D8C4B2] font-medium mb-1.5">
                E-mail Cadastrado
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8A725E] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1F1108] border border-[#5C3317] text-white text-xs sm:text-sm focus:outline-hidden focus:border-[#C69255]"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setMode('login');
                  resetFeedback();
                }}
                className="px-4 py-3 rounded-xl bg-[#1F1108] border border-[#4A2810] text-[#D8C4B2] hover:text-white font-semibold text-xs transition-colors"
              >
                Voltar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-3.5 rounded-xl bg-[#C69255] hover:bg-[#B8803F] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all active:scale-98 disabled:opacity-70"
              >
                <KeyRound className="w-4 h-4" />
                <span>{isLoading ? 'Enviando e-mail...' : 'Enviar Link de Redefinição'}</span>
              </button>
            </div>
          </form>
        )}

        <div className="pt-4 border-t border-[#3D1F0D] text-center text-[11px] text-[#8A725E] space-y-1">
          <p className="flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C69255]" />
            <span>Autenticação Oficial Supabase Auth</span>
          </p>
          <p className="text-[10px] text-[#6E5440]">
            Acesso protegido por criptografia e controle de aprovação.
          </p>
        </div>
      </div>
    </div>
  );
}
