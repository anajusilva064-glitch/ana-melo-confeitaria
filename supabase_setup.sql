-- ==============================================================================
-- ANA MELO CONFEITARIA - SISTEMA DE AUTENTICAÇÃO E APROVAÇÃO DE ADMINISTRADORES
-- ==============================================================================
-- Execute este script no SQL Editor do seu painel do Supabase.
-- Ele cria a tabela de usuários administrativos, segurança RLS e a regra
-- onde apenas usuários APROVADOS pelo administrador podem acessar o sistema.
-- ==============================================================================

-- 1. Cria a tabela pública de administradores vinculada ao auth.users
create table if not exists public.admin_users (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  role text not null default 'pending', -- 'admin', 'pending', 'rejected'
  is_approved boolean not null default false,
  approved_by uuid references auth.users(id),
  approved_at timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Ativa RLS (Row Level Security)
alter table public.admin_users enable row level security;

-- 2. Função auxiliar para verificar se o usuário atual é admin aprovado (sem recursão)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.admin_users
    where id = auth.uid()
      and is_approved = true
      and role = 'admin'
  );
$$;

-- 3. Políticas de Segurança (RLS)
drop policy if exists "Users can read own or admin can read all" on public.admin_users;
create policy "Users can read own or admin can read all"
  on public.admin_users
  for select
  to authenticated
  using (
    (select auth.uid()) = id or public.is_admin()
  );

drop policy if exists "Allow users to register their own profile" on public.admin_users;
create policy "Allow users to register their own profile"
  on public.admin_users
  for insert
  to authenticated
  with check (
    (select auth.uid()) = id
  );

drop policy if exists "Only admins can update profiles" on public.admin_users;
create policy "Only admins can update profiles"
  on public.admin_users
  for update
  to authenticated
  using ( public.is_admin() )
  with check ( public.is_admin() );

drop policy if exists "Only admins can delete profiles" on public.admin_users;
create policy "Only admins can delete profiles"
  on public.admin_users
  for delete
  to authenticated
  using ( public.is_admin() );

-- 4. Gatilho (Trigger) automático ao registrar no auth.users do Supabase
-- Se for o primeiríssimo usuário cadastrado, torna-o Admin Master aprovado automaticamente.
-- Os próximos usuários entram como 'pending' (is_approved = false) aguardando liberação.
create or replace function public.handle_new_admin_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  user_count int;
begin
  select count(*) into user_count from public.admin_users;

  if user_count = 0 then
    -- Primeiro usuário vira Administrador Master imediatamente
    insert into public.admin_users (id, email, full_name, role, is_approved, approved_at)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', 'Administrador Master'),
      'admin',
      true,
      now()
    );
  else
    -- Demais usuários entram pendentes de aprovação
    insert into public.admin_users (id, email, full_name, role, is_approved, approved_at)
    values (
      new.id,
      new.email,
      coalesce(new.raw_user_meta_data->>'full_name', ''),
      'pending',
      false,
      null
    );
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_admin_user();

-- ==============================================================================
-- COMANDOS ÚTEIS (Execute separadamente quando necessário):
--
-- Para aprovar manualmente um usuário pelo e-mail caso deseje via SQL:
-- UPDATE public.admin_users 
-- SET is_approved = true, role = 'admin', approved_at = now() 
-- WHERE email = 'seu-email@exemplo.com';
--
-- Para ver todos os usuários cadastrados e o status:
-- SELECT id, email, full_name, role, is_approved, created_at, approved_at FROM public.admin_users;
-- ==============================================================================
