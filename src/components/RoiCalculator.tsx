"use client";

import { useMemo, useState } from "react";

import { DISCLAIMER_FINANCE } from "@/lib/constants";
import { calcRoi, formatInrFromRupees } from "@/lib/format";

type Props = {
  initialInvestment?: number;
};

export function RoiCalculator({ initialInvestment = 225000 }: Props) {
  const [investment, setInvestment] = useState(initialInvestment);
  const [pouchesPerDay, setPouchesPerDay] = useState(2000);
  const [daysPerMonth, setDaysPerMonth] = useState(25);
  const [marginPerPouch, setMarginPerPouch] = useState(0.5);

  const result = useMemo(() => {
    const monthly = pouchesPerDay * daysPerMonth * marginPerPouch;
    const annual = monthly * 12;
    const roi = calcRoi(investment, annual);
    return { monthly, annual, ...roi };
  }, [investment, pouchesPerDay, daysPerMonth, marginPerPouch]);

  return (
    <div className="border border-border bg-surface-raised p-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          id="roi-invest"
          label="Machine investment (₹)"
          value={investment}
          onChange={setInvestment}
          step={1000}
        />
        <Field
          id="roi-pouch"
          label="Pouches / day"
          value={pouchesPerDay}
          onChange={setPouchesPerDay}
          step={100}
        />
        <Field
          id="roi-days"
          label="Working days / month"
          value={daysPerMonth}
          onChange={setDaysPerMonth}
          min={1}
          max={31}
        />
        <label className="block text-sm" htmlFor="roi-margin">
          <span className="mb-1 block text-ink-muted">Gross margin per pouch (₹)</span>
          <input
            id="roi-margin"
            type="number"
            min={0}
            step={0.1}
            value={marginPerPouch}
            onChange={(e) => setMarginPerPouch(Number(e.target.value) || 0)}
            className="w-full border border-border bg-surface px-3 py-2 text-ink"
          />
        </label>
      </div>

      <dl className="mt-6 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Est. monthly contribution</dt>
          <dd className="tabular-price font-semibold text-ink">
            {formatInrFromRupees(Math.round(result.monthly))}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Est. annual contribution</dt>
          <dd className="tabular-price font-semibold text-ink">
            {formatInrFromRupees(Math.round(result.annual))}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Simple ROI</dt>
          <dd className="tabular-price font-semibold text-price">
            {result.roiPercent.toFixed(1)}%
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-ink-muted">Payback</dt>
          <dd className="tabular-price font-semibold text-ink">
            {result.paybackMonths != null ? `~${result.paybackMonths} months` : "—"}
          </dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-ink-muted">{DISCLAIMER_FINANCE}</p>
    </div>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  step = 1,
  min = 0,
  max,
}: {
  id: string;
  label: string;
  value: number;
  onChange: (n: number) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <label className="block text-sm" htmlFor={id}>
      <span className="mb-1 block text-ink-muted">{label}</span>
      <input
        id={id}
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="w-full border border-border bg-surface px-3 py-2 text-ink"
      />
    </label>
  );
}
