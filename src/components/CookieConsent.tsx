"use client";

import { useEffect, useState } from "react";

const KEY = "ym_cookie_consent";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true);
    } catch {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[60] border-t border-border bg-ink p-4 text-surface shadow-lg md:px-6">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-surface/90">
          We use essential cookies to run the site and optional analytics if you accept.
          See <a href="/privacy" className="underline">Privacy</a>.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className="rounded border border-surface/40 px-4 py-2 text-sm font-semibold text-surface"
            onClick={() => {
              try {
                localStorage.setItem(KEY, "essential");
              } catch { /* ignore */ }
              setShow(false);
            }}
          >
            Essential only
          </button>
          <button
            type="button"
            className="rounded bg-amber px-4 py-2 text-sm font-semibold text-amber-ink"
            onClick={() => {
              try {
                localStorage.setItem(KEY, "accepted");
                window.dispatchEvent(new Event("ym-consent"));
              } catch { /* ignore */ }
              setShow(false);
            }}
          >
            Accept analytics
          </button>
        </div>
      </div>
    </div>
  );
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(KEY) === "accepted";
  } catch {
    return false;
  }
}
