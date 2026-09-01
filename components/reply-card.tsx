import { GrokIcon, MoreIcon, VerifiedBadge } from "@/components/icons";
import { TweetActions } from "@/components/tweet-actions";
import { TweetMediaGrid } from "@/components/tweet-media";
import { TweetText } from "@/components/tweet-text";
import { formatIstDateTime, formatRelativeTime } from "@/lib/format";
import { normalizeMedia, type RawMedia } from "@/lib/media";
import type { Reply } from "@/lib/tweets";

export function ReplyCard({ reply }: { reply: Reply }) {
  const verified = reply.author_is_verified || reply.author_is_blue_verified;
  const media = normalizeMedia(
    (reply.extended_entities?.media as RawMedia[] | undefined) ??
      (reply.media as RawMedia[] | undefined),
  );

  return (
    <article className="flex gap-3 border-b border-[#2f3336] px-4 py-3 transition-colors hover:bg-[#080808]">
      <div className="shrink-0">
        {reply.author_profile_picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={reply.author_profile_picture.replace("_normal", "_x96")}
            alt={reply.author_name}
            className="h-10 w-10 rounded-full bg-[#16181c] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-[#16181c]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1 text-[15px]">
            <span className="truncate font-bold text-[#e7e9ea] hover:underline">
              {reply.author_name}
            </span>
            {verified ? (
              <VerifiedBadge className="h-[18px] w-[18px] shrink-0 text-[#1d9bf0]" />
            ) : null}
            <span className="truncate text-[#71767b]">@{reply.author_username}</span>
            <span className="text-[#71767b]">·</span>
            <time
              dateTime={reply.tweet_created_at}
              title={formatIstDateTime(reply.tweet_created_at)}
              className="text-[#71767b] hover:underline"
            >
              {formatRelativeTime(reply.tweet_created_at)}
            </time>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 text-[#71767b]">
            <GrokIcon className="h-[18.75px] w-[18.75px]" />
            <MoreIcon className="h-[18.75px] w-[18.75px]" />
          </div>
        </div>

        <TweetText text={reply.text} />

        {media.length > 0 ? <TweetMediaGrid media={media} /> : null}

        <TweetActions tweet={reply} url={reply.url} />
      </div>
    </article>
  );
}
