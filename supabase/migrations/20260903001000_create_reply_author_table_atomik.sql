-- Authors surfaced by the replies scraper. This dataset carries only user
-- profiles -- no tweet id, text, or conversation id -- so rows cannot be
-- attached to a source tweet and are keyed on the user alone.
create table if not exists public.reply_author_table_atomik (
  user_id text primary key,
  username text not null,
  name text not null,
  type text not null default 'user',
  followers bigint not null default 0 check (followers >= 0),
  following bigint not null default 0 check (following >= 0),
  is_verified boolean not null default false,
  is_blue_verified boolean not null default false,
  verified_type text,
  profile_picture text,
  cover_picture text,
  description text,
  location text,
  status text not null default '',
  account_created_at timestamptz not null,
  protected boolean not null default false,
  can_dm boolean not null default false,
  can_media_tag boolean not null default false,
  has_custom_timelines boolean not null default false,
  is_translator boolean not null default false,
  possibly_sensitive boolean not null default false,
  fast_followers_count bigint not null default 0 check (fast_followers_count >= 0),
  favourites_count bigint not null default 0 check (favourites_count >= 0),
  media_count bigint not null default 0 check (media_count >= 0),
  statuses_count bigint not null default 0 check (statuses_count >= 0),
  profile_url text,
  twitter_url text,
  entities jsonb not null default '{}'::jsonb,
  affiliates_highlighted_label jsonb not null default '{}'::jsonb,
  professional jsonb,
  pinned_tweet_ids jsonb not null default '[]'::jsonb,
  raw_data jsonb not null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.reply_author_table_atomik is
  'Reply authors from the replies scraper. Profile fields are typed; raw_data preserves the complete scraper payload.';

create index if not exists reply_author_table_atomik_username_idx
  on public.reply_author_table_atomik (username);

create index if not exists reply_author_table_atomik_followers_idx
  on public.reply_author_table_atomik (followers desc);

create index if not exists reply_author_table_atomik_verified_idx
  on public.reply_author_table_atomik (is_verified, is_blue_verified);

alter table public.reply_author_table_atomik enable row level security;

-- No anon/authenticated policies. Server-only, accessed with the service-role key.
