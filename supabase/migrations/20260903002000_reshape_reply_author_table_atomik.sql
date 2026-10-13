-- The replies scraper now returns full reply tweets (id, text, conversation and
-- parent ids) rather than the bare author profiles the previous run produced.
-- The old shape was keyed on user_id and has no room for reply content, so the
-- table is rebuilt around the reply itself.
--
-- WARNING: this drops the 366 author-only rows currently in the table. They hold
-- no reply text and are superseded by the new dataset.
drop table if exists public.reply_author_table_atomik;

create table public.reply_author_table_atomik (
  id text primary key,
  root_tweet_id text not null,
  parent_tweet_id text not null,
  conversation_id text not null,
  in_reply_to_user_id text,
  in_reply_to_username text,
  type text not null default 'reply',
  url text not null,
  twitter_url text,
  text text not null,
  full_text text,
  source text not null default '',
  retweet_count bigint not null default 0 check (retweet_count >= 0),
  reply_count bigint not null default 0 check (reply_count >= 0),
  like_count bigint not null default 0 check (like_count >= 0),
  quote_count bigint not null default 0 check (quote_count >= 0),
  view_count bigint not null default 0 check (view_count >= 0),
  bookmark_count bigint not null default 0 check (bookmark_count >= 0),
  tweet_created_at timestamptz not null,
  lang text,
  is_reply boolean not null default true,
  is_pinned boolean not null default false,
  is_retweet boolean not null default false,
  is_quote boolean not null default false,
  is_conversation_controlled boolean not null default false,
  possibly_sensitive boolean not null default false,
  quote_id text,
  author_id text not null,
  author_username text not null,
  author_name text not null,
  author_profile_picture text,
  author_is_verified boolean not null default false,
  author_is_blue_verified boolean not null default false,
  author_followers bigint not null default 0 check (author_followers >= 0),
  author_following bigint not null default 0 check (author_following >= 0),
  author_description text,
  author_location text,
  author jsonb not null default '{}'::jsonb,
  entities jsonb not null default '{}'::jsonb,
  extended_entities jsonb not null default '{}'::jsonb,
  card jsonb not null default '{}'::jsonb,
  place jsonb not null default '{}'::jsonb,
  media jsonb not null default '[]'::jsonb,
  quote jsonb,
  raw_data jsonb not null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reply_author_table_atomik_must_be_reply check (is_reply),
  constraint reply_author_table_atomik_root_matches_conversation
    check (root_tweet_id = conversation_id),
  constraint reply_author_table_atomik_not_self_parent
    check (id <> parent_tweet_id)
);

-- No foreign key on root_tweet_id: this scrape covers conversations that are not
-- all present in tweet_table_atomik, and an FK would reject those rows.
comment on table public.reply_author_table_atomik is
  'Replies scraped for Atomik posts, keyed on the reply. root_tweet_id links to the conversation; raw_data preserves the complete scraper payload.';

create index if not exists reply_author_table_atomik_root_tweet_id_idx
  on public.reply_author_table_atomik (root_tweet_id);

create index if not exists reply_author_table_atomik_parent_tweet_id_idx
  on public.reply_author_table_atomik (parent_tweet_id);

create index if not exists reply_author_table_atomik_created_at_idx
  on public.reply_author_table_atomik (tweet_created_at desc);

create index if not exists reply_author_table_atomik_view_count_idx
  on public.reply_author_table_atomik (view_count desc);

create index if not exists reply_author_table_atomik_like_count_idx
  on public.reply_author_table_atomik (like_count desc);

create index if not exists reply_author_table_atomik_author_username_idx
  on public.reply_author_table_atomik (author_username);

alter table public.reply_author_table_atomik enable row level security;

-- No anon/authenticated policies. Server-only, accessed with the service-role key.
