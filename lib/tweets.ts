export type TweetMediaVariant = {
  bitrate?: number;
  content_type?: string;
  url?: string;
};

export type TweetMedia = {
  id_str?: string;
  type?: string;
  media_url_https?: string;
  url?: string;
  video_info?: { duration_millis?: number; variants?: TweetMediaVariant[] };
  original_info?: { width?: number; height?: number };
};

export type TweetEntityUrl = {
  url?: string;
  display_url?: string;
  expanded_url?: string;
};

export type TweetAuthor = {
  id?: string;
  name?: string;
  userName?: string;
  profilePicture?: string;
  isVerified?: boolean;
  isBlueVerified?: boolean;
  description?: string;
  followers?: number;
  following?: number;
};

export type TweetSourceType = "global" | "atomik";

/** The feed only shows the latest Atomik scrape; the older global-directory rows stay in the table. */
const FEED_SOURCE_TYPE: TweetSourceType = "atomik";

export type Tweet = {
  id: string;
  source_type: TweetSourceType;
  url: string;
  text: string;
  tweet_created_at: string;
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
  view_count: number;
  bookmark_count: number;
  author_id: string;
  author_username: string;
  author_name: string;
  author_profile_picture: string | null;
  author_is_verified: boolean;
  author_is_blue_verified: boolean;
  author: TweetAuthor;
  entities: {
    hashtags?: { text?: string }[];
    user_mentions?: { screen_name?: string }[];
    urls?: TweetEntityUrl[];
  };
  extended_entities: { media?: TweetMedia[] };
};

const COLUMNS = [
  "id",
  "url",
  "text",
  "tweet_created_at",
  "retweet_count",
  "reply_count",
  "like_count",
  "quote_count",
  "view_count",
  "bookmark_count",
  "author_id",
  "author_username",
  "author_name",
  "author_profile_picture",
  "author_is_verified",
  "author_is_blue_verified",
  "author",
  "entities",
  "extended_entities",
].join(",");

/** `source_type` exists only on tweet_table_atomik, not on the reply/quote tables. */
const TWEET_COLUMNS = `${COLUMNS},source_type`;

export type Reply = Omit<Tweet, "source_type"> & {
  root_tweet_id: string;
  parent_tweet_id: string;
  media: unknown[];
};

export type QuoteTweet = {
  id: string;
  source_tweet_id: string;
  text: string;
  url: string;
  tweet_created_at: string;
  retweet_count: number;
  reply_count: number;
  like_count: number;
  quote_count: number;
  view_count: number;
  bookmark_count: number;
  author_id: string;
  author_username: string;
  author_name: string;
  author_profile_picture: string | null;
  author_verified: boolean;
  author_is_blue_verified: boolean;
  author_description: string | null;
  author_followers: number;
  author_following: number;
  media: unknown[];
  content_disclosure: {
    advertising?: { isPaidPromotion?: boolean };
    aiGenerated?: { hasAiGeneratedMedia?: boolean };
  } | null;
  quoted_tweet: {
    id?: string;
    text?: string;
    url?: string;
    createdAt?: string;
    media?: unknown[];
    mediaUrls?: string[];
    author?: {
      name?: string;
      username?: string;
      profilePicture?: string;
      isBlueVerified?: boolean;
      isVerified?: boolean;
    };
  } | null;
};

export type Retweeter = {
  source_tweet_id: string;
  user_id: string;
  username: string;
  name: string;
  description: string | null;
  profile_picture: string | null;
  followers: number;
  following: number;
  is_verified: boolean;
  is_blue_verified: boolean;
  account_created_at: string;
};

