import { unstable_cache } from "next/cache";
import { normalizeMedia, type NormalizedMedia, type RawMedia } from "@/lib/media";
import { queryTable } from "@/lib/tweets";

export type SourcePost = {
  id: string;
  url: string;
  text: string;
  createdAt: string;
  authorName: string;
  authorUsername: string;
  authorProfilePicture: string | null;
  media: NormalizedMedia[];
};

export type QuoteEntry = {
  id: string;
  url: string;
  text: string;
  createdAt: string;
  media: NormalizedMedia[];
  replyCount: number;
  retweetCount: number;
  likeCount: number;
  viewCount: number;
  isPaidPromotion: boolean;
  hasAiGeneratedMedia: boolean;
  source: SourcePost | null;
};

export type QuoteAuthorActivity = {
  authorId: string;
  username: string;
  name: string;
  profilePicture: string | null;
  verified: boolean;
  quotes: QuoteEntry[];
};

/** Small per-author record: identity plus the ids of that author's quotes. */
type AuthorIndexEntry = {
  authorId: string;
  username: string;
  name: string;
  profilePicture: string | null;
  verified: boolean;
  quoteIds: string[];
  paidQuoteIds: string[];
};

type ContentDisclosure = {
  advertising?: { isPaidPromotion?: boolean };
  aiGenerated?: { hasAiGeneratedMedia?: boolean };
} | null;

type IndexRow = {
  id: string;
  tweet_created_at: string;
  author_id: string;
  author_username: string;
  author_name: string;
  author_profile_picture: string | null;
  author_verified: boolean;
  author_is_blue_verified: boolean;
  content_disclosure: ContentDisclosure;
};

type QuoteDetailRow = {
  id: string;
  url: string;
  text: string;
  tweet_created_at: string;
  source_tweet_id: string;
  media: RawMedia[] | null;
  reply_count: number;
  retweet_count: number;
  like_count: number;
  view_count: number;
  content_disclosure: ContentDisclosure;
};

type SourceRow = {
  id: string;
  url: string;
  text: string;
  tweet_created_at: string;
  author_name: string;
  author_username: string;
  author_profile_picture: string | null;
  extended_entities: { media?: RawMedia[] } | null;
};

const INDEX_COLUMNS = [
  "id",
  "tweet_created_at",
  "author_id",
  "author_username",
  "author_name",
  "author_profile_picture",
  "author_verified",
  "author_is_blue_verified",
  "content_disclosure",
].join(",");

const DETAIL_COLUMNS = [
  "id",
  "url",
  "text",
  "tweet_created_at",
  "source_tweet_id",
  "media",
  "reply_count",
  "retweet_count",
  "like_count",
  "view_count",
  "content_disclosure",
].join(",");

const SOURCE_COLUMNS = [
  "id",
  "url",
  "text",
  "tweet_created_at",
  "author_name",
  "author_username",
  "author_profile_picture",
  "extended_entities",
].join(",");

async function loadAuthorIndex(): Promise<AuthorIndexEntry[]> {
  const pageSize = 1000;
  const rows: IndexRow[] = [];

  for (let offset = 0; ; offset += pageSize) {
    const page = await queryTable<IndexRow[]>(
      `quote_tweet_table_atomik?select=${INDEX_COLUMNS}&order=tweet_created_at.desc` +
        `&limit=${pageSize}&offset=${offset}`,
    );

    rows.push(...page);
    if (page.length < pageSize) break;
  }

  const byAuthor = new Map<string, AuthorIndexEntry>();

  for (const row of rows) {
    const isPaid = row.content_disclosure?.advertising?.isPaidPromotion === true;
    const existing = byAuthor.get(row.author_id);

    if (existing) {
      existing.quoteIds.push(row.id);
      if (isPaid) existing.paidQuoteIds.push(row.id);
      continue;
    }

    byAuthor.set(row.author_id, {
      authorId: row.author_id,
      username: row.author_username,
      name: row.author_name,
      profilePicture: row.author_profile_picture,
      verified: row.author_verified || row.author_is_blue_verified,
      quoteIds: [row.id],
      paidQuoteIds: isPaid ? [row.id] : [],
    });
  }

  return [...byAuthor.values()].sort(
    (a, b) => b.quoteIds.length - a.quoteIds.length || a.username.localeCompare(b.username),
  );
}

