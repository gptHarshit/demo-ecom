"use client";

import React, { useCallback, useSyncExternalStore } from "react";
import { useTheme } from "next-themes";
import { Bell, Monitor, Moon, Palette, Sun } from "lucide-react";

function useIsClient(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}

// A boolean preference kept in localStorage (this device only for now).
function useStoredFlag(
  key: string,
  defaultValue: boolean,
): [boolean, (next: boolean) => void] {
  const eventName = `commerce:setting:${key}`;

  const subscribe = useCallback(
    (onChange: () => void) => {
      window.addEventListener("storage", onChange);
      window.addEventListener(eventName, onChange);

      return () => {
        window.removeEventListener("storage", onChange);
        window.removeEventListener(eventName, onChange);
      };
    },
    [eventName],
  );

  const getSnapshot = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(key);

      return raw === null ? defaultValue : raw === "true";
    } catch {
      return defaultValue;
    }
  }, [key, defaultValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, () => defaultValue);

  const setValue = useCallback(
    (next: boolean) => {
      try {
        window.localStorage.setItem(key, String(next));
      } catch {
        // Storage unavailable (private mode) — nothing to persist.
      }

      window.dispatchEvent(new Event(eventName));
    },
    [key, eventName],
  );

  return [value, setValue];
}

/* ============================================================
   PAGE
============================================================ */

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const isClient = useIsClient();

  const [lowStockAlerts, setLowStockAlerts] = useStoredFlag(
    "notify-low-stock",
    true,
  );

  const [orderUpdates, setOrderUpdates] = useStoredFlag(
    "notify-order-updates",
    true,
  );

  return (
    <div className="mx-auto w-full max-w-3xl space-y-5">
      <div className="mb-2">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Settings
        </h1>

        <p className="mt-1 text-sm text-muted-text">
          Manage how the dashboard looks and what you get notified about.
        </p>
      </div>

      {/* APPEARANCE */}

      <SettingsCard
        icon={Palette}
        title="Appearance"
        description="Choose how Commerce Core looks on your device."
      >
        <div className="grid grid-cols-3 gap-3">
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const isSelected = isClient && theme === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => setTheme(value)}
                aria-pressed={isSelected}
                className={`
                  flex
                  flex-col
                  items-center
                  gap-2
                  rounded-xl
                  border
                  px-3
                  py-4
                  text-sm
                  font-semibold
                  transition-all
                  ${
                    isSelected
                      ? "border-[#0284c7] bg-[#0284c7]/10 text-[#0284c7] ring-1 ring-[#0284c7]/30"
                      : "border-border bg-background text-muted-text hover:bg-border/30 hover:text-foreground"
                  }
                `}
              >
                <Icon className="h-5 w-5" />
                {label}
              </button>
            );
          })}
        </div>
      </SettingsCard>

      {/* NOTIFICATIONS */}

      <SettingsCard
        icon={Bell}
        title="Notifications"
        description="Pick the alerts you want to see. Saved on this device."
      >
        <div className="divide-y divide-border rounded-xl border border-border bg-background">
          <ToggleRow
            label="Low stock alerts"
            description="Get notified when a product is running low."
            checked={lowStockAlerts}
            onChange={setLowStockAlerts}
          />

          <ToggleRow
            label="Order updates"
            description="Get notified when an order is placed or its status changes."
            checked={orderUpdates}
            onChange={setOrderUpdates}
          />
        </div>
      </SettingsCard>
    </div>
  );
}

/* ============================================================
   PRESENTATIONAL PIECES
============================================================ */

function SettingsCard({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
          <Icon className="h-5 w-5" />
        </div>

        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>

          <p className="text-xs text-muted-text">{description}</p>
        </div>
      </div>

      {children}
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3.5">
      <div>
        <p className="text-sm font-semibold text-foreground">{label}</p>

        <p className="mt-0.5 text-xs text-muted-text">{description}</p>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`
          relative
          h-6
          w-11
          shrink-0
          rounded-full
          transition-colors
          ${checked ? "bg-[#0284c7]" : "bg-border"}
        `}
      >
        <span
          className={`
            absolute
            left-0.5
            top-0.5
            h-5
            w-5
            rounded-full
            bg-white
            shadow
            transition-transform
            ${checked ? "translate-x-5" : "translate-x-0"}
          `}
        />
      </button>
    </div>
  );
}