import Link from "next/link";

type Item = { slug: string; name: string };

type Props = {
  items: Item[];
  eyebrow?: string;
};

/**
 * Infinite right→left category strip with edge fade (OldMachine PartnerLogos pattern).
 */
export function CategoryMarquee({
  items,
  eyebrow = "Live catalogue by product",
}: Props) {
  if (items.length < 4) return null;

  const doubled = [...items, ...items];

  return (
    <section className="border-b border-border bg-[#fff7ed]">
      <div className="mx-auto max-w-6xl px-4 py-5 md:py-6">
        <p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-amber-text">
          {eyebrow}
        </p>

        <div className="ym-marquee relative mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <div className="ym-marquee-track flex w-max items-center gap-3 pr-3">
            {doubled.map((item, idx) => (
              <Link
                key={`${item.slug}-${idx}`}
                href={`/packing-machine/${item.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-semibold text-ink shadow-sm transition hover:border-amber hover:text-amber-text"
              >
                <span className="size-1.5 rounded-full bg-amber" aria-hidden />
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
