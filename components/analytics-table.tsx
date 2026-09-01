"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VerifiedBadge } from "@/components/icons";
import { MiniTweetCard } from "@/components/mini-tweet-card";
import { formatIstDateTime } from "@/lib/format";
import type { QuoteAuthorActivity, QuoteAuthorPage } from "@/lib/analytics";

export function AnalyticsTable({
  initial,
  paidOnly = false,
}: {
  initial: QuoteAuthorPage;
  paidOnly?: boolean;
}) {
  const [authors, setAuthors] = useState<QuoteAuthorActivity[]>(initial.authors);
  const [nextOffset, setNextOffset] = useState<number | null>(initial.nextOffset);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (nextOffset === null || loading) return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/quote-authors?offset=${nextOffset}${paidOnly ? "&paid=1" : ""}`,
      );
      if (!response.ok) throw new Error(`Failed to load page (${response.status})`);

      const page: QuoteAuthorPage = await response.json();
      setAuthors((current) => [...current, ...page.authors]);
      setNextOffset(page.nextOffset);
    } finally {
      setLoading(false);
    }
  }, [loading, nextOffset, paidOnly]);

  useEffect(() => {
    const node = sentinel.current;
    if (!node || nextOffset === null) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "600px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, nextOffset]);

  return (
    <>
      <div className="w-full overflow-x-auto">
        <table className="w-full min-w-[1200px] border-collapse text-left">
          <thead className="sticky z-10 bg-black">
            <tr className="border-b border-[#2f3336] text-[13px] uppercase tracking-wide text-[#71767b]">
              <th className="w-[220px] px-6 py-3 font-medium">User</th>
              <th className="w-[90px] px-6 py-3 text-right font-medium">Quotes</th>
              <th className="px-6 py-3 font-medium">Quote tweet</th>
              <th className="w-[210px] px-6 py-3 font-medium">Quoted at (IST)</th>
              <th className="px-6 py-3 font-medium">Original post</th>
              <th className="w-[210px] px-6 py-3 font-medium">Original posted at (IST)</th>
            </tr>
          </thead>

          <tbody>
            {authors.map((author, authorIndex) =>
              author.quotes.map((quote, index) => {
                const isFirst = index === 0;
                const isLast = index === author.quotes.length - 1;

                return (
                  <tr
                    key={quote.id}
                    className={`transition-colors hover:bg-[#0e0e0e] ${
                      authorIndex % 2 === 1 ? "bg-[#08090a]" : ""
                    } ${isLast ? "border-b border-[#2f3336]" : ""}`}
                  >
                    {isFirst ? (
                      <>
                        <td
                          rowSpan={author.quotes.length}
                          className="border-r border-[#2f3336]/60 px-6 py-3 align-middle"
                        >
                          <a
                            href={`https://x.com/${author.username}`}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3"
                          >
                            {author.profilePicture ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={author.profilePicture.replace("_normal", "_x96")}
                                alt={author.name}
                                className="h-10 w-10 shrink-0 rounded-full bg-[#16181c] object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="h-10 w-10 shrink-0 rounded-full bg-[#16181c]" />
                            )}
                            <span className="min-w-0 leading-tight">
                              <span className="flex items-center gap-1">
                                <span className="truncate text-[15px] font-bold text-[#e7e9ea] hover:underline">
                                  {author.name}
                                </span>
                                {author.verified ? (
                                  <VerifiedBadge className="h-[16px] w-[16px] shrink-0 text-[#1d9bf0]" />
                                ) : null}
                              </span>
                              <span className="block truncate text-[14px] text-[#71767b]">
                                @{author.username}
                              </span>
                            </span>
                          </a>
                        </td>

                        <td
                          rowSpan={author.quotes.length}
                          className="border-r border-[#2f3336]/60 px-6 py-3 text-center align-middle text-[15px] font-bold tabular-nums text-[#e7e9ea]"
                        >
                          {author.quotes.length}
                        </td>
                      </>
                    ) : null}

                    <td className="border-r border-[#2f3336]/60 px-6 py-3">
                      <MiniTweetCard
                        url={quote.url}
                        text={quote.text}
                        media={quote.media}
                        metrics={{
                          replies: quote.replyCount,
                          reposts: quote.retweetCount,
                          likes: quote.likeCount,
                          views: quote.viewCount,
                        }}
                        paidPromotion={quote.isPaidPromotion}
                        aiGenerated={quote.hasAiGeneratedMedia}
                      />
                    </td>

                    <td className="border-r border-[#2f3336]/60 whitespace-nowrap px-6 py-3 align-middle text-[14px] text-[#71767b]">
                      <time dateTime={quote.createdAt}>{formatIstDateTime(quote.createdAt)}</time>
                    </td>

                    <td className="border-r border-[#2f3336]/60 px-6 py-3">
                      {quote.source ? (
                        <MiniTweetCard
                          url={quote.source.url}
                          text={quote.source.text}
                          media={quote.source.media}
                          author={{
                            name: quote.source.authorName,
                            username: quote.source.authorUsername,
                            profilePicture: quote.source.authorProfilePicture,
                          }}
                        />
                      ) : (
                        <span className="text-[14px] text-[#71767b]">&mdash;</span>
                      )}
                    </td>

                    <td className="whitespace-nowrap px-6 py-3 align-middle text-[14px] text-[#71767b]">
                      {quote.source ? (
                        <time dateTime={quote.source.createdAt}>
                          {formatIstDateTime(quote.source.createdAt)}
                        </time>
                      ) : (
                        <span>&mdash;</span>
                      )}
                    </td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>

      <div ref={sentinel} className="px-6 py-8 text-center text-[15px] text-[#71767b]">
        {nextOffset !== null
          ? loading
            ? "Loading more accounts…"
            : "Scroll for more"
          : `All ${initial.total.toLocaleString("en-IN")} accounts loaded`}
      </div>
    </>
  );
}
