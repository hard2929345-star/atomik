import { GrokIcon, MoreIcon, VerifiedBadge } from "@/components/icons";
import { QuotedTweetCard } from "@/components/quoted-tweet";
import { TweetActions } from "@/components/tweet-actions";
import { TweetMediaGrid } from "@/components/tweet-media";
import { TweetText } from "@/components/tweet-text";
import { ViewOnX } from "@/components/view-on-x";
import { formatIstDateTime } from "@/lib/format";
import { normalizeMedia, type RawMedia } from "@/lib/media";
import type { QuoteTweet } from "@/lib/tweets";

export function QuoteCard({ quote }: { quote: QuoteTweet }) {
  const verified = quote.author_verified || quote.author_is_blue_verified;
  const paidPromotion = quote.content_disclosure?.advertising?.isPaidPromotion === true;
  const aiGenerated = quote.content_disclosure?.aiGenerated?.hasAiGeneratedMedia === true;
  const media = normalizeMedia(quote.media as RawMedia[] | undefined);

  return (
    <article className="flex gap-3 border-b border-[#2f3336] px-4 py-3 transition-colors hover:bg-[#080808]">
      <div className="shrink-0">
        {quote.author_profile_picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={quote.author_profile_picture.replace("_normal", "_x96")}
            alt={quote.author_name}
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
              {quote.author_name}
            </span>
            {verified ? (
              <VerifiedBadge className="h-[18px] w-[18px] shrink-0 text-[#1d9bf0]" />
            ) : null}
            <span className="truncate text-[#71767b]">@{quote.author_username}</span>
            <span className="text-[#71767b]">·</span>
            <time
              dateTime={quote.tweet_created_at}
              className="whitespace-nowrap text-[#71767b] hover:underline"
            >
              {formatIstDateTime(quote.tweet_created_at)}
            </time>
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2 text-[#71767b]">
            <GrokIcon className="h-[18.75px] w-[18.75px]" />
            <MoreIcon className="h-[18.75px] w-[18.75px]" />
          </div>
        </div>

        {paidPromotion || aiGenerated ? (
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            {paidPromotion ? (
              <span className="rounded-full border border-[#ffd400]/40 bg-[#ffd400]/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#ffd400]">
                Paid partnership
              </span>
            ) : null}
            {aiGenerated ? (
              <span className="rounded-full border border-[#536471] px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[#71767b]">
                AI media
              </span>
            ) : null}
          </div>
        ) : null}

        <TweetText text={quote.text} />

        {media.length > 0 ? <TweetMediaGrid media={media} /> : null}

        {quote.quoted_tweet?.text ? <QuotedTweetCard quoted={quote.quoted_tweet} /> : null}

        <div className="flex items-end justify-between gap-3">
          <TweetActions tweet={quote} url={quote.url} />
          <ViewOnX url={quote.url} className="mt-3" />
        </div>
      </div>
    </article>
  );
}
