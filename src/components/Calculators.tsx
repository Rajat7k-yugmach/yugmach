"use client";

import { useState } from "react";

import { calcEmi, formatInrFromPaise } from "@/lib/api/client";

const DISCLAIMER =
  "This is an estimate only, not financial advice. Final EMI, interest rate and tenure depend on your lender.";

export function EmiCalculator({ initialRupees = 225000 }: { initialRupees?: number }) {
  const [price, setPrice] = useState(initialRupees);
  const [downPct, setDownPct] = useState(20);
  const [months, setMonths] = useState(60);
  const [rate, setRate] = useState(12);
  const principal = price * (1 - downPct / 100);
  const emi = calcEmi(principal, rate, months);
  return (
    <div className="space-y-3 border border-border bg-surface-raised p-5">
      <label className="block text-sm">
        Price (₹)
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(Number(e.target.value) || 0)}
          className="mt-1 w-full border border-border px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Down payment %
        <input
          type="number"
          value={downPct}
          onChange={(e) => setDownPct(Number(e.target.value) || 0)}
          className="mt-1 w-full border border-border px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Tenure (months)
        <input
          type="number"
          value={months}
          onChange={(e) => setMonths(Number(e.target.value) || 1)}
          className="mt-1 w-full border border-border px-3 py-2"
        />
      </label>
      <label className="block text-sm">
        Interest % p.a.
        <input
          type="number"
          value={rate}
          onChange={(e) => setRate(Number(e.target.value) || 0)}
          className="mt-1 w-full border border-border px-3 py-2"
        />
      </label>
      <p className="tabular-price text-2xl font-semibold text-price">
        ≈ {formatInrFromPaise(Math.round(emi) * 100)} / month
      </p>
      <p className="text-xs text-ink-muted">{DISCLAIMER}</p>
    </div>
  );
}
