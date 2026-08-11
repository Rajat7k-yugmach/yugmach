import { createHash, timingSafeEqual } from "node:crypto";

import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

type Body = {
  tags?: unknown;
};

function secretsEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET ?? "";
  const provided = request.headers.get("x-revalidate-secret") ?? "";

  if (!expected || !provided || !secretsEqual(provided, expected)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  if (!Array.isArray(body.tags) || body.tags.some((t) => typeof t !== "string")) {
    return NextResponse.json({ ok: false, error: "tags_required" }, { status: 400 });
  }

  const tags = body.tags as string[];
  for (const tag of tags) {
    revalidateTag(tag);
  }

  return NextResponse.json({ ok: true, revalidated: tags });
}
