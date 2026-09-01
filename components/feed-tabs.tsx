export function FeedTabs() {
  return (
    <div className="flex border-b border-[#2f3336]">
      <div className="flex flex-1 justify-center px-4 transition-colors hover:bg-[#181919]">
        <span className="relative py-4 text-[15px] font-bold text-[#e7e9ea]">
          For you
          <span className="absolute inset-x-0 -bottom-px h-1 rounded-full bg-[#1d9bf0]" />
        </span>
      </div>
    </div>
  );
}
