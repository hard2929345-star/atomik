import { NextResponse } from "next/server";
import { getQuoteAuthorPage, PAGE_SIZE } from "@/lib/analytics";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const parsed = Number(searchParams.get("offset") ?? 0);
  const offset = Number.isSafeInteger(parsed) && parsed >= 0 ? parsed : 0;

  const paidOnly = searchParams.get("paid") === "1";

  return NextResponse.json(await getQuoteAuthorPage(offset, PAGE_SIZE, paidOnly));
}
