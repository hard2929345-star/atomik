"use client";

import { useRouter } from "next/navigation";
import { GrokIcon, MoreIcon, VerifiedBadge } from "@/components/icons";
import { ProfileHoverCard } from "@/components/profile-hover-card";
import { tweetProfile } from "@/lib/profile";
import { TweetActions } from "@/components/tweet-actions";
import { TweetMediaGrid } from "@/components/tweet-media";
import { TweetText } from "@/components/tweet-text";
import { formatIstDateTime, formatRelativeTime } from "@/lib/format";
import { normalizeMedia, type RawMedia } from "@/lib/media";
import type { Tweet } from "@/lib/tweets";

export function TweetCard({ tweet, position }: { tweet: Tweet; position?: number }) {
  const router = useRouter();
  const verified = tweet.author_is_verified || tweet.author_is_blue_verified;
  const media = normalizeMedia(tweet.extended_entities?.media as RawMedia[] | undefined);
  const href = `/status/${tweet.id}`;

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={() => {
        if (window.getSelection()?.toString()) return;
        router.push(href);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter") router.push(href);
      }}
      className="flex cursor-pointer gap-3 border-b border-[#2f3336] px-4 py-3 transition-colors hover:bg-[#080808]"
    >
      <div className="shrink-0">
        <ProfileHoverCard profile={tweetProfile(tweet)}>
          {tweet.author_profile_picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={tweet.author_profile_picture.replace("_normal", "_x96")}
              alt={tweet.author_name}
              className="h-10 w-10 rounded-full bg-[#16181c] object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-10 w-10 rounded-full bg-[#16181c]" />
          )}
        </ProfileHoverCard>
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-x-1 text-[15px]">
            <ProfileHoverCard profile={tweetProfile(tweet)} className="items-center gap-x-1">
              <span className="truncate font-bold text-[#e7e9ea] hover:underline">
                {tweet.author_name}
              </span>
              {verified ? (
                <VerifiedBadge className="h-[18px] w-[18px] shrink-0 text-[#1d9bf0]" />
              ) : null}
              <span className="truncate text-[#71767b]">@{tweet.author_username}</span>
            </ProfileHoverCard>
            <span className="text-[#71767b]">·</span>
            <time
              dateTime={tweet.tweet_created_at}
              title={formatIstDateTime(tweet.tweet_created_at)}
              className="text-[#71767b] hover:underline"
            >
              {formatRelativeTime(tweet.tweet_created_at)}
            </time>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 text-[#71767b]">
            {position ? (
              <span className="mr-1 rounded-full border border-[#2f3336] px-2 py-0.5 text-[12px] font-bold tabular-nums text-[#e7e9ea]">
                #{position}
              </span>
            ) : null}
            <button
              type="button"
              aria-label="Grok actions"
              onClick={(event) => event.stopPropagation()}
              className="-m-2 rounded-full p-2 hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0]"
            >
              <GrokIcon className="h-[18.75px] w-[18.75px]" />
            </button>
            <button
              type="button"
              aria-label="More"
              onClick={(event) => event.stopPropagation()}
              className="-m-2 rounded-full p-2 hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0]"
            >
              <MoreIcon className="h-[18.75px] w-[18.75px]" />
            </button>
          </div>
        </div>

        <TweetText text={tweet.text} />

        {media.length > 0 ? (
          <div onClick={(event) => event.stopPropagation()}>
            <TweetMediaGrid media={media} />
          </div>
        ) : null}

        <TweetActions tweet={tweet} url={tweet.url} />
      </div>
    </article>
  );
}
