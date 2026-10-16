"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import {
  Building2,
  Camera,
  Crown,
  Loader2,
  Mail,
  RefreshCw,
  Settings,
  Shield,
  Sparkles,
  Store,
  Trash2,
  Truck,
  User as UserIcon,
  Warehouse,
} from "lucide-react";

import { useTenant } from "@/context/TenantContext";
import UserAvatar from "@/components/common/UserAvatar";
import {
  fileToAvatarDataUrl,
  removeProfileImage,
  saveProfileImage,
  useProfileImage,
} from "@/lib/profile-image";

function capitalize(value?: string | null): string {
  if (!value) return "—";

  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function ProfilePage() {
  const {
    workspace,
    tenants,
    isWorkspaceLoading,
    workspaceError,
    reloadWorkspace,
  } = useTenant();

  const userId = workspace?.user.id;
  const profileImage = useProfileImage(userId);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSavingPhoto, setIsSavingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    // Reset so picking the same file again still fires onChange.
    event.target.value = "";

    if (!file) return;

    setPhotoError("");
    setIsSavingPhoto(true);

    try {
      const dataUrl = await fileToAvatarDataUrl(file);
      saveProfileImage(userId, dataUrl);
    } catch (error) {
      setPhotoError(
        error instanceof Error ? error.message : "Couldn't update your photo.",
      );
    } finally {
      setIsSavingPhoto(false);
    }
  };

  if (isWorkspaceLoading && !workspace) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="flex min-h-[360px] items-center justify-center rounded-2xl border border-border bg-card">
          <div className="flex flex-col items-center text-center">
            <Loader2 className="mb-3 h-7 w-7 animate-spin text-[#0284c7]" />

            <p className="text-sm font-semibold text-foreground">
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-500">
              <RefreshCw className="h-5 w-5" />
            </div>

            <h2 className="text-sm font-semibold text-foreground">
              Unable to load your profile
            </h2>

            <p className="mt-1 max-w-md text-xs text-muted-text">
              {workspaceError ?? "Something went wrong."}
            </p>

            <button
              type="button"
              onClick={reloadWorkspace}
              className="mt-5 inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-background"
            >
              <RefreshCw className="h-4 w-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { user, business, role, default_warehouse, default_channel } =
    workspace;

  const isBusinessActive = business.status?.toLowerCase() === "active";

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5">
      {/* ===================================================== */}
      {/* HERO                                                  */}
      {/* ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="h-28 bg-gradient-to-r from-[#0284c7] via-indigo-500 to-fuchsia-500 sm:h-32" />

        <div className="px-5 pb-6 sm:px-8">
          <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              {/* Avatar + change photo */}

              <div className="relative w-fit">
                <div className="rounded-full border-4 border-card bg-card">
                  <UserAvatar
                    name={user.name}
                    image={profileImage}
                    className="h-24 w-24 text-2xl sm:h-28 sm:w-28 sm:text-3xl"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSavingPhoto}
                  title="Change photo"
                  className="
                    absolute
                    bottom-1
                    right-1
                    flex
                    h-8
                    w-8
                    items-center
                    justify-center
                    rounded-full
                    border-2
                    border-card
                    bg-[#0284c7]
                    text-white
                    shadow-md
                    transition-colors
                    hover:bg-[#0369a1]
                    disabled:opacity-60
                  "
                >
                  {isSavingPhoto ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              {/* Name + email + badges */}

              <div className="pb-1">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {user.name}
                </h1>

                <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-text">
                  <Mail className="h-3.5 w-3.5" />
                  {user.email}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#0284c7]/10 px-2.5 py-1 text-xs font-semibold text-[#0284c7]">
                    <Shield className="h-3 w-3" />
                    {capitalize(role.name)}
                  </span>

                  <span className="inline-flex items-center gap-1 rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs font-semibold text-indigo-500">
                    <Crown className="h-3 w-3" />
                    {capitalize(business.plan)} plan
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
                      isBusinessActive
                        ? "bg-emerald-500/10 text-emerald-500"
                        : "bg-amber-500/10 text-amber-500"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        isBusinessActive ? "bg-emerald-500" : "bg-amber-500"
                      }`}
                    />
                    Store {business.status || "unknown"}
                  </span>
                </div>
              </div>
            </div>

            {/* Photo actions */}

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSavingPhoto}
                className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-3.5 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-border/30 disabled:opacity-60"
              >
                <Camera className="h-4 w-4" />
                {profileImage ? "Change photo" : "Upload photo"}
              </button>

              {profileImage && (
                <button
                  type="button"
                  onClick={() => removeProfileImage(userId)}
                  disabled={isSavingPhoto}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 px-3.5 py-2 text-sm font-semibold text-red-500 transition-colors hover:bg-red-500/10 disabled:opacity-60"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              )}
            </div>
          </div>

          {photoError && (
            <p className="mt-3 text-xs font-medium text-red-500">
              {photoError}
            </p>
          )}

          <p className="mt-3 text-[11px] text-muted-text">
            Your photo is saved on this device only for now.
          </p>
        </div>
      </div>

      {/* ===================================================== */}
      {/* QUICK STATS                                           */}
      {/* ===================================================== */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          icon={Store}
          label="Total stores"
          value={String(tenants.length)}
        />

        <StatTile
          icon={Crown}
          label="Current plan"
          value={capitalize(business.plan)}
        />

        <StatTile icon={Shield} label="Your role" value={capitalize(role.name)} />

        <StatTile
          icon={Building2}
          label="Store status"
          value={capitalize(business.status)}
        />
      </div>

      {/* ===================================================== */}
      {/* DETAILS                                               */}
      {/* ===================================================== */}

      <div className="grid gap-5 lg:grid-cols-2">
        <SectionCard
          icon={UserIcon}
          title="Personal details"
          description="Your account information."
        >
          <InfoRow label="Full name" value={user.name} />
          <InfoRow label="Email address" value={user.email} />
          <InfoRow label="Role" value={capitalize(role.name)} />
          <InfoRow label="User ID" value={user.id} mono />
        </SectionCard>

        <SectionCard
          icon={Store}
          title="Store details"
          description="The store you're currently managing."
        >
          <InfoRow label="Store name" value={business.name} />
          <InfoRow label="Store slug" value={business.slug} mono />
          <InfoRow
            label="Default warehouse"
            value={`${default_warehouse.name} (${default_warehouse.type})`}
            icon={Warehouse}
          />
          <InfoRow
            label="Default sales channel"
            value={`${default_channel.name} (${default_channel.type})`}
            icon={Truck}
          />
        </SectionCard>
      </div>

      {/* ===================================================== */}
      {/* QUICK ACTIONS                                         */}
      {/* ===================================================== */}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-border/30"
        >
          <Settings className="h-4 w-4 text-muted-text" />
          Account settings
        </Link>

        <Link
          href="/dashboard/upgrade"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0284c7] to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:brightness-110"
        >
          <Sparkles className="h-4 w-4" />
          View plans
        </Link>
      </div>
    </div>
  );
}

/* ============================================================
   SMALL PRESENTATIONAL PIECES
============================================================ */

function StatTile({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-[#0284c7]/10 text-[#0284c7]">
        <Icon className="h-5 w-5" />
      </div>

      <p className="text-xs font-medium text-muted-text">{label}</p>

      <p className="mt-1 truncate text-xl font-bold text-foreground">
        {value}
      </p>
    </div>
  );
}

function SectionCard({
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

      <div className="space-y-3">{children}</div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  mono = false,
  icon: Icon,
}: {
  label: string;
  value: string;
  mono?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-text">
        {label}
      </p>

      <p
        className={`mt-1.5 flex items-center gap-2 break-all text-sm font-semibold text-foreground ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-text" />}
        {value || "—"}
      </p>
    </div>
  );
}