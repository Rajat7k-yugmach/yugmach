"use client";

import Link from "next/link";

import { useSiteSettings } from "@/components/SiteSettingsProvider";
import { primaryPhone, telHref } from "@/lib/api/siteSettings";
import { INDIAMART_REVIEWS_URL } from "@/lib/constants";

export function SiteFooter() {
  const year = new Date().getFullYear();
  const settings = useSiteSettings();
  const phone = primaryPhone(settings);

  return (
    <footer className="mt-auto border-t border-border bg-ink text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-xl font-extrabold tracking-tight">YugMach</p>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-amber">
            Industrial packing machines
          </p>
          <p className="mt-3 text-sm text-white/70">
            Published prices. Industrial packing machines. India-wide dispatch.
          </p>
          <p className="mt-4 text-sm text-white/65">{settings.companyAddress}</p>
          <p className="mt-2 text-sm">
            <a href={`tel:${telHref(phone)}`} className="font-medium hover:underline">
              {phone.display}
            </a>
          </p>
          <p className="mt-1 text-sm">
            <a href={`mailto:${settings.companyEmail}`} className="hover:underline">
              {settings.companyEmail}
            </a>
          </p>
        </div>

        <div>
          <p className="section-label text-white/45">Catalogue</p>
          <ul className="mt-3 space-y-2 text-sm font-medium">
            <li>
              <Link href="/products" className="hover:underline">
                All machines
              </Link>
            </li>
            <li>
              <Link href="/packing-machine" className="hover:underline">
                By application
              </Link>
            </li>
            <li>
              <Link href="/machine-finder" className="hover:underline">
                Machine finder
              </Link>
            </li>
            <li>
              <Link href="/about/factory" className="hover:underline">
                Factory
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="section-label text-white/45">Popular</p>
          <ul className="mt-3 space-y-2 text-sm font-medium">
            <li>
              <Link href="/packing-machine/namkeen" className="hover:underline">
                Namkeen
              </Link>
            </li>
            <li>
              <Link href="/packing-machine/masala" className="hover:underline">
                Masala
              </Link>
            </li>
            <li>
              <Link href="/packing-machine/powder" className="hover:underline">
                Powder
              </Link>
            </li>
            <li>
              <Link href="/packing-machine/snacks" className="hover:underline">
                Snacks
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="section-label text-white/45">Support</p>
          <ul className="mt-3 space-y-2 text-sm font-medium">
            <li>
              <Link href="/service" className="hover:underline">
                Service &amp; AMC
              </Link>
            </li>
            <li>
              <Link href="/spares" className="hover:underline">
                Spare parts
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link href="/locations" className="hover:underline">
                Cities
              </Link>
            </li>
          </ul>
          <p className="mt-5 text-sm text-white/70">
            <a
              href={INDIAMART_REVIEWS_URL}
              rel="noopener noreferrer"
              target="_blank"
              className="underline decoration-white/40 underline-offset-2 hover:decoration-white"
            >
              4.9★ IndiaMART · 40 reviews
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-white/10 px-4 py-3 text-center text-xs text-white/50">
        © {year} YugMach. All rights reserved.
      </div>
    </footer>
  );
}
