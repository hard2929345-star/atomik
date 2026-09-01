"use client";

import {
  BookmarkIcon,
  LikeIcon,
  ReplyIcon,
  RetweetIcon,
  ShareIcon,
  ViewsIcon,
} from "@/components/icons";
import { formatCount } from "@/lib/format";

type Counts = {
  reply_count: number;
  retweet_count: number;
  quote_count: number;
  like_count: number;
  view_count: number;
  bookmark_count: number;
};

function Action({
  icon: Icon,
  count,
  label,
  hoverClass,
}: {
  icon: (props: { className?: string }) => React.ReactElement;
  count: number;
  label: string;
  hoverClass: string;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={(event) => event.stopPropagation()}
      className={`group flex items-center gap-1 text-[13px] text-[#71767b] transition-colors ${hoverClass}`}
    >
      <span className="-m-2 rounded-full p-2 transition-colors group-hover:bg-current/10">
        <Icon className="h-[18.75px] w-[18.75px]" />
      </span>
      {count > 0 ? <span className="tabular-nums">{formatCount(count)}</span> : null}
    </button>
  );
}

export function TweetActions({ tweet, url }: { tweet: Counts; url: string }) {
  return (
    <div className="mt-3 flex max-w-[425px] items-center justify-between">
      <Action
        icon={ReplyIcon}
        count={tweet.reply_count}
        label="Reply"
        hoverClass="hover:text-[#1d9bf0]"
      />
      <Action
        icon={RetweetIcon}
        count={tweet.retweet_count + tweet.quote_count}
        label="Repost"
        hoverClass="hover:text-[#00ba7c]"
      />
      <Action
        icon={LikeIcon}
        count={tweet.like_count}
        label="Like"
        hoverClass="hover:text-[#f91880]"
      />
      <Action
        icon={ViewsIcon}
        count={tweet.view_count}
        label="Views"
        hoverClass="hover:text-[#1d9bf0]"
      />
      <div className="flex items-center gap-1">
        <Action
          icon={BookmarkIcon}
          count={tweet.bookmark_count}
          label="Bookmark"
          hoverClass="hover:text-[#1d9bf0]"
        />
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          aria-label="Open on X"
          onClick={(event) => event.stopPropagation()}
          className="-m-2 rounded-full p-2 text-[#71767b] transition-colors hover:bg-[#1d9bf0]/10 hover:text-[#1d9bf0]"
        >
          <ShareIcon className="h-[18.75px] w-[18.75px]" />
        </a>
      </div>
    </div>
  );
}
