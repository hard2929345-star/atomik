import { VerifiedBadge } from "@/components/icons";
import { formatIstDateTime, formatRelativeTime } from "@/lib/format";
import { normalizeMedia, type RawMedia } from "@/lib/media";
import type { QuoteTweet } from "@/lib/tweets";

export function QuotedTweetCard({ quoted }: { quoted: NonNullable<QuoteTweet["quoted_tweet"]> }) {
  const author = quoted.author ?? {};
  const verified = Boolean(author.isBlueVerified || author.isVerified);
  const media = normalizeMedia(quoted.media as RawMedia[] | undefined);
  const thumbnail = media[0]?.posterUrl ?? quoted.mediaUrls?.[0];

  return (
    <div className="mt-3 overflow-hidden rounded-2xl border border-[#2f3336]">
      <div className="flex items-center gap-1 px-3 pt-2 text-[15px]">
        {author.profilePicture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={author.profilePicture}
            alt=""
            className="h-5 w-5 rounded-full bg-[#16181c] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-5 w-5 rounded-full bg-[#16181c]" />
        )}
        <span className="font-bold text-[#e7e9ea]">{author.name}</span>
        {verified ? <VerifiedBadge className="h-[16px] w-[16px] text-[#1d9bf0]" /> : null}
        <span className="text-[#71767b]">@{author.username}</span>
        {quoted.createdAt ? (
          <>
            <span className="text-[#71767b]">·</span>
            <span className="text-[#71767b]" title={formatIstDateTime(quoted.createdAt)}>
              {formatRelativeTime(quoted.createdAt)}
            </span>
          </>
        ) : null}
      </div>

      <div className="flex gap-3 px-3 pb-3 pt-1">
        {thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbnail}
            alt=""
            className="h-[76px] w-[76px] shrink-0 rounded-lg bg-[#16181c] object-cover"
            loading="lazy"
          />
        ) : null}
        <p className="line-clamp-4 min-w-0 whitespace-pre-wrap break-words text-[15px] leading-5 text-[#e7e9ea]">
          {quoted.text}
        </p>
      </div>
    </div>
  );
}
