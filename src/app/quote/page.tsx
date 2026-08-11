"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { submitLead } from "@/lib/api/leads";
import { trackEvent } from "@/lib/analytics";
import { WhatsAppButton } from "@/components/WhatsAppButton";

export default function QuoteWizardPage() {
  const [step, setStep] = useState(1);
  const [productToPack, setProductToPack] = useState("");
  const [requiredPph, setRequiredPph] = useState("");
  const [budgetBand, setBudgetBand] = useState("");
  const [city, setCity] = useState("");
  const [timeline, setTimeline] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    const res = await submitLead({
      name,
      phone,
      city,
      productToPack,
      requiredPph: requiredPph ? Number(requiredPph) : undefined,
      budgetBand,
      timeline,
      message: message || `Quote wizard: ${productToPack}`,
      source: "QUOTE_FLOW",
      pageUrl: typeof window !== "undefined" ? window.location.href : "/quote",
    });
    if (res.ok) {
      setStatus("ok");
      trackEvent("generate_lead", { source: "QUOTE_FLOW" });
    } else {
      setStatus("err");
      setError(res.error || "Could not submit");
    }
  }

  const field =
    "mt-1.5 w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-base text-ink";

  if (status === "ok") {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="section-label text-amber-text">Quote</p>
        <h1 className="font-display mt-1 text-3xl font-extrabold text-ink">
          Request received
        </h1>
        <p className="mt-3 text-ink-muted">
          We will call or WhatsApp you on the number you shared.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-flex items-center gap-1 rounded-lg bg-amber px-5 py-3 text-sm font-bold text-white"
        >
          Browse machines
          <ArrowRight className="size-3.5" aria-hidden />
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-8 pb-24 md:py-10">
      <p className="section-label text-amber-text">Buy</p>
      <h1 className="font-display mt-1 text-3xl font-extrabold tracking-tight text-ink">
        Get a configuration quote
      </h1>
      <p className="mt-2 text-ink-muted">
        Step {step} of 3 — published prices, GST extra. Tell us what you pack
        and we come back with a fit.
      </p>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
        <div
          className="h-full rounded-full bg-amber transition-[width]"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-6 rounded-2xl border border-border bg-white p-5 shadow-sm md:p-6"
      >
        {step === 1 ? (
          <div className="space-y-4">
            <label className="block text-sm font-semibold">
              What do you pack?
              <input
                className={field}
                required
                value={productToPack}
                onChange={(e) => setProductToPack(e.target.value)}
                placeholder="Namkeen, masala, detergent…"
              />
            </label>
            <label className="block text-sm font-semibold">
              Target packs / hour
              <input
                className={field}
                type="number"
                min={1}
                value={requiredPph}
                onChange={(e) => setRequiredPph(e.target.value)}
                placeholder="e.g. 1800"
              />
            </label>
            <button
              type="button"
              className="tap-target w-full rounded-xl bg-amber px-5 py-3.5 text-base font-bold text-white"
              onClick={() => productToPack && setStep(2)}
            >
              Continue
            </button>
          </div>
        ) : null}
        {step === 2 ? (
          <div className="space-y-4">
            <label className="block text-sm font-semibold">
              Budget band
              <select
                className={field}
                value={budgetBand}
                onChange={(e) => setBudgetBand(e.target.value)}
              >
                <option value="">Select</option>
                <option value="under-2L">Under ₹2 lakh</option>
                <option value="2-4L">₹2–4 lakh</option>
                <option value="4-7L">₹4–7 lakh</option>
                <option value="7L-plus">₹7 lakh+</option>
              </select>
            </label>
            <label className="block text-sm font-semibold">
              City
              <input
                className={field}
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold">
              Timeline
              <select
                className={field}
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
              >
                <option value="">Select</option>
                <option value="asap">ASAP</option>
                <option value="1-3m">1–3 months</option>
                <option value="research">Still researching</option>
              </select>
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                className="tap-target rounded-xl border border-border px-5 py-3 font-semibold"
                onClick={() => setStep(1)}
              >
                Back
              </button>
              <button
                type="button"
                className="tap-target flex-1 rounded-xl bg-amber px-5 py-3 font-bold text-white"
                onClick={() => setStep(3)}
              >
                Continue
              </button>
            </div>
          </div>
        ) : null}
        {step === 3 ? (
          <div className="space-y-4">
            <label className="block text-sm font-semibold">
              Name
              <input
                className={field}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
            <label className="block text-sm font-semibold">
              Mobile
              <input
                className={field}
                required
                pattern="[0-9]{10}"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile"
              />
            </label>
            <label className="block text-sm font-semibold">
              Notes
              <textarea
                className={field}
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </label>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <div className="flex gap-2">
              <button
                type="button"
                className="tap-target rounded-xl border border-border px-5 py-3 font-semibold"
                onClick={() => setStep(2)}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={status === "loading"}
                className="tap-target flex-1 rounded-xl bg-amber px-5 py-3 font-bold text-white disabled:opacity-50"
              >
                {status === "loading" ? "Sending…" : "Submit quote request"}
              </button>
            </div>
          </div>
        ) : null}
      </form>

      <div className="mt-8 flex flex-wrap items-center gap-3 text-sm">
        <WhatsAppButton
          message="Hi, I want a packing machine quote. Product: "
          className="font-semibold text-whatsapp hover:underline"
        >
          Prefer WhatsApp?
        </WhatsAppButton>
        <span className="text-ink-muted">·</span>
        <Link href="/advisor" className="font-semibold text-trust hover:underline">
          Try the advisor
        </Link>
      </div>
    </main>
  );
}
