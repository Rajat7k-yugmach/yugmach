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

const CREATE_GROUPS = Object.keys(GROUP_LABELS);

const DATA_TYPES: SpecDataType[] = [
  "TEXT",
  "INT",
  "DECIMAL",
  "BOOL",
  "ENUM",
  "RANGE",
  "MULTI",
];

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

function hasSpecValue(value: unknown): boolean {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (typeof value === "boolean") return true;
  if (typeof value === "number") return !Number.isNaN(value);
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  return true;
}

function slugifyKey(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 64);
}

function relId(value: unknown): string | null {
  if (value == null || value === "") return null;
  if (typeof value === "object" && value && "id" in value) {
    return String((value as { id: string | number }).id);
  }
  return String(value);
}

function SpecInput({
  field,
  current,
  onChange,
}: {
  field: SpecFieldDoc;
  current: unknown;
  onChange: (next: unknown) => void;
}) {
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
    <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
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
          onChange={(e) => onChange(e.target.checked)}
          data-testid={`spec-${field.key}`}
        />
      ) : field.dataType === "ENUM" ? (
        <select
          {...common}
          value={current == null ? "" : String(current)}
          onChange={(e) => onChange(e.target.value)}
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
              onChange(undefined);
              return;
            }
            onChange(
              field.dataType === "INT" ? Number.parseInt(raw, 10) : Number(raw),
            );
          }}
          data-testid={`spec-${field.key}`}
        />
      ) : field.dataType === "RANGE" || field.dataType === "MULTI" ? (
        <textarea
          {...common}
          rows={3}
          value={
            current == null
              ? ""
              : typeof current === "string"
                ? current
                : JSON.stringify(current, null, 2)
          }
          onChange={(e) => {
            const raw = e.target.value.trim();
            if (!raw) {
              onChange(undefined);
              return;
            }
            try {
              onChange(JSON.parse(raw));
            } catch {
              onChange(raw);
            }
          }}
          data-testid={`spec-${field.key}`}
        />
      ) : (
        <input
          {...common}
          type="text"
          value={current == null ? "" : String(current)}
          onChange={(e) => onChange(e.target.value)}
          data-testid={`spec-${field.key}`}
        />
      )}
    </label>
  );
}

