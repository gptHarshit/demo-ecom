"use client";

import { useState } from "react";
import {
  Check,
  Layers,
  Loader2,
  PackagePlus,
} from "lucide-react";

import { createProduct } from "@/lib/api/product.api";
import { ApiError } from "@/lib/api/api-error";
import { fieldErrorsFromApiError } from "@/lib/api/product-errors";
import VariantMatrixBuilder from "./VariantMatrixBuilder";
import type {
  CreateProductVariantInput,
  ProductResponse,
} from "@/types/product";

interface Props {
  onCreated: (product: ProductResponse) => void;
  onCancel?: () => void;
}

const inputClass = `
  w-full
  rounded-xl
  border
  border-border
  bg-background
  px-3.5
  py-2.5
  text-sm
  text-foreground
  placeholder:text-muted-text
  outline-none
  transition-all
  focus:border-[#0284c7]
  focus:ring-2
  focus:ring-[#0284c7]/10
  disabled:cursor-not-allowed
  disabled:opacity-60
`;

const PRICE_RE = /^\d+(\.\d{1,2})?$/;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <p className="mt-1.5 text-xs font-medium text-red-500">
      {message}
    </p>
  );
}

function isVariantRowValid(row: CreateProductVariantInput): boolean {
  return (
    Boolean(row.sku.trim()) &&
    PRICE_RE.test(row.price.trim()) &&
    Number.isInteger(row.initial_quantity) &&
    row.initial_quantity >= 0 &&
    row.options.length > 0
  );
}

function hasDuplicateSkus(rows: CreateProductVariantInput[]): boolean {
  const seen = new Set<string>();

  for (const row of rows) {
    const key = row.sku.trim().toUpperCase();

    if (seen.has(key)) return true;

    seen.add(key);
  }

  return false;
}

export default function ProductForm({ onCreated, onCancel }: Props) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sku, setSku] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("0");

  // New bulk-create flow: when on, price/quantity move onto each variant row.
  const [hasVariants, setHasVariants] = useState(false);
  const [variantRows, setVariantRows] = useState<CreateProductVariantInput[]>(
    [],
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<
    Record<string, string>
  >({});

  const qtyNum = Number(quantity);

  const simpleFieldsValid =
    Boolean(name.trim()) && Boolean(sku.trim());

  const isValid = hasVariants
    ? simpleFieldsValid &&
      variantRows.length > 0 &&
      variantRows.every(isVariantRowValid) &&
      !hasDuplicateSkus(variantRows)
    : simpleFieldsValid &&
      PRICE_RE.test(price.trim()) &&
      quantity !== "" &&
      Number.isInteger(qtyNum) &&
      qtyNum >= 0;

  const resetForm = () => {
    setName("");
    setDescription("");
    setSku("");
    setPrice("");
    setQuantity("0");
    setHasVariants(false);
    setVariantRows([]);
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    setErrorMessage("");
    setFieldErrors({});

    try {
      setIsSubmitting(true);

      const created = await createProduct(
        hasVariants
          ? {
              name: name.trim(),
              description: description.trim(),
              sku: sku.trim(),
              variants: variantRows,
            }
          : {
              name: name.trim(),
              description: description.trim(),
              sku: sku.trim(),
              price: price.trim(),
              initial_quantity: qtyNum,
            },
      );

      onCreated(created);
      resetForm();
    } catch (error) {
      if (error instanceof ApiError) {
        setErrorMessage(error.message);
        setFieldErrors(fieldErrorsFromApiError(error));
      } else {
        setErrorMessage(
          "Something went wrong. Please try again.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      {/* Header */}
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
          <PackagePlus className="h-5 w-5" />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Add a new product
          </h3>

          <p className="mt-0.5 text-xs text-muted-text">
            Add product details to your catalog.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name + SKU */}
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              Product name
            </label>

            <input
              className={inputClass}
              placeholder="e.g. Classic Blue T-Shirt"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={isSubmitting}
            />

            <FieldError message={fieldErrors.name} />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-foreground">
              {hasVariants ? "Catalog SKU (parent)" : "SKU"}
            </label>

            <input
              className={inputClass}
              placeholder="e.g. TSHIRT-BLUE-001"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              disabled={isSubmitting}
            />

            <FieldError message={fieldErrors.sku} />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-foreground">
            Description
          </label>

          <textarea
            className={`${inputClass} resize-none`}
            placeholder="Describe this product..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />

          <FieldError message={fieldErrors.description} />
        </div>

        {/* Variants toggle */}
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-background/60 p-3.5">
          <input
            type="checkbox"
            className="mt-0.5"
            checked={hasVariants}
            disabled={isSubmitting}
            onChange={(e) => setHasVariants(e.target.checked)}
          />

          <span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
              <Layers className="h-4 w-4 text-[#0284c7]" />
              This product has variants
            </span>

            <span className="mt-0.5 block text-xs text-muted-text">
              e.g. different Sizes or Colors — each with its own SKU, price
              and stock.
            </span>
          </span>
        </label>

        {hasVariants ? (
          <VariantMatrixBuilder
            baseSku={sku}
            basePrice={price}
            disabled={isSubmitting}
            onChange={setVariantRows}
          />
        ) : (
          /* Price + Quantity — only for a single-SKU product */
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Price
              </label>

              <input
                className={inputClass}
                inputMode="decimal"
                placeholder="e.g. 799.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                disabled={isSubmitting}
              />

              <FieldError message={fieldErrors.price} />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-foreground">
                Initial quantity
              </label>

              <input
                className={inputClass}
                type="number"
                min="0"
                step="1"
                placeholder="0"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isSubmitting}
              />

              <FieldError
                message={fieldErrors.initial_quantity}
              />
            </div>
          </div>
        )}

        {/* Error */}
        {errorMessage && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
            <p className="text-sm font-medium text-red-500">
              {errorMessage}
            </p>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="rounded-xl border border-border bg-background px-5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-border/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>
          )}

          <button
            type="submit"
            disabled={!isValid || isSubmitting}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-[#0284c7]
              px-5
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              shadow-sky-500/20
              transition-all
              hover:bg-[#0369a1]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {hasVariants
                  ? `Add product + ${variantRows.length || 0} variant${variantRows.length === 1 ? "" : "s"}`
                  : "Add product"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}