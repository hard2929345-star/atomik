import Link from "next/link";

const TABS = [
  { label: "Quotes", segment: "quotes" },
  { label: "Reposts", segment: "reposts" },
] as const;

export function PostActivityTabs({
  tweetId,
  active,
}: {
  tweetId: string;
  active: "quotes" | "reposts";
}) {
  return (
    <div className="flex border-b border-[#2f3336]">
      {TABS.map((tab) => (
        <Link
          key={tab.segment}
          href={`/status/${tweetId}/${tab.segment}`}
          className="flex flex-1 justify-center px-4 transition-colors hover:bg-[#181919]"
        >
          <span
            className={`relative py-4 text-[15px] ${
              active === tab.segment ? "font-bold text-[#e7e9ea]" : "text-[#71767b]"
            }`}
          >
            {tab.label}
            {active === tab.segment ? (
              <span className="absolute inset-x-0 -bottom-px h-1 rounded-full bg-[#1d9bf0]" />
            ) : null}
          </span>
        </Link>
      ))}
    </div>
  );
}
