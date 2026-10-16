"use client";

import { useState } from "react";
import { Loader2, Save, X } from "lucide-react";

import { createVariant, updateVariant } from "@/lib/api/product.api";
import { ApiError } from "@/lib/api/api-error";
import { fieldErrorsFromApiError } from "@/lib/api/product-errors";
import type { OptionTypeResponse, VariantResponse } from "@/types/product";

interface Props {
  productId: string;
  optionTypes: OptionTypeResponse[];
  /** Pass an existing variant to edit it; omit to create a new one. */
  variant?: VariantResponse;
  onSaved: (variant: VariantResponse) => void;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-text focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-text";

// Decimal string with up to 2 places. Empty is allowed for the optional
// cost_price / weight fields; the backend treats "" as 0 / null.
const DECIMAL_RE = /^\d+(\.\d{1,2})?$/;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

export default function VariantForm({
  productId,
  optionTypes,
  variant,
  onSaved,
  onCancel,
}: Props) {
  const isEditing = Boolean(variant);

  const [sku, setSku] = useState(variant?.sku ?? "");
  const [barcode, setBarcode] = useState(variant?.barcode ?? "");
  const [price, setPrice] = useState(variant?.price ?? "");
  const [costPrice, setCostPrice] = useState(variant?.cost_price ?? "");
  const [weight, setWeight] = useState(variant?.weight ?? "");
  const [quantity, setQuantity] = useState("0");

  const initialSelections: Record<string, string> = {};
  if (variant) {
    for (const ov of variant.option_values) {
      initialSelections[ov.option_type_id] = ov.id;
    }
  }
  const [selections, setSelections] =
    useState<Record<string, string>>(initialSelections);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const selectedOptionValueIds = Object.values(selections).filter(Boolean);

  const qtyNum = Number(quantity);
  const isValid =
    sku.trim() &&
    DECIMAL_RE.test(price.trim()) &&
    (costPrice.trim() === "" || DECIMAL_RE.test(costPrice.trim())) &&
    (weight.trim() === "" || /^\d+(\.\d+)?$/.test(weight.trim())) &&
    selectedOptionValueIds.length > 0 &&
    (isEditing || (quantity !== "" && Number.isInteger(qtyNum) && qtyNum >= 0));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    const basePayload = {
      sku: sku.trim(),
      barcode: barcode.trim() || undefined,
      price: price.trim(),
      cost_price: costPrice.trim() || undefined,
      weight: weight.trim() || undefined,
      option_value_ids: selectedOptionValueIds,
    };

    try {
      setIsSubmitting(true);

      const saved = variant
        ? await updateVariant(productId, variant.id, basePayload)
        : await createVariant(productId, {
            ...basePayload,
            initial_quantity: qtyNum,
          });

      onSaved(saved);
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        setFieldErrors(fieldErrorsFromApiError(error));
      } else {
        setErrorMessage("Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-border bg-card p-5"
    >
      <h4 className="text-sm font-semibold text-foreground">
        {isEditing ? "Edit variant" : "New variant"}
      </h4>

      {optionTypes.length === 0 ? (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-2.5">
          <p className="text-sm text-amber-400">
            No option types exist yet. Create at least one (e.g. Size) on the{" "}
            <a href="/dashboard/options" className="underline">
              Product Options
            </a>{" "}
            page before adding variants.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {optionTypes.map((type) => (
            <div key={type.id}>
              <label className={labelClass}>{type.name}</label>
              <select
                className={inputClass}
                value={selections[type.id] ?? ""}
                disabled={isSubmitting}
                onChange={(e) =>
                  setSelections((prev) => ({
                    ...prev,
                    [type.id]: e.target.value,
                  }))
                }
              >
                <option value="">Not used</option>
                {type.values.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.value}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>
      )}

      {selectedOptionValueIds.length === 0 && optionTypes.length > 0 && (
        <p className="text-sm text-amber-400">
          Pick at least one option value for this variant.
        </p>
      )}
      <FieldError message={fieldErrors.option_value_ids} />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className={labelClass}>SKU</label>
          <input
            className={inputClass}
            placeholder="e.g. PANT-BLK-M"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldError message={fieldErrors.sku} />
        </div>

        <div>
          <label className={labelClass}>Barcode (optional)</label>
          <input
            className={inputClass}
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldError message={fieldErrors.barcode} />
        </div>

        <div>
          <label className={labelClass}>Price (₹)</label>
          <input
            className={inputClass}
            inputMode="decimal"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldError message={fieldErrors.price} />
        </div>

        <div>
          <label className={labelClass}>Cost price (optional)</label>
          <input
            className={inputClass}
            inputMode="decimal"
            value={costPrice}
            onChange={(e) => setCostPrice(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldError message={fieldErrors.cost_price} />
        </div>

        <div>
          <label className={labelClass}>Weight (optional)</label>
          <input
            className={inputClass}
            inputMode="decimal"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldError message={fieldErrors.weight} />
        </div>

        {!isEditing && (
          <div>
            <label className={labelClass}>Opening stock</label>
            <input
              className={inputClass}
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              disabled={isSubmitting}
            />
            <FieldError message={fieldErrors.initial_quantity} />
          </div>
        )}
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!isValid || isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSubmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSubmitting ? "Saving..." : isEditing ? "Save variant" : "Add variant"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-muted-text transition-all hover:bg-background disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="h-4 w-4" />
          Cancel
        </button>
      </div>
    </form>
  );
}