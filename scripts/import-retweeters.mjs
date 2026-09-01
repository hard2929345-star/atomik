import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const DATASET_FILE = "dataset_x-tweet-scraper_2026-09-01_15-59-00-337.json";
const TABLE = "retweeter_table_atomik";
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

function timestamp(value, field, userId) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) {
    throw new Error(`Invalid ${field} for user ${userId}: ${value}`);
  }
  return parsed.toISOString();
}

function nonNegativeInteger(value, field, userId) {
  const parsed = Number(value ?? 0);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new Error(`Invalid ${field} for user ${userId}: ${value}`);
  }
  return parsed;
}

function optionalText(value) {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function toRow(user) {
  const sourceTweetId = user.sourceTweetId ?? user.sourceTarget;

  if (!user.id || !user.username || !user.name || !sourceTweetId) {
    throw new Error(`Retweeter ${user.id ?? "<unknown>"} is missing a required field`);
  }

  if (user.sourceTarget && user.sourceTarget !== sourceTweetId) {
    throw new Error(
      `Retweeter ${user.id} has mismatched source IDs (${sourceTweetId} and ${user.sourceTarget})`,
    );
  }

  return {
    source_tweet_id: sourceTweetId,
    user_id: user.id,
    username: user.username,
    name: user.name,
    followers: nonNegativeInteger(user.followers, "followers", user.id),
    following: nonNegativeInteger(user.following, "following", user.id),
    verified: Boolean(user.verified),
    is_blue_verified: Boolean(user.isBlueVerified),
    is_verified: Boolean(user.isVerified),
    profile_picture: optionalText(user.profilePicture),
    cover_picture: optionalText(user.coverPicture),
    profile_banner_url: optionalText(user.profileBannerUrl),
    description: optionalText(user.description),
    location: optionalText(user.location),
    account_created_at: timestamp(user.createdAt, "createdAt", user.id),
    statuses_count: nonNegativeInteger(user.statusesCount, "statusesCount", user.id),
    media_count: nonNegativeInteger(user.mediaCount, "mediaCount", user.id),
    protected: Boolean(user.protected),
    profile_url: optionalText(user.url),
    favourites_count: nonNegativeInteger(
      user.favouritesCount,
      "favouritesCount",
      user.id,
    ),
    possibly_sensitive: Boolean(user.possiblySensitive),
    verified_type: optionalText(user.verifiedType),
    has_graduated_access: Boolean(user.hasGraduatedAccess),
    parody_commentary_fan_label: optionalText(user.parodyCommentaryFanLabel),
    profile_description_language: optionalText(user.profileDescriptionLanguage),
    profile_image_shape: optionalText(user.profileImageShape),
    profile_interstitial_type: optionalText(user.profileInterstitialType),
    profile_translator_type: optionalText(user.profileTranslatorType),
    super_follow_eligible: Boolean(user.superFollowEligible),
    engagement_mode: user.engagementMode ?? "retweeters",
    result_type: user.resultType ?? "user",
    source_target: user.sourceTarget ?? sourceTweetId,
    tweet_url: optionalText(user.tweetUrl),
    twitter_url: optionalText(user.twitterUrl),
    profile_bio: user.profileBio ?? {},
    affiliates_highlighted_label: user.affiliatesHighlightedLabel ?? null,
    professional: user.professional ?? null,
    pinned_tweet_ids: user.pinnedTweetIds ?? [],
    raw_data: user,
    updated_at: new Date().toISOString(),
  };
}

async function upsertBatch(url, serviceRoleKey, rows) {
  const response = await fetch(
    `${url}/rest/v1/${TABLE}?on_conflict=source_tweet_id,user_id`,
    {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(rows),
    },
  );

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Supabase import failed (${response.status}): ${detail}`);
  }
}

const datasetArgument = process.argv.slice(2).find((argument) => !argument.startsWith("--"));
const datasetPath = resolve(datasetArgument ?? DATASET_FILE);
const users = JSON.parse(await readFile(datasetPath, "utf8"));

if (!Array.isArray(users)) {
  throw new Error("Retweeter dataset must be a JSON array");
}

const rows = users.map(toRow);
const keys = new Set(rows.map((row) => `${row.source_tweet_id}:${row.user_id}`));

if (keys.size !== rows.length) {
  throw new Error(`Dataset contains ${rows.length - keys.size} duplicate retweeter(s)`);
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

console.log(`Imported ${rows.length} retweeters into ${TABLE}.`);
