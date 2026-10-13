function Line({ className }: { className: string }) {
  return <div className={`animate-pulse rounded bg-[#16181c] ${className}`} />;
}

export function TweetSkeleton() {
  return (
    <div className="flex gap-3 border-b border-[#2f3336] px-4 py-3">
      <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#16181c]" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Line className="h-[15px] w-32" />
          <Line className="h-[15px] w-24" />
        </div>
        <div className="mt-2 space-y-2">
          <Line className="h-[15px] w-full" />
          <Line className="h-[15px] w-[85%]" />
          <Line className="h-[15px] w-[60%]" />
        </div>
        <div className="mt-3 flex items-center justify-between pr-8">
          {Array.from({ length: 4 }, (_, index) => (
            <Line key={index} className="h-[15px] w-10" />
          ))}
        </div>
      </div>
    </div>
  );
}

export function TweetSkeletonList({ count = 8 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading posts">
      {Array.from({ length: count }, (_, index) => (
        <TweetSkeleton key={index} />
      ))}
    </div>
  );
}

// Stands in for the expanded post at the top of the detail page, which is
// taller than a feed row because of the timestamp and action bars.
export function PostDetailSkeleton() {
  return (
    <div className="px-4 pt-3" aria-busy="true" aria-label="Loading post">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-[#16181c]" />
        <div className="min-w-0 flex-1 space-y-2">
          <Line className="h-[15px] w-40" />
          <Line className="h-[15px] w-28" />
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <Line className="h-[17px] w-full" />
        <Line className="h-[17px] w-[92%]" />
        <Line className="h-[17px] w-[78%]" />
      </div>

      <div className="border-b border-[#2f3336] py-4">
        <Line className="h-[15px] w-56" />
      </div>

      <div className="flex items-center justify-between border-b border-[#2f3336] px-2 py-3">
        {Array.from({ length: 5 }, (_, index) => (
          <Line key={index} className="h-[22px] w-12" />
        ))}
      </div>
    </div>
  );
}
