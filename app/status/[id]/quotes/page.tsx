import { notFound } from "next/navigation";
import { BackHeader } from "@/components/back-header";
import { OriginalPostStrip } from "@/components/original-post-strip";
import { PostActivityTabs } from "@/components/post-activity-tabs";
import { QuoteCard } from "@/components/quote-card";
import { LeftSidebar, RightSidebar } from "@/components/sidebar";
import { DateRangeFilter } from "@/components/date-range-filter";
import { DisclosureFilter } from "@/components/disclosure-filter";
import { SortPanel } from "@/components/sort-panel";
import { TimeWindowFilter } from "@/components/time-window-filter";
import {
  dateRangeFilter,
  parseDateRange,
  parseDirection,
  parsePostSortField,
  POST_DATE_COLUMN,
  POST_SORT_FIELDS,
  postOrder,
  disclosureFilter,
  disclosureParam,
  parseDisclosure,
  parseWindowMinutes,
  windowFilter,
} from "@/lib/sort";
import { countQuoteTweets, getQuoteCounts, getQuoteTweets, getTweet } from "@/lib/tweets";

export default async function QuotesPage({
  params,
  searchParams,
}: PageProps<"/status/[id]/quotes">) {
  const [{ id }, { sort, dir, from, to, paid, window: windowParam }] = await Promise.all([
    params,
    searchParams,
  ]);
  const disclosure = parseDisclosure(paid);
  const paidParam = disclosureParam(disclosure);
  const field = parsePostSortField(sort, "date");
  const direction = parseDirection(dir, "asc");
  const range = parseDateRange(from, to);
  const windowMinutes = parseWindowMinutes(windowParam);

  const [tweet, counts] = await Promise.all([getTweet(id), getQuoteCounts(id)]);

  if (!tweet) notFound();

  // The "first N minutes" window is measured from the original post's timestamp.
  const scopeFilter =
    dateRangeFilter(POST_DATE_COLUMN, range) +
    windowFilter(POST_DATE_COLUMN, tweet.tweet_created_at, windowMinutes);
  const filter = scopeFilter + disclosureFilter(disclosure);

  // Disclosure counts follow the selected time window and date range.
  const [quotes, scopedTotal, scopedPaid] = await Promise.all([
    getQuoteTweets(id, postOrder(field, direction), filter),
    countQuoteTweets(id, scopeFilter),
    countQuoteTweets(id, scopeFilter + disclosureFilter("paid")),
  ]);
  const matchCount =
    disclosure === "paid"
      ? scopedPaid
      : disclosure === "unpaid"
        ? scopedTotal - scopedPaid
        : scopedTotal;

  return (
    <div className="mx-auto flex w-full max-w-[1265px] justify-center bg-black">
      <LeftSidebar />

      <main className="w-full max-w-[600px] shrink border-x border-[#2f3336]">
        <div className="sticky top-0 z-10 bg-black/65 backdrop-blur-md">
          <BackHeader
            title="Post activity"
            action={
              <div className="shrink-0 text-right">
                <p className="text-[17px] font-bold tabular-nums leading-tight text-[#e7e9ea]">
                  {counts.total.toLocaleString()}
                </p>
                <p className="text-[12px] leading-tight text-[#71767b]">
                  {counts.total === 1 ? "quote" : "quotes"}
                </p>
              </div>
            }
          />
          <PostActivityTabs tweetId={id} active="quotes" />
          <OriginalPostStrip tweet={tweet} />
        </div>

        {quotes.length === 0 ? (
          <p className="px-4 py-10 text-center text-[15px] text-[#71767b]">
            {windowMinutes
              ? `No quotes were posted in the first ${windowMinutes} minutes after this post.`
              : disclosure === "paid"
                ? "None of this post's quotes are labelled as a paid partnership."
                : "No quotes match this filter."}
          </p>
        ) : (
          <>
            <p className="border-b border-[#2f3336] px-4 py-2.5 text-[13px] text-[#71767b]">
              Showing{" "}
              <span className="font-bold tabular-nums text-[#e7e9ea]">
                {matchCount.toLocaleString()}
              </span>{" "}
              {matchCount === 1 ? "quote" : "quotes"}
              {windowMinutes ? ` from the first ${windowMinutes} minutes` : ""}
            </p>
            {quotes.map((quote) => <QuoteCard key={quote.id} quote={quote} />)}
          </>
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
          paid={paidParam}
          windowMinutes={windowMinutes}
        />
        <TimeWindowFilter
          basePath={`/status/${id}/quotes`}
          sort={field}
          direction={direction}
          range={range}
          paid={paidParam}
          windowMinutes={windowMinutes}
          matchCount={matchCount}
        />
        <DisclosureFilter
          basePath={`/status/${id}/quotes`}
          sort={field}
          direction={direction}
          range={range}
          disclosure={disclosure}
          paidCount={scopedPaid}
          totalCount={scopedTotal}
          windowMinutes={windowMinutes}
        />
        <DateRangeFilter
          basePath={`/status/${id}/quotes`}
          label="Quoted between"
          sort={field}
          direction={direction}
          range={range}
          paid={paidParam}
          windowMinutes={windowMinutes}
        />
      </RightSidebar>
    </div>
  );
}
