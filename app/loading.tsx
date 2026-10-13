import { LeftSidebar, RightSidebar } from "@/components/sidebar";
import { TweetSkeletonList } from "@/components/skeleton";

export default function Loading() {
  return (
    <div className="mx-auto flex w-full max-w-[1265px] justify-center bg-black">
      <LeftSidebar />

      <main className="w-full max-w-[600px] shrink border-x border-[#2f3336]">
        <div className="sticky top-0 z-10 bg-black/65 backdrop-blur-md">
          <h1 className="px-4 py-3 text-xl font-bold text-[#e7e9ea]">Home</h1>
        </div>
        <TweetSkeletonList />
      </main>

      <RightSidebar />
    </div>
  );
}
