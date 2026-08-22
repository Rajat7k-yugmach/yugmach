import Link from "next/link";

import { MachineImage } from "@/components/MachineImage";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import type { ProductListItem } from "@/lib/api/catalogue";

function mtSlug(p: ProductListItem): string | null {
  if (!p.machineType) return null;
  return typeof p.machineType === "string" ? p.machineType : p.machineType.slug;
}

function capacityHint(p: ProductListItem): string | null {
  const specs = p.specs || {};
  const pph = specs.capacity_pph ?? specs.CAPACITY_PPH;
  const ppm = specs.capacity_ppm ?? specs.CAPACITY_PPM;
  if (pph != null) return `${Number(pph).toLocaleString("en-IN")} PPH`;
  if (ppm != null) return `${Number(ppm).toLocaleString("en-IN")} PPM`;
  return null;
}

type Props = {
  product: ProductListItem;
  /** @deprecated pouch row removed for catalogue density */
  showPouch?: boolean;
  hrefPrefix?: string;
  /** Prioritize LCP image for the first above-the-fold card */
  priority?: boolean;
};

export function ProductCard({
  product,
  hrefPrefix = "/products",
  priority = false,
}: Props) {
  const cap = capacityHint(product);
  const mt = mtSlug(product);

  return (
    <article
      className="card-elevated group flex h-full flex-col overflow-hidden transition-[border-color] duration-[var(--dur-fast)] hover:border-border-strong"
      data-testid={`product-card-${product.slug}`}
    >
      <Link
        href={`${hrefPrefix}/${product.slug}`}
        className="block shrink-0"
        data-testid={`product-card-link-${product.slug}`}
      >
        <MachineImage
          image={product.primaryImage}
          name={product.name}
          capacityHint={cap}
          machineType={mt}
          className="rounded-none border-b border-border"
          priority={priority}
          sizes="(max-width: 768px) 50vw, 25vw"
        />
      </Link>
      <div className="flex min-h-0 flex-1 flex-col p-3.5">
        <div className="min-h-[4.5rem]">
          <Link
            href={`${hrefPrefix}/${product.slug}`}
            className="line-clamp-2 text-base font-semibold leading-snug text-ink group-hover:underline md:text-lg"
            data-testid={`product-card-title-${product.slug}`}
          >
            {product.name}
          </Link>
          <p className="spec-label mt-1.5 min-h-[1rem] text-ink-muted">{cap || "\u00A0"}</p>
        </div>
        <div className="mt-2">
          <p className="tabular-price text-xl font-semibold text-price md:text-2xl">
            {product.priceDisplay ?? "Price on request"}
          </p>
          <p className="text-[11px] text-ink-muted">GST extra · /{product.priceUnit}</p>
        </div>
        <div className="mt-auto flex gap-2 pt-3">
          <Link
            href={`${hrefPrefix}/${product.slug}`}
            className="tap-target flex flex-1 items-center justify-center rounded-md border border-border bg-white px-3 py-2 text-sm font-semibold"
            data-testid={`product-card-specs-${product.slug}`}
          >
            Specs
          </Link>
          <WhatsAppButton
            message={`Hi, I need the price and details for ${product.name}.`}
            placement="product_card"
            data-testid={`product-card-whatsapp-${product.slug}`}
            className="tap-target flex flex-1 items-center justify-center rounded-md bg-whatsapp px-3 py-2 text-sm font-semibold text-white"
          >
            WhatsApp
          </WhatsAppButton>
        </div>
      </div>
    </article>
  );
}
