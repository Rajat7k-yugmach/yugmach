"use client";

import NumberFlow from "@number-flow/react";
import { useEffect, useState } from "react";

type Metric = {
  value: number;
  suffix?: string;
  prefix?: string;
  label: string;
};

export function HeroMetrics({ metrics }: { metrics: Metric[] }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(t);
  }, []);

  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      {metrics.map((m) => (
        <div key={m.label} className="border-l-2 border-amber pl-3">
          <dt className="section-label">{m.label}</dt>
          <dd className="mt-1 text-3xl font-bold tabular-nums text-ink md:text-4xl">
            {m.prefix}
            <NumberFlow value={ready ? m.value : 0} />
            {m.suffix}
          </dd>
        </div>
      ))}
    </dl>
  );
}
