import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { Resend } from "resend";

import { getPayload } from "@/lib/payload/getPayload";

export const runtime = "nodejs";

function getRatelimit() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "1 h"),
    prefix: "yugmach:leads",
  });
}

function isIndianPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return /^[6-9]/.test(digits);
  if (digits.length === 12 && digits.startsWith("91")) return /^91[6-9]/.test(digits);
  return false;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;

    // Honeypot — silently accept bots
    if (body.website || body.company_url) {
      return NextResponse.json({ ok: true, id: "honeypot" }, { status: 201 });
    }

    const name = String(body.name ?? "").trim();
    const phone = String(body.phone ?? "").trim();
    if (!name || !phone) {
      return NextResponse.json(
        { ok: false, error: "Name and phone are required" },
        { status: 400 },
      );
    }
    if (!isIndianPhone(phone)) {
      return NextResponse.json(
        { ok: false, error: "Enter a valid 10-digit Indian mobile number" },
        { status: 400 },
      );
    }

    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "anonymous";

    const ratelimit = getRatelimit();
    if (ratelimit) {
      const { success } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { ok: false, error: "Too many requests. Try again later." },
          { status: 429 },
        );
      }
    }

    const payload = await getPayload();
    let productId: string | number | undefined;
    const productSlug = body.productSlug ? String(body.productSlug) : "";
    if (productSlug) {
      const found = await payload.find({
        collection: "products",
        where: { slug: { equals: productSlug } },
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });
      if (found.docs[0]) productId = found.docs[0].id;
    }

    const lead = await payload.create({
      collection: "leads",
      data: {
        name,
        phone,
        email: body.email ? String(body.email) : undefined,
        company: body.company ? String(body.company) : undefined,
        city: body.city ? String(body.city) : undefined,
        state: body.state ? String(body.state) : undefined,
        message: body.message ? String(body.message) : undefined,
        productToPack: body.productToPack ? String(body.productToPack) : undefined,
        requiredPph:
          typeof body.requiredPph === "number" ? body.requiredPph : undefined,
        pouchSizeRange: body.pouchSizeRange
          ? String(body.pouchSizeRange)
          : undefined,
        budgetBand: body.budgetBand ? String(body.budgetBand) : undefined,
        timeline: body.timeline ? String(body.timeline) : undefined,
        needsFinance: Boolean(body.needsFinance),
        needsSubsidyHelp: Boolean(body.needsSubsidyHelp),
        product: productId,
        source: (body.source as "WEBSITE_FORM" | "QUOTE_FLOW" | "WHATSAPP" | "INDIAMART" | "PHONE" | "OTHER") || "WEBSITE_FORM",
        sourcePage: body.pageUrl ? String(body.pageUrl) : undefined,
        status: "NEW",
      },
      overrideAccess: true,
    });

    const resendKey = process.env.RESEND_API_KEY;
    const notifyTo = process.env.LEAD_NOTIFY_EMAIL || "sales@yugmach.com";
    if (resendKey) {
      try {
        const resend = new Resend(resendKey);
        await resend.emails.send({
          from: process.env.LEAD_FROM_EMAIL || "YugMach Leads <onboarding@resend.dev>",
          to: notifyTo,
          subject: `New lead: ${name} (${phone})`,
          text: [
            `Name: ${name}`,
            `Phone: ${phone}`,
            body.email ? `Email: ${body.email}` : null,
            body.city ? `City: ${body.city}` : null,
            body.productToPack ? `Product to pack: ${body.productToPack}` : null,
            productSlug ? `Product slug: ${productSlug}` : null,
            body.message ? `Message: ${body.message}` : null,
            body.pageUrl ? `Page: ${body.pageUrl}` : null,
            `Source: ${String(body.source ?? "WEBSITE_FORM")}`,
          ]
            .filter(Boolean)
            .join("\n"),
        });
      } catch {
        // Lead is saved; email failure should not fail the request
      }
    }

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : "Failed to create lead",
      },
      { status: 500 },
    );
  }
}
