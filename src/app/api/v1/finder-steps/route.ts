import { NextResponse } from "next/server";

import { getFinderSteps } from "@/lib/api/catalogue";

export const runtime = "nodejs";

export async function GET() {
  const results = await getFinderSteps();
  return NextResponse.json({
    count: results.length,
    next: null,
    previous: null,
    results,
  });
}
