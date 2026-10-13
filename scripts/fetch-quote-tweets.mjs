import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const ACTOR = "seemuapps~x-quote-tweets-scraper";
const TABLE = "quote_tweet_table_atomik";
const BATCH_SIZE = 100;
const PAGE_SIZE = 500;
const POLL_INTERVAL_MS = 5000;
const RUN_TIMEOUT_MS = 15 * 60 * 1000;

async function loadEnvLocal() {
  const contents = await readFile(resolve(".env.local"), "utf8");
  const values = {};

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator === -1) continue;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

function timestamp(value, field, tweetId) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    throw new Error(`Invalid ${field} for tweet ${tweetId}: ${value}`);
  }
  return parsed.toISOString();
}

function nonNegativeInteger(value, field, tweetId) {
  const parsed = Number(value ?? 0);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${field} for tweet ${tweetId}: ${value}`);
  }
  return parsed;
}

function optionalText(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function sleep(ms) {
  return new Promise((done) => setTimeout(done, ms));
}

// The source post id is authoritative: we asked the actor for this post's
// quotes, so every row it returns belongs to it regardless of how the payload
// happens to label the quoted tweet.
function toRow(tweet, sourceTweetId) {
  const author = tweet.author ?? {};

  if (!tweet.id || !tweet.url) {
    throw new Error(`Quote of ${sourceTweetId} is missing id or url`);
  }

  return {
    id: tweet.id,
    source_tweet_id: sourceTweetId,
    quoted_tweet_id: sourceTweetId,
    type: tweet.type ?? "tweet",
    text: tweet.text ?? "",
    url: tweet.url,
    twitter_url: optionalText(tweet.twitterUrl),
    conversation_id: optionalText(tweet.conversationId),
    source: tweet.source ?? "",
    lang: optionalText(tweet.lang),
    tweet_created_at: timestamp(tweet.createdAt, "createdAt", tweet.id),
    retweet_count: nonNegativeInteger(tweet.retweetCount, "retweetCount", tweet.id),
    reply_count: nonNegativeInteger(tweet.replyCount, "replyCount", tweet.id),
    like_count: nonNegativeInteger(tweet.likeCount, "likeCount", tweet.id),
    quote_count: nonNegativeInteger(tweet.quoteCount, "quoteCount", tweet.id),
    view_count: nonNegativeInteger(tweet.viewCount, "viewCount", tweet.id),
    bookmark_count: nonNegativeInteger(tweet.bookmarkCount, "bookmarkCount", tweet.id),
    is_note_tweet: Boolean(tweet.isNoteTweet),
    is_quote_status: tweet.isQuoteStatus !== false,
    is_reply: Boolean(tweet.isReply),
    is_translatable: Boolean(tweet.isTranslatable),
    possibly_sensitive:
      typeof tweet.possiblySensitive === "boolean" ? tweet.possiblySensitive : null,
    in_reply_to_user_id: optionalText(tweet.inReplyToUserId),
    in_reply_to_username: optionalText(tweet.inReplyToUsername),
    engagement_mode: optionalText(tweet.engagementMode),
    result_type: optionalText(tweet.resultType),
    source_target: optionalText(tweet.sourceTarget),
    author_id: tweet.authorId ?? author.id,
    author_username: tweet.authorUsername ?? author.username,
    author_name: tweet.authorName ?? author.name,
    author_followers: nonNegativeInteger(
      tweet.authorFollowers ?? author.followers,
      "authorFollowers",
      tweet.id,
    ),
    author_following: nonNegativeInteger(
      tweet.authorFollowing ?? author.following,
      "authorFollowing",
      tweet.id,
    ),
    author_verified: Boolean(
      tweet.authorVerified ?? tweet.authorIsVerified ?? author.verified ?? author.isVerified,
    ),
    author_is_blue_verified: Boolean(tweet.authorIsBlueVerified ?? author.isBlueVerified),
    author_profile_picture: optionalText(
      tweet.authorProfilePicture ?? author.profilePicture,
    ),
    author_description: optionalText(tweet.authorDescription ?? author.description),
    author_location: optionalText(tweet.authorLocation ?? author.location),
    author,
    entities: tweet.entities ?? {},
    edit: tweet.edit ?? {},
    media: tweet.media ?? [],
    note_tweet: tweet.noteTweet ?? null,
    content_disclosure: tweet.contentDisclosure ?? null,
    quoted_tweet: tweet.quotedTweet ?? {},
    raw_data: tweet,
    updated_at: new Date().toISOString(),
  };
}

async function apify(token, path, init = {}) {
  const response = await fetch(`https://api.apify.com/v2${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`Apify ${path} failed (${response.status}): ${await response.text()}`);
  }

  return response;
}

