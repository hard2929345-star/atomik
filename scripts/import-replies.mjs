import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const DATASET_FILE = "reply.json";
const TABLE = "reply_tweet_table_atomik";
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
    throw new Error(`Invalid ${field} for reply ${tweetId}: ${value}`);
  }
  return parsed.toISOString();
}

function nonNegativeInteger(value, field, tweetId) {
  const parsed = Number(value ?? 0);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${field} for reply ${tweetId}: ${value}`);
  }
  return parsed;
}

function optionalText(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toRow(reply) {
  const author = reply.author ?? {};
  const rootTweetId = reply.conversationId;
  const parentTweetId = reply.inReplyToId;

  if (!reply.id || typeof reply.text !== "string" || !reply.url || !author.id) {
    throw new Error(`Reply ${reply.id ?? "<unknown>"} is missing a required field`);
  }

  if (!rootTweetId || !parentTweetId) {
    throw new Error(`Reply ${reply.id} is missing conversationId or inReplyToId`);
  }

  if (parentTweetId === reply.id) {
    throw new Error(`Reply ${reply.id} points at itself as its parent`);
  }

  return {
    id: reply.id,
    root_tweet_id: rootTweetId,
    parent_tweet_id: parentTweetId,
    conversation_id: rootTweetId,
    in_reply_to_user_id: optionalText(reply.inReplyToUserId),
    in_reply_to_username: optionalText(reply.inReplyToUsername),
    type: reply.type ?? "tweet",
    url: reply.url,
    twitter_url: optionalText(reply.twitterUrl),
    text: reply.text,
    source: reply.source ?? "",
    retweet_count: nonNegativeInteger(reply.retweetCount, "retweetCount", reply.id),
    reply_count: nonNegativeInteger(reply.replyCount, "replyCount", reply.id),
    like_count: nonNegativeInteger(reply.likeCount, "likeCount", reply.id),
    quote_count: nonNegativeInteger(reply.quoteCount, "quoteCount", reply.id),
    view_count: nonNegativeInteger(reply.viewCount, "viewCount", reply.id),
    bookmark_count: nonNegativeInteger(reply.bookmarkCount, "bookmarkCount", reply.id),
    tweet_created_at: timestamp(reply.createdAt, "createdAt", reply.id),
    lang: optionalText(reply.lang),
    is_reply: true,
    is_pinned: Boolean(reply.isPinned),
    is_retweet: Boolean(reply.isRetweet),
    is_quote: Boolean(reply.isQuote),
    is_conversation_controlled: Boolean(reply.isConversationControlled),
    author_id: author.id,
    author_username: author.userName ?? author.username,
    author_name: author.name,
    author_profile_picture: optionalText(author.profilePicture),
    author_is_verified: Boolean(author.isVerified),
    author_is_blue_verified: Boolean(author.isBlueVerified),
    author_followers: nonNegativeInteger(author.followers, "author.followers", reply.id),
    author_following: nonNegativeInteger(author.following, "author.following", reply.id),
    author,
    extended_entities: reply.extendedEntities ?? {},
    entities: reply.entities ?? {},
    card: reply.card ?? {},
    place: reply.place ?? {},
    media: reply.media ?? [],
    raw_data: reply,
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
const records = JSON.parse(await readFile(datasetPath, "utf8"));

if (!Array.isArray(records)) {
  throw new Error("Reply dataset must be a JSON array");
}

// The scraper interleaves the root tweets with their replies; root tweets belong
// to tweet_table_atomik, so only genuine replies are imported here.
const replies = records.filter((record) => record.isReply);
const skippedRoots = records.length - replies.length;

// A reply can appear more than once across scrape pages, sometimes with refreshed
// engagement counts. The last occurrence wins.
const byId = new Map();
for (const reply of replies) {
  byId.set(reply.id, toRow(reply));
}

const rows = [...byId.values()];
const duplicates = replies.length - rows.length;

if (process.argv.includes("--dry-run")) {
  console.log(
    JSON.stringify(
      {
        valid: true,
        table: TABLE,
        records: rows.length,
        skippedRootTweets: skippedRoots,
        duplicatesCollapsed: duplicates,
        rootTweetIds: [...new Set(rows.map((row) => row.root_tweet_id))],
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

console.log(`Imported ${rows.length} replies into ${TABLE}.`);