export default function ProductSpecsField(props: {
  path?: string;
  field?: { label?: string; required?: boolean };
}) {
  const path = props.path || "specs";
  const { value, setValue } = useField<Record<string, unknown>>({ path });
  const machineType = useFormFields(([fields]) => fields.machineType?.value);
  const machineTypeId = relId(machineType);

  const [registry, setRegistry] = useState<SpecFieldDoc[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [pickerQuery, setPickerQuery] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [newField, setNewField] = useState({
    label: "",
    key: "",
    dataType: "TEXT" as SpecDataType,
    group: "CAPACITY",
    unit: "",
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(
          "/api/spec-fields?limit=200&depth=0&sort=displayOrder",
          { credentials: "include" },
        );
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
          setLoadError(
            err instanceof Error ? err.message : "Failed to load Spec Fields",
          );
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
    () =>
      value && typeof value === "object" && !Array.isArray(value) ? value : {},
    [value],
  );

  const registryByKey = useMemo(() => {
    const map = new Map<string, SpecFieldDoc>();
    for (const field of registry) map.set(field.key, field);
    return map;
  }, [registry]);

  /** Only keys that currently have a value on this product. */
  const activeFields = useMemo(() => {
    const keys = Object.keys(specs).filter((k) => hasSpecValue(specs[k]));
    return keys
      .map((key) => {
        const fromRegistry = registryByKey.get(key);
        if (fromRegistry) return fromRegistry;
        return {
          id: `orphan-${key}`,
          key,
          label: key.replace(/_/g, " "),
          dataType: "TEXT" as SpecDataType,
          group: "COMMERCIAL",
          isActive: true,
        };
      })
      .sort((a, b) => {
        const ao = Number(a.displayOrder ?? 9999);
        const bo = Number(b.displayOrder ?? 9999);
        if (ao !== bo) return ao - bo;
        return a.label.localeCompare(b.label);
      });
  }, [specs, registryByKey]);

  const grouped = useMemo(() => {
    const map = new Map<string, SpecFieldDoc[]>();
    for (const field of activeFields) {
      const key = field.group || "OTHER";
      const list = map.get(key) || [];
      list.push(field);
      map.set(key, list);
    }
    return map;
  }, [activeFields]);

  const unusedFields = useMemo(() => {
    const used = new Set(Object.keys(specs).filter((k) => hasSpecValue(specs[k])));
    return registry
      .filter((f) => !used.has(f.key))
      .filter((f) => {
        if (!pickerQuery.trim()) return true;
        const q = pickerQuery.toLowerCase();
        return (
          f.label.toLowerCase().includes(q) ||
          f.key.toLowerCase().includes(q) ||
          (f.group || "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [registry, specs, pickerQuery]);

  function updateKey(key: string, next: unknown) {
    const copy = { ...specs };
    if (next === "" || next === undefined || next === null) {
      delete copy[key];
    } else {
      copy[key] = next;
    }
    setValue(copy);
  }

  function addExistingField(field: SpecFieldDoc) {
    const copy = { ...specs };
    if (field.dataType === "BOOL") copy[field.key] = false;
    else if (field.dataType === "INT" || field.dataType === "DECIMAL") {
      copy[field.key] = 0;
    } else {
      copy[field.key] = "";
    }
    setValue(copy);
    setPickerOpen(false);
    setPickerQuery("");
  }

  async function createAndAddField() {
    setCreateError(null);
    const label = newField.label.trim();
    const key = (newField.key.trim() || slugifyKey(label)).replace(
      /[^a-z0-9_]/gi,
      "_",
    );
    if (!label || !key) {
      setCreateError("Label and key are required");
      return;
    }
    if (registryByKey.has(key) || key in specs) {
      setCreateError(`Key "${key}" already exists — pick it from Add field instead`);
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/spec-fields", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key,
          label,
          dataType: newField.dataType,
          group: newField.group || "CAPACITY",
          unit: newField.unit.trim() || null,
          isActive: true,
          ...(machineTypeId ? { machineTypes: [Number(machineTypeId) || machineTypeId] } : {}),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text.slice(0, 200) || `Create failed (${res.status})`);
      }
      const created = (await res.json()) as { doc?: SpecFieldDoc } & SpecFieldDoc;
      const doc = created.doc || created;
      setRegistry((prev) => [...prev, doc as SpecFieldDoc]);
      addExistingField({
        ...(doc as SpecFieldDoc),
        key,
        label,
        dataType: newField.dataType,
        group: newField.group || "CAPACITY",
        unit: newField.unit.trim() || null,
      });
      setCreateOpen(false);
      setNewField({
        label: "",
        key: "",
        dataType: "TEXT",
        group: "CAPACITY",
        unit: "",
      });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : "Could not create field");
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="field-type json" data-testid="product-specs-field">
      <FieldLabel
        label={props.field?.label || "Specs"}
        required={props.field?.required}
      />
      <p
        style={{
          margin: "0 0 12px",
          color: "var(--theme-elevation-600)",
          fontSize: 13,
        }}
      >
        Only specs already set on this product are shown. Use <strong>Add field</strong>{" "}
        to attach another Spec Field, or create a new one.
      </p>

      {loading && <p style={{ fontSize: 13 }}>Loading spec fields…</p>}
      {loadError && (
        <p style={{ color: "var(--theme-error-500)", fontSize: 13 }}>{loadError}</p>
      )}

      {!loading && activeFields.length === 0 ? (
        <p
          style={{
            marginBottom: 12,
            padding: "12px 14px",
            border: "1px dashed var(--theme-elevation-250)",
            borderRadius: 6,
            fontSize: 13,
            color: "var(--theme-elevation-600)",
          }}
        >
          No specs on this product yet. Add a field below.
        </p>
      ) : null}

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
            {fields.map((field) => (
              <div key={field.key} style={{ position: "relative" }}>
                <SpecInput
                  field={field}
                  current={specs[field.key]}
                  onChange={(next) => updateKey(field.key, next)}
                />
                <button
                  type="button"
                  onClick={() => updateKey(field.key, undefined)}
                  title="Remove this spec from the product"
                  style={{
                    marginTop: 6,
                    fontSize: 12,
                    color: "var(--theme-elevation-500)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </fieldset>
      ))}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
        <button
          type="button"
          data-testid="product-specs-add-field"
          onClick={() => {
            setPickerOpen((v) => !v);
            setCreateOpen(false);
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px solid var(--theme-elevation-250)",
            background: "var(--theme-elevation-50)",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          + Add field
        </button>
        <button
          type="button"
          data-testid="product-specs-create-field"
          onClick={() => {
            setCreateOpen((v) => !v);
            setPickerOpen(false);
          }}
          style={{
            padding: "8px 12px",
            borderRadius: 6,
            border: "1px dashed var(--theme-elevation-250)",
            background: "transparent",
            cursor: "pointer",
            fontWeight: 600,
            fontSize: 13,
          }}
        >
          + Create new field
        </button>
      </div>

      {pickerOpen ? (
        <div
          style={{
            marginTop: 12,
            border: "1px solid var(--theme-elevation-150)",
            borderRadius: 8,
            padding: 12,
            background: "var(--theme-elevation-0)",
          }}
          data-testid="product-specs-field-picker"
        >
          <input
            type="search"
            placeholder="Search existing Spec Fields…"
            value={pickerQuery}
            onChange={(e) => setPickerQuery(e.target.value)}
            style={{
              width: "100%",
              marginBottom: 10,
              padding: "8px 10px",
              borderRadius: 4,
              border: "1px solid var(--theme-elevation-150)",
            }}
          />
          <div style={{ maxHeight: 220, overflowY: "auto" }}>
            {unusedFields.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--theme-elevation-500)" }}>
                No unused fields match. Create a new one instead.
              </p>
            ) : (
              unusedFields.map((field) => (
                <button
                  key={field.key}
                  type="button"
                  onClick={() => addExistingField(field)}
                  style={{
                    display: "flex",
                    width: "100%",
                    justifyContent: "space-between",
                    gap: 8,
                    textAlign: "left",
                    padding: "8px 6px",
                    border: "none",
                    borderBottom: "1px solid var(--theme-elevation-100)",
                    background: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <span>
                    <strong style={{ fontSize: 13 }}>{field.label}</strong>
                    <span
                      style={{
                        display: "block",
                        fontSize: 11,
                        color: "var(--theme-elevation-500)",
                      }}
                    >
                      {field.key} · {GROUP_LABELS[field.group] || field.group} ·{" "}
                      {field.dataType}
                    </span>
                  </span>
                  <span style={{ fontSize: 12, color: "var(--theme-success-500)" }}>
                    Add
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}

      {createOpen ? (
        <div
          style={{
            marginTop: 12,
            border: "1px dashed var(--theme-elevation-250)",
            borderRadius: 8,
            padding: 12,
          }}
          data-testid="product-specs-create-form"
        >
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600 }}>
            Create Spec Field and add to this product
          </p>
          <div
            style={{
              display: "grid",
              gap: 10,
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
            }}
          >
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
              Label
              <input
                value={newField.label}
                onChange={(e) => {
                  const label = e.target.value;
                  setNewField((prev) => ({
                    ...prev,
                    label,
                    key: prev.key || slugifyKey(label),
                  }));
                }}
                style={{ padding: "8px 10px", borderRadius: 4, border: "1px solid var(--theme-elevation-150)" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
              Key
              <input
                value={newField.key}
                onChange={(e) =>
                  setNewField((prev) => ({
                    ...prev,
                    key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_"),
                  }))
                }
                style={{ padding: "8px 10px", borderRadius: 4, border: "1px solid var(--theme-elevation-150)" }}
              />
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
              Type
              <select
                value={newField.dataType}
                onChange={(e) =>
                  setNewField((prev) => ({
                    ...prev,
                    dataType: e.target.value as SpecDataType,
                  }))
                }
                style={{ padding: "8px 10px", borderRadius: 4, border: "1px solid var(--theme-elevation-150)" }}
              >
                {DATA_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
              Group
              <select
                value={newField.group}
                onChange={(e) =>
                  setNewField((prev) => ({ ...prev, group: e.target.value }))
                }
                style={{ padding: "8px 10px", borderRadius: 4, border: "1px solid var(--theme-elevation-150)" }}
              >
                {CREATE_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {GROUP_LABELS[g]}
                  </option>
                ))}
              </select>
            </label>
            <label style={{ display: "flex", flexDirection: "column", gap: 4, fontSize: 12 }}>
              Unit (optional)
              <input
                value={newField.unit}
                onChange={(e) =>
                  setNewField((prev) => ({ ...prev, unit: e.target.value }))
                }
                placeholder="e.g. ppm, mm"
                style={{ padding: "8px 10px", borderRadius: 4, border: "1px solid var(--theme-elevation-150)" }}
              />
            </label>
          </div>
          {createError ? (
            <p style={{ color: "var(--theme-error-500)", fontSize: 12, marginTop: 8 }}>
              {createError}
            </p>
          ) : null}
          <button
            type="button"
            disabled={creating}
            onClick={() => void createAndAddField()}
            style={{
              marginTop: 10,
              padding: "8px 12px",
              borderRadius: 6,
              border: "none",
              background: "var(--theme-success-500)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
              opacity: creating ? 0.6 : 1,
            }}
          >
            {creating ? "Creating…" : "Create & add"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
