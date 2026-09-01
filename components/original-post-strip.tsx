import { VerifiedBadge } from "@/components/icons";
import { formatIstDateTime } from "@/lib/format";
import { ViewOnX } from "@/components/view-on-x";
import type { Tweet } from "@/lib/tweets";

export function OriginalPostStrip({ tweet }: { tweet: Tweet }) {
  const verified = tweet.author_is_verified || tweet.author_is_blue_verified;

  return (
    <div className="border-b border-[#2f3336] bg-[#0a0a0b] px-4 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[13px] uppercase tracking-wide text-[#71767b]">Original post</p>
        <ViewOnX url={tweet.url} />
      </div>

      <div className="mt-1 flex items-center gap-2">
        {tweet.author_profile_picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={tweet.author_profile_picture.replace("_normal", "_x96")}
            alt={tweet.author_name}
            className="h-6 w-6 shrink-0 rounded-full bg-[#16181c] object-cover"
          />
        ) : (
          <div className="h-6 w-6 shrink-0 rounded-full bg-[#16181c]" />
        )}

        <span className="flex min-w-0 items-center gap-1 text-[15px]">
          <span className="truncate font-bold text-[#e7e9ea]">{tweet.author_name}</span>
          {verified ? (
            <VerifiedBadge className="h-[16px] w-[16px] shrink-0 text-[#1d9bf0]" />
          ) : null}
          <span className="truncate text-[#71767b]">@{tweet.author_username}</span>
        </span>
      </div>

      <p className="mt-1 text-[15px] text-[#e7e9ea]">
        Posted{" "}
        <time dateTime={tweet.tweet_created_at} className="font-bold">
          {formatIstDateTime(tweet.tweet_created_at)}
        </time>
      </p>
    </div>
  );
}
