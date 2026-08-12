import Image from "next/image";

import { toPublicImageSrc } from "@/lib/media";

type ImageInfo = {
  url: string;
  alt?: string;
  width?: number;
  height?: number;
} | null | undefined;

type Props = {
  image?: ImageInfo;
  name: string;
  capacityHint?: string | number | null;
  machineType?: string | null;
  className?: string;
  priority?: boolean;
  sizes?: string;
};

/** Light placeholder when no photo is available. Never shows price. */
export function MachinePlaceholder({
  name,
  capacityHint,
  machineType,
  className = "",
}: {
  name: string;
  capacityHint?: string | number | null;
  machineType?: string | null;
  className?: string;
}) {
  const raw = capacityHint != null ? String(capacityHint).trim() : "";
  const looksLikePrice =
    !raw ||
    /[₹Rs]|lakh|lac|,/i.test(raw) ||
    (/^\d[\d,.]*$/.test(raw) && !/(pph|ppm|\/hr|pack)/i.test(raw));
  const label = !looksLikePrice && raw ? raw : null;

  return (
    <div
      className={`relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-surface-sunken text-ink ${className}`}
      role="img"
      aria-label={name}
    >
      <svg
        viewBox="0 0 200 150"
        className="absolute inset-0 m-auto h-[70%] w-[70%] text-ink/20"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <rect x="70" y="20" width="60" height="20" rx="4" />
        <path d="M80 40 L70 70 H130 L120 40" />
        <rect x="75" y="70" width="50" height="55" rx="4" />
        <circle cx="100" cy="95" r="8" />
        <path d="M60 125 H140" />
        <path d="M70 125 V135 M130 125 V135" />
      </svg>
      <div className="relative z-10 px-4 text-center">
        {label ? (
          <p className="text-2xl font-semibold tabular-nums tracking-tight text-amber-text md:text-3xl">
            {label}
          </p>
        ) : null}
        <p className="mt-1 text-xs font-medium text-ink-muted">
          {machineType || "Packing machine"}
        </p>
      </div>
    </div>
  );
}

export function MachineImage({
  image,
  name,
  capacityHint,
  machineType,
  className = "",
  priority = false,
  sizes = "(max-width: 768px) 100vw, 400px",
}: Props) {
  const localSrc = toPublicImageSrc(image?.url);
  if (!localSrc) {
    return (
      <MachinePlaceholder
        name={name}
        capacityHint={capacityHint}
        machineType={machineType}
        className={className}
      />
    );
  }
  const isLocal = localSrc.startsWith("/");
  const isBlob = localSrc.includes("blob.vercel-storage.com");

  return (
    <div className={`relative aspect-[4/3] overflow-hidden bg-surface-sunken ${className}`}>
      <Image
        src={localSrc}
        alt={image?.alt || name}
        fill
        className="object-contain p-2 md:p-3"
        sizes={sizes}
        priority={priority}
        unoptimized={isLocal || isBlob}
      />
    </div>
  );
}
