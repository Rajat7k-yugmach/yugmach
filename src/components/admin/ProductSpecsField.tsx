"use client";

import React, { useEffect, useMemo, useState } from "react";
import { FieldLabel, useField, useFormFields } from "@payloadcms/ui";

type SpecDataType =
  | "INT"
  | "DECIMAL"
  | "TEXT"
  | "BOOL"
  | "ENUM"
  | "RANGE"
  | "MULTI";

type SpecFieldDoc = {
  id: string | number;
  key: string;
  label: string;
  dataType: SpecDataType;
  enumOptions?: unknown;
  group: string;
  displayOrder?: number;
  unit?: string | null;
  helpText?: string | null;
  isActive?: boolean;
  isRequired?: boolean;
  machineTypes?: Array<string | number | { id: string | number }>;
};

const GROUP_LABELS: Record<string, string> = {
  CAPACITY: "Capacity",
  FILL: "Filling",
  POUCH: "Pouch & Film",
  SEAL: "Sealing",
  POWER: "Power",
  PHYSICAL: "Physical",
  CONTROL: "Controls",
  COMMERCIAL: "Commercial",
};

function parseEnumOptions(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "value" in item) {
        return String((item as { value: unknown }).value);
      }
      if (item && typeof item === "object" && "label" in item) {
        return String((item as { label: unknown }).label);
      }
      return "";
    })
    .filter(Boolean);
}

function relId(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "object" && value && "id" in value) {
    return String((value as { id: string | number }).id);
  }
  return String(value);
}

function fieldMatchesMachineType(
  field: SpecFieldDoc,
  machineTypeId: string | null,
): boolean {
  const linked = field.machineTypes || [];
  if (!linked.length) return true;
  if (!machineTypeId) return true;
  return linked.some((mt) => relId(mt) === machineTypeId);
}

