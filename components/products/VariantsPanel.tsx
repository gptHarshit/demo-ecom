"use client";

import { Fragment, useEffect, useState } from "react";
import { Layers, Loader2, Pencil, Plus } from "lucide-react";

import VariantForm from "./VariantForm";
import { listVariants } from "@/lib/api/product.api";
import { ApiError } from "@/lib/api/api-error";
import type { OptionTypeResponse, VariantResponse } from "@/types/product";

interface Props {
  productId: string;
  optionTypes: OptionTypeResponse[];
}

export default function VariantsPanel({ productId, optionTypes }: Props) {
  const [variants, setVariants] = useState<VariantResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(
    null,
  );

  const load = async () => {
    try {
      setIsLoading(true);
      setError("");
      setVariants(await listVariants(productId));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load variants.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-text" />
          <h4 className="text-sm font-semibold text-foreground">Variants</h4>
        </div>

        {!showCreateForm && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="inline-flex items-center gap-1 text-sm font-medium text-accent hover:opacity-80"
          >
            <Plus className="h-3.5 w-3.5" />
            Add variant
          </button>
        )}
      </div>

      {showCreateForm && (
        <VariantForm
          productId={productId}
          optionTypes={optionTypes}
          onCancel={() => setShowCreateForm(false)}
          onSaved={(created) => {
            setVariants((prev) => [...prev, created]);
            setShowCreateForm(false);
          }}
        />
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-sm text-muted-text">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading variants...
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{error}</p>
          <button
            onClick={load}
            className="mt-1 text-sm text-red-400 underline underline-offset-2"
          >
            Retry
          </button>
        </div>
      )}

      {!isLoading && !error && variants.length === 0 && !showCreateForm && (
        <p className="text-sm text-muted-text">
          No variants yet. This product only has its default SKU until you
          add one.
        </p>
      )}

      {variants.length > 0 && (
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="bg-background/60 text-xs uppercase tracking-wide text-muted-text">
              <tr>
                <th className="px-3 py-2 font-medium">SKU</th>
                <th className="px-3 py-2 font-medium">Options</th>
                <th className="px-3 py-2 font-medium">Price</th>
                <th className="px-3 py-2 font-medium">Cost</th>
                <th className="px-3 py-2 font-medium">On hand</th>
                <th className="px-3 py-2 font-medium">Available</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <Fragment key={v.id}>
                  <tr className="border-t border-border">
                    <td className="px-3 py-2.5 font-medium text-foreground">
                      {v.sku}
                      {v.is_default && (
                        <span className="ml-2 rounded-full bg-background px-2 py-0.5 text-xs text-muted-text">
                          default
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted-text">
                      {v.option_values.length > 0
                        ? v.option_values
                            .map((ov) => `${ov.option_type_name}: ${ov.value}`)
                            .join(", ")
                        : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-foreground">{v.price}</td>
                    <td className="px-3 py-2.5 text-muted-text">
                      {v.cost_price}
                    </td>
                    <td className="px-3 py-2.5 text-foreground">
                      {v.inventory.quantity_on_hand}
                    </td>
                    <td className="px-3 py-2.5 text-foreground">
                      {v.inventory.quantity_available}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <button
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-accent hover:bg-accent/10"
                        onClick={() =>
                          setEditingVariantId(
                            editingVariantId === v.id ? null : v.id,
                          )
                        }
                        title={editingVariantId === v.id ? "Close" : "Edit variant"}
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        {editingVariantId === v.id ? "Close" : "Edit"}
                      </button>
                    </td>
                  </tr>

                  {editingVariantId === v.id && (
                    <tr className="border-t border-border bg-background/40">
                      <td colSpan={7} className="px-3 py-3">
                        <VariantForm
                          productId={productId}
                          optionTypes={optionTypes}
                          variant={v}
                          onCancel={() => setEditingVariantId(null)}
                          onSaved={(updated) => {
                            setVariants((prev) =>
                              prev.map((x) =>
                                x.id === updated.id ? updated : x,
                              ),
                            );
                            setEditingVariantId(null);
                          }}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}