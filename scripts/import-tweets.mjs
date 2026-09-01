import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const DATASET_FILE =
  "dataset_twitter-x-data-tweet-scraper-pay-per-result-cheapest_2026-09-01_16-09-39-758.json";
const TABLE = "tweet_table_atomik";
const BATCH_SIZE = 100;

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

function toRow(tweet) {
  const author = tweet.author ?? {};

  if (!tweet.id || typeof tweet.text !== "string" || !tweet.url || !author.id) {
    throw new Error(`Tweet ${tweet.id ?? "<unknown>"} is missing a required field`);
  }

  return {
    id: tweet.id,
    type: tweet.type ?? "tweet",
    url: tweet.url,
    twitter_url: optionalText(tweet.twitterUrl),
    text: tweet.text,
    source: tweet.source ?? "",
    retweet_count: nonNegativeInteger(tweet.retweetCount, "retweetCount", tweet.id),
    reply_count: nonNegativeInteger(tweet.replyCount, "replyCount", tweet.id),
    like_count: nonNegativeInteger(tweet.likeCount, "likeCount", tweet.id),
    quote_count: nonNegativeInteger(tweet.quoteCount, "quoteCount", tweet.id),
    view_count: nonNegativeInteger(tweet.viewCount, "viewCount", tweet.id),
    bookmark_count: nonNegativeInteger(tweet.bookmarkCount, "bookmarkCount", tweet.id),
    tweet_created_at: timestamp(tweet.createdAt, "createdAt", tweet.id),
    lang: optionalText(tweet.lang),
    is_reply: Boolean(tweet.isReply),
    in_reply_to_id: optionalText(tweet.inReplyToId),
    conversation_id: optionalText(tweet.conversationId),
    in_reply_to_user_id: optionalText(tweet.inReplyToUserId),
    in_reply_to_username: optionalText(tweet.inReplyToUsername),
    is_pinned: Boolean(tweet.isPinned),
    is_retweet: Boolean(tweet.isRetweet),
    is_quote: Boolean(tweet.isQuote),
    is_conversation_controlled: Boolean(tweet.isConversationControlled),
    author_id: author.id,
    author_username: author.userName ?? author.username,
    author_name: author.name,
    author_profile_picture: optionalText(author.profilePicture),
    author_is_verified: Boolean(author.isVerified),
    author_is_blue_verified: Boolean(author.isBlueVerified),
    author_followers: nonNegativeInteger(author.followers, "author.followers", tweet.id),
    author_following: nonNegativeInteger(author.following, "author.following", tweet.id),
    author,
    extended_entities: tweet.extendedEntities ?? {},
    entities: tweet.entities ?? {},
    card: tweet.card ?? {},
    place: tweet.place ?? {},
    quoted_tweet: tweet.quoted_tweet ?? null,
    retweeted_tweet: tweet.retweeted_tweet ?? null,
    raw_data: tweet,
    updated_at: new Date().toISOString(),
  };
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
    const detail = await response.text();
    throw new Error(`Supabase import failed (${response.status}): ${detail}`);
  }
}

const datasetArgument = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
const datasetPath = resolve(datasetArgument ?? DATASET_FILE);
const tweets = JSON.parse(await readFile(datasetPath, "utf8"));

if (!Array.isArray(tweets)) {
  throw new Error("Tweet dataset must be a JSON array");
}

const parsedRows = tweets.map(toRow);
const byId = new Map();

for (const row of parsedRows) {
  const existing = byId.get(row.id);

  if (existing && JSON.stringify(existing.raw_data) !== JSON.stringify(row.raw_data)) {
    throw new Error(`Tweet ${row.id} appears twice with conflicting payloads`);
  }

  byId.set(row.id, row);
}

const rows = [...byId.values()];
const duplicates = parsedRows.length - rows.length;

if (process.argv.includes("--dry-run")) {
  console.log(
    JSON.stringify(
      {
        valid: true,
        table: TABLE,
        records: rows.length,
        duplicatesCollapsed: duplicates,
        authors: [...new Set(rows.map((row) => row.author_username))],
        dataset: datasetPath,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

const env = await loadEnvLocal();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    "NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local",
  );
}

for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
  await upsertBatch(
    supabaseUrl.replace(/\/$/, ""),
    serviceRoleKey,
    rows.slice(offset, offset + BATCH_SIZE),
  );
}

console.log(`Imported ${rows.length} tweets into ${TABLE}.`);
