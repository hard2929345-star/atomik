import { XLogo } from "@/components/icons";

export default function Loading() {
  return (
    <div className="min-h-screen w-full bg-black">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#2f3336] bg-black/85 px-6 py-3 backdrop-blur-md">
        <XLogo className="h-6 w-6 text-[#e7e9ea]" />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#e7e9ea]">Quote tweet analytics</h1>
          <div className="mt-1 h-[13px] w-72 animate-pulse rounded bg-[#16181c]" />
        </div>
      </header>

      <div className="space-y-px p-6" aria-busy="true" aria-label="Loading analytics">
        {Array.from({ length: 14 }, (_, index) => (
          <div key={index} className="h-12 animate-pulse rounded bg-[#16181c]" />
        ))}
      </div>
    </div>
  );
}