export async function queryTable<T>(path: string): Promise<T> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local",
    );
  }

  const response = await fetch(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/${path}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

export async function getTweet(id: string): Promise<Tweet | null> {
  const rows = await queryTable<Tweet[]>(
    `tweet_table_atomik?select=${TWEET_COLUMNS}&id=eq.${encodeURIComponent(id)}&limit=1`,
  );
  return rows[0] ?? null;
}

export async function getReplies(
  rootTweetId: string,
  order = "view_count.desc",
  filter = "",
): Promise<Reply[]> {
  return queryTable<Reply[]>(
    `reply_tweet_table_atomik?select=${COLUMNS},root_tweet_id,parent_tweet_id,media` +
      `&root_tweet_id=eq.${encodeURIComponent(rootTweetId)}${filter}` +
      `&order=${order}&limit=100`,
  );
}

/**
 * Replies for an Atomik post. Same shape as getReplies, but read from the
 * Atomik replies scrape rather than the global reply table.
 */
export async function getAtomikReplies(
  rootTweetId: string,
  order = "view_count.desc",
  filter = "",
): Promise<Reply[]> {
  return queryTable<Reply[]>(
    `reply_author_table_atomik?select=${COLUMNS},root_tweet_id,parent_tweet_id,media` +
      `&root_tweet_id=eq.${encodeURIComponent(rootTweetId)}${filter}` +
      `&order=${order}&limit=100`,
  );
}

export async function getQuoteTweets(
  sourceTweetId: string,
  order = "view_count.desc",
  filter = "",
): Promise<QuoteTweet[]> {
  const columns = [
    "id",
    "source_tweet_id",
    "text",
    "url",
    "tweet_created_at",
    "retweet_count",
    "reply_count",
    "like_count",
    "quote_count",
    "view_count",
    "bookmark_count",
    "author_id",
    "author_username",
    "author_name",
    "author_profile_picture",
    "author_verified",
    "author_is_blue_verified",
    "author_description",
    "author_followers",
    "author_following",
    "media",
    "content_disclosure",
    "quoted_tweet",
  ].join(",");

  return queryTable<QuoteTweet[]>(
    `quote_tweet_table_atomik?select=${columns}` +
      `&source_tweet_id=eq.${encodeURIComponent(sourceTweetId)}${filter}&order=${order}&limit=100`,
  );
}

/** Exact row counts for a source tweet: all quotes, and paid-partnership quotes. */
export async function getQuoteCounts(
  sourceTweetId: string,
): Promise<{ total: number; paid: number }> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local",
    );
  }

  const base = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/quote_tweet_table_atomik`;
  const filter = `source_tweet_id=eq.${encodeURIComponent(sourceTweetId)}`;

  const count = async (path: string) => {
    const response = await fetch(path, {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "count=exact",
        Range: "0-0",
      },
      cache: "no-store",
    });

    return Number(response.headers.get("content-range")?.split("/")[1] ?? 0);
  };

  const [total, paid] = await Promise.all([
    count(`${base}?select=id&${filter}`),
    count(
      `${base}?select=id&${filter}` +
        "&content_disclosure->advertising->>isPaidPromotion=eq.true",
    ),
  ]);

  return { total, paid };
}

export async function getRetweeters(
  sourceTweetId: string,
  order = "followers.desc",
  filter = "",
): Promise<Retweeter[]> {
  const columns = [
    "source_tweet_id",
    "user_id",
    "username",
    "name",
    "description",
    "profile_picture",
    "followers",
    "following",
    "is_verified",
    "is_blue_verified",
    "account_created_at",
  ].join(",");

  return queryTable<Retweeter[]>(
    `retweeter_table_atomik?select=${columns}` +
      `&source_tweet_id=eq.${encodeURIComponent(sourceTweetId)}${filter}&order=${order}&limit=100`,
  );
}

export async function getTweets(order = "view_count.desc", filter = ""): Promise<Tweet[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local",
    );
  }

  const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/tweet_table_atomik`;
  const query = `?select=${TWEET_COLUMNS}&source_type=eq.${FEED_SOURCE_TYPE}${filter}&order=${order}`;

  const response = await fetch(`${endpoint}${query}`, {
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Failed to load tweets (${response.status}): ${await response.text()}`);
  }

  return response.json();
}

/** Exact retweeter count for a source tweet, independent of the 100-row page limit. */
export async function countRetweeters(sourceTweetId: string): Promise<number> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local",
    );
  }

  const response = await fetch(
    `${supabaseUrl.replace(/\/$/, "")}/rest/v1/retweeter_table_atomik` +
      `?select=user_id&source_tweet_id=eq.${encodeURIComponent(sourceTweetId)}`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "count=exact",
        Range: "0-0",
      },
      cache: "no-store",
    },
  );

  return Number(response.headers.get("content-range")?.split("/")[1] ?? 0);
}

/** Exact row count for a source tweet's quotes under an arbitrary PostgREST filter. */
export async function countQuoteTweets(sourceTweetId: string, filter = ""): Promise<number> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local",
    );
  }

  const response = await fetch(
    `${supabaseUrl.replace(/\/$/, "")}/rest/v1/quote_tweet_table_atomik` +
      `?select=id&source_tweet_id=eq.${encodeURIComponent(sourceTweetId)}${filter}`,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        Prefer: "count=exact",
        Range: "0-0",
      },
      cache: "no-store",
    },
  );

  return Number(response.headers.get("content-range")?.split("/")[1] ?? 0);
}
