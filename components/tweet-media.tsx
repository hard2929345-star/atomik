import { formatDuration, type NormalizedMedia } from "@/lib/media";

function MediaItem({ media, fill }: { media: NormalizedMedia; fill: boolean }) {
  const duration = formatDuration(media.durationMillis);

  if (media.videoUrl) {
    return (
      // Video playback-speed browser extensions inject controls next to <video>
      // before hydration; ignore the resulting attribute mismatch on this node.
      <div className="relative h-full" suppressHydrationWarning>
        <video
          className={`w-full bg-black object-cover ${fill ? "h-full" : "max-h-[510px]"}`}
          poster={media.posterUrl}
          controls
          preload="none"
          playsInline
        >
          <source src={media.videoUrl} type="video/mp4" />
        </video>
        {duration ? (
          <span className="pointer-events-none absolute bottom-2 left-2 rounded bg-black/70 px-1 py-0.5 text-[13px] font-medium text-white">
            {duration}
          </span>
        ) : null}
      </div>
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
