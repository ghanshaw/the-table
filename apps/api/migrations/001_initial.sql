-- Run this in your Supabase SQL editor

create table if not exists presidents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  party text,
  term_start date not null,
  term_end date,
  created_at timestamptz default now()
);

create type action_type as enum ('executive_order', 'proclamation', 'memorandum');

create table if not exists executive_actions (
  id uuid primary key default gen_random_uuid(),
  president_id uuid not null references presidents(id),
  type action_type not null,
  title text not null,
  abstract text,
  document_number text not null unique,
  signing_date date,
  publication_date date not null,
  federal_register_url text not null,
  pdf_url text,
  created_at timestamptz default now()
);

create index idx_actions_president on executive_actions(president_id);
create index idx_actions_type on executive_actions(type);
create index idx_actions_pub_date on executive_actions(publication_date desc);
