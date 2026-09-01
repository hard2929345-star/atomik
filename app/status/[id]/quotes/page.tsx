import { notFound } from "next/navigation";
import { BackHeader } from "@/components/back-header";
import { OriginalPostStrip } from "@/components/original-post-strip";
import { PostActivityTabs } from "@/components/post-activity-tabs";
import { QuoteCard } from "@/components/quote-card";
import { LeftSidebar, RightSidebar } from "@/components/sidebar";
import { DateRangeFilter } from "@/components/date-range-filter";
import { DisclosureFilter } from "@/components/disclosure-filter";
import { SortPanel } from "@/components/sort-panel";
import {
  dateRangeFilter,
  parseDateRange,
  parseDirection,
  parsePostSortField,
  POST_DATE_COLUMN,
  POST_SORT_FIELDS,
  postOrder,
  paidPromotionFilter,
  parsePaidOnly,
} from "@/lib/sort";
import { getQuoteCounts, getQuoteTweets, getTweet } from "@/lib/tweets";

export default async function QuotesPage({
  params,
  searchParams,
}: PageProps<"/status/[id]/quotes">) {
  const [{ id }, { sort, dir, from, to, paid }] = await Promise.all([params, searchParams]);
  const paidOnly = parsePaidOnly(paid);
  const field = parsePostSortField(sort, "date");
  const direction = parseDirection(dir, "asc");
  const range = parseDateRange(from, to);
  const [tweet, quotes, counts] = await Promise.all([
    getTweet(id),
    getQuoteTweets(
      id,
      postOrder(field, direction),
      dateRangeFilter(POST_DATE_COLUMN, range) + paidPromotionFilter(paidOnly),
    ),
    getQuoteCounts(id),
  ]);

  if (!tweet) notFound();

  return (
    <div className="mx-auto flex w-full max-w-[1265px] justify-center bg-black">
      <LeftSidebar />

      <main className="w-full max-w-[600px] shrink border-x border-[#2f3336]">
        <div className="sticky top-0 z-10 bg-black/65 backdrop-blur-md">
          <BackHeader title="Post activity" />
          <PostActivityTabs tweetId={id} active="quotes" />
          <OriginalPostStrip tweet={tweet} />
        </div>

        {quotes.length === 0 ? (
          <p className="px-4 py-10 text-center text-[15px] text-[#71767b]">
            {paidOnly
              ? "None of this post's quotes are labelled as a paid partnership."
              : "No quotes match this filter."}
          </p>
        ) : (
          quotes.map((quote) => <QuoteCard key={quote.id} quote={quote} />)
        )}
      </main>

      <RightSidebar>
        <SortPanel
          title="Sort quotes"
          basePath={`/status/${id}/quotes`}
          fields={POST_SORT_FIELDS}
          activeField={field}
          activeDirection={direction}
          range={range}
          paidOnly={paidOnly}
        />
        <DisclosureFilter
          basePath={`/status/${id}/quotes`}
          sort={field}
          direction={direction}
          range={range}
          paidOnly={paidOnly}
          paidCount={counts.paid}
          totalCount={counts.total}
        />
        <DateRangeFilter
          basePath={`/status/${id}/quotes`}
          label="Quoted between"
          sort={field}
          direction={direction}
          range={range}
          paidOnly={paidOnly}
        />
      </RightSidebar>
    </div>
  );
}
