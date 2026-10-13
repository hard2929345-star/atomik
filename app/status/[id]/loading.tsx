import { BackHeader } from "@/components/back-header";
import { LeftSidebar, RightSidebar } from "@/components/sidebar";
import { PostDetailSkeleton, TweetSkeletonList } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[1265px] justify-center bg-black">
      <LeftSidebar />

      <main className="w-full max-w-[600px] shrink border-x border-[#2f3336]">
        <BackHeader title="Post" />
        <PostDetailSkeleton />
        <TweetSkeletonList count={6} />
      </main>

      <RightSidebar />
    </div>
  );
}
