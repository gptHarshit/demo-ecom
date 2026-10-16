"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, Plus, RotateCcw, Tag, Trash2, X } from "lucide-react";

import type {
  CreateProductVariantInput,
  CreateProductVariantOption,
} from "@/types/product";

// The backend accepts at most 100 variants per create call
// (CreateProductRequest.Variants validate:"max=100").
const MAX_VARIANTS = 100;

const PRICE_RE = /^\d+(\.\d{1,2})?$/;

interface Axis {
  id: string;
  name: string;
  values: string[];
}

interface RowState {
  include: boolean;
  sku: string;
  price: string;
  quantity: string;
}

interface Combo {
  key: string;
  options: CreateProductVariantOption[];
}

let axisSeq = 0;
function newAxisId(): string {
  axisSeq += 1;
  return `axis-${axisSeq}`;
}

function slug(value: string): string {
  return value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "");
}

function comboKey(options: CreateProductVariantOption[]): string {
  return options.map((o) => `${o.name}=${o.value}`).join("|");
}

function cartesian(axes: Axis[]): Combo[] {
  const usable = axes.filter((a) => a.name.trim() && a.values.length > 0);
  if (usable.length === 0) return [];

  let combos: CreateProductVariantOption[][] = [[]];

  for (const axis of usable) {
    const next: CreateProductVariantOption[][] = [];
    for (const combo of combos) {
      for (const value of axis.values) {
        next.push([...combo, { name: axis.name.trim(), value }]);
      }
    }
    combos = next;
  }

  return combos.map((options) => ({ key: comboKey(options), options }));
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-text focus:border-[#0284c7] focus:ring-2 focus:ring-[#0284c7]/10 disabled:cursor-not-allowed disabled:opacity-60";

interface Props {
  baseSku: string;
  basePrice: string;
  disabled?: boolean;
  onChange: (variants: CreateProductVariantInput[]) => void;
}

export default function VariantMatrixBuilder({
  baseSku,
  basePrice,
  disabled = false,
  onChange,
}: Props) {
  const [axes, setAxes] = useState<Axis[]>([
    { id: newAxisId(), name: "", values: [] },
  ]);

  const [defaultPrice, setDefaultPrice] = useState(basePrice || "");
  const [defaultQuantity, setDefaultQuantity] = useState("0");

  // Per-combination overrides, keyed by comboKey, so edits survive as long
  // as that exact combination still exists after an axis changes.
  const [rows, setRows] = useState<Record<string, RowState>>({});

  const combos = useMemo(() => cartesian(axes), [axes]);
  const overLimit = combos.length > MAX_VARIANTS;

  const getRow = (combo: Combo): RowState =>
    rows[combo.key] ?? {
      include: true,
      sku: [baseSku.trim(), ...combo.options.map((o) => slug(o.value))]
        .filter(Boolean)
        .join("-")
        .toUpperCase(),
      price: defaultPrice,
      quantity: defaultQuantity,
    };

  const updateRow = (key: string, patch: Partial<RowState>, combo: Combo) => {
    setRows((prev) => ({
      ...prev,
      [key]: { ...getRow(combo), ...prev[key], ...patch },
    }));
  };

  // Re-apply the default price/quantity to rows that were never
  // hand-edited, so changing the default fills in new rows sensibly.
  const touchedRef = useRef<Set<string>>(new Set());

  // Rewrites every row's SKU from the current base SKU + its option values,
  // clearing any hand-edited overrides. Use this after changing the base
  // SKU if rows you'd already edited didn't pick up the change — editing a
  // row's SKU directly "locks" it, by design, so typing stays put.
  const regenerateAllSkus = () => {
    setRows((prev) => {
      const next = { ...prev };
      for (const combo of combos) {
        const current = getRow(combo);
        const freshSku = [baseSku.trim(), ...combo.options.map((o) => slug(o.value))]
          .filter(Boolean)
          .join("-")
          .toUpperCase();
        next[combo.key] = { ...current, sku: freshSku };
      }
      return next;
    });
  };

  const addAxis = () => {
    setAxes((prev) => [...prev, { id: newAxisId(), name: "", values: [] }]);
  };

  const removeAxis = (id: string) => {
    setAxes((prev) => prev.filter((a) => a.id !== id));
  };

  const renameAxis = (id: string, name: string) => {
    setAxes((prev) => prev.map((a) => (a.id === id ? { ...a, name } : a)));
  };

  const addValue = (id: string, rawValue: string) => {
    const value = rawValue.trim();
    if (!value) return;

    setAxes((prev) =>
      prev.map((a) =>
        a.id === id && !a.values.includes(value)
          ? { ...a, values: [...a.values, value] }
          : a,
      ),
    );
  };

  const removeValue = (id: string, value: string) => {
    setAxes((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, values: a.values.filter((v) => v !== value) }
          : a,
      ),
    );
  };

  // Emit the current variant list to the parent whenever anything relevant
  // changes. Rows with include=false are dropped entirely.
  useEffect(() => {
    if (overLimit) {
      onChange([]);
      return;
    }

    const variants: CreateProductVariantInput[] = combos
      .map((combo) => ({ combo, row: getRow(combo) }))
      .filter(({ row }) => row.include)
      .map(({ combo, row }) => ({
        sku: row.sku.trim(),
        price: row.price.trim(),
        initial_quantity: Number(row.quantity) || 0,
        options: combo.options,
      }));

    onChange(variants);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combos, rows, overLimit]);

  return (
    <div className="space-y-4">
      {/* AXES */}
      <div className="space-y-3">
        {axes.map((axis, index) => (
          <AxisRow
            key={axis.id}
            axis={axis}
            index={index}
            canRemove={axes.length > 1}
            disabled={disabled}
            onRename={(name) => renameAxis(axis.id, name)}
            onRemove={() => removeAxis(axis.id)}
            onAddValue={(value) => addValue(axis.id, value)}
            onRemoveValue={(value) => removeValue(axis.id, value)}
          />
        ))}

        <button
          type="button"
          onClick={addAxis}
          disabled={disabled}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-2 text-xs font-semibold text-muted-text transition-colors hover:border-[#0284c7] hover:text-[#0284c7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-3.5 w-3.5" />
          Add another option (e.g. Size)
        </button>
      </div>

      {/* DEFAULTS */}
      {combos.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Default price for all variants (₹)
            </label>
            <input
              className={inputClass}
              inputMode="decimal"
              placeholder="e.g. 899.00"
              value={defaultPrice}
              disabled={disabled}
              onChange={(e) => {
                setDefaultPrice(e.target.value);
                // Fill in every row that hasn't been hand-edited yet.
                setRows((prev) => {
                  const next = { ...prev };
                  for (const combo of combos) {
                    if (!touchedRef.current.has(`${combo.key}:price`)) {
                      next[combo.key] = {
                        ...getRow(combo),
                        ...next[combo.key],
                        price: e.target.value,
                      };
                    }
                  }
                  return next;
                });
              }}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Default opening stock for all variants
            </label>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="1"
              value={defaultQuantity}
              disabled={disabled}
              onChange={(e) => {
                setDefaultQuantity(e.target.value);
                setRows((prev) => {
                  const next = { ...prev };
                  for (const combo of combos) {
                    if (!touchedRef.current.has(`${combo.key}:quantity`)) {
                      next[combo.key] = {
                        ...getRow(combo),
                        ...next[combo.key],
                        quantity: e.target.value,
                      };
                    }
                  }
                  return next;
                });
              }}
            />
          </div>
        </div>
      )}

      {/* LIMIT WARNING */}
      {overLimit && (
        <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-600 dark:text-amber-400">
            That&apos;s {combos.length} combinations — the maximum per product
            is {MAX_VARIANTS}. Remove a value or split this into more than one
            product.
          </p>
        </div>
      )}

      {/* GENERATED ROWS */}
      {combos.length > 0 && !overLimit && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted-text">
              {combos.length} variant{combos.length === 1 ? "" : "s"} will be
              created — uncheck any you don&apos;t sell.
            </p>

            <button
              type="button"
              onClick={regenerateAllSkus}
              disabled={disabled}
              title="Rewrite every SKU below from the base SKU above, clearing any manual edits"
              className="inline-flex shrink-0 items-center gap-1.5 text-xs font-semibold text-[#0284c7] hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Regenerate SKUs
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-background/60 text-xs uppercase tracking-wide text-muted-text">
                <tr>
                  <th className="w-10 px-3 py-2.5" />
                  <th className="px-3 py-2.5 font-medium">Options</th>
                  <th className="px-3 py-2.5 font-medium">SKU</th>
                  <th className="px-3 py-2.5 font-medium">Price (₹)</th>
                  <th className="px-3 py-2.5 font-medium">Qty</th>
                </tr>
              </thead>

              <tbody>
                {combos.map((combo) => {
                  const row = getRow(combo);
                  const priceInvalid =
                    row.include && !PRICE_RE.test(row.price.trim());

                  return (
                    <tr
                      key={combo.key}
                      className={`border-t border-border ${row.include ? "" : "opacity-40"}`}
                    >
                      <td className="px-3 py-2">
                        <input
                          type="checkbox"
                          checked={row.include}
                          disabled={disabled}
                          onChange={(e) =>
                            updateRow(
                              combo.key,
                              { include: e.target.checked },
                              combo,
                            )
                          }
                        />
                      </td>

                      <td className="px-3 py-2 text-foreground">
                        {combo.options.map((o) => o.value).join(" / ")}
                      </td>

                      <td className="px-3 py-2">
                        <input
                          className={`${inputClass} font-mono text-xs`}
                          value={row.sku}
                          disabled={disabled || !row.include}
                          onChange={(e) =>
                            updateRow(
                              combo.key,
                              { sku: e.target.value },
                              combo,
                            )
                          }
                        />
                      </td>

                      <td className="px-3 py-2">
                        <input
                          className={inputClass}
                          inputMode="decimal"
                          value={row.price}
                          disabled={disabled || !row.include}
                          onChange={(e) => {
                            touchedRef.current.add(`${combo.key}:price`);
                            updateRow(
                              combo.key,
                              { price: e.target.value },
                              combo,
                            );
                          }}
                        />
                        {priceInvalid && (
                          <p className="mt-1 text-[11px] text-red-500">
                            Invalid price
                          </p>
                        )}
                      </td>

                      <td className="px-3 py-2">
                        <input
                          className={inputClass}
                          type="number"
                          min="0"
                          step="1"
                          value={row.quantity}
                          disabled={disabled || !row.include}
                          onChange={(e) => {
                            touchedRef.current.add(`${combo.key}:quantity`);
                            updateRow(
                              combo.key,
                              { quantity: e.target.value },
                              combo,
                            );
                          }}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function AxisRow({
  axis,
  index,
  canRemove,
  disabled,
  onRename,
  onRemove,
  onAddValue,
  onRemoveValue,
}: {
  axis: Axis;
  index: number;
  canRemove: boolean;
  disabled: boolean;
  onRename: (name: string) => void;
  onRemove: () => void;
  onAddValue: (value: string) => void;
  onRemoveValue: (value: string) => void;
}) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    onAddValue(draft);
    setDraft("");
  };

  return (
    <div className="rounded-xl border border-border bg-background/60 p-3.5">
      <div className="mb-2.5 flex items-center gap-2">
        <Tag className="h-4 w-4 shrink-0 text-muted-text" />

        <input
          className="min-w-0 flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-semibold text-foreground outline-none focus:border-[#0284c7]"
          placeholder={index === 0 ? "e.g. Color" : "e.g. Size"}
          value={axis.name}
          disabled={disabled}
          onChange={(e) => onRename(e.target.value)}
        />

        {canRemove && (
          <button
            type="button"
            onClick={onRemove}
            disabled={disabled}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-text transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-50"
            title="Remove this option"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {axis.values.map((value) => (
          <span
            key={value}
            className="flex items-center gap-1.5 rounded-full border border-[#0284c7]/30 bg-[#0284c7]/10 px-2.5 py-1 text-xs font-medium text-[#0284c7]"
          >
            {value}
            <button
              type="button"
              onClick={() => onRemoveValue(value)}
              disabled={disabled}
              aria-label={`Remove ${value}`}
              className="text-[#0284c7]/70 hover:text-[#0284c7]"
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        <input
          className="w-28 rounded-full border border-dashed border-border bg-transparent px-2.5 py-1 text-xs text-foreground outline-none focus:border-[#0284c7]"
          placeholder="Add value..."
          value={draft}
          disabled={disabled}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === ",") {
              e.preventDefault();
              commit();
            }
          }}
          onBlur={() => {
            if (draft.trim()) commit();
          }}
        />
      </div>
    </div>
  );
}