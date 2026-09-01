create table if not exists public.reply_tweet_table_atomik (
  id text primary key,
  root_tweet_id text not null
    references public.tweet_table_atomik (id) on delete cascade,
  parent_tweet_id text not null,
  conversation_id text not null,
  in_reply_to_user_id text,
  in_reply_to_username text,
  type text not null default 'tweet',
  url text not null,
  twitter_url text,
  text text not null,
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
  author_id text not null,
  author_username text not null,
  author_name text not null,
  author_profile_picture text,
  author_is_verified boolean not null default false,
  author_is_blue_verified boolean not null default false,
  author_followers bigint not null default 0 check (author_followers >= 0),
  author_following bigint not null default 0 check (author_following >= 0),
  author jsonb not null default '{}'::jsonb,
  extended_entities jsonb not null default '{}'::jsonb,
  entities jsonb not null default '{}'::jsonb,
  card jsonb not null default '{}'::jsonb,
  place jsonb not null default '{}'::jsonb,
  media jsonb not null default '[]'::jsonb,
  raw_data jsonb not null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint reply_tweet_table_atomik_must_be_reply check (is_reply),
  constraint reply_tweet_table_atomik_root_matches_conversation
    check (root_tweet_id = conversation_id),
  constraint reply_tweet_table_atomik_not_self_parent
    check (id <> parent_tweet_id)
);

comment on table public.reply_tweet_table_atomik is
  'Replies belonging to Atomik source-tweet conversations. Common fields are typed; raw_data preserves the complete source payload.';

create index if not exists reply_tweet_table_atomik_root_tweet_id_idx
  on public.reply_tweet_table_atomik (root_tweet_id);

create index if not exists reply_tweet_table_atomik_parent_tweet_id_idx
  on public.reply_tweet_table_atomik (parent_tweet_id);

create index if not exists reply_tweet_table_atomik_created_at_idx
  on public.reply_tweet_table_atomik (tweet_created_at asc);

create index if not exists reply_tweet_table_atomik_author_username_idx
  on public.reply_tweet_table_atomik (author_username);

create index if not exists reply_tweet_table_atomik_like_count_idx
  on public.reply_tweet_table_atomik (like_count desc);

alter table public.reply_tweet_table_atomik enable row level security;

-- No anon/authenticated policies are intentionally created. Imports and reads
-- remain server-only through the service-role key until the UI is connected.