async function loadSourcePosts(): Promise<Record<string, SourcePost>> {
  const rows = await queryTable<SourceRow[]>(`tweet_table_atomik?select=${SOURCE_COLUMNS}`);
  const sources: Record<string, SourcePost> = {};

  for (const row of rows) {
    sources[row.id] = {
      id: row.id,
      url: row.url,
      text: row.text,
      createdAt: row.tweet_created_at,
      authorName: row.author_name,
      authorUsername: row.author_username,
      authorProfilePicture: row.author_profile_picture,
      // Only the first item is ever rendered as a thumbnail.
      media: normalizeMedia(row.extended_entities?.media).slice(0, 1),
    };
  }

  return sources;
}

/**
 * Only the lightweight index is cached — the full card payload for every quote
 * is far past Next's 2MB cache-entry ceiling, so card details are fetched per
 * page instead.
 */
const getCachedAuthorIndex = unstable_cache(loadAuthorIndex, ["quote-author-index"], {
  tags: ["quote-analytics"],
  revalidate: 3600,
});

const getCachedSourcePosts = unstable_cache(loadSourcePosts, ["quote-source-posts"], {
  tags: ["quote-analytics"],
  revalidate: 3600,
});

async function fetchQuoteDetails(ids: string[]): Promise<Map<string, QuoteDetailRow>> {
  const details = new Map<string, QuoteDetailRow>();
  const chunkSize = 100;

  for (let index = 0; index < ids.length; index += chunkSize) {
    const chunk = ids.slice(index, index + chunkSize);
    const rows = await queryTable<QuoteDetailRow[]>(
      `quote_tweet_table_atomik?select=${DETAIL_COLUMNS}` +
        `&id=in.(${chunk.join(",")})&limit=${chunk.length}`,
    );

    for (const row of rows) details.set(row.id, row);
  }

  return details;
}

export const PAGE_SIZE = 100;

export type QuoteAuthorPage = {
  authors: QuoteAuthorActivity[];
  total: number;
  totalQuotes: number;
  allQuotes: number;
  paidAuthors: number;
  paidQuotes: number;
  nextOffset: number | null;
};

export async function getQuoteAuthorPage(
  offset = 0,
  limit = PAGE_SIZE,
  paidOnly = false,
): Promise<QuoteAuthorPage> {
  const [fullIndex, sources] = await Promise.all([
    getCachedAuthorIndex(),
    getCachedSourcePosts(),
  ]);

  const index = paidOnly
    ? fullIndex
        .filter((author) => author.paidQuoteIds.length > 0)
        .map((author) => ({ ...author, quoteIds: author.paidQuoteIds }))
    : fullIndex;

  const slice = index.slice(offset, offset + limit);
  const details = await fetchQuoteDetails(slice.flatMap((author) => author.quoteIds));

  const authors: QuoteAuthorActivity[] = slice.map((author) => ({
    authorId: author.authorId,
    username: author.username,
    name: author.name,
    profilePicture: author.profilePicture,
    verified: author.verified,
    quotes: author.quoteIds.flatMap((id) => {
      const row = details.get(id);
      if (!row) return [];

      return [
        {
          id: row.id,
          url: row.url,
          text: row.text,
          createdAt: row.tweet_created_at,
          media: normalizeMedia(row.media).slice(0, 1),
          replyCount: row.reply_count,
          retweetCount: row.retweet_count,
          likeCount: row.like_count,
          viewCount: row.view_count,
          isPaidPromotion: row.content_disclosure?.advertising?.isPaidPromotion === true,
          hasAiGeneratedMedia: row.content_disclosure?.aiGenerated?.hasAiGeneratedMedia === true,
          source: sources[row.source_tweet_id] ?? null,
        },
      ];
    }),
  }));

  return {
    authors,
    total: index.length,
    totalQuotes: index.reduce((sum, author) => sum + author.quoteIds.length, 0),
    allQuotes: fullIndex.reduce((sum, author) => sum + author.quoteIds.length, 0),
    paidAuthors: fullIndex.filter((author) => author.paidQuoteIds.length > 0).length,
    paidQuotes: fullIndex.reduce((sum, author) => sum + author.paidQuoteIds.length, 0),
    nextOffset: offset + limit < index.length ? offset + limit : null,
  };
}
