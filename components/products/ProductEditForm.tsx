"use client";

import { useState } from "react";
import { Loader2, Save, X } from "lucide-react";

import { updateProduct } from "@/lib/api/product.api";
import { ApiError } from "@/lib/api/api-error";
import { fieldErrorsFromApiError } from "@/lib/api/product-errors";
import type { ProductResponse, ProductStatus } from "@/types/product";

interface Props {
  product: ProductResponse;
  onSaved: (product: ProductResponse) => void;
  onCancel: () => void;
}

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-text focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-text";

const PRICE_RE = /^\d+(\.\d{1,2})?$/;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-xs text-red-400">{message}</p>;
}

export default function ProductEditForm({ product, onSaved, onCancel }: Props) {
  const [name, setName] = useState(product.name);
  const [description, setDescription] = useState(product.description ?? "");
  const [price, setPrice] = useState(product.price);
  const [status, setStatus] = useState<ProductStatus>(product.status);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const isValid = name.trim() && PRICE_RE.test(price.trim());

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setFieldErrors({});

    try {
      setIsSubmitting(true);

      const updated = await updateProduct(product.id, {
        name: name.trim(),
        description: description.trim(),
        price: price.trim(),
        status,
      });

      onSaved(updated);
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
      className="rounded-xl border border-border bg-card p-5"
    >
      <h3 className="mb-4 text-sm font-semibold text-foreground">
        Edit product
      </h3>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={labelClass}>Name</label>
          <input
            className={inputClass}
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldError message={fieldErrors.name} />
        </div>

        <div>
          <label className={labelClass}>Price (₹)</label>
          <input
            className={inputClass}
            value={price}
            inputMode="decimal"
            onChange={(e) => setPrice(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldError message={fieldErrors.price} />
        </div>

        <div className="sm:col-span-2">
          <label className={labelClass}>Description</label>
          <textarea
            className={inputClass}
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isSubmitting}
          />
          <FieldError message={fieldErrors.description} />
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select
            className={inputClass}
            value={status}
            disabled={isSubmitting}
            onChange={(e) => setStatus(e.target.value as ProductStatus)}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <FieldError message={fieldErrors.status} />
        </div>
      </div>

      {errorMessage && (
        <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5">
          <p className="text-sm text-red-400">{errorMessage}</p>
        </div>
      )}

      <div className="mt-5 flex gap-2">
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
          {isSubmitting ? "Saving..." : "Save changes"}
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