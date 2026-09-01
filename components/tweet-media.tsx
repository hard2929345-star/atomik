import { TweetVideo } from "@/components/tweet-video";
import { formatDuration, type NormalizedMedia } from "@/lib/media";

function MediaItem({ media, fill }: { media: NormalizedMedia; fill: boolean }) {
  const duration = formatDuration(media.durationMillis);

  if (media.videoUrl) {
    return (
      <TweetVideo
        src={media.videoUrl}
        poster={media.posterUrl}
        duration={duration}
        fill={fill}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={media.posterUrl}
      alt=""
      className={`w-full bg-[#16181c] object-cover ${fill ? "h-full" : "max-h-[510px]"}`}
      loading="lazy"
    />
  );
}

export function TweetMediaGrid({
  media,
  className = "",
}: {
  media: NormalizedMedia[];
  className?: string;
}) {
  const items = media.slice(0, 4);
  if (items.length === 0) return null;

  const single = items.length === 1;

  return (
    <div
      className={`mt-3 grid overflow-hidden rounded-2xl border border-[#2f3336] ${
        single ? "" : "aspect-video grid-cols-2 gap-0.5"
      } ${items.length === 3 ? "[&>*:first-child]:row-span-2" : ""} ${className}`}
    >
      {items.map((item) => (
        <div key={item.id} className={single ? "" : "h-full min-h-0 overflow-hidden"}>
          <MediaItem media={item} fill={!single} />
        </div>
      ))}
    </div>
  );
}
