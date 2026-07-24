-- Content Central schema. Run once in the Supabase SQL editor.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  topic text not null,
  topic_rationale text not null default '',
  research_sources jsonb not null default '[]',
  social_topic text not null default '',
  social_topic_rationale text not null default '',
  social_research_sources jsonb not null default '[]',
  devto jsonb not null,
  tabnews jsonb not null,
  twitter jsonb not null,
  instagram jsonb not null,
  project_mentions jsonb not null default '[]',
  status jsonb not null default '{"devto": false, "tabnews": false, "twitter": false, "instagram": false}',
  created_at timestamptz not null default now()
);

-- All access goes through the service role in server code; no public policies.
alter table public.posts enable row level security;

create unique index if not exists posts_date_topic_key on public.posts (date, topic);

create table if not exists public.automation_settings (
  id integer primary key check (id = 1),
  state jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

alter table public.automation_settings enable row level security;

-- Migration for databases created with the older one-post-per-day schema:
alter table public.posts drop constraint if exists posts_date_key;

-- Migration for the two independent editorial research sessions:
alter table public.posts add column if not exists social_topic text not null default '';
alter table public.posts add column if not exists social_topic_rationale text not null default '';
alter table public.posts add column if not exists social_research_sources jsonb not null default '[]';
