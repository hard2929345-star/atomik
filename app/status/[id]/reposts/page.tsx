import { notFound } from "next/navigation";
import { BackHeader } from "@/components/back-header";
import { PostActivityTabs } from "@/components/post-activity-tabs";
import { RetweeterRow } from "@/components/retweeter-row";
import { LeftSidebar, RightSidebar } from "@/components/sidebar";
import { SortPanel } from "@/components/sort-panel";
import { parseDirection, repostOrder } from "@/lib/sort";
import { getRetweeters, getTweet } from "@/lib/tweets";

export default async function RepostsPage({
  params,
  searchParams,
}: PageProps<"/status/[id]/reposts">) {
  const [{ id }, { dir }] = await Promise.all([params, searchParams]);
  const direction = parseDirection(dir);
  const [tweet, retweeters] = await Promise.all([
    getTweet(id),
    getRetweeters(id, repostOrder(direction)),
  ]);

  if (!tweet) notFound();

  return (
    <div className="mx-auto flex w-full max-w-[1265px] justify-center bg-black">
      <LeftSidebar />

      <main className="w-full max-w-[600px] shrink border-x border-[#2f3336]">
        <div className="sticky top-0 z-10 bg-black/65 backdrop-blur-md">
          <BackHeader title="Post activity" />
          <PostActivityTabs tweetId={id} active="reposts" />
        </div>

        {retweeters.length === 0 ? (
          <p className="px-4 py-10 text-center text-[15px] text-[#71767b]">No reposts yet.</p>
        ) : (
          retweeters.map((retweeter) => (
            <RetweeterRow key={retweeter.user_id} retweeter={retweeter} />
          ))
        )}
      </main>

      <RightSidebar>
        <SortPanel
          title="Sort by followers"
          basePath={`/status/${id}/reposts`}
          activeDirection={direction}
          range={{}}
        />
      </RightSidebar>
    </div>
  );
}
