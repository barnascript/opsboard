import { NextResponse, type NextRequest } from "next/server";
import { summariseSales } from "@/lib/queries";
import { corsHeaders } from "@/lib/cors";

const ALLOWED_DAYS = new Set([7, 30, 90]);

export function GET(req: NextRequest) {
  const headers = corsHeaders(req.headers.get("origin"));
  const days = Number(req.nextUrl.searchParams.get("days") ?? 30);
  if (!ALLOWED_DAYS.has(days)) {
    return NextResponse.json({ error: "days must be 7, 30 or 90" }, { status: 400, headers });
  }
  return NextResponse.json(summariseSales(days), {
    headers: { ...headers, "Cache-Control": "public, max-age=60, stale-while-revalidate=300" },
  });
}
