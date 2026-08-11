import { NextResponse } from "next/server";

import { getApplications } from "@/lib/api/catalogue";

export const runtime = "nodejs";

export async function GET() {
  const results = await getApplications();
  return NextResponse.json({
    count: results.length,
    next: null,
    previous: null,
    results,
  });
}
