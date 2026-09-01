import Link from "next/link";
import { AnalyticsTable } from "@/components/analytics-table";
import { XLogo } from "@/components/icons";
import { getQuoteAuthorPage, PAGE_SIZE } from "@/lib/analytics";

export const metadata = {
  title: "Quote tweet analytics / Atomik",
};

export default async function AnalyticsPage({ searchParams }: PageProps<"/analytics">) {
  const { paid } = await searchParams;
  const paidOnly = paid === "1";
  const initial = await getQuoteAuthorPage(0, PAGE_SIZE, paidOnly);

  return (
    <div className="min-h-screen w-full bg-black">
      <header className="sticky top-0 z-20 flex items-center gap-4 border-b border-[#2f3336] bg-black/85 px-6 py-3 backdrop-blur-md">
        <XLogo className="h-6 w-6 text-[#e7e9ea]" />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-[#e7e9ea]">Quote tweet analytics</h1>
          <p className="text-[13px] text-[#71767b]">
            {initial.total.toLocaleString("en-IN")} accounts &middot;{" "}
            {initial.totalQuotes.toLocaleString("en-IN")} quote tweets &middot;{" "}
            {initial.paidQuotes.toLocaleString("en-IN")} paid partnerships &middot; times in IST
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/analytics"
            aria-current={paidOnly ? undefined : "page"}
            className={`rounded-full border px-4 py-1.5 text-[14px] font-bold transition-colors ${
              paidOnly
                ? "border-[#536471] text-[#71767b] hover:bg-[#181919] hover:text-[#e7e9ea]"
                : "border-[#eff3f4] bg-[#eff3f4] text-black"
            }`}
          >
            All quotes
            <span className="ml-2 tabular-nums opacity-70">{initial.allQuotes.toLocaleString("en-IN")}</span>
          </Link>

          <Link
            href="/analytics?paid=1"
            aria-current={paidOnly ? "page" : undefined}
            className={`rounded-full border px-4 py-1.5 text-[14px] font-bold transition-colors ${
              paidOnly
                ? "border-[#ffd400] bg-[#ffd400] text-black"
                : "border-[#ffd400]/50 text-[#ffd400] hover:bg-[#ffd400]/10"
            }`}
          >
            Paid partnerships
            <span className="ml-2 tabular-nums opacity-70">
              {initial.paidQuotes.toLocaleString("en-IN")}
            </span>
          </Link>
        </div>
        <Link
          href="/"
          className="rounded-full border border-[#536471] px-4 py-1.5 text-[14px] font-bold text-[#e7e9ea] transition-colors hover:bg-[#181919]"
        >
          Home
        </Link>
      </header>

      {initial.total === 0 ? (
        <p className="px-6 py-10 text-center text-[15px] text-[#71767b]">
          No quote tweets recorded yet.
        </p>
      ) : (
        <AnalyticsTable key={paidOnly ? "paid" : "all"} initial={initial} paidOnly={paidOnly} />
      )}
    </div>
  );
}
