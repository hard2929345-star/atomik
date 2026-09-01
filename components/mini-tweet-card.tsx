import { LikeIcon, ReplyIcon, RetweetIcon, ViewsIcon } from "@/components/icons";
import { formatCount } from "@/lib/format";
import { TweetVideo } from "@/components/tweet-video";
import { ViewOnX } from "@/components/view-on-x";
import { formatDuration, type NormalizedMedia } from "@/lib/media";

function Thumb({ media }: { media: NormalizedMedia }) {
  const duration = formatDuration(media.durationMillis);

  if (media.videoUrl) {
    return (
      <span className="block h-[92px] w-[92px] shrink-0 overflow-hidden rounded-lg">
        <TweetVideo
          src={media.videoUrl}
          poster={media.posterUrl}
          duration={duration}
          fill
          compact
        />
      </span>
    );
  }

  return (
    <span className="relative block shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={media.posterUrl}
        alt=""
        className="h-[92px] w-[92px] rounded-lg bg-[#16181c] object-cover"
        loading="lazy"
      />
    </span>
  );
}

function Metric({
  icon: Icon,
  value,
}: {
  icon: (props: { className?: string }) => React.ReactElement;
  value: number;
}) {
  return (
    <span className="flex items-center gap-1 text-[12px] text-[#71767b]">
      <Icon className="h-[15px] w-[15px]" />
      {formatCount(value)}
    </span>
  );
}

export function MiniTweetCard({
  url,
  text,
  media,
  author,
  metrics,
  paidPromotion = false,
  aiGenerated = false,
}: {
  url: string;
  text: string;
  media: NormalizedMedia[];
  author?: { name: string; username: string; profilePicture: string | null };
  metrics?: { replies: number; reposts: number; likes: number; views: number };
  paidPromotion?: boolean;
  aiGenerated?: boolean;
}) {
  return (
    <div className="max-w-[420px] rounded-xl border border-[#2f3336] bg-black p-3 transition-colors hover:border-[#536471]">
      {author ? (
        <span className="mb-1.5 flex items-center gap-1.5">
          {author.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={author.profilePicture}
              alt=""
              className="h-5 w-5 shrink-0 rounded-full bg-[#16181c] object-cover"
              loading="lazy"
            />
          ) : (
            <span className="h-5 w-5 shrink-0 rounded-full bg-[#16181c]" />
          )}
          <span className="truncate text-[13px] font-bold text-[#e7e9ea]">{author.name}</span>
          <span className="truncate text-[13px] text-[#71767b]">@{author.username}</span>
        </span>
      ) : null}

      {paidPromotion || aiGenerated ? (
        <span className="mb-1.5 flex flex-wrap items-center gap-1.5">
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
        </span>
      ) : null}

      <div className="flex gap-2.5">
        {media[0] ? <Thumb media={media[0]} /> : null}
        <span className="line-clamp-4 min-w-0 whitespace-pre-wrap break-words text-[14px] leading-5 text-[#e7e9ea]">
          {text}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between gap-3">
        {metrics ? (
          <span className="flex items-center gap-4">
            <Metric icon={ReplyIcon} value={metrics.replies} />
            <Metric icon={RetweetIcon} value={metrics.reposts} />
            <Metric icon={LikeIcon} value={metrics.likes} />
            <Metric icon={ViewsIcon} value={metrics.views} />
          </span>
        ) : (
          <span />
        )}
        <ViewOnX url={url} />
      </div>
    </div>
  );
}
