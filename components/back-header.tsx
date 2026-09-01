"use client";

import { useRouter } from "next/navigation";

export function BackHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <div className="sticky top-0 z-10 flex items-center gap-6 bg-black/65 px-4 py-2 backdrop-blur-md">
      <button
        type="button"
        aria-label="Back"
        onClick={() => router.back()}
        className="-ml-2 rounded-full p-2 text-[#e7e9ea] transition-colors hover:bg-[#181919]"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M7.414 13l5.043 5.04-1.414 1.42L3.586 12l7.457-7.46 1.414 1.42L7.414 11H21v2H7.414z" />
        </svg>
      </button>
      <div className="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2">
        <h1 className="text-xl font-bold text-[#e7e9ea]">{title}</h1>
        {subtitle ? (
          <span className="whitespace-nowrap text-[14px] font-medium text-[#71767b]">
            {subtitle}
          </span>
        ) : null}
      </div>
      {action}
    </div>
  );
}
