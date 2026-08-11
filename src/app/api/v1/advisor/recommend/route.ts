import { NextResponse } from "next/server";

import { getProducts, type ProductListItem } from "@/lib/api/catalogue";
import { getPayload } from "@/lib/payload/getPayload";

export const runtime = "nodejs";

function specFill(product: ProductListItem): string {
  return String(product.specs.fill_type || product.specs.fillType || "").toUpperCase();
}

function specPph(product: ProductListItem): number | null {
  const raw = product.specs.capacity_pph ?? product.specs.capacityPph;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      productToPack?: string;
      requiredPph?: number | null;
      budgetMaxInr?: number | null;
      fillType?: string;
    };

    const needle = (body.productToPack || "").trim().toLowerCase();
    const requiredPph = body.requiredPph ?? null;
    const budget = body.budgetMaxInr ?? null;
    const fill = (body.fillType || "").trim().toUpperCase();
    const rationale: string[] = [];

    let products = await getProducts();
    const payload = await getPayload();

    if (needle) {
      const apps = await payload.find({
        collection: "applications",
        where: {
          and: [
            { status: { equals: "published" } },
            {
              or: [
                { slug: { contains: needle.replace(/\s+/g, "-") } },
                { name: { contains: needle } },
                { nameHi: { contains: needle } },
              ],
            },
          ],
        },
        limit: 20,
        depth: 0,
        overrideAccess: true,
      });

      if (apps.docs.length) {
        const slugs = new Set(apps.docs.map((a) => String(a.slug)));
        products = products.filter((p) =>
          (p.applications ?? []).some((a) => {
            const s = typeof a === "string" ? a : a.slug;
            return slugs.has(s);
          }),
        );
        rationale.push(`Matched ${apps.docs.length} application(s) for “${needle}”.`);
      } else {
        products = products.filter(
          (p) =>
            p.name.toLowerCase().includes(needle) ||
            p.shortDescription.toLowerCase().includes(needle),
        );
        rationale.push(
          `No application slug match; searched product names for “${needle}”.`,
        );
      }
    }

    if (budget) {
      const maxPaise = Math.floor(budget) * 100;
      products = products.filter(
        (p) => p.pricePaise == null || p.pricePaise <= maxPaise,
      );
      rationale.push(`Budget cap ≈ ₹${budget.toLocaleString("en-IN")} (GST extra).`);
    }

    products = [...products].sort((a, b) => {
      const ap = a.pricePaise ?? Number.MAX_SAFE_INTEGER;
      const bp = b.pricePaise ?? Number.MAX_SAFE_INTEGER;
      return ap - bp;
    });

    if (fill) {
      const matched = products.filter((p) => specFill(p) === fill);
      if (matched.length) {
        products = matched;
        rationale.push(`Filtered to fill type ${fill}.`);
      } else {
        rationale.push(`No exact fill-type ${fill}; keeping application matches.`);
      }
    }

    if (requiredPph) {
      const capable = products.filter((p) => {
        const cap = specPph(p);
        return cap == null || cap >= requiredPph;
      });
      if (capable.length) {
        products = capable;
        rationale.push(`Capacity target ≥ ${requiredPph} packs/hour.`);
      } else {
        rationale.push(
          `No product met ${requiredPph} pph in specs; showing closest matches.`,
        );
      }
    }

    products = products.slice(0, 8);
    if (!rationale.length) {
      rationale.push(
        "Showing published machines. Refine with product-to-pack and budget.",
      );
    }
    if (!products.length) {
      products = (await getProducts("is_featured=true")).slice(0, 6);
      rationale.push("Fell back to featured catalogue machines.");
    }

    return NextResponse.json({
      recommendations: products,
      rationale: rationale.join(" "),
    });
  } catch (err) {
    return NextResponse.json(
      {
        recommendations: [],
        rationale: err instanceof Error ? err.message : "Advisor failed",
      },
      { status: 500 },
    );
  }
}
