create table if not exists public.x_api_quote_tweet_table_atomik (
  id text primary key,
  source_tweet_id text not null,
  text text not null,
  url text,
  tweet_created_at timestamptz,
  lang text,
  conversation_id text,
  is_retweet boolean not null default false,
  retweet_count bigint not null default 0 check (retweet_count >= 0),
  reply_count bigint not null default 0 check (reply_count >= 0),
  like_count bigint not null default 0 check (like_count >= 0),
  quote_count bigint not null default 0 check (quote_count >= 0),
  view_count bigint not null default 0 check (view_count >= 0),
  bookmark_count bigint not null default 0 check (bookmark_count >= 0),
  paid_partnership boolean,
  possibly_sensitive boolean,
  author_id text,
  author_username text,
  author_name text,
  author_profile_picture text,
  author_description text,
  author_location text,
  author_followers bigint not null default 0 check (author_followers >= 0),
  author_following bigint not null default 0 check (author_following >= 0),
  author_verified boolean not null default false,
  author_verified_type text,
  author jsonb not null default '{}'::jsonb,
  entities jsonb not null default '{}'::jsonb,
  media jsonb not null default '[]'::jsonb,
  referenced_tweets jsonb not null default '[]'::jsonb,
  raw_data jsonb not null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.x_api_quote_tweet_table_atomik is
  'Quote tweets fetched from the official X API (GET /2/tweets/:id/quote_tweets). source_tweet_id is deliberately not a foreign key so any post can be fetched, not only those in tweet_table_atomik. raw_data preserves the complete API object.';

create index if not exists x_api_quote_tweet_table_atomik_source_tweet_id_idx
  on public.x_api_quote_tweet_table_atomik (source_tweet_id);

create index if not exists x_api_quote_tweet_table_atomik_created_at_idx
  on public.x_api_quote_tweet_table_atomik (tweet_created_at desc);

create index if not exists x_api_quote_tweet_table_atomik_author_username_idx
  on public.x_api_quote_tweet_table_atomik (author_username);

create index if not exists x_api_quote_tweet_table_atomik_view_count_idx
  on public.x_api_quote_tweet_table_atomik (view_count desc);

alter table public.x_api_quote_tweet_table_atomik enable row level security;

-- No anon/authenticated policies are intentionally created. Writes and reads
-- remain server-only through the service-role key.
