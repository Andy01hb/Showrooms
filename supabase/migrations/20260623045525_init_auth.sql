-- Roles del dominio
create type public.user_role as enum ('admin', 'broker', 'cliente');

-- Perfil 1:1 con auth.users
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'cliente',
  full_name text,
  created_at timestamptz not null default now()
);

-- RLS: default-deny (al activar RLS sin políticas, nadie accede)
alter table public.profiles enable row level security;

-- Privilegios de tabla: RLS controla QUÉ filas; los GRANT controlan acceso a la tabla.
-- Supabase moderno NO otorga privilegios a authenticated/anon en tablas nuevas (secure by default),
-- así que hay que concederlos explícitamente. El INSERT lo hace el trigger (SECURITY DEFINER), no el rol.
grant select, update on public.profiles to authenticated;

-- service_role: clave de backend con acceso total (igual salta RLS por BYPASSRLS).
-- Tampoco se auto-otorga en Supabase moderno, así que lo concedemos explícitamente.
grant all on public.profiles to service_role;

-- Helper sin recursión: rol del usuario actual (SECURITY DEFINER salta RLS internamente)
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- Políticas:
-- 1) cada quien lee su propio profile
create policy "leer_propio_profile"
  on public.profiles for select
  using (id = auth.uid());

-- 2) admin lee todos
create policy "admin_lee_todos"
  on public.profiles for select
  using (public.current_user_role() = 'admin');

-- 3) cada quien actualiza su propio profile, pero NO puede cambiarse el rol
create policy "actualizar_propio_profile"
  on public.profiles for update
  using (id = auth.uid())
  with check (id = auth.uid() and role = (select role from public.profiles where id = auth.uid()));

-- Trigger: crear profile automáticamente al registrarse (rol cliente por defecto)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
