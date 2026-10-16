"use client";

import React, {
  FormEvent,
  useState,
} from "react";

import {
  Loader2,
  PackagePlus,
  X,
} from "lucide-react";

import { createProduct } from "@/lib/api/product.api";
import { ApiError } from "@/lib/api/api-error";

import type {
  CreateProductRequest,
} from "@/types/product";

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

interface FormState {
  name: string;
  description: string;
  sku: string;
  price: string;
  initial_quantity: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  description: "",
  sku: "",
  price: "",
  initial_quantity: "0",
};

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
  transition
  focus:border-[#0284c7]
  focus:ring-2
  focus:ring-[#0284c7]/10
  disabled:cursor-not-allowed
  disabled:opacity-60
`;

export const ProductFormModal: React.FC<
  ProductFormModalProps
> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [form, setForm] =
    useState<FormState>(EMPTY_FORM);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  if (!open) {
    return null;
  }

  const updateField = (
    field: keyof FormState,
    value: string,
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError(null);

    const name = form.name.trim();
    const description =
      form.description.trim();
    const sku = form.sku.trim();
    const price = form.price.trim();
    const initialQuantity = Number(
      form.initial_quantity,
    );

    if (!name) {
      setError("Product name is required.");
      return;
    }

    if (!sku) {
      setError("SKU is required.");
      return;
    }

    if (!price) {
      setError("Price is required.");
      return;
    }

    if (
      !Number.isInteger(initialQuantity) ||
      initialQuantity < 0
    ) {
      setError(
        "Initial quantity must be a valid non-negative number.",
      );
      return;
    }

    const request: CreateProductRequest = {
      name,
      description,
      sku,
      price,
      initial_quantity:
        initialQuantity,
    };

    try {
      setIsSubmitting(true);

      await createProduct(request);

      setForm(EMPTY_FORM);

      onCreated();
      onClose();
    } catch (error) {
      if (error instanceof ApiError) {
        setError(error.message);
      } else if (error instanceof Error) {
        setError(error.message);
      } else {
        setError(
          "Failed to create product.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/50
        p-4
        backdrop-blur-sm
      "
      onMouseDown={(event) => {
        if (
          event.target ===
            event.currentTarget &&
          !isSubmitting
        ) {
          onClose();
        }
      }}
    >
      <div
        className="
          w-full
          max-w-xl
          overflow-hidden
          rounded-2xl
          border
          border-border
          bg-card
          shadow-2xl
        "
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
              <PackagePlus className="h-5 w-5" />
            </div>

            <div>
              <h2 className="text-base font-bold text-foreground">
                Add product
              </h2>

              <p className="mt-0.5 text-xs text-muted-text">
                Add a new product to your catalog.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="
              flex
              h-8
              w-8
              items-center
              justify-center
              rounded-lg
              text-muted-text
              transition
              hover:bg-border/30
              hover:text-foreground
              disabled:opacity-50
            "
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 p-6"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="inventory-product-name"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Product name
              </label>

              <input
                id="inventory-product-name"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value,
                  )
                }
                placeholder="Classic Blue T-Shirt"
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="inventory-product-sku"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                SKU
              </label>

              <input
                id="inventory-product-sku"
                value={form.sku}
                onChange={(event) =>
                  updateField(
                    "sku",
                    event.target.value,
                  )
                }
                placeholder="TSHIRT-BLUE-001"
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="inventory-product-description"
              className="mb-1.5 block text-xs font-semibold text-foreground"
            >
              Description
            </label>

            <textarea
              id="inventory-product-description"
              value={form.description}
              onChange={(event) =>
                updateField(
                  "description",
                  event.target.value,
                )
              }
              placeholder="Short product description..."
              rows={3}
              disabled={isSubmitting}
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label
                htmlFor="inventory-product-price"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Price
              </label>

              <input
                id="inventory-product-price"
                type="text"
                inputMode="decimal"
                value={form.price}
                onChange={(event) =>
                  updateField(
                    "price",
                    event.target.value,
                  )
                }
                placeholder="799.00"
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>

            <div>
              <label
                htmlFor="inventory-product-quantity"
                className="mb-1.5 block text-xs font-semibold text-foreground"
              >
                Initial quantity
              </label>

              <input
                id="inventory-product-quantity"
                type="number"
                min="0"
                step="1"
                value={form.initial_quantity}
                onChange={(event) =>
                  updateField(
                    "initial_quantity",
                    event.target.value,
                  )
                }
                disabled={isSubmitting}
                className={inputClass}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3">
              <p className="text-xs font-medium text-red-500">
                {error}
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="
                rounded-xl
                border
                border-border
                px-4
                py-2.5
                text-sm
                font-semibold
                text-foreground
                transition
                hover:bg-border/30
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
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
                transition
                hover:bg-[#0369a1]
                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              {isSubmitting && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}

              {isSubmitting
                ? "Creating..."
                : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};