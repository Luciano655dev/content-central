-- Content Central schema. Run once in the Supabase SQL editor.

create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  topic text not null,
  topic_rationale text not null default '',
  research_sources jsonb not null default '[]',
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
