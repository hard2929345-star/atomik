import { BackHeader } from "@/components/back-header";
import { LeftSidebar, RightSidebar } from "@/components/sidebar";
import { TweetSkeletonList } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[1265px] justify-center bg-black">
      <LeftSidebar />

      <main className="w-full max-w-[600px] shrink border-x border-[#2f3336]">
        <div className="sticky top-0 z-10 bg-black/65 backdrop-blur-md">
          <BackHeader title="Post activity" />
          {/* loading.tsx receives no params, so the real tab bar (which needs
              the tweet id) is stood in for by a matching-height placeholder. */}
          <div className="h-[53px] border-b border-[#2f3336]" />
        </div>
        <TweetSkeletonList />
      </main>

      <RightSidebar />
    </div>
  );
}
