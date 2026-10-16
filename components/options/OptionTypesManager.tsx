"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Loader2,
  Pencil,
  Plus,
  Tag,
  Trash2,
  X,
} from "lucide-react";

import {
  createOptionType,
  createOptionValue,
  deleteOptionType,
  deleteOptionValue,
  listOptionTypes,
  updateOptionType,
  updateOptionValue,
} from "@/lib/api/product-options.api";
import { ApiError } from "@/lib/api/api-error";
import type { OptionTypeResponse } from "@/types/product";

const inputClass =
  "rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-all placeholder:text-muted-text focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:cursor-not-allowed disabled:opacity-60";

// A small rotating palette so each option type's chips get a distinct tint —
// purely visual, has no meaning in the data.
const CHIP_THEMES = [
  "border-sky-500/30 bg-sky-500/10 text-sky-400",
  "border-violet-500/30 bg-violet-500/10 text-violet-400",
  "border-rose-500/30 bg-rose-500/10 text-rose-400",
  "border-amber-500/30 bg-amber-500/10 text-amber-400",
  "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
];

export default function OptionTypesManager() {
  const [optionTypes, setOptionTypes] = useState<OptionTypeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNewTypeForm, setShowNewTypeForm] = useState(false);

  const load = async () => {
    try {
      setIsLoading(true);
      setError("");
      const data = await listOptionTypes();
      setOptionTypes(data);
      // Open the first one by default so the page doesn't feel empty/inert.
      if (data.length > 0) setExpandedId((prev) => prev ?? data[0].id);
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to load options.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-text">
          {isLoading
            ? "Loading..."
            : `${optionTypes.length} option ${optionTypes.length === 1 ? "type" : "types"}`}
        </p>

        {!showNewTypeForm && (
          <button
            onClick={() => setShowNewTypeForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            New option type
          </button>
        )}
      </div>

      {showNewTypeForm && (
        <NewOptionTypeForm
          onCreated={(t) => {
            setOptionTypes((prev) => [...prev, t]);
            setExpandedId(t.id);
            setShowNewTypeForm(false);
          }}
          onCancel={() => setShowNewTypeForm(false)}
        />
      )}

      {isLoading && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-6 text-sm text-muted-text">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading options...
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

      {!isLoading && !error && optionTypes.length === 0 && !showNewTypeForm && (
        <button
          onClick={() => setShowNewTypeForm(true)}
          className="flex w-full flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center transition-all hover:border-accent/40 hover:bg-card"
        >
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Tag className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium text-foreground">
            No option types yet
          </p>
          <p className="text-xs text-muted-text">
            Start with something like &quot;Size&quot; or &quot;Color&quot;
          </p>
        </button>
      )}

      <div className="space-y-3">
        {optionTypes.map((type, i) => (
          <OptionTypeCard
            key={type.id}
            optionType={type}
            theme={CHIP_THEMES[i % CHIP_THEMES.length]}
            isExpanded={expandedId === type.id}
            onToggle={() =>
              setExpandedId((prev) => (prev === type.id ? null : type.id))
            }
            onRemoved={() => {
              setOptionTypes((prev) => prev.filter((t) => t.id !== type.id));
              if (expandedId === type.id) setExpandedId(null);
            }}
            onChanged={(updated) =>
              setOptionTypes((prev) =>
                prev.map((t) => (t.id === updated.id ? updated : t)),
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function NewOptionTypeForm({
  onCreated,
  onCancel,
}: {
  onCreated: (t: OptionTypeResponse) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setIsSubmitting(true);
      setError("");
      const created = await createOptionType({ name: name.trim() });
      onCreated(created);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Failed to create option type.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-start gap-2 rounded-xl border border-accent/30 bg-accent/5 p-4"
    >
      <div className="flex-1">
        <input
          className={`${inputClass} w-full bg-card`}
          placeholder="e.g. Size, Color, Material..."
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isSubmitting}
          autoFocus
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={!name.trim() || isSubmitting}
        className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isSubmitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
        Create
      </button>
      <button
        type="button"
        onClick={onCancel}
        disabled={isSubmitting}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-muted-text hover:bg-background disabled:opacity-50"
      >
        <X className="h-4 w-4" />
      </button>
    </form>
  );
}

function OptionTypeCard({
  optionType,
  theme,
  isExpanded,
  onToggle,
  onRemoved,
  onChanged,
}: {
  optionType: OptionTypeResponse;
  theme: string;
  isExpanded: boolean;
  onToggle: () => void;
  onRemoved: () => void;
  onChanged: (updated: OptionTypeResponse) => void;
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState(optionType.name);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");

  const [newValue, setNewValue] = useState("");
  const [isAddingValue, setIsAddingValue] = useState(false);
  const [valueError, setValueError] = useState("");

  const saveName = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === optionType.name) {
      setIsEditingName(false);
      setName(optionType.name);
      return;
    }

    try {
      setIsSaving(true);
      setError("");
      await updateOptionType(optionType.id, { name: trimmed });
      onChanged({ ...optionType, name: trimmed });
      setIsEditingName(false);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to rename.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteType = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      !window.confirm(
        `Delete "${optionType.name}"? This also removes its values.`,
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      setError("");
      await deleteOptionType(optionType.id);
      onRemoved();
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : "Failed to delete option type.",
      );
      setIsDeleting(false);
    }
  };

  const handleAddValue = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newValue.trim();
    if (!trimmed) return;

    try {
      setIsAddingValue(true);
      setValueError("");
      const created = await createOptionValue(optionType.id, {
        value: trimmed,
      });
      onChanged({ ...optionType, values: [...optionType.values, created] });
      setNewValue("");
    } catch (err) {
      setValueError(
        err instanceof ApiError ? err.message : "Failed to add value.",
      );
    } finally {
      setIsAddingValue(false);
    }
  };

  const handleDeleteValue = async (valueId: string, label: string) => {
    if (!window.confirm(`Remove value "${label}"?`)) return;

    try {
      await deleteOptionValue(optionType.id, valueId);
      onChanged({
        ...optionType,
        values: optionType.values.filter((v) => v.id !== valueId),
      });
    } catch (err) {
      setValueError(
        err instanceof ApiError ? err.message : "Failed to remove value.",
      );
    }
  };

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-accent/30">
      {/* Header row — click anywhere to expand/collapse */}
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${theme}`}
          >
            <Tag className="h-4 w-4" />
          </div>

          {isEditingName ? (
            <div
              className="flex flex-1 items-center gap-2"
              onClick={(e) => e.stopPropagation()}
            >
              <input
                className={`${inputClass} flex-1`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSaving}
                autoFocus
              />
              <button
                onClick={saveName}
                disabled={isSaving}
                className="text-sm font-medium text-accent hover:opacity-80"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditingName(false);
                  setName(optionType.name);
                }}
                disabled={isSaving}
                className="text-sm text-muted-text hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          ) : (
            <div className="min-w-0">
              <p className="truncate font-semibold text-foreground">
                {optionType.name}
              </p>
              <p className="text-xs text-muted-text">
                {optionType.values.length}{" "}
                {optionType.values.length === 1 ? "value" : "values"}
              </p>
            </div>
          )}
        </div>

        {!isEditingName && (
          <div className="flex shrink-0 items-center gap-1">
            <span
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingName(true);
              }}
              role="button"
              tabIndex={0}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-text hover:bg-background hover:text-accent"
              title="Rename"
            >
              <Pencil className="h-4 w-4" />
            </span>
            <span
              onClick={handleDeleteType}
              role="button"
              tabIndex={0}
              className="flex h-8 w-8 items-center justify-center rounded-md text-muted-text hover:bg-red-500/10 hover:text-red-400"
              title="Delete option type"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
            </span>
            <ChevronDown
              className={`h-4 w-4 text-muted-text transition-transform ${isExpanded ? "rotate-180" : ""}`}
            />
          </div>
        )}
      </button>

      {/* Expandable body */}
      {isExpanded && (
        <div className="border-t border-border px-5 py-4">
          {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

          <div className="mb-3 flex flex-wrap gap-2">
            {optionType.values.length === 0 && (
              <p className="text-sm text-muted-text">
                No values yet — add the first one below.
              </p>
            )}

            {optionType.values.map((v) => (
              <span
                key={v.id}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium ${theme}`}
              >
                {v.value}
                <button
                  onClick={() => handleDeleteValue(v.id, v.value)}
                  className="opacity-60 hover:opacity-100"
                  aria-label={`Remove ${v.value}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <form onSubmit={handleAddValue} className="flex items-center gap-2">
            <input
              className={`${inputClass} w-40`}
              placeholder="New value, e.g. M"
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              disabled={isAddingValue}
            />
            <button
              type="submit"
              disabled={!newValue.trim() || isAddingValue}
              className="inline-flex items-center gap-1 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted-text transition-all hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAddingValue ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Add value
            </button>
          </form>

          {valueError && (
            <p className="mt-2 text-sm text-red-400">{valueError}</p>
          )}
        </div>
      )}
    </div>
  );
}