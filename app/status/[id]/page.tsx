import Link from "next/link";
import { notFound } from "next/navigation";
import { BackHeader } from "@/components/back-header";
import {
  BookmarkIcon,
  GrokIcon,
  LikeIcon,
  MoreIcon,
  ReplyIcon,
  RetweetIcon,
  ShareIcon,
  VerifiedBadge,
} from "@/components/icons";
import { ReplyCard } from "@/components/reply-card";
import { LeftSidebar, RightSidebar } from "@/components/sidebar";
import { TweetMediaGrid } from "@/components/tweet-media";
import { DateRangeFilter } from "@/components/date-range-filter";
import { SortPanel } from "@/components/sort-panel";
import { formatCount, formatFullTimestamp } from "@/lib/format";
import {
  dateRangeFilter,
  parseDateRange,
  parseDirection,
  parsePostSortField,
  POST_DATE_COLUMN,
  POST_SORT_FIELDS,
  postOrder,
} from "@/lib/sort";
import { normalizeMedia, type RawMedia } from "@/lib/media";
import { getReplies, getTweet } from "@/lib/tweets";

function DetailAction({
  icon: Icon,
  count,
  label,
  hoverClass,
}: {
  icon: (props: { className?: string }) => React.ReactElement;
  count?: number;
  label: string;
  hoverClass: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`group flex items-center gap-1.5 text-[13px] text-[#71767b] transition-colors ${hoverClass}`}
    >
      <span className="-m-2 rounded-full p-2 transition-colors group-hover:bg-current/10">
        <Icon className="h-[22.5px] w-[22.5px]" />
      </span>
      {count ? <span className="tabular-nums">{formatCount(count)}</span> : null}
    </button>
  );
}

const SORT_LABELS: Record<string, string> = {
  date: "Latest",
  views: "Most views",
  likes: "Most likes",
};

export default async function PostPage({ params, searchParams }: PageProps<"/status/[id]">) {
  const [{ id }, { sort, dir, from, to }] = await Promise.all([params, searchParams]);
  const field = parsePostSortField(sort, "views");
  const direction = parseDirection(dir);
  const range = parseDateRange(from, to);

  const [tweet, replies] = await Promise.all([
    getTweet(id),
    getReplies(id, postOrder(field, direction), dateRangeFilter(POST_DATE_COLUMN, range)),
  ]);

  if (!tweet) notFound();

  const verified = tweet.author_is_verified || tweet.author_is_blue_verified;
  const media = normalizeMedia(tweet.extended_entities?.media as RawMedia[] | undefined);

  return (
    <div className="mx-auto flex w-full max-w-[1265px] justify-center bg-black">
      <LeftSidebar />

      <main className="w-full max-w-[600px] shrink border-x border-[#2f3336]">
        <BackHeader title="Post" />

        <article className="px-4 pt-3">
          <div className="flex items-center gap-3">
            {tweet.author_profile_picture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={tweet.author_profile_picture.replace("_normal", "_x96")}
                alt={tweet.author_name}
                className="h-10 w-10 rounded-full bg-[#16181c] object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-[#16181c]" />
            )}

            <div className="min-w-0 flex-1 leading-tight">
              <div className="flex items-center gap-1">
                <span className="truncate text-[15px] font-bold text-[#e7e9ea] hover:underline">
                  {tweet.author_name}
                </span>
                {verified ? (
                  <VerifiedBadge className="h-[18px] w-[18px] shrink-0 text-[#1d9bf0]" />
                ) : null}
              </div>
              <p className="truncate text-[15px] text-[#71767b]">@{tweet.author_username}</p>
            </div>

            <div className="flex shrink-0 items-center gap-2 text-[#71767b]">
              <GrokIcon className="h-[18.75px] w-[18.75px]" />
              <MoreIcon className="h-[18.75px] w-[18.75px]" />
            </div>
          </div>

          <p className="mt-3 whitespace-pre-wrap break-words text-[17px] leading-6 text-[#e7e9ea]">
            {tweet.text}
          </p>

          {media.length > 0 ? <TweetMediaGrid media={media} /> : null}

          <div className="border-b border-[#2f3336] py-4 text-[15px] text-[#71767b]">
            <time dateTime={tweet.tweet_created_at}>
              {formatFullTimestamp(tweet.tweet_created_at)}
            </time>
            <span> · </span>
            <span className="font-bold text-[#e7e9ea]">{formatCount(tweet.view_count)}</span> Views
          </div>

          <div className="flex items-center justify-between border-b border-[#2f3336] px-2 py-1">
            <DetailAction
              icon={ReplyIcon}
              count={tweet.reply_count}
              label="Reply"
              hoverClass="hover:text-[#1d9bf0]"
            />
            <DetailAction
              icon={RetweetIcon}
              count={tweet.retweet_count + tweet.quote_count}
              label="Repost"
              hoverClass="hover:text-[#00ba7c]"
            />
            <DetailAction
              icon={LikeIcon}
              count={tweet.like_count}
              label="Like"
              hoverClass="hover:text-[#f91880]"
            />
            <DetailAction
              icon={BookmarkIcon}
              count={tweet.bookmark_count}
              label="Bookmark"
              hoverClass="hover:text-[#1d9bf0]"
            />
            <a
              href={tweet.url}
              target="_blank"
              rel="noreferrer"
              aria-label="Open on X"
              className="-m-2 rounded-full p-2 text-[#71767b] transition-colors hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0]"
            >
              <ShareIcon className="h-[22.5px] w-[22.5px]" />
            </a>
          </div>

          <div className="flex items-center justify-between border-b border-[#2f3336] py-3 text-[15px]">
            <span className="flex items-center gap-1 font-bold text-[#e7e9ea]">
              {SORT_LABELS[field]}
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
                <path d="M12 15.5l-6-6 1.4-1.4 4.6 4.6 4.6-4.6L18 9.5l-6 6z" />
              </svg>
            </span>
            <Link
              href={`/status/${tweet.id}/quotes`}
              className="flex items-center gap-1 text-[#1d9bf0] hover:underline"
            >
              View quotes
              <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor">
                <path d="M9.5 18l-1.4-1.4 4.6-4.6-4.6-4.6L9.5 6l6 6-6 6z" />
              </svg>
            </Link>
          </div>

          <div className="flex items-center gap-3 border-b border-[#2f3336] py-3">
            <div className="h-10 w-10 shrink-0 rounded-full bg-[#16181c]" />
            <input
              type="text"
              placeholder="Post your reply"
              className="flex-1 bg-transparent text-xl text-[#e7e9ea] outline-none placeholder:text-[#71767b]"
            />
            <button
              type="button"
              disabled
              className="rounded-full bg-[#1d9bf0] px-4 py-1.5 text-[15px] font-bold text-white opacity-50"
            >
              Reply
            </button>
          </div>
        </article>

        {replies.length === 0 ? (
          <p className="px-4 py-10 text-center text-[15px] text-[#71767b]">
            No replies match this filter.
          </p>
        ) : (
          replies.map((reply) => <ReplyCard key={reply.id} reply={reply} />)
        )}
      </main>

      <RightSidebar>
        <SortPanel
          title="Sort replies"
          basePath={`/status/${id}`}
          fields={POST_SORT_FIELDS}
          activeField={field}
          activeDirection={direction}
          range={range}
        />
        <DateRangeFilter
          basePath={`/status/${id}`}
          label="Replied between"
          sort={field}
          direction={direction}
          range={range}
        />
      </RightSidebar>
    </div>
  );
}
