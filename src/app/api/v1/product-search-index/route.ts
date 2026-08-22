import { NextResponse } from "next/server";

import { getProductSearchIndex } from "@/lib/api/catalogue";

export const runtime = "nodejs";

/** Slim machine list for homepage name search — keep payload tiny. */
export async function GET() {
  const results = await getProductSearchIndex();
  return NextResponse.json(
    { count: results.length, results },
    {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
      },
    },
  );
}
