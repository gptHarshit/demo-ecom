"use client";

import React from "react";

export function getInitials(name?: string | null): string {
  if (!name) return "U";

  return (
    name
      .trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U"
  );
}

interface UserAvatarProps {
  name?: string | null;
  image?: string | null;
  className?: string;
}

export default function UserAvatar({
  name,
  image,
  className = "h-8 w-8 text-xs",
}: UserAvatarProps) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name ? `${name}'s profile photo` : "Profile photo"}
        className={`${className} shrink-0 rounded-full object-cover`}
      />
    );
  }

  return (
    <div
      className={`${className} flex shrink-0 items-center justify-center rounded-full bg-[#0284c7] font-bold text-white shadow-xs`}
      aria-label={name ?? "User"}
    >
      {getInitials(name)}
    </div>
  );
}