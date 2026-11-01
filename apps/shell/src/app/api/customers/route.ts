import { NextResponse, type NextRequest } from "next/server";
import { searchCustomers } from "@/lib/queries";
import { corsHeaders } from "@/lib/cors";

const TIERS = new Set(["", "gold", "silver", "bronze"]);

export function GET(req: NextRequest) {
  const headers = corsHeaders(req.headers.get("origin"));
  const p = req.nextUrl.searchParams;
  const page = Number(p.get("page") ?? 1);
  const search = (p.get("search") ?? "").slice(0, 100);
  const tier = p.get("tier") ?? "";
  if (!Number.isInteger(page) || page < 1 || !TIERS.has(tier)) {
    return NextResponse.json({ error: "invalid page or tier" }, { status: 400, headers });
  }
  return NextResponse.json(searchCustomers({ page, search, tier }), { headers });
}
