import { NextResponse } from "next/server";

import { getProducts } from "@/lib/api/catalogue";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.toString();
  const results = await getProducts(query);
  return NextResponse.json({
    count: results.length,
    next: null,
    previous: null,
    results,
  });
}
