-- Distinguishes which scrape a tweet came from. `type` is already taken by the
-- upstream payload's tweet kind, so the dataset label lives in `source_type`.
alter table public.tweet_table_atomik
  add column if not exists source_type text not null default 'global'
  check (source_type in ('global', 'atomik'));

-- Everything already in the table came from the global-directory scrape.
update public.tweet_table_atomik set source_type = 'global' where source_type is null;

comment on column public.tweet_table_atomik.source_type is
  'Which scrape the row came from: global (global directory) or atomik (Atomik accounts).';

create index if not exists tweet_table_atomik_source_type_idx
  on public.tweet_table_atomik (source_type);
