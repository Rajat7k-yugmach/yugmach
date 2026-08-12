"use client";

import { FormEvent, useState } from "react";

import { submitLead, type LeadPayload } from "@/lib/api/leads";
import { trackEvent } from "@/lib/analytics";

type Props = {
  source?: LeadPayload["source"];
  productSlug?: string;
  defaultMessage?: string;
  submitLabel?: string;
  compact?: boolean;
};

export function LeadForm({
  source = "WEBSITE_FORM",
  productSlug,
  defaultMessage = "",
  submitLabel = "Send enquiry",
  compact = false,
}: Props) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setError(null);
    const fd = new FormData(e.currentTarget);
    const payload: LeadPayload = {
      name: String(fd.get("name") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim() || undefined,
      company: String(fd.get("company") ?? "").trim() || undefined,
      city: String(fd.get("city") ?? "").trim() || undefined,
      message: String(fd.get("message") ?? "").trim() || undefined,
      productToPack: String(fd.get("productToPack") ?? "").trim() || undefined,
      productSlug: productSlug || undefined,
      source,
      pageUrl: typeof window !== "undefined" ? window.location.href : undefined,
      needsFinance: fd.get("needsFinance") === "on",
    };

    const result = await submitLead(payload);
    if (result.ok) {
      setStatus("ok");
      trackEvent("submit_lead", { source: String(source), productSlug: productSlug ?? "" });
      e.currentTarget.reset();
      return;
    }
    setStatus("error");
    setError(result.error);
  }

  if (status === "ok") {
    return (
      <div className="border border-border bg-surface-raised p-5 text-ink">
        <p className="font-semibold">Thanks — we received your enquiry.</p>
        <p className="mt-2 text-sm text-ink-muted">
          We usually reply on WhatsApp or phone within business hours.
        </p>
        <button
          type="button"
          data-testid="lead-form-reset"
          className="mt-4 text-sm text-info underline"
          onClick={() => setStatus("idle")}
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="border border-border bg-surface-raised p-5"
      data-testid="lead-form"
    >
      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        <Field label="Name *" name="name" required testId="lead-form-name" />
        <Field
          label="Phone *"
          name="phone"
          required
          type="tel"
          testId="lead-form-phone"
        />
        {!compact ? (
          <>
            <Field label="Email" name="email" type="email" testId="lead-form-email" />
            <Field label="City" name="city" testId="lead-form-city" />
            <Field label="Company" name="company" testId="lead-form-company" />
            <Field
              label="Product you pack"
              name="productToPack"
              testId="lead-form-product-to-pack"
            />
          </>
        ) : null}
      </div>
      <label className="mt-4 block text-sm">
        <span className="mb-1 block text-ink-muted">Message</span>
        <textarea
          name="message"
          rows={compact ? 3 : 4}
          defaultValue={defaultMessage}
          data-testid="lead-form-message"
          className="w-full border border-border bg-surface px-3 py-2 text-ink"
        />
      </label>
      {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
      <button
        type="submit"
        disabled={status === "loading"}
        data-testid="lead-form-submit"
        className="mt-5 rounded bg-amber px-5 py-3 text-sm font-semibold text-amber-ink disabled:opacity-60"
      >
        {status === "loading" ? "Sending…" : submitLabel}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  required,
  type = "text",
  testId,
}: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  testId?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block text-ink-muted">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        data-testid={testId}
        className="w-full border border-border bg-surface px-3 py-2 text-ink"
      />
    </label>
  );
}
