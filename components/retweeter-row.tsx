import { VerifiedBadge } from "@/components/icons";
import type { Retweeter } from "@/lib/tweets";

const MENTION_PATTERN = /(@\w{1,15}|https?:\/\/\S+)/g;

function renderBio(description: string) {
  return description.split(MENTION_PATTERN).map((part, index) =>
    part.startsWith("@") || part.startsWith("http") ? (
      <span key={index} className="text-[#1d9bf0]">
        {part}
      </span>
    ) : (
      <span key={index}>{part}</span>
    ),
  );
}

export function RetweeterRow({ retweeter }: { retweeter: Retweeter }) {
  const verified = retweeter.is_verified || retweeter.is_blue_verified;

  return (
    <div className="flex gap-3 px-4 py-3 transition-colors hover:bg-[#080808]">
      <div className="shrink-0">
        {retweeter.profile_picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={retweeter.profile_picture.replace("_normal", "_x96")}
            alt={retweeter.name}
            className="h-10 w-10 rounded-full bg-[#16181c] object-cover"
            loading="lazy"
          />
        ) : (
          <div className="h-10 w-10 rounded-full bg-[#16181c]" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 leading-tight">
            <div className="flex items-center gap-1">
              <span className="truncate text-[15px] font-bold text-[#e7e9ea] hover:underline">
                {retweeter.name}
              </span>
              {verified ? (
                <VerifiedBadge className="h-[18px] w-[18px] shrink-0 text-[#1d9bf0]" />
              ) : null}
            </div>
            <p className="truncate text-[15px] text-[#71767b]">@{retweeter.username}</p>
          </div>

          <a
            href={`https://x.com/${retweeter.username}`}
            target="_blank"
            rel="noreferrer"
            className="shrink-0 rounded-full border border-[#536471] px-4 py-1.5 text-[14px] font-bold text-[#e7e9ea] transition-colors hover:bg-[#181919]"
          >
            View on X
          </a>
        </div>

        {retweeter.description ? (
          <p className="mt-1 whitespace-pre-wrap break-words text-[15px] leading-5 text-[#e7e9ea]">
            {renderBio(retweeter.description)}
          </p>
        ) : null}
      </div>
    </div>
  );
}
