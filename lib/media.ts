export type RawMedia = Record<string, unknown>;

export type NormalizedMedia = {
  id: string;
  type: string;
  posterUrl: string;
  videoUrl?: string;
  durationMillis?: number;
};

type Variant = { bitrate?: number; url?: string; content_type?: string; contentType?: string };

function pickVideo(variants: Variant[]): string | undefined {
  return variants
    .filter((variant) => (variant.content_type ?? variant.contentType) === "video/mp4" && variant.url)
    .sort((a, b) => (a.bitrate ?? 0) - (b.bitrate ?? 0))
    .at(-1)?.url;
}

/**
 * The scrapers emit two media shapes: snake_case on tweets/replies
 * (`extended_entities.media`) and camelCase on quote tweets (`media`).
 */
export function normalizeMedia(items: RawMedia[] | undefined | null): NormalizedMedia[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item, index): NormalizedMedia | null => {
      const record = item as Record<string, never>;
      const poster =
        (record.media_url_https as string | undefined) ?? (record.mediaUrl as string | undefined);

      if (!poster) return null;

      const variants =
        ((record.video_info as { variants?: Variant[] } | undefined)?.variants ??
          (record.videoVariants as Variant[] | undefined)) ??
        [];

      return {
        id: (record.id_str as string | undefined) ?? (record.id as string | undefined) ?? String(index),
        type: (record.type as string | undefined) ?? "photo",
        posterUrl: poster,
        videoUrl: pickVideo(variants),
        durationMillis:
          (record.video_info as { duration_millis?: number } | undefined)?.duration_millis ??
          (record.durationMillis as number | undefined),
      };
    })
    .filter((item): item is NormalizedMedia => item !== null);
}

export function formatDuration(millis: number | undefined): string | null {
  if (!millis) return null;
  const total = Math.round(millis / 1000);
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}
