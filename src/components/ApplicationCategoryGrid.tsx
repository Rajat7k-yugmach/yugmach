import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { toPublicImageSrc } from "@/lib/media";

export type CategoryApp = {
  slug: string;
  name: string;
  imageUrl: string | null;
  priceMinDisplay: string | null;
  priceMaxDisplay?: string | null;
  productCount: number;
  blurb?: string;
};

type Props = {
  apps: CategoryApp[];
};

function priceLabel(app: CategoryApp) {
  if (!app.priceMinDisplay) return "Ask on WhatsApp";
  if (app.priceMaxDisplay && app.priceMaxDisplay !== app.priceMinDisplay) {
    return `${app.priceMinDisplay} – ${app.priceMaxDisplay}`;
  }
  return `from ${app.priceMinDisplay}`;
}

export function ApplicationCategoryGrid({ apps }: Props) {
  if (!apps.length) return null;

  const featured =
    apps.find((a) => a.slug === "masala") ||
    apps.find((a) => a.slug === "namkeen") ||
    apps.find((a) => a.imageUrl) ||
    apps[0];
  const compact = apps.filter((a) => a.slug !== featured.slug).slice(0, 4);
  const featuredSrc = toPublicImageSrc(featured.imageUrl);

  return (
    <section className="border-b border-border bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 md:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="section-label text-amber-text">Browse by product</p>
            <h2 className="font-display mt-1 text-2xl font-extrabold tracking-tight text-ink md:text-3xl">
              What are you packing?
            </h2>
            <p className="mt-1 max-w-xl text-sm text-ink-muted">
              Clear paths by product — prices, speed, and matching machines.
            </p>
          </div>
          <Link
            href="/packing-machine"
            className="inline-flex items-center gap-1 text-sm font-bold text-amber-text hover:underline"
          >
            All applications
            <ArrowRight className="size-3.5" aria-hidden />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
          <Link
            href={`/packing-machine/${featured.slug}`}
            className="group relative min-h-[360px] overflow-hidden rounded-2xl border border-border bg-ink shadow-[0_28px_90px_rgba(15,23,42,0.14)] sm:min-h-[420px]"
          >
            {featuredSrc ? (
              <>
                <Image
                  src={featuredSrc}
                  alt={`${featured.name} packing machine`}
                  fill
                  sizes="(min-width: 1024px) 55vw, 100vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  unoptimized={featuredSrc.startsWith("/")}
                />
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-tr from-ink/92 via-ink/55 to-amber/20"
                />
              </>
            ) : (
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-tr from-ink via-ink/90 to-amber/30"
              />
            )}
            <div className="relative flex h-full min-h-[360px] flex-col justify-between p-7 sm:min-h-[420px] sm:p-9">
              <div>
                <p className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-white/80 backdrop-blur">
                  Featured
                </p>
                <h3 className="mt-5 max-w-md font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-5xl">
                  {featured.name}
                </h3>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-white/82">
                  {featured.blurb ||
                    `${featured.productCount} machine${featured.productCount === 1 ? "" : "s"} with published prices. India-wide delivery.`}
                </p>
              </div>
              <div className="mt-10">
                <p className="tabular-price text-2xl font-semibold text-white">
                  {priceLabel(featured)}
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2.5 text-sm font-bold text-ink shadow-sm transition-transform group-hover:translate-x-0.5">
                  Explore machines
                  <ArrowRight className="size-4" aria-hidden />
                </span>
              </div>
            </div>
          </Link>

          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {compact.map((app) => {
              const src = toPublicImageSrc(app.imageUrl);
              return (
                <li key={app.slug}>
                  <Link
                    href={`/packing-machine/${app.slug}`}
                    className="group grid overflow-hidden rounded-xl border border-border bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-amber hover:shadow-[0_18px_50px_rgba(15,23,42,0.1)] sm:grid-cols-[112px_1fr] lg:grid-cols-[120px_1fr]"
                  >
                    <div className="relative min-h-[112px] overflow-hidden bg-surface-sunken">
                      {src ? (
                        <Image
                          src={src}
                          alt={`${app.name} packing machine`}
                          fill
                          sizes="120px"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized={src.startsWith("/")}
                        />
                      ) : null}
                      <div
                        aria-hidden
                        className="absolute inset-0 bg-gradient-to-tr from-ink/35 to-transparent"
                      />
                    </div>
                    <div className="flex flex-col justify-center p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[0.68rem] font-bold uppercase tracking-[0.14em] text-amber-text">
                            Application
                          </p>
                          <h3 className="mt-1 font-display text-lg font-extrabold tracking-tight text-ink">
                            {app.name}
                          </h3>
                        </div>
                        <ArrowRight
                          className="mt-1 size-4 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1 group-hover:text-amber"
                          aria-hidden
                        />
                      </div>
                      <p className="mt-2 text-sm font-semibold text-price">
                        {priceLabel(app)}
                      </p>
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {app.productCount} machine
                        {app.productCount === 1 ? "" : "s"}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
