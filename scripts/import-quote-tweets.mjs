import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const DATASET_FILE = "dataset_x-tweet-scraper_2026-09-01_15-43-58-506.json";
const TABLE = "quote_tweet_table_atomik";
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
  const sourceTweetId = tweet.sourceTweetId ?? tweet.sourceTarget;
  const quotedTweetId = tweet.quotedTweetId ?? tweet.quotedTweet?.id;

  if (!tweet.id || !tweet.text || !tweet.url || !sourceTweetId || !quotedTweetId) {
    throw new Error(`Tweet ${tweet.id ?? "<unknown>"} is missing a required field`);
  }

  if (sourceTweetId !== quotedTweetId) {
    throw new Error(
      `Tweet ${tweet.id} has mismatched source (${sourceTweetId}) and quote (${quotedTweetId}) IDs`,
    );
  }

  return {
    id: tweet.id,
    source_tweet_id: sourceTweetId,
    quoted_tweet_id: quotedTweetId,
    type: tweet.type ?? "tweet",
    text: tweet.text,
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
    author_is_blue_verified: Boolean(
      tweet.authorIsBlueVerified ?? author.isBlueVerified,
    ),
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
  throw new Error("Quote-tweet dataset must be a JSON array");
}

const rows = tweets.map(toRow);
const ids = new Set(rows.map((row) => row.id));

if (ids.size !== rows.length) {
  throw new Error(`Dataset contains ${rows.length - ids.size} duplicate tweet ID(s)`);
}

const sourceIds = [...new Set(rows.map((row) => row.source_tweet_id))];

if (process.argv.includes("--dry-run")) {
  console.log(
    JSON.stringify(
      {
        valid: true,
        table: TABLE,
        records: rows.length,
        sourceTweetIds: sourceIds,
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

console.log(`Imported ${rows.length} quote tweets into ${TABLE}.`);
