"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, MoreIcon, ViewsIcon, XLogo } from "@/components/icons";

const NAV_ITEMS = [
  { label: "Home", icon: HomeIcon, href: "/" },
  { label: "Analytics", icon: ViewsIcon, href: "/analytics" },
];

export function LeftSidebar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 hidden h-screen shrink-0 flex-col justify-between px-2 py-1 sm:flex xl:w-[275px]">
      <nav className="flex flex-col items-center xl:items-start">
        <Link
          href="/"
          aria-label="X"
          className="my-1 rounded-full p-3 text-[#e7e9ea] hover:bg-[#181919]"
        >
          <XLogo className="h-[30px] w-[30px]" />
        </Link>

        {NAV_ITEMS.map(({ label, icon: Icon, href }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

          return (
            <Link
              key={label}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex items-center gap-5 rounded-full p-3 text-xl text-[#e7e9ea] transition-colors hover:bg-[#181919]"
            >
              <Icon className="h-[26.25px] w-[26.25px]" />
              <span className={`hidden xl:inline ${active ? "font-bold" : ""}`}>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mb-3 flex items-center gap-2 rounded-full p-3 hover:bg-[#181919]">
        <div className="h-10 w-10 shrink-0 rounded-full bg-[#16181c]" />
        <div className="hidden min-w-0 flex-1 leading-tight xl:block">
          <p className="truncate text-[15px] font-bold text-[#e7e9ea]">Atomik</p>
          <p className="truncate text-[15px] text-[#71767b]">@atomik</p>
        </div>
        <MoreIcon className="hidden h-[18.75px] w-[18.75px] text-[#e7e9ea] xl:block" />
      </div>
    </header>
  );
}

export function RightSidebar({ children }: { children?: React.ReactNode }) {
  return (
    <aside className="sticky top-0 hidden h-screen w-[350px] shrink-0 flex-col gap-4 px-8 py-3 lg:flex">
      {children}

      <p className="px-1 text-[13px] leading-4 text-[#71767b]">
        Terms of Service · Privacy Policy · Cookie Policy · Accessibility · Ads info · More
        · © 2026 Atomik
      </p>
    </aside>
  );
}
