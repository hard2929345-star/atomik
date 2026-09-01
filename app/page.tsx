import { DateRangeFilter } from "@/components/date-range-filter";
import { FeedTabs } from "@/components/feed-tabs";
import { LeftSidebar, RightSidebar } from "@/components/sidebar";
import { SortPanel } from "@/components/sort-panel";
import { TweetCard } from "@/components/tweet-card";
import {
  dateRangeFilter,
  parseDateRange,
  parseDirection,
  parsePostSortField,
  POST_DATE_COLUMN,
  POST_SORT_FIELDS,
  postOrder,
} from "@/lib/sort";
import { getTweets } from "@/lib/tweets";

export default async function Home({ searchParams }: PageProps<"/">) {
  const { sort, dir, from, to } = await searchParams;
  const field = parsePostSortField(sort);
  const direction = parseDirection(dir);
  const range = parseDateRange(from, to);

  const tweets = await getTweets(
    postOrder(field, direction),
    dateRangeFilter(POST_DATE_COLUMN, range),
  );

  return (
    <div className="mx-auto flex w-full max-w-[1265px] justify-center bg-black">
      <LeftSidebar />

      <main className="w-full max-w-[600px] shrink border-x border-[#2f3336]">
        <div className="sticky top-0 z-10 bg-black/65 backdrop-blur-md">
          <h1 className="px-4 py-3 text-xl font-bold text-[#e7e9ea]">Home</h1>
          <FeedTabs />
        </div>

        {tweets.length === 0 ? (
          <p className="px-4 py-10 text-center text-[15px] text-[#71767b]">
            No posts match this filter.
          </p>
        ) : (
          tweets.map((tweet) => <TweetCard key={tweet.id} tweet={tweet} />)
        )}
      </main>

      <RightSidebar>
        <SortPanel
          title="Sort posts"
          basePath="/"
          fields={POST_SORT_FIELDS}
          activeField={field}
          activeDirection={direction}
          range={range}
        />
        <DateRangeFilter
          basePath="/"
          label="Posted between"
          sort={field}
          direction={direction}
          range={range}
        />
      </RightSidebar>
    </div>
  );
}
