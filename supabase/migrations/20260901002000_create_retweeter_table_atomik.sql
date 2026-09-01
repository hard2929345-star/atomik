create table if not exists public.retweeter_table_atomik (
  source_tweet_id text not null
    references public.tweet_table_atomik (id) on delete cascade,
  user_id text not null,
  username text not null,
  name text not null,
  followers bigint not null default 0 check (followers >= 0),
  following bigint not null default 0 check (following >= 0),
  verified boolean not null default false,
  is_blue_verified boolean not null default false,
  is_verified boolean not null default false,
  profile_picture text,
  cover_picture text,
  profile_banner_url text,
  description text,
  location text,
  account_created_at timestamptz not null,
  statuses_count bigint not null default 0 check (statuses_count >= 0),
  media_count bigint not null default 0 check (media_count >= 0),
  protected boolean not null default false,
  profile_url text,
  favourites_count bigint not null default 0 check (favourites_count >= 0),
  possibly_sensitive boolean not null default false,
  verified_type text,
  has_graduated_access boolean not null default false,
  parody_commentary_fan_label text,
  profile_description_language text,
  profile_image_shape text,
  profile_interstitial_type text,
  profile_translator_type text,
  super_follow_eligible boolean not null default false,
  engagement_mode text not null default 'retweeters',
  result_type text not null default 'user',
  source_target text not null,
  tweet_url text,
  twitter_url text,
  profile_bio jsonb not null default '{}'::jsonb,
  affiliates_highlighted_label jsonb,
  professional jsonb,
  pinned_tweet_ids jsonb not null default '[]'::jsonb,
  raw_data jsonb not null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (source_tweet_id, user_id),
  constraint retweeter_table_atomik_source_target_matches
    check (source_target = source_tweet_id)
);

comment on table public.retweeter_table_atomik is
  'Users who retweeted Atomik source tweets. Common profile fields are typed; raw_data preserves the complete scraper payload.';

create index if not exists retweeter_table_atomik_username_idx
  on public.retweeter_table_atomik (username);

create index if not exists retweeter_table_atomik_followers_idx
  on public.retweeter_table_atomik (followers desc);

create index if not exists retweeter_table_atomik_verified_idx
  on public.retweeter_table_atomik (is_verified, is_blue_verified);

create index if not exists retweeter_table_atomik_account_created_at_idx
  on public.retweeter_table_atomik (account_created_at desc);

alter table public.retweeter_table_atomik enable row level security;

-- No anon/authenticated policies are intentionally created. Imports and reads
-- remain server-only through the service-role key until the UI is connected.
