create table if not exists public.quote_tweet_table_atomik (
  id text primary key,
  source_tweet_id text not null
    references public.tweet_table_atomik (id) on delete cascade,
  quoted_tweet_id text not null,
  type text not null default 'tweet',
  text text not null,
  url text not null,
  twitter_url text,
  conversation_id text,
  source text not null default '',
  lang text,
  tweet_created_at timestamptz not null,
  retweet_count bigint not null default 0 check (retweet_count >= 0),
  reply_count bigint not null default 0 check (reply_count >= 0),
  like_count bigint not null default 0 check (like_count >= 0),
  quote_count bigint not null default 0 check (quote_count >= 0),
  view_count bigint not null default 0 check (view_count >= 0),
  bookmark_count bigint not null default 0 check (bookmark_count >= 0),
  is_note_tweet boolean not null default false,
  is_quote_status boolean not null default true,
  is_reply boolean not null default false,
  is_translatable boolean not null default false,
  possibly_sensitive boolean,
  in_reply_to_user_id text,
  in_reply_to_username text,
  engagement_mode text,
  result_type text,
  source_target text,
  author_id text not null,
  author_username text not null,
  author_name text not null,
  author_followers bigint not null default 0 check (author_followers >= 0),
  author_following bigint not null default 0 check (author_following >= 0),
  author_verified boolean not null default false,
  author_is_blue_verified boolean not null default false,
  author_profile_picture text,
  author_description text,
  author_location text,
  author jsonb not null default '{}'::jsonb,
  entities jsonb not null default '{}'::jsonb,
  edit jsonb not null default '{}'::jsonb,
  media jsonb not null default '[]'::jsonb,
  note_tweet jsonb,
  content_disclosure jsonb,
  quoted_tweet jsonb not null default '{}'::jsonb,
  raw_data jsonb not null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quote_tweet_table_atomik_source_matches_quote
    check (source_tweet_id = quoted_tweet_id)
);

comment on table public.quote_tweet_table_atomik is
  'Quote tweets collected for Atomik source tweets. Common fields are typed; raw_data preserves the complete scraper payload.';

create index if not exists quote_tweet_table_atomik_source_tweet_id_idx
  on public.quote_tweet_table_atomik (source_tweet_id);

create index if not exists quote_tweet_table_atomik_created_at_idx
  on public.quote_tweet_table_atomik (tweet_created_at desc);

create index if not exists quote_tweet_table_atomik_author_username_idx
  on public.quote_tweet_table_atomik (author_username);

create index if not exists quote_tweet_table_atomik_like_count_idx
  on public.quote_tweet_table_atomik (like_count desc);

create index if not exists quote_tweet_table_atomik_view_count_idx
  on public.quote_tweet_table_atomik (view_count desc);

alter table public.quote_tweet_table_atomik enable row level security;

-- No anon/authenticated policies are intentionally created. Imports and reads
-- remain server-only through the service-role key until the UI is connected.
