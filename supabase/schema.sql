-- ============================================================
-- FORMAÇÃO EM IA — Schema completo
-- ============================================================

create extension if not exists "pgcrypto";

-- ── PERFIS ──────────────────────────────────────────────────
create table public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text not null,
  email text not null,
  role text not null default 'aluno' check (role in ('formador','aluno')),
  criado_em timestamptz not null default now()
);

-- ── CURSOS ──────────────────────────────────────────────────
create table public.cursos (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  nome text not null,
  descricao text,
  imagem_url text,
  template boolean not null default false,
  ativo boolean not null default true,
  criado_em timestamptz not null default now()
);

-- ── SESSÕES ─────────────────────────────────────────────────
create table public.sessoes (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  numero integer not null,
  titulo text not null,
  descricao text,
  duracao_minutos integer not null default 180,
  criado_em timestamptz not null default now(),
  unique(curso_id, numero)
);

-- ── PASSOS ──────────────────────────────────────────────────
create table public.passos (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references public.sessoes(id) on delete cascade,
  titulo text not null,
  tipo text not null default 'instrucao'
    check (tipo in ('instrucao','demo','exercicio','nota','aviso')),
  conteudo jsonb,           -- TipTap rich text JSON
  ordem integer not null default 0,
  para_formador boolean not null default true,
  para_aluno boolean not null default true,
  criado_em timestamptz not null default now()
);

-- ── FICHEIROS ───────────────────────────────────────────────
create table public.ficheiros (
  id uuid primary key default gen_random_uuid(),
  sessao_id uuid not null references public.sessoes(id) on delete cascade,
  passo_id uuid references public.passos(id) on delete set null,
  nome text not null,
  descricao text,
  storage_path text not null,
  url_publica text,
  tipo text not null default 'outro'
    check (tipo in ('excel','pdf','pptx','csv','outro')),
  tamanho_bytes bigint not null default 0,
  criado_em timestamptz not null default now()
);

-- ── TURMAS ──────────────────────────────────────────────────
create table public.turmas (
  id uuid primary key default gen_random_uuid(),
  curso_id uuid not null references public.cursos(id) on delete cascade,
  codigo text not null,
  nome text not null,
  formador_id uuid not null references auth.users(id),
  data_inicio date,
  data_fim date,
  ativa boolean not null default true,
  criado_em timestamptz not null default now()
);

-- ── SESSÕES POR TURMA (controlo de activação) ───────────────
create table public.sessoes_turma (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turmas(id) on delete cascade,
  sessao_id uuid not null references public.sessoes(id) on delete cascade,
  ativa boolean not null default false,
  data_real date,
  unique(turma_id, sessao_id)
);

-- ── CONVITES ────────────────────────────────────────────────
create table public.convites (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turmas(id) on delete cascade,
  email text,
  token text not null unique default encode(gen_random_bytes(32),'hex'),
  usado boolean not null default false,
  criado_em timestamptz not null default now()
);

