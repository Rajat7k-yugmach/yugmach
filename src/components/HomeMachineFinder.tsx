"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  Compass,
  Search,
  Truck,
  Video,
  BadgeIndianRupee,
} from "lucide-react";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

type AppOption = { slug: string; name: string };

type FinderOption = { id: string; label: string; min?: number; max?: number };

type FinderStepDto = {
  key: string;
  label: string;
  helpText?: string;
  inputType: "select" | "chip" | "number";
  options: FinderOption[];
  source: string;
  dependsOn: string | null;
  visibleWhen: {
    map?: Record<string, FinderOption[]>;
    depends_on_key?: string;
  };
  sortOrder: number;
};

type Props = {
  applications: AppOption[];
  steps?: FinderStepDto[];
  compact?: boolean;
  /** Stronger visual weight on homepage hero */
  highlighted?: boolean;
};

/** Built-in option — always appended client-side; not configured from admin. */
export const FINDER_OTHER_ID = "other";

function otherDetailKey(stepKey: string) {
  return `${stepKey}_other`;
}

function withOtherOption(options: FinderOption[]): FinderOption[] {
  const hasOther = options.some(
    (o) =>
      o.id === FINDER_OTHER_ID ||
      o.id.toLowerCase() === "other" ||
      o.label.trim().toLowerCase() === "other",
  );
  if (hasOther) return options;
  return [...options, { id: FINDER_OTHER_ID, label: "Other" }];
}

const FALLBACK_STEPS: FinderStepDto[] = [
  {
    key: "application",
    label: "What are you packing?",
    inputType: "select",
    options: [],
    source: "applications",
    dependsOn: null,
    visibleWhen: {},
    sortOrder: 0,
  },
  {
    key: "capacity",
    label: "How many pouches per hour?",
    inputType: "chip",
    options: [
      { id: "under-500", label: "Under 500" },
      { id: "500-1500", label: "500–1,500" },
      { id: "1500-3000", label: "1,500–3,000" },
      { id: "3000-plus", label: "3,000+" },
    ],
    source: "capacity",
    dependsOn: "application",
    visibleWhen: {},
    sortOrder: 1,
  },
  {
    key: "budget",
    label: "What’s your budget?",
    inputType: "chip",
    options: [
      { id: "1-2L", label: "₹1–2L" },
      { id: "2-4L", label: "₹2–4L" },
      { id: "4L-plus", label: "₹4L+" },
    ],
    source: "budget",
    dependsOn: "capacity",
    visibleWhen: {},
    sortOrder: 2,
  },
];

