import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Package,
  ShieldCheck,
  Wrench,
  GraduationCap,
  ClipboardList,
} from "lucide-react";

import { Breadcrumbs } from "@/components/Breadcrumbs";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Service & AMC for packing machines",
  description:
    "Installation, operator training, warranty, AMC and India-wide service for YugMach packing machines.",
  path: "/service",
  withHreflang: false,
});

const LINKS = [
  {
    href: "/service/installation",
    label: "Installation",
    d: "Commissioning on your floor with operators signed off.",
    Icon: Wrench,
  },
  {
    href: "/service/training",
    label: "Training",
    d: "HMI, changeovers, film loading, and daily checks.",
    Icon: GraduationCap,
  },
  {
    href: "/service/amc",
    label: "AMC",
    d: "Scheduled visits so downtime does not wait for a crisis.",
    Icon: ClipboardList,
  },
  {
    href: "/service/warranty",
    label: "Warranty",
    d: "What is covered, what is wear, and how claims work.",
    Icon: ShieldCheck,
  },
  {
    href: "/service/coverage",
    label: "Coverage",
    d: "India-wide service planning from the Mathura workshop.",
    Icon: MapPin,
  },
  {
    href: "/spares",
    label: "Spare parts",
    d: "Jaws, collars, load cells, HMIs — request by model.",
    Icon: Package,
  },
] as const;

export default function ServicePage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 pb-24 md:py-10">
      <Breadcrumbs
        items={[{ href: "/", label: "Home" }, { label: "Service" }]}
      />
      <div className="mt-4 max-w-2xl">
        <p className="section-label text-amber-text">After you buy</p>
        <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink md:text-4xl">
          Service that keeps output up
        </h1>
        <p className="mt-3 text-ink-muted">
          Installation, training, spares and AMC — scoped in writing. Coverage is
          India-wide with scheduled visits, not a promise of overnight miracles.
        </p>
        <div className="mt-6">
          <WhatsAppButton
            message="Hi, I need service / AMC help for my packing machine"
            className="tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-5 py-3 text-sm font-bold text-white"
          >
            WhatsApp service desk
          </WhatsAppButton>
        </div>
      </div>

      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {LINKS.map(({ href, label, d, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="group flex h-full flex-col rounded-xl border border-border bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-amber hover:shadow-[0_14px_40px_rgba(15,23,42,0.08)]"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-amber/12 text-amber-text">
                <Icon className="size-4" aria-hidden />
              </span>
              <span className="mt-4 font-display text-lg font-extrabold text-ink group-hover:underline">
                {label}
              </span>
              <span className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">
                {d}
              </span>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-trust">
                Open
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