-- ── INSCRIÇÕES ──────────────────────────────────────────────
create table public.inscricoes (
  id uuid primary key default gen_random_uuid(),
  turma_id uuid not null references public.turmas(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  nome text,
  email text not null,
  inscrito_em timestamptz not null default now(),
  unique(turma_id, user_id)
);

-- ── PROGRESSO ───────────────────────────────────────────────
create table public.progresso (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  turma_id uuid not null references public.turmas(id) on delete cascade,
  passo_id uuid not null references public.passos(id) on delete cascade,
  concluido boolean not null default true,
  concluido_em timestamptz not null default now(),
  unique(user_id, turma_id, passo_id)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.perfis enable row level security;
alter table public.cursos enable row level security;
alter table public.sessoes enable row level security;
alter table public.passos enable row level security;
alter table public.ficheiros enable row level security;
alter table public.turmas enable row level security;
alter table public.sessoes_turma enable row level security;
alter table public.convites enable row level security;
alter table public.inscricoes enable row level security;
alter table public.progresso enable row level security;

-- Helper: verificar se é formador
create or replace function public.is_formador()
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.perfis
    where id = auth.uid() and role = 'formador'
  )
$$;

-- Helper: verificar se está inscrito numa turma
create or replace function public.inscrito_em_turma(p_turma_id uuid)
returns boolean language sql security definer stable as $$
  select exists (
    select 1 from public.inscricoes
    where turma_id = p_turma_id and user_id = auth.uid()
  )
$$;

-- PERFIS
create policy "ver proprio perfil" on public.perfis for select using (id = auth.uid() or public.is_formador());
create policy "actualizar proprio perfil" on public.perfis for update using (id = auth.uid());

-- CURSOS
create policy "formadores gerem cursos" on public.cursos for all using (public.is_formador());
create policy "alunos veem cursos activos" on public.cursos for select using (ativo = true);

-- SESSÕES
create policy "formadores gerem sessoes" on public.sessoes for all using (public.is_formador());
create policy "alunos veem sessoes" on public.sessoes for select using (
  exists (
    select 1 from public.sessoes_turma st
    join public.inscricoes i on i.turma_id = st.turma_id
    where st.sessao_id = sessoes.id and st.ativa = true and i.user_id = auth.uid()
  )
);

-- PASSOS
create policy "formadores gerem passos" on public.passos for all using (public.is_formador());
create policy "alunos veem passos" on public.passos for select using (
  para_aluno = true and exists (
    select 1 from public.sessoes_turma st
    join public.inscricoes i on i.turma_id = st.turma_id
    where st.sessao_id = passos.sessao_id and st.ativa = true and i.user_id = auth.uid()
  )
);

-- FICHEIROS
create policy "formadores gerem ficheiros" on public.ficheiros for all using (public.is_formador());
create policy "alunos veem ficheiros" on public.ficheiros for select using (
  exists (
    select 1 from public.sessoes_turma st
    join public.inscricoes i on i.turma_id = st.turma_id
    where st.sessao_id = ficheiros.sessao_id and st.ativa = true and i.user_id = auth.uid()
  )
);

-- TURMAS
create policy "formadores gerem turmas" on public.turmas for all using (public.is_formador());
create policy "alunos veem suas turmas" on public.turmas for select using (
  exists (select 1 from public.inscricoes where turma_id = turmas.id and user_id = auth.uid())
);

-- SESSÕES TURMA
create policy "formadores gerem sessoes_turma" on public.sessoes_turma for all using (public.is_formador());
create policy "alunos veem sessoes_turma activas" on public.sessoes_turma for select using (
  ativa = true and exists (
    select 1 from public.inscricoes where turma_id = sessoes_turma.turma_id and user_id = auth.uid()
  )
);

-- CONVITES
create policy "formadores gerem convites" on public.convites for all using (public.is_formador());
create policy "acesso publico a convites por token" on public.convites for select using (true);

-- INSCRIÇÕES
create policy "formadores veem todas as inscricoes" on public.inscricoes for all using (public.is_formador());
create policy "alunos veem as suas inscricoes" on public.inscricoes for select using (user_id = auth.uid());
create policy "alunos inserem inscricao" on public.inscricoes for insert with check (user_id = auth.uid());

-- PROGRESSO
create policy "formadores veem todo o progresso" on public.progresso for select using (public.is_formador());
create policy "alunos gerem o seu progresso" on public.progresso for all using (user_id = auth.uid());

-- ============================================================
-- TRIGGER: criar perfil automaticamente no registo
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, email, nome)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email,'@',1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- STORAGE: bucket para ficheiros de cursos
-- ============================================================
insert into storage.buckets (id, name, public)
values ('curso-ficheiros', 'curso-ficheiros', false)
on conflict do nothing;

create policy "formadores fazem upload" on storage.objects
  for insert with check (
    bucket_id = 'curso-ficheiros' and public.is_formador()
  );
create policy "formadores gerem ficheiros storage" on storage.objects
  for all using (
    bucket_id = 'curso-ficheiros' and public.is_formador()
  );
create policy "alunos descarregam ficheiros" on storage.objects
  for select using (
    bucket_id = 'curso-ficheiros' and auth.role() = 'authenticated'
  );
