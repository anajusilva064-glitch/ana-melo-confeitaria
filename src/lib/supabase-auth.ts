import { supabase, isSupabaseConfigured } from './supabase';

export interface AdminUserProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'admin' | 'pending' | 'rejected';
  is_approved: boolean;
  approved_by: string | null;
  approved_at: string | null;
  created_at: string;
}

export type AuthResult = {
  success: boolean;
  message?: string;
  user?: AdminUserProfile | null;
  isPendingApproval?: boolean;
  isRejected?: boolean;
  isMasterAdmin?: boolean;
  isEmailUnconfirmed?: boolean;
};

/**
 * Realiza login via Supabase Auth e valida se o usuário possui acesso aprovado pelo administrador
 */
export async function loginAdmin(email: string, password: string): Promise<AuthResult> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      message: 'O Supabase não está configurado. Verifique as chaves NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no arquivo .env.local.',
    };
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (authError || !authData.user) {
      if (authError?.message?.includes('Email not confirmed') || (authError as { code?: string })?.code === 'email_not_confirmed') {
        return {
          success: false,
          isEmailUnconfirmed: true,
          message: 'E-mail ainda não confirmado. Verifique sua caixa de entrada e pasta de spam para clicar no link de confirmação enviado pelo Supabase.',
        };
      }
      if (authError?.message?.includes('Invalid login credentials')) {
        return {
          success: false,
          message: 'E-mail ou senha incorretos. Verifique suas credenciais.',
        };
      }
      return {
        success: false,
        message: authError?.message || 'Falha ao autenticar com o servidor.',
      };
    }

    const userId = authData.user.id;

    // Busca o registro de autorização na tabela admin_users
    let { data: profile, error: profileError } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // Caso a trigger do banco não tenha criado ainda (ex: primeira execução antes do SQL ou migração manual)
    if (!profile && !profileError) {
      // Verifica se é o primeiro usuário do sistema
      const { count } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });

      const isFirstUser = (count ?? 0) === 0;

      const { data: newProfile, error: insertError } = await supabase
        .from('admin_users')
        .insert({
          id: userId,
          email: cleanEmail,
          full_name: authData.user.user_metadata?.full_name || '',
          role: isFirstUser ? 'admin' : 'pending',
          is_approved: isFirstUser,
          approved_at: isFirstUser ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (!insertError && newProfile) {
        profile = newProfile;
      }
    }

    // Se o usuário foi rejeitado
    if (profile?.role === 'rejected' || (profile && !profile.is_approved && profile.role === 'rejected')) {
      await supabase.auth.signOut();
      return {
        success: false,
        isRejected: true,
        message: 'Acesso negado: Sua solicitação de acesso foi recusada pelo Administrador.',
      };
    }

    // Se o usuário ainda não foi aprovado pelo administrador
    if (!profile || !profile.is_approved || profile.role === 'pending') {
      await supabase.auth.signOut();
      return {
        success: false,
        isPendingApproval: true,
        message: 'Acesso pendente: Sua conta foi criada, mas o acesso ao painel precisa ser autorizado por um Administrador.',
      };
    }

    return {
      success: true,
      user: profile as AdminUserProfile,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro inesperado na conexão';
    if (errorMsg.includes('fetch failed') || errorMsg.includes('ENOTFOUND')) {
      return {
        success: false,
        message: 'Não foi possível conectar ao servidor do Supabase. Verifique se a URL no arquivo .env.local está correta e se o projeto está ativo.',
      };
    }
    return {
      success: false,
      message: errorMsg,
    };
  }
}

/**
 * Cadastro de novo usuário solicitando autorização
 */
export async function registerAdminRequest(email: string, password: string, fullName: string): Promise<AuthResult> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase não configurado no .env.local',
    };
  }

  try {
    const cleanEmail = email.trim().toLowerCase();
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined;
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: fullName.trim(),
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (authError || !authData.user) {
      if (authError?.message?.includes('User already registered')) {
        return {
          success: false,
          message: 'Este e-mail já está cadastrado. Tente entrar ou recuperar a senha.',
        };
      }
      return {
        success: false,
        message: authError?.message || 'Erro ao registrar solicitação.',
      };
    }

    // Se o Supabase retornou sem identities, o e-mail já existe no banco
    if (authData.user.identities && authData.user.identities.length === 0) {
      return {
        success: false,
        isEmailUnconfirmed: true,
        message: 'Este e-mail já possui cadastro. Se você ainda não confirmou seu e-mail, clique em Reenviar Confirmação abaixo.',
      };
    }

    // Se a confirmação de e-mail estiver ativa no Supabase e ainda não foi confirmada
    if (!authData.session && !authData.user.email_confirmed_at) {
      return {
        success: true,
        isEmailUnconfirmed: true,
        message: 'Cadastro realizado com sucesso! Um link de ativação foi enviado para o seu e-mail. Por favor, confirme para liberar seu acesso.',
      };
    }

    const userId = authData.user.id;

    // Aguarda e busca o registro criado pela trigger do banco
    let { data: profile } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    // Se a trigger ainda não rodou ou se a tabela não tinha registro
    if (!profile) {
      const { count } = await supabase
        .from('admin_users')
        .select('*', { count: 'exact', head: true });

      const isFirst = (count ?? 0) === 0;

      const { data: insertedProfile } = await supabase
        .from('admin_users')
        .insert({
          id: userId,
          email: cleanEmail,
          full_name: fullName.trim(),
          role: isFirst ? 'admin' : 'pending',
          is_approved: isFirst,
          approved_at: isFirst ? new Date().toISOString() : null,
        })
        .select()
        .single();

      if (insertedProfile) {
        profile = insertedProfile;
      }
    }

    // Se for o Administrador Master (primeiro usuário aprovado), mantém conectado!
    if (profile && profile.is_approved && profile.role === 'admin') {
      return {
        success: true,
        isMasterAdmin: true,
        user: profile as AdminUserProfile,
        message: 'Conta de Administrador Master criada com sucesso! Acesso concedido.',
      };
    }

    // Para novos colaboradores comuns, desconecta e avisa sobre aprovação
    await supabase.auth.signOut();

    return {
      success: true,
      isPendingApproval: true,
      message: 'Solicitação de acesso enviada com sucesso! Um administrador precisará autorizar sua conta.',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Erro na solicitação';
    if (errorMsg.includes('fetch failed') || errorMsg.includes('ENOTFOUND')) {
      return {
        success: false,
        message: 'Não foi possível conectar ao servidor do Supabase. Verifique se a URL no arquivo .env.local está correta e se o projeto está ativo.',
      };
    }
    return {
      success: false,
      message: errorMsg,
    };
  }
}

