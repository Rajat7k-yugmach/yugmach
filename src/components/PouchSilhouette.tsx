/** Pouch-format silhouette library — flat industrial SVGs. */

export type PouchFormatId =
  | "pillow"
  | "gusseted"
  | "centre-seal"
  | "three-side"
  | "four-side"
  | "stand-up"
  | "stand-up-zipper"
  | "sachet"
  | "block-bottom"
  | "flow-wrap";

export const POUCH_FORMATS: Array<{ id: PouchFormatId; label: string }> = [
  { id: "pillow", label: "Pillow pack" },
  { id: "gusseted", label: "Gusseted" },
  { id: "centre-seal", label: "Centre seal" },
  { id: "three-side", label: "3-side seal" },
  { id: "four-side", label: "4-side seal" },
  { id: "stand-up", label: "Stand-up" },
  { id: "stand-up-zipper", label: "Stand-up zipper" },
  { id: "sachet", label: "Sachet" },
  { id: "block-bottom", label: "Block bottom" },
  { id: "flow-wrap", label: "Flow wrap" },
];

const paths: Record<PouchFormatId, string> = {
  pillow:
    "M28 8h44c4 0 8 4 8 8v88c0 4-4 8-8 8H28c-4 0-8-4-8-8V16c0-4 4-8 8-8zm22 4v96M24 20h52M24 100h52",
  gusseted:
    "M30 10h40l14 14v76c0 6-4 10-10 10H26c-6 0-10-4-10-10V24L30 10zm0 0L16 24M70 10l14 14M50 14v90",
  "centre-seal":
    "M26 12h48c6 0 10 4 10 10v76c0 6-4 10-10 10H26c-6 0-10-4-10-10V22c0-6 4-10 10-10zm24 0v96",
  "three-side":
    "M22 14h56c4 0 8 4 8 8v76c0 4-4 8-8 8H22c-4 0-8-4-8-8V22c0-4 4-8 8-8zm0 0v92M78 14v92M22 106h56",
  "four-side":
    "M24 16h52c4 0 8 4 8 8v72c0 4-4 8-8 8H24c-4 0-8-4-8-8V24c0-4 4-8 8-8zm0 0h52M24 104h52M16 24v72M84 24v72",
  "stand-up":
    "M34 12h32c4 0 8 6 10 14l8 58c2 12-4 20-14 20H30c-10 0-16-8-14-20l8-58c2-8 6-14 10-14z",
  "stand-up-zipper":
    "M34 18h32c4 0 8 6 10 14l8 52c2 12-4 20-14 20H30c-10 0-16-8-14-20l8-52c2-8 6-14 10-14zM30 28h40",
  sachet:
    "M38 8h24c2 0 4 2 4 4v96c0 2-2 4-4 4H38c-2 0-4-2-4-4V12c0-2 2-4 4-4zm0 8h24M38 104h24",
  "block-bottom":
    "M28 10h44c4 0 8 4 8 8v70l-14 20H34L20 88V18c0-4 4-8 8-8zm8 98h28",
  "flow-wrap":
    "M12 40h76c4 0 8 4 8 8v24c0 4-4 8-8 8H12c-4 0-8-4-8-8V48c0-4 4-8 8-8zm8 0v40M80 40v40",
};

type Props = {
  format: PouchFormatId;
  className?: string;
  title?: string;
};

export function PouchSilhouette({ format, className = "", title }: Props) {
  return (
    <svg
      viewBox="0 0 100 120"
      className={className}
      role="img"
      aria-label={title || format}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={paths[format]} />
    </svg>
  );
}

export function PouchFormatRow({
  formats,
  className = "",
}: {
  formats: PouchFormatId[];
  className?: string;
}) {
  const items = POUCH_FORMATS.filter((f) => formats.includes(f.id));
  if (!items.length) return null;
  return (
    <ul className={`flex flex-wrap gap-3 ${className}`}>
      {items.map((f) => (
        <li key={f.id} className="flex w-16 flex-col items-center gap-1 text-center">
          <PouchSilhouette format={f.id} className="h-14 w-12 text-ink" />
          <span className="section-label">{f.label}</span>
        </li>
      ))}
    </ul>
  );
}

/** Heuristic default formats by machine type / product keywords */
export function defaultPouchFormats(product: {
  name?: string;
  machineType?: string | { slug: string } | null;
}): PouchFormatId[] {
  const mt =
    typeof product.machineType === "string"
      ? product.machineType
      : product.machineType?.slug || "";
  const name = (product.name || "").toLowerCase();
  if (mt.includes("flow") || name.includes("flow wrap") || name.includes("soap") || name.includes("sanitary")) {
    return ["flow-wrap"];
  }
  if (name.includes("sachet") || name.includes("tea") || name.includes("supari")) {
    return ["sachet", "three-side", "pillow"];
  }
  if (name.includes("powder") || name.includes("masala") || name.includes("haldi") || name.includes("coffee")) {
    return ["pillow", "centre-seal", "stand-up"];
  }
  if (name.includes("namkeen") || name.includes("snack") || name.includes("chips") || name.includes("kurkure")) {
    return ["pillow", "gusseted", "stand-up"];
  }
  return ["pillow", "centre-seal", "three-side"];
}
