"use client";

import { useState } from "react";

import { MachineImage } from "@/components/MachineImage";
import type { ProductImage } from "@/lib/api/catalogue";

type Props = {
  name: string;
  images: ProductImage[];
  capacityHint?: string | null;
  machineType?: string | null;
};

export function ProductGallery({ name, images, capacityHint, machineType }: Props) {
  const list = images.length
    ? images
    : [{ url: "", alt: name } as ProductImage];
  const [active, setActive] = useState(0);
  const current = list[Math.min(active, list.length - 1)];

  return (
    <div data-testid="product-gallery">
      <div
        className="overflow-hidden rounded-xl border border-border bg-surface-sunken"
        data-testid="product-gallery-main"
      >
        <MachineImage
          image={current?.url ? current : null}
          name={name}
          capacityHint={capacityHint}
          machineType={machineType}
          priority
          sizes="(max-width: 1024px) 100vw, 560px"
          className="aspect-[4/3] md:aspect-[5/4]"
        />
      </div>
      {list.length > 1 && list[0]?.url ? (
        <ul className="mt-2 grid grid-cols-5 gap-2 sm:grid-cols-6">
          {list.slice(0, 6).map((img, i) => (
            <li key={`${img.url}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                data-testid={`product-gallery-thumb-${i}`}
                className={`block w-full overflow-hidden rounded-lg border bg-surface-sunken transition-colors ${
                  i === active ? "border-amber ring-2 ring-amber/30" : "border-border hover:border-border-strong"
                }`}
                aria-label={`View image ${i + 1}`}
                aria-pressed={i === active}
              >
                <MachineImage
                  image={img}
                  name={name}
                  className="aspect-square"
                  sizes="80px"
                />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