export default function ProductSpecsField(props: { path?: string; field?: { label?: string; required?: boolean } }) {
  const path = props.path || "specs";
  const { value, setValue } = useField<Record<string, unknown>>({ path });
  const machineType = useFormFields(([fields]) => fields.machineType?.value);
  const machineTypeId = relId(machineType);

  const [registry, setRegistry] = useState<SpecFieldDoc[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/spec-fields?limit=200&depth=0&sort=displayOrder", {
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error(`Could not load Spec Fields (${res.status})`);
        }
        const json = (await res.json()) as { docs?: SpecFieldDoc[] };
        if (!cancelled) {
          setRegistry((json.docs || []).filter((d) => d.isActive !== false));
          setLoadError(null);
        }
      } catch (err) {
        if (!cancelled) {
          setLoadError(err instanceof Error ? err.message : "Failed to load Spec Fields");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const specs = useMemo(
    () => (value && typeof value === "object" && !Array.isArray(value) ? value : {}),
    [value],
  );

  const visibleFields = useMemo(() => {
    return [...registry]
      .filter((f) => fieldMatchesMachineType(f, machineTypeId))
      .sort((a, b) => Number(a.displayOrder ?? 0) - Number(b.displayOrder ?? 0));
  }, [registry, machineTypeId]);

  const grouped = useMemo(() => {
    const map = new Map<string, SpecFieldDoc[]>();
    for (const field of visibleFields) {
      const key = field.group || "OTHER";
      const list = map.get(key) || [];
      list.push(field);
      map.set(key, list);
    }
    return map;
  }, [visibleFields]);

  const unmappedKeys = useMemo(() => {
    const known = new Set(registry.map((f) => f.key));
    return Object.keys(specs).filter((k) => !known.has(k));
  }, [registry, specs]);

  function updateKey(key: string, next: unknown) {
    const copy = { ...specs };
    if (next === "" || next === undefined || next === null) {
      delete copy[key];
    } else {
      copy[key] = next;
    }
    setValue(copy);
  }

  return (
    <div className="field-type json" data-testid="product-specs-field">
      <FieldLabel label={props.field?.label || "Specs"} required={props.field?.required} />
      <p style={{ margin: "0 0 12px", color: "var(--theme-elevation-600)", fontSize: 13 }}>
        Edit values here. Labels and units come from <strong>Spec Fields</strong> in the sidebar
        (capacity, power, fill type, etc.).
      </p>

      {loading && <p style={{ fontSize: 13 }}>Loading spec fields…</p>}
      {loadError && (
        <p style={{ color: "var(--theme-error-500)", fontSize: 13 }}>{loadError}</p>
      )}

      {[...grouped.entries()].map(([group, fields]) => (
        <fieldset
          key={group}
          style={{
            border: "1px solid var(--theme-elevation-150)",
            borderRadius: 6,
            marginBottom: 16,
            padding: "12px 14px",
          }}
        >
          <legend style={{ fontWeight: 600, padding: "0 6px" }}>
            {GROUP_LABELS[group] || group}
          </legend>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            }}
          >
            {fields.map((field) => {
              const current = specs[field.key];
              const label = field.unit ? `${field.label} (${field.unit})` : field.label;
              const common = {
                id: `spec-${field.key}`,
                style: {
                  width: "100%",
                  padding: "8px 10px",
                  border: "1px solid var(--theme-elevation-150)",
                  borderRadius: 4,
                  background: "var(--theme-input-bg)",
                  color: "var(--theme-elevation-800)",
                } as React.CSSProperties,
              };

              return (
                <label key={field.key} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>
                    {label}
                    {field.isRequired ? " *" : ""}
                  </span>
                  {field.helpText ? (
                    <span style={{ fontSize: 12, color: "var(--theme-elevation-500)" }}>
                      {field.helpText}
                    </span>
                  ) : null}

                  {field.dataType === "BOOL" ? (
                    <input
                      type="checkbox"
                      checked={Boolean(current)}
                      onChange={(e) => updateKey(field.key, e.target.checked)}
                      data-testid={`spec-${field.key}`}
                    />
                  ) : field.dataType === "ENUM" ? (
                    <select
                      {...common}
                      value={current == null ? "" : String(current)}
                      onChange={(e) => updateKey(field.key, e.target.value)}
                      data-testid={`spec-${field.key}`}
                    >
                      <option value="">—</option>
                      {parseEnumOptions(field.enumOptions).map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  ) : field.dataType === "INT" || field.dataType === "DECIMAL" ? (
                    <input
                      {...common}
                      type="number"
                      step={field.dataType === "DECIMAL" ? "0.01" : "1"}
                      value={current == null ? "" : String(current)}
                      onChange={(e) => {
                        const raw = e.target.value;
                        if (raw === "") {
                          updateKey(field.key, undefined);
                          return;
                        }
                        updateKey(
                          field.key,
                          field.dataType === "INT" ? Number.parseInt(raw, 10) : Number(raw),
                        );
                      }}
                      data-testid={`spec-${field.key}`}
                    />
                  ) : (
                    <input
                      {...common}
                      type="text"
                      value={
                        current == null
                          ? ""
                          : typeof current === "object"
                            ? JSON.stringify(current)
                            : String(current)
                      }
                      onChange={(e) => updateKey(field.key, e.target.value)}
                      data-testid={`spec-${field.key}`}
                    />
                  )}
                </label>
              );
            })}
          </div>
        </fieldset>
      ))}

      {unmappedKeys.length > 0 && (
        <fieldset
          style={{
            border: "1px dashed var(--theme-elevation-250)",
            borderRadius: 6,
            marginBottom: 8,
            padding: "12px 14px",
          }}
        >
          <legend style={{ padding: "0 6px" }}>Unmapped keys (not in Spec Fields)</legend>
          {unmappedKeys.map((key) => (
            <div key={key} style={{ display: "flex", gap: 8, marginBottom: 8, alignItems: "center" }}>
              <code style={{ minWidth: 140 }}>{key}</code>
              <input
                style={{ flex: 1, padding: "6px 8px" }}
                value={
                  specs[key] == null
                    ? ""
                    : typeof specs[key] === "object"
                      ? JSON.stringify(specs[key])
                      : String(specs[key])
                }
                onChange={(e) => updateKey(key, e.target.value)}
              />
              <button type="button" onClick={() => updateKey(key, undefined)}>
                Remove
              </button>
            </div>
          ))}
        </fieldset>
      )}
    </div>
  );
}
