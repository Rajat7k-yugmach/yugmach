import Image from "next/image";
import Link from "next/link";

import { toPublicImageSrc } from "@/lib/media";
import { cn } from "@/lib/utils";

export type MosaicApp = {
  slug: string;
  name: string;
  imageUrl: string | null;
  priceMinDisplay?: string | null;
};

type Stats = {
  models: number;
  label2?: string;
  label3?: string;
};

type Props = {
  apps: MosaicApp[];
  stats?: Stats;
  className?: string;
};

export function HeroApplicationMosaic({ apps, stats, className }: Props) {
  const tiles = apps.slice(0, 4);

  return (
    <div className={cn("relative", className)}>
      <div
        aria-hidden
        className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-amber/20 via-white to-trust/10 blur-3xl"
      />
      <div className="relative grid grid-cols-2 gap-2">
        {tiles.map((app, idx) => {
          const src = toPublicImageSrc(app.imageUrl);
          return (
            <Link
              key={app.slug}
              href={`/packing-machine/${app.slug}`}
              className="group relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-sunken"
            >
              {src ? (
                <Image
                  src={src}
                  alt={`${app.name} packing machine`}
                  fill
                  sizes="(max-width: 1024px) 46vw, 22vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  priority={idx < 2}
                  unoptimized={src.startsWith("/")}
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-surface-sunken text-xs font-semibold text-ink-muted">
                  {app.name}
                </div>
              )}
              <div
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/72 via-black/20 to-transparent"
              />
              <div
                aria-hidden
                className="absolute inset-0 bg-amber/0 transition-colors duration-300 group-hover:bg-amber/20"
              />
              <div className="absolute inset-x-0 bottom-0 p-2.5 sm:p-3">
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-white/70">
                  Application
                </p>
                <p className="mt-0.5 font-display text-sm font-extrabold leading-tight text-white sm:text-base">
                  {app.name}
                </p>
              </div>
              <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-[0.6rem] font-bold text-ink">
                  View ↗
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {stats ? (
        <div className="relative mt-3 grid grid-cols-3 overflow-hidden rounded-xl border border-border bg-white shadow-sm">
          <div className="p-3 text-center">
            <p className="font-display text-xl font-extrabold text-ink">
              {stats.models}+
            </p>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
              Models
            </p>
          </div>
          <div className="border-x border-border p-3 text-center">
            <p className="font-display text-xl font-extrabold text-ink">
              {stats.label2 || "India"}
            </p>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
              Pan-India
            </p>
          </div>
          <div className="p-3 text-center">
            <p className="font-display text-xl font-extrabold text-ink">
              {stats.label3 || "Price"}
            </p>
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.1em] text-ink-muted">
              Published
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