// One actor run returns at most PAGE_SIZE quotes plus a NEXT_PAGE_ID cursor.
// Feeding that cursor back in resumes where the previous run stopped, so a post
// with thousands of quotes is drained across however many runs it takes.
async function fetchPage(token, tweetId, pageId) {
  const started = await apify(token, `/acts/${ACTOR}/runs`, {
    method: "POST",
    body: JSON.stringify({
      tweetId,
      maxItems: PAGE_SIZE,
      ...(pageId ? { pageId } : {}),
    }),
  });

  const runId = (await started.json()).data.id;
  const deadline = Date.now() + RUN_TIMEOUT_MS;
  let run;

  for (;;) {
    await sleep(POLL_INTERVAL_MS);
    run = (await (await apify(token, `/actor-runs/${runId}`)).json()).data;
    if (run.status !== "RUNNING" && run.status !== "READY") break;
    if (Date.now() > deadline) {
      throw new Error(`Run ${runId} for ${tweetId} exceeded the timeout`);
    }
  }

  if (run.status !== "SUCCEEDED") {
    throw new Error(`Run ${runId} for ${tweetId} finished as ${run.status}`);
  }

  const items = await (
    await apify(token, `/datasets/${run.defaultDatasetId}/items?clean=true&format=json`)
  ).json();

  const cursor = await fetch(
    `https://api.apify.com/v2/key-value-stores/${run.defaultKeyValueStoreId}/records/NEXT_PAGE_ID`,
    { headers: { Authorization: `Bearer ${token}` } },
  );

  let nextPageId = null;
  if (cursor.ok) {
    const raw = (await cursor.text()).trim();
    if (raw && raw !== "null" && raw !== '""') {
      nextPageId = raw.startsWith('"') ? JSON.parse(raw) : raw;
    }
  }

  return { items, nextPageId };
}

async function fetchAllQuotes(token, tweetId) {
  const byId = new Map();
  let pageId = null;
  let page = 0;

  for (;;) {
    const { items, nextPageId } = await fetchPage(token, tweetId, pageId);
    page += 1;

    for (const item of items) {
      if (item?.id) byId.set(item.id, item);
    }

    console.log(
      `  page ${page}: +${items.length} (${byId.size} unique)${nextPageId ? "" : " - exhausted"}`,
    );

    // No cursor, or a page that came back empty, means the post is drained.
    if (!nextPageId || items.length === 0) break;
    pageId = nextPageId;
  }

  return [...byId.values()];
}

async function upsertBatch(url, serviceRoleKey, rows) {
  const response = await fetch(`${url}/rest/v1/${TABLE}?on_conflict=id`, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(rows),
  });

  if (!response.ok) {
    throw new Error(`Upsert failed (${response.status}): ${await response.text()}`);
  }
}

async function main() {
  const env = { ...(await loadEnvLocal()), ...process.env };
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const apifyToken = env.APIFY_TOKEN;

  if (!url || !serviceRoleKey) {
    throw new Error("NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  if (!apifyToken) {
    throw new Error("APIFY_TOKEN is required - add it to .env.local");
  }

  const only = process.argv.slice(2);

  const postsResponse = await fetch(
    `${url}/rest/v1/tweet_table_atomik?select=id,author_username,quote_count&source_type=eq.atomik&order=quote_count.desc`,
    { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } },
  );

  if (!postsResponse.ok) {
    throw new Error(
      `Could not load posts (${postsResponse.status}): ${await postsResponse.text()}`,
    );
  }

  const posts = (await postsResponse.json()).filter(
    (post) => only.length === 0 || only.includes(post.id),
  );

  console.log(`Draining quote tweets for ${posts.length} atomik posts\n`);
  let grandTotal = 0;

  for (const post of posts) {
    console.log(`${post.id} @${post.author_username} (X reports ${post.quote_count} quotes)`);

    const quotes = await fetchAllQuotes(apifyToken, post.id);
    const rows = quotes.map((quote) => toRow(quote, post.id));

    for (let index = 0; index < rows.length; index += BATCH_SIZE) {
      await upsertBatch(url, serviceRoleKey, rows.slice(index, index + BATCH_SIZE));
    }

    grandTotal += rows.length;
    const pct = post.quote_count ? ((rows.length / post.quote_count) * 100).toFixed(1) : "0.0";
    console.log(`  stored ${rows.length} rows (${pct}% of reported)\n`);
  }

  console.log(`Done. ${grandTotal} quote tweets upserted.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
