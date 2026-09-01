import { XLogo } from "./icons";


export function ViewOnX({ url, className = "" }: { url: string; className?: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[#536471] px-3 py-1 text-[13px] font-bold text-[#e7e9ea] transition-colors hover:border-[#e7e9ea] hover:bg-[#181919] ${className}`}
    >
      <XLogo className="h-[13px] w-[13px]" />
      View on X
    </a>
  );
}
