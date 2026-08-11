import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="font-display text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 text-ink-muted">Try these popular applications or WhatsApp us.</p>
      <ul className="mt-6 space-y-2">
        <li>
          <Link className="underline" href="/packing-machine/namkeen">
            Namkeen packing machine
          </Link>
        </li>
        <li>
          <Link className="underline" href="/packing-machine/haldi-powder">
            Haldi packing machine
          </Link>
        </li>
        <li>
          <Link className="underline" href="/products">
            All products
          </Link>
        </li>
        <li>
          <Link className="underline" href="/contact">
            Contact
          </Link>
        </li>
      </ul>
    </main>
  );
}