function FinderCombobox({
  options,
  value,
  placeholder,
  highlighted,
  onSelect,
  testIdPrefix = "machine-finder",
}: {
  options: FinderOption[];
  value: string;
  placeholder: string;
  highlighted?: boolean;
  onSelect: (id: string) => void;
  testIdPrefix?: string;
}) {
  const [open, setOpen] = useState(false);
  const [canScrollMore, setCanScrollMore] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value);
  const listOptions = options.filter((o) => o.id !== FINDER_OTHER_ID);

  function updateScrollHint() {
    const el = listRef.current;
    if (!el) {
      setCanScrollMore(false);
      return;
    }
    const remaining = el.scrollHeight - el.scrollTop - el.clientHeight;
    setCanScrollMore(remaining > 8);
  }

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(updateScrollHint);
    return () => cancelAnimationFrame(id);
  }, [open, listOptions.length]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        type="button"
        data-testid={`${testIdPrefix}-combobox-trigger`}
        className={cn(
          "flex w-full min-w-0 items-center justify-between gap-2 border border-border bg-white px-3.5 text-left font-medium text-ink shadow-sm outline-none transition",
          "hover:border-ink/25 focus-visible:border-amber focus-visible:ring-3 focus-visible:ring-amber/20",
          "data-popup-open:border-amber data-popup-open:ring-3 data-popup-open:ring-amber/20",
          highlighted
            ? "h-[3.25rem] rounded-xl text-base md:h-14 md:text-lg"
            : "h-12 rounded-xl text-base",
        )}
      >
        <span className={cn("truncate", !selected && "text-ink-muted")}>
          {selected?.label || placeholder}
        </span>
        <ChevronDown
          className="size-4 shrink-0 text-ink-muted opacity-70"
          aria-hidden
        />
      </PopoverTrigger>
      <PopoverContent
        align="start"
        sideOffset={6}
        className="w-[var(--anchor-width)] min-w-[var(--anchor-width)] gap-0 rounded-xl border border-border bg-white p-0 text-ink shadow-lg ring-1 ring-black/5"
      >
        <Command className="rounded-xl bg-white text-ink">
          <CommandInput
            placeholder="Search options…"
            data-testid={`${testIdPrefix}-combobox-search`}
            className="h-10 text-base text-ink placeholder:text-ink-muted"
            onValueChange={() => {
              requestAnimationFrame(updateScrollHint);
            }}
          />
          <div className="relative">
            <CommandList
              ref={listRef}
              onScroll={updateScrollHint}
              className={cn(
                "max-h-[13.5rem] overflow-y-auto scroll-py-1 outline-none",
                /* Override cmdk no-scrollbar so users see they can scroll */
                "![scrollbar-width:thin] [scrollbar-color:rgba(14,22,31,0.35)_transparent]",
                "[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-ink/30",
              )}
            >
              <CommandEmpty className="py-5 text-ink-muted">
                No match — use Other below.
              </CommandEmpty>
              <CommandGroup>
                {listOptions.map((o) => (
                  <CommandItem
                    key={o.id}
                    value={o.label}
                    data-checked={value === o.id || undefined}
                    className="cursor-pointer rounded-lg py-2.5 text-base data-selected:bg-amber/15 data-selected:text-ink [&_svg]:text-amber-text"
                    onSelect={() => {
                      onSelect(o.id);
                      setOpen(false);
                    }}
                  >
                    <span className="flex-1 truncate">{o.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
            {canScrollMore ? (
              <div
                className="pointer-events-none absolute inset-x-0 bottom-0 flex h-10 items-end justify-center bg-gradient-to-t from-white via-white/90 to-transparent pb-1"
                aria-hidden
              >
                <span className="rounded-full bg-ink/90 px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                  Scroll for more
                </span>
              </div>
            ) : null}
          </div>
          <div className="border-t border-border px-2 py-1.5">
            <p className="px-1 pb-1 text-[11px] text-ink-muted">
              {listOptions.length} products · search or scroll
            </p>
            <button
              type="button"
              data-testid={`${testIdPrefix}-combobox-other`}
              onClick={() => {
                onSelect(FINDER_OTHER_ID);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center rounded-lg px-2 py-2.5 text-left text-base font-medium text-ink transition hover:bg-amber/15",
                value === FINDER_OTHER_ID && "bg-amber/10",
              )}
            >
              Other
            </button>
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

function OtherDetailInput({
  value,
  onChange,
  placeholder,
  highlighted,
  testId = "machine-finder-other-detail",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  highlighted?: boolean;
  testId?: string;
}) {
  return (
    <Input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      autoFocus
      data-testid={testId}
      className={cn(
        "mt-2.5 border-border bg-white text-ink shadow-sm placeholder:text-ink-muted",
        "focus-visible:border-amber focus-visible:ring-amber/20",
        highlighted ? "h-12 rounded-xl text-base" : "h-11 rounded-xl text-base",
      )}
    />
  );
}

export function HomeMachineFinder({
  applications,
  steps: stepsProp,
  compact = false,
  highlighted = false,
}: Props) {
  const router = useRouter();
  const steps = (stepsProp?.length ? stepsProp : FALLBACK_STEPS).slice().sort(
    (a, b) => a.sortOrder - b.sortOrder,
  );

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [stepIdx, setStepIdx] = useState(0);

  const current = steps[stepIdx];
  const total = steps.length;
  const progress = ((stepIdx + 1) / total) * 100;

  const optionsForStep = useMemo((): FinderOption[] => {
    if (!current) return [];
    let base: FinderOption[] = [];
    if (current.source === "applications") {
      base = applications.map((a) => ({ id: a.slug, label: a.name }));
    } else {
      const depKey =
        current.visibleWhen?.depends_on_key || current.dependsOn || "application";
      const depVal = answers[depKey];
      const mapped = depVal && current.visibleWhen?.map?.[depVal];
      base = mapped && mapped.length ? mapped : current.options || [];
    }
    return withOtherOption(base);
  }, [current, applications, answers]);

  const currentValue = current ? answers[current.key] || "" : "";
  const isOther = currentValue === FINDER_OTHER_ID;
  const otherText = current ? answers[otherDetailKey(current.key)] || "" : "";

  const appName = useMemo(() => {
    if (answers.application === FINDER_OTHER_ID) {
      return answers[otherDetailKey("application")]?.trim() || "custom product";
    }
    return (
      applications.find((a) => a.slug === answers.application)?.name ||
      answers.application ||
      "machines"
    );
  }, [answers, applications]);

  function setAnswer(key: string, value: string) {
    setAnswers((prev) => {
      const next = { ...prev, [key]: value };
      if (value !== FINDER_OTHER_ID) {
        delete next[otherDetailKey(key)];
      }
      return next;
    });
  }

  function setOtherDetail(stepKey: string, text: string) {
    setAnswers((prev) => ({ ...prev, [otherDetailKey(stepKey)]: text }));
  }

  function goNext() {
    if (stepIdx < total - 1) {
      setStepIdx(stepIdx + 1);
      return;
    }
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(answers)) {
      if (v?.trim()) params.set(k, v.trim());
    }
    router.push(`/machine-finder?${params.toString()}`);
  }

  function goBack() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  if (!current) return null;

  const canContinue = isOther
    ? otherText.trim().length > 0
    : Boolean(currentValue);

  const selectPlaceholder =
    current.key === "application"
      ? "Select a product"
      : `Select ${current.label.toLowerCase()}`;

  const otherPlaceholder =
    current.key === "application"
      ? "Describe what you pack…"
      : current.key === "capacity"
        ? "Enter pouches per hour…"
        : current.key === "budget"
          ? "Enter your budget…"
          : "Please specify…";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (canContinue) goNext();
      }}
      data-testid="machine-finder-form"
      className={`relative overflow-hidden bg-white text-ink ${
        highlighted
          ? "rounded-2xl border border-border bg-white shadow-[0_12px_36px_rgba(15,23,42,0.07)]"
          : "card-elevated rounded-xl border border-border"
      } ${compact ? "p-4" : highlighted ? "p-5 sm:p-6" : "p-5 md:p-6"}`}
    >
      <div
        className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber via-amber to-amber/40"
        aria-hidden
      />

      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`inline-flex items-center justify-center rounded-xl bg-amber/15 text-amber-text ${
              highlighted ? "size-10" : "size-9"
            }`}
          >
            <Search className={highlighted ? "size-5" : "size-4"} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Find your machine</p>
            <p className="text-xs text-ink-muted">Matched in under a minute</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold tabular-nums text-amber-text">
            {stepIdx + 1} / {total}
          </p>
          <div className="mt-1.5 flex justify-end gap-1" aria-hidden>
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full transition-colors ${
                  i <= stepIdx ? "bg-amber" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-surface-sunken">
        <div
          className="h-full rounded-full bg-amber transition-[width] duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        key={current.key}
        className="mt-5 animate-in fade-in-0 slide-in-from-right-1 duration-200"
      >
        <h2
          className={`font-semibold tracking-tight text-ink ${
            highlighted ? "text-2xl md:text-[1.65rem]" : "text-xl"
          }`}
        >
          {current.label}
        </h2>

        <div className="mt-4">
          {current.inputType === "select" || current.inputType === "number" ? (
            <>
              <FinderCombobox
                options={optionsForStep}
                value={currentValue}
                placeholder={selectPlaceholder}
                highlighted={highlighted}
                onSelect={(id) => setAnswer(current.key, id)}
                testIdPrefix={`machine-finder-${current.key}`}
              />
              {isOther ? (
                <OtherDetailInput
                  value={otherText}
                  onChange={(v) => setOtherDetail(current.key, v)}
                  placeholder={otherPlaceholder}
                  highlighted={highlighted}
                  testId={`machine-finder-${current.key}-other-detail`}
                />
              ) : null}
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-2">
                {optionsForStep.map((o) => {
                  const active = currentValue === o.id;
                  const isOtherChip = o.id === FINDER_OTHER_ID;
                  return (
                    <button
                      key={o.id}
                      type="button"
                      data-testid={`machine-finder-${current.key}-option-${o.id}`}
                      onClick={() => {
                        setAnswer(current.key, o.id);
                        if (!isOtherChip) {
                          setTimeout(() => {
                            if (stepIdx < total - 1) {
                              setStepIdx((i) => Math.min(i + 1, total - 1));
                            }
                          }, 140);
                        }
                      }}
                      className={cn(
                        "tap-target rounded-xl border px-3 py-3 text-sm font-semibold transition-all",
                        isOtherChip && "col-span-2",
                        active
                          ? "border-amber bg-white text-ink shadow-sm ring-2 ring-amber/25"
                          : "border-border/80 bg-white text-ink-muted hover:border-border hover:text-ink",
                      )}
                    >
                      {o.label}
                    </button>
                  );
                })}
              </div>
              {isOther ? (
                <OtherDetailInput
                  value={otherText}
                  onChange={(v) => setOtherDetail(current.key, v)}
                  placeholder={otherPlaceholder}
                  highlighted={highlighted}
                  testId={`machine-finder-${current.key}-other-detail`}
                />
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className={`flex gap-2 ${highlighted ? "mt-6" : "mt-5"}`}>
        {stepIdx > 0 ? (
          <button
            type="button"
            onClick={goBack}
            data-testid="machine-finder-back"
            className="tap-target inline-flex items-center justify-center gap-1 rounded-xl border border-border bg-white px-4 py-3 text-sm font-semibold text-ink hover:bg-surface-sunken"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Back
          </button>
        ) : null}
        <button
          type="submit"
          disabled={!canContinue}
          data-testid="machine-finder-continue"
          className={`tap-target group inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber font-semibold text-white shadow-[0_8px_22px_rgba(249,115,22,0.25)] transition hover:bg-amber-hover disabled:opacity-45 ${
            highlighted
              ? "px-4 py-3.5 text-base md:py-4 md:text-lg"
              : "px-4 py-3.5 text-base"
          }`}
        >
          {stepIdx < total - 1 ? "Continue" : `Show ${appName} machines`}
          <ArrowRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden
          />
        </button>
      </div>

      {highlighted ? (
        <ul className="mt-5 grid gap-2.5 border-t border-border pt-4">
          {[
            {
              Icon: BadgeIndianRupee,
              text: "Published prices — no blank quotes",
            },
            {
              Icon: Video,
              text: "Demo with your material on WhatsApp",
            },
            {
              Icon: Truck,
              text: "India-wide delivery & install support",
            },
          ].map(({ Icon, text }) => (
            <li
              key={text}
              className="flex items-start gap-2.5 text-sm text-ink-muted"
            >
              <span className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-amber/12 text-amber-text">
                <Icon className="size-3.5" aria-hidden />
              </span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      ) : null}

      <Link
        href="/advisor"
        data-testid="machine-finder-advisor-link"
        className="mt-4 flex items-center justify-center gap-1.5 text-center text-sm font-semibold text-trust transition hover:text-ink"
      >
        <Compass className="size-3.5" aria-hidden />
        Or open the machine advisor
        <span aria-hidden>→</span>
      </Link>
    </form>
  );
}
