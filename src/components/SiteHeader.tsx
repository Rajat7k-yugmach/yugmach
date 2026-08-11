"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, ChevronDown, Home } from "lucide-react";

import { WhatsAppButton } from "@/components/WhatsAppButton";
import { cn } from "@/lib/utils";
import { waMessageGeneric } from "@/lib/whatsapp";

const PRIMARY = [
  {
    label: "Machines",
    href: "/products",
    children: [
      { href: "/products", label: "All machines · prices" },
      { href: "/packing-machine", label: "By what you pack" },
      { href: "/machines", label: "By machine type" },
      { href: "/machine-finder", label: "Machine finder" },
      { href: "/advisor", label: "Advisor" },
      { href: "/compare", label: "Compare" },
    ],
  },
  {
    label: "Buy",
    href: "/quote",
    children: [
      { href: "/quote", label: "Get price" },
      { href: "/finance/roi-calculator", label: "ROI calculator" },
      { href: "/spares", label: "Spare parts" },
      { href: "/service", label: "Service & AMC" },
    ],
  },
  {
    label: "Company",
    href: "/about",
    children: [
      { href: "/about", label: "About YugMach" },
      { href: "/about/factory", label: "Factory" },
      { href: "/case-studies", label: "Case studies" },
      { href: "/reviews", label: "Reviews" },
      { href: "/blog", label: "Blog" },
      { href: "/partners/become-a-dealer", label: "Become a dealer" },
      { href: "/export", label: "Export" },
      { href: "/locations", label: "Cities" },
    ],
  },
] as const;

function pathMatches(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  if (href === "/hi") return pathname === "/hi" || pathname.startsWith("/hi/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

function groupActive(
  pathname: string,
  group: (typeof PRIMARY)[number],
): boolean {
  if (pathMatches(pathname, group.href)) return true;
  return group.children.some((c) => pathMatches(pathname, c.href));
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const isHi = pathname === "/hi" || pathname.startsWith("/hi/");
  const homeHref = isHi ? "/hi" : "/";
  const [open, setOpen] = useState(false);
  const homeActive = pathMatches(pathname, homeHref);
  const contactActive = pathMatches(pathname, "/contact");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 text-ink shadow-[0_1px_0_rgba(15,23,42,0.04),0_8px_24px_rgba(15,23,42,0.05)] backdrop-blur">
      {/* Brand accent */}
      <div
        className="h-1 bg-gradient-to-r from-amber via-amber to-[#f59e0b]/60"
        aria-hidden
      />

      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2.5 md:gap-3 md:py-3">
        <Link
          href={homeHref}
          className="group flex min-w-0 shrink-0 items-center"
          aria-label="YugMach home"
        >
          <Image
            src="/brand-logo.png"
            alt="YugMach"
            width={180}
            height={87}
            className="h-10 w-auto object-contain object-left md:h-12"
            priority
          />
        </Link>

        <nav className="ml-1 hidden items-center gap-0.5 lg:flex xl:ml-4">
          <Link
            href={homeHref}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              homeActive
                ? "bg-amber/15 text-ink"
                : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
            )}
          >
            <Home className="size-3.5" aria-hidden />
            Home
          </Link>

          {PRIMARY.map((group) => {
            const active = groupActive(pathname, group);
            return (
              <div key={group.label} className="group/nav relative">
                <Link
                  href={group.href}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
                    active
                      ? "bg-amber/15 text-ink"
                      : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
                  )}
                >
                  {group.label}
                  <ChevronDown className="size-3.5 opacity-60 transition-transform group-hover/nav:rotate-180" />
                </Link>
                <div className="invisible absolute left-0 top-full z-50 min-w-[230px] translate-y-1 pt-1.5 opacity-0 transition-all duration-150 group-hover/nav:visible group-hover/nav:translate-y-0 group-hover/nav:opacity-100 group-focus-within/nav:visible group-focus-within/nav:translate-y-0 group-focus-within/nav:opacity-100">
                  <ul className="rounded-xl border border-border bg-white py-1.5 shadow-lg ring-1 ring-black/5">
                    {group.children.map((c) => {
                      const childActive = pathMatches(pathname, c.href);
                      return (
                        <li key={c.href}>
                          <Link
                            href={c.href}
                            className={cn(
                              "block px-4 py-2 text-sm font-medium transition-colors",
                              childActive
                                ? "bg-amber/12 text-ink"
                                : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
                            )}
                          >
                            {c.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}

          <Link
            href="/contact"
            className={cn(
              "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
              contactActive
                ? "bg-amber/15 text-ink"
                : "text-ink-muted hover:bg-surface-sunken hover:text-ink",
            )}
          >
            Contact
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <WhatsAppButton
            message={waMessageGeneric()}
            placement="header"
            className="tap-target inline-flex items-center justify-center rounded-lg bg-whatsapp px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:brightness-110"
          >
            <span className="hidden sm:inline">Get Price on WhatsApp</span>
            <span className="sm:hidden">WhatsApp</span>
          </WhatsAppButton>
          <button
            type="button"
            className="tap-target inline-flex items-center justify-center rounded-lg border border-border bg-surface p-2 text-ink lg:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface lg:hidden">
          <div className="mx-auto max-w-6xl space-y-1 px-4 py-3">
            <Link
              href={homeHref}
              className={cn(
                "tap-target flex items-center gap-2 rounded-lg px-2 py-2.5 text-sm font-semibold",
                homeActive ? "bg-amber/15 text-ink" : "text-ink hover:bg-white",
              )}
              onClick={() => setOpen(false)}
            >
              <Home className="size-4" aria-hidden />
              Home
            </Link>

            {PRIMARY.map((group) => (
              <div key={group.label} className="pb-2">
                <p className="px-2 py-2 text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                  {group.label}
                </p>
                {group.children.map((c) => (
                  <Link
                    key={c.href}
                    href={c.href}
                    className={cn(
                      "tap-target block rounded-lg px-2 py-2.5 text-sm font-semibold",
                      pathMatches(pathname, c.href)
                        ? "bg-amber/15 text-ink"
                        : "text-ink hover:bg-white",
                    )}
                    onClick={() => setOpen(false)}
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            ))}

            <Link
              href="/contact"
              className={cn(
                "tap-target block rounded-lg px-2 py-2.5 text-sm font-semibold",
                contactActive ? "bg-amber/15 text-ink" : "text-ink hover:bg-white",
              )}
              onClick={() => setOpen(false)}
            >
              Contact
            </Link>

            <div className="pt-2">
              <WhatsAppButton
                message={waMessageGeneric()}
                placement="header"
                className="tap-target flex w-full items-center justify-center rounded-lg bg-whatsapp py-3 text-sm font-bold text-white"
              >
                Get Price on WhatsApp
              </WhatsAppButton>
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
