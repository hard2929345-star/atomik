create table if not exists public.tweet_table_atomik (
  id text primary key,
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
  is_reply boolean not null default false,
  in_reply_to_id text,
  conversation_id text,
  in_reply_to_user_id text,
  in_reply_to_username text,
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
  quoted_tweet jsonb,
  retweeted_tweet jsonb,
  raw_data jsonb not null,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.tweet_table_atomik is
  'Atomik tweet records. Common fields are typed for querying; raw_data preserves the complete source payload.';

create index if not exists tweet_table_atomik_created_at_idx
  on public.tweet_table_atomik (tweet_created_at desc);

create index if not exists tweet_table_atomik_author_username_idx
  on public.tweet_table_atomik (author_username);

create index if not exists tweet_table_atomik_like_count_idx
  on public.tweet_table_atomik (like_count desc);

create index if not exists tweet_table_atomik_view_count_idx
  on public.tweet_table_atomik (view_count desc);

alter table public.tweet_table_atomik enable row level security;

-- No anon/authenticated policies are intentionally created. The table is
-- server-only for now and can be accessed with the service-role key.

with payload as (
  select $tweet$
  {
    "type": "tweet",
    "id": "2094455917597138959",
    "url": "https://x.com/yasser_elsaid_/status/2094455917597138959",
    "twitterUrl": "https://twitter.com/yasser_elsaid_/status/2094455917597138959",
    "text": "Announcing @Chatbase Backstage: a control center for managing your AI customer support agent.\n\nTalk to your agent like a teammate to understand what's driving support tickets, update how it responds, deploy new Procedures, and manage workflows in plain English.\n\nBackstage is available on iMessage, Slack, and the Chatbase dashboard, so you can manage your customer experience from wherever you work.",
    "source": "",
    "retweetCount": 44,
    "replyCount": 122,
    "likeCount": 1308,
    "quoteCount": 56,
    "viewCount": 673862,
    "createdAt": "Mon Aug 31 16:02:58 +0000 2026",
    "lang": "en",
    "bookmarkCount": 918,
    "isReply": false,
    "inReplyToId": null,
    "conversationId": "2094455917597138959",
    "inReplyToUserId": "",
    "inReplyToUsername": "",
    "isPinned": false,
    "author": {
      "type": "user",
      "userName": "yasser_elsaid_",
      "url": "https://x.com/yasser_elsaid_",
      "twitterUrl": "https://twitter.com/yasser_elsaid_",
      "id": "1375427123507249152",
      "name": "Yasser",
      "isVerified": false,
      "isBlueVerified": true,
      "profilePicture": "https://pbs.twimg.com/profile_images/1761628238323802112/pXIc00nu_normal.jpg",
      "coverPicture": "",
      "description": "Founder of @chatbase",
      "location": "sf",
      "followers": 60788,
      "following": 1774,
      "status": "",
      "canDm": true,
      "canMediaTag": true,
      "createdAt": "Fri Mar 26 12:39:19 +0000 2021",
      "entities": {
        "description": {
          "user_mentions": [
            { "id_str": "", "indices": [11, 20], "name": "", "screen_name": "chatbase" }
          ]
        }
      },
      "fastFollowersCount": 0,
      "favouritesCount": 0,
      "hasCustomTimelines": true,
      "isTranslator": false,
      "mediaCount": 312,
      "statusesCount": 2588,
      "withheldInCountries": [],
      "affiliatesHighlightedLabel": {
        "label": {
          "badge": { "url": "https://pbs.twimg.com/profile_images/2094107993155457024/Hfn_t9wK_bigger.jpg" },
          "description": "Chatbase",
          "url": { "url": "https://twitter.com/chatbase", "url_type": "DeepLink" },
          "user_label_display_type": "Badge",
          "user_label_type": "BusinessLabel"
        }
      },
      "possiblySensitive": false,
      "pinnedTweetIds": ["2094455917597138959"],
      "profile_bio": {
        "description": "Founder of @chatbase",
        "entities": {
          "description": {
            "user_mentions": [
              { "id_str": "", "indices": [11, 20], "name": "", "screen_name": "chatbase" }
            ]
          }
        }
      },
      "isAutomated": false,
      "automatedBy": null
    },
    "extendedEntities": {
      "media": [
        {
          "additional_media_info": { "monetizable": false },
          "allow_download_status": { "allow_download": true },
          "display_url": "pic.x.com/s30epf8tOC",
          "expanded_url": "https://x.com/yasser_elsaid_/status/2094455917597138959/video/1",
          "ext_master_playlist_only": [],
          "ext_media_availability": { "status": "Available" },
          "ext_playlists": [],
          "id_str": "2094451099528830976",
          "indices": [276, 299],
          "media_key": "13_2094451099528830976",
          "media_results": {
            "id": "QXBpTWVkaWFSZXN1bHRzOgwABAoAAR0Q/C2a16AAAAA=",
            "result": {
              "__typename": "ApiMedia",
              "id": "QXBpTWVkaWE6DAAECgABHRD8LZrXoAAAAA==",
              "media_key": "13_2094451099528830976"
            }
          },
          "media_url_https": "https://pbs.twimg.com/amplify_video_thumb/2094451099528830976/img/2kVBAd0of5cR3XFC.jpg",
          "original_info": { "focus_rects": [], "height": 2160, "width": 3840 },
          "sizes": { "large": { "h": 1152, "w": 2048 } },
          "type": "video",
          "url": "https://t.co/s30epf8tOC",
          "video_info": {
            "aspect_ratio": [16, 9],
            "duration_millis": 156447,
            "variants": [
              { "content_type": "application/x-mpegURL", "url": "https://video.twimg.com/amplify_video/2094451099528830976/pl/E1Auk3CqmOXz60wq.m3u8?tag=29" },
              { "bitrate": 256000, "content_type": "video/mp4", "url": "https://video.twimg.com/amplify_video/2094451099528830976/vid/avc1/480x270/3GOPkniwCIy-wWvM.mp4?tag=29" },
              { "bitrate": 832000, "content_type": "video/mp4", "url": "https://video.twimg.com/amplify_video/2094451099528830976/vid/avc1/640x360/43ZPhGn4cSSbIp-5.mp4?tag=29" },
              { "bitrate": 2176000, "content_type": "video/mp4", "url": "https://video.twimg.com/amplify_video/2094451099528830976/vid/avc1/1280x720/RD4sUFYc1_aSLjHT.mp4?tag=29" },
              { "bitrate": 10368000, "content_type": "video/mp4", "url": "https://video.twimg.com/amplify_video/2094451099528830976/vid/avc1/1920x1080/9s4rr99vCOcOPwlG.mp4?tag=29" },
              { "bitrate": 25128000, "content_type": "video/mp4", "url": "https://video.twimg.com/amplify_video/2094451099528830976/vid/avc1/3840x2160/HQWJPdfa2e1ZNz5u.mp4?tag=29" }
            ]
          }
        }
      ]
    },
    "card": {},
    "place": {},
    "entities": {
      "hashtags": [],
      "symbols": [],
      "timestamps": [],
      "urls": [],
      "user_mentions": [
        { "id_str": "1777680690923864064", "indices": [11, 20], "name": "Chatbase", "screen_name": "Chatbase" }
      ]
    },
    "isRetweet": false,
    "isQuote": false,
    "isConversationControlled": false,
    "quoted_tweet": null,
    "retweeted_tweet": null
  }
  $tweet$::jsonb as data
)
insert into public.tweet_table_atomik (
  id,
  type,
  url,
  twitter_url,
  text,
  source,
  retweet_count,
  reply_count,
  like_count,
  quote_count,
  view_count,
  bookmark_count,
  tweet_created_at,
  lang,
  is_reply,
  in_reply_to_id,
  conversation_id,
  in_reply_to_user_id,
  in_reply_to_username,
  is_pinned,
  is_retweet,
  is_quote,
  is_conversation_controlled,
  author_id,
  author_username,
  author_name,
  author_profile_picture,
  author_is_verified,
  author_is_blue_verified,
  author_followers,
  author_following,
  author,
  extended_entities,
  entities,
  card,
  place,
  quoted_tweet,
  retweeted_tweet,
  raw_data
)
select
  data->>'id',
  coalesce(data->>'type', 'tweet'),
  data->>'url',
  data->>'twitterUrl',
  data->>'text',
  coalesce(data->>'source', ''),
  coalesce((data->>'retweetCount')::bigint, 0),
  coalesce((data->>'replyCount')::bigint, 0),
  coalesce((data->>'likeCount')::bigint, 0),
  coalesce((data->>'quoteCount')::bigint, 0),
  coalesce((data->>'viewCount')::bigint, 0),
  coalesce((data->>'bookmarkCount')::bigint, 0),
  '2026-08-31T16:02:58Z'::timestamptz,
  data->>'lang',
  coalesce((data->>'isReply')::boolean, false),
  nullif(data->>'inReplyToId', ''),
  nullif(data->>'conversationId', ''),
  nullif(data->>'inReplyToUserId', ''),
  nullif(data->>'inReplyToUsername', ''),
  coalesce((data->>'isPinned')::boolean, false),
  coalesce((data->>'isRetweet')::boolean, false),
  coalesce((data->>'isQuote')::boolean, false),
  coalesce((data->>'isConversationControlled')::boolean, false),
  data->'author'->>'id',
  data->'author'->>'userName',
  data->'author'->>'name',
  nullif(data->'author'->>'profilePicture', ''),
  coalesce((data->'author'->>'isVerified')::boolean, false),
  coalesce((data->'author'->>'isBlueVerified')::boolean, false),
  coalesce((data->'author'->>'followers')::bigint, 0),
  coalesce((data->'author'->>'following')::bigint, 0),
  coalesce(data->'author', '{}'::jsonb),
  coalesce(data->'extendedEntities', '{}'::jsonb),
  coalesce(data->'entities', '{}'::jsonb),
  coalesce(data->'card', '{}'::jsonb),
  coalesce(data->'place', '{}'::jsonb),
  data->'quoted_tweet',
  data->'retweeted_tweet',
  data
from payload
on conflict (id) do update set
  retweet_count = excluded.retweet_count,
  reply_count = excluded.reply_count,
  like_count = excluded.like_count,
  quote_count = excluded.quote_count,
  view_count = excluded.view_count,
  bookmark_count = excluded.bookmark_count,
  author_followers = excluded.author_followers,
  author_following = excluded.author_following,
  author = excluded.author,
  extended_entities = excluded.extended_entities,
  entities = excluded.entities,
  raw_data = excluded.raw_data,
  updated_at = now();