/**
 * Reenvia o e-mail de confirmação de cadastro do Supabase
 */
export async function resendConfirmationEmail(email: string): Promise<{ success: boolean; message: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, message: 'Supabase não configurado.' };
  }

  try {
    const redirectUrl = typeof window !== 'undefined' ? `${window.location.origin}/admin` : undefined;
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim().toLowerCase(),
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: 'Link de confirmação reenviado! Verifique sua caixa de entrada e spam.',
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao reenviar confirmação.',
    };
  }
}

/**
 * Solicita recuperação de senha por e-mail com redirecionamento para definição de nova senha
 */
export async function sendPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return {
      success: false,
      message: 'Supabase não configurado.',
    };
  }

  try {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/admin/login?mode=reset`
      : undefined;

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
      redirectTo: redirectUrl,
    });
    if (error) {
      return { success: false, message: error.message };
    }
    return {
      success: true,
      message: 'E-mail de recuperação enviado! Clique no link do e-mail para cadastrar sua nova senha.',
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao enviar e-mail de recuperação.',
    };
  }
}

/**
 * Atualiza a senha do usuário autenticado no Supabase
 */
export async function updateAdminPassword(newPassword: string): Promise<{ success: boolean; message: string }> {
  if (!supabase || !isSupabaseConfigured) {
    return { success: false, message: 'Supabase não configurado.' };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, message: 'A nova senha deve ter no mínimo 6 caracteres.' };
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { success: false, message: error.message };
    }

    return {
      success: true,
      message: 'Nova senha cadastrada com sucesso! Seu acesso já está atualizado.',
    };
  } catch (err: unknown) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Erro ao atualizar a senha.',
    };
  }
}

/**
 * Encerra a sessão do usuário
 */
export async function logoutAdmin(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('ana_melo_admin_auth');
    sessionStorage.removeItem('ana_melo_admin_user');
  }
}

/**
 * Obtém o perfil e permissões do usuário atualmente conectado
 */
export async function getCurrentAdminProfile(): Promise<AdminUserProfile | null> {
  if (!supabase || !isSupabaseConfigured) return null;

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return null;

    const { data: profile } = await supabase
      .from('admin_users')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (!profile || !profile.is_approved) {
      return null;
    }

    return profile as AdminUserProfile;
  } catch {
    return null;
  }
}

/**
 * Lista todos os usuários cadastrados (para o painel de aprovação do administrador)
 */
export async function listAdminUsers(): Promise<AdminUserProfile[]> {
  if (!supabase || !isSupabaseConfigured) return [];

  try {
    const { data, error } = await supabase
      .from('admin_users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data as AdminUserProfile[];
  } catch {
    return [];
  }
}

/**
 * Aprova o acesso de um usuário pendente
 */
export async function approveUserAccess(targetUserId: string, approvedByUserId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('admin_users')
      .update({
        is_approved: true,
        role: 'admin',
        approved_by: approvedByUserId,
        approved_at: new Date().toISOString(),
      })
      .eq('id', targetUserId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Rejeita ou revoga o acesso de um usuário
 */
export async function rejectUserAccess(targetUserId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('admin_users')
      .update({
        is_approved: false,
        role: 'rejected',
        approved_at: null,
      })
      .eq('id', targetUserId);

    return !error;
  } catch {
    return false;
  }
}

/**
 * Remove um usuário da lista de autorizações
 */
export async function deleteUserAccess(targetUserId: string): Promise<boolean> {
  if (!supabase || !isSupabaseConfigured) return false;

  try {
    const { error } = await supabase
      .from('admin_users')
      .delete()
      .eq('id', targetUserId);

    return !error;
  } catch {
    return false;
  }
}
