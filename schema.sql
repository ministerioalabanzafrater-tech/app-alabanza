-- ============================================================
-- APP ALABANZA — Supabase Schema
-- ============================================================

-- Habilitar extensiones necesarias
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

create type user_role as enum ('admin', 'musician');
create type voice_type as enum ('soprano', 'alto', 'tenor', 'bajo', 'otro');
create type instrument_type as enum (
  'guitarra', 'bajo', 'bateria', 'teclado', 'piano',
  'violin', 'cello', 'trompeta', 'saxofon', 'flauta',
  'voz', 'director', 'otro'
);
create type event_type as enum ('ensayo', 'servicio', 'retiro', 'otro');
create type key_note as enum (
  'C', 'C#', 'Db', 'D', 'D#', 'Eb', 'E', 'F',
  'F#', 'Gb', 'G', 'G#', 'Ab', 'A', 'A#', 'Bb', 'B'
);

-- ============================================================
-- PERFILES DE USUARIO
-- ============================================================

create table profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text not null,
  role        user_role not null default 'musician',
  instrument  instrument_type,
  voice       voice_type,
  birthday    date,
  phone       text,
  avatar_url  text,
  bio         text,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Trigger para updated_at automático
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- ============================================================
-- CATÁLOGO DE CANCIONES
-- ============================================================

create table songs (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  author      text,
  bpm         integer check (bpm > 0 and bpm < 300),
  key_note    key_note,
  genre       text,
  lyrics      text,
  notes       text,
  youtube_url text,
  active      boolean not null default true,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger songs_updated_at
  before update on songs
  for each row execute function set_updated_at();

create index songs_title_idx on songs using gin(to_tsvector('spanish', title));

-- ============================================================
-- EVENTOS (ENSAYOS / SERVICIOS)
-- ============================================================

create table events (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  type        event_type not null default 'ensayo',
  description text,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  location    text,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger events_updated_at
  before update on events
  for each row execute function set_updated_at();

create index events_starts_at_idx on events(starts_at);

-- ============================================================
-- SETLISTS
-- ============================================================

create table setlists (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  event_id    uuid references events(id) on delete set null,
  notes       text,
  created_by  uuid references profiles(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger setlists_updated_at
  before update on setlists
  for each row execute function set_updated_at();

-- Canciones dentro de un setlist (orden importa)
create table setlist_songs (
  id           uuid primary key default uuid_generate_v4(),
  setlist_id   uuid not null references setlists(id) on delete cascade,
  song_id      uuid not null references songs(id) on delete cascade,
  position     integer not null default 0,
  key_override key_note,      -- tonalidad diferente a la original para este setlist
  notes        text,
  pdf_url      text,          -- URL en Supabase Storage
  created_at   timestamptz not null default now(),
  unique(setlist_id, position)
);

create index setlist_songs_setlist_idx on setlist_songs(setlist_id, position);

-- ============================================================
-- ASIGNACIONES DE MÚSICOS A SETLIST
-- ============================================================

create table setlist_musicians (
  id           uuid primary key default uuid_generate_v4(),
  setlist_id   uuid not null references setlists(id) on delete cascade,
  musician_id  uuid not null references profiles(id) on delete cascade,
  instrument   instrument_type,
  confirmed    boolean not null default false,
  notes        text,
  created_at   timestamptz not null default now(),
  unique(setlist_id, musician_id)
);

-- ============================================================
-- ASISTENCIA A EVENTOS
-- ============================================================

create table event_attendance (
  id          uuid primary key default uuid_generate_v4(),
  event_id    uuid not null references events(id) on delete cascade,
  musician_id uuid not null references profiles(id) on delete cascade,
  confirmed   boolean,        -- null=pendiente, true=confirma, false=no asiste
  attended    boolean,        -- marcado post-evento
  notes       text,
  created_at  timestamptz not null default now(),
  unique(event_id, musician_id)
);

-- ============================================================
-- LABORATORIO DE AUDIO (historial de procesamientos)
-- ============================================================

create table audio_jobs (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references profiles(id) on delete cascade,
  youtube_url     text not null,
  original_key    key_note,
  target_key      key_note,
  semitones       integer,
  status          text not null default 'pending'
                    check (status in ('pending','processing','done','error')),
  output_url      text,       -- URL en Supabase Storage del MP3 resultante
  error_msg       text,
  replicate_id    text,       -- ID del job en Replicate.com
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger audio_jobs_updated_at
  before update on audio_jobs
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table profiles           enable row level security;
alter table songs              enable row level security;
alter table events             enable row level security;
alter table setlists           enable row level security;
alter table setlist_songs      enable row level security;
alter table setlist_musicians  enable row level security;
alter table event_attendance   enable row level security;
alter table audio_jobs         enable row level security;

-- Helper: rol del usuario actual
create or replace function current_user_role()
returns user_role language sql security definer as $$
  select role from profiles where id = auth.uid()
$$;

-- PROFILES: ver todos los perfiles activos; editar solo el propio (o admin)
create policy "profiles_select" on profiles
  for select using (active = true);

create policy "profiles_update_own" on profiles
  for update using (id = auth.uid());

create policy "profiles_admin_all" on profiles
  for all using (current_user_role() = 'admin');

-- SONGS: todos leen; admin/músicos autenticados crean/editan
create policy "songs_select" on songs
  for select using (true);

create policy "songs_insert" on songs
  for insert with check (auth.uid() is not null);

create policy "songs_update" on songs
  for update using (auth.uid() is not null)
  with check (auth.uid() is not null);

create policy "songs_delete" on songs
  for delete using (current_user_role() = 'admin');

-- EVENTS: todos leen; solo admin crea/edita/borra
create policy "events_select" on events
  for select using (true);

create policy "events_admin" on events
  for all using (current_user_role() = 'admin');

-- SETLISTS: todos leen; admin gestiona
create policy "setlists_select" on setlists
  for select using (true);

create policy "setlists_admin" on setlists
  for all using (current_user_role() = 'admin');

create policy "setlist_songs_select" on setlist_songs
  for select using (true);

create policy "setlist_songs_admin" on setlist_songs
  for all using (current_user_role() = 'admin');

create policy "setlist_musicians_select" on setlist_musicians
  for select using (true);

create policy "setlist_musicians_admin" on setlist_musicians
  for all using (current_user_role() = 'admin');

-- ATTENDANCE: músico ve/edita la suya; admin ve todas
create policy "attendance_select_own" on event_attendance
  for select using (musician_id = auth.uid() or current_user_role() = 'admin');

create policy "attendance_upsert_own" on event_attendance
  for all using (musician_id = auth.uid() or current_user_role() = 'admin');

-- AUDIO JOBS: cada usuario ve/crea los suyos
create policy "audio_jobs_own" on audio_jobs
  for all using (user_id = auth.uid());

-- ============================================================
-- STORAGE BUCKETS (ejecutar desde Supabase Dashboard o API)
-- ============================================================
-- bucket: "cifrados"   (PDFs de cifrados)  — acceso autenticado
-- bucket: "audio"      (MP3 procesados)     — acceso autenticado
-- bucket: "avatars"    (fotos de perfil)    — acceso público

-- ============================================================
-- FUNCIÓN: crear perfil automáticamente al registrarse
-- ============================================================

create or replace function handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'musician')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
