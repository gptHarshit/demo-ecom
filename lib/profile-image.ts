"use client";

import { useSyncExternalStore } from "react";

// The backend has no avatar-upload endpoint yet, so the profile photo is kept
// on THIS device only (localStorage), resized to a small square first so it
// stays tiny. When an upload API exists, replace saveProfileImage /
// removeProfileImage with API calls and keep the rest as is.

const KEY_PREFIX = "commerce_profile_image:";
const CHANGE_EVENT = "commerce:profile-image-changed";

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const AVATAR_SIZE = 256;

function storageKey(userId?: string | null): string {
  return `${KEY_PREFIX}${userId ?? "anonymous"}`;
}

export function readProfileImage(userId?: string | null): string | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage.getItem(storageKey(userId));
  } catch {
    return null;
  }
}

export function saveProfileImage(
  userId: string | null | undefined,
  dataUrl: string,
): void {
  try {
    window.localStorage.setItem(storageKey(userId), dataUrl);
  } catch {
    throw new Error("Couldn't save the image on this device.");
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function removeProfileImage(userId?: string | null): void {
  try {
    window.localStorage.removeItem(storageKey(userId));
  } catch {
    // Nothing to clean up if storage is unavailable.
  }

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** Center-crops the picked file to a square and returns a small JPEG data URL. */
export async function fileToAvatarDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Please choose an image file.");
  }

  if (file.size > MAX_FILE_BYTES) {
    throw new Error("Image must be smaller than 5 MB.");
  }

  let bitmap: ImageBitmap;

  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("This image format isn't supported. Try a JPG or PNG.");
  }

  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;

  const context = canvas.getContext("2d");

  if (!context) {
    bitmap.close();
    throw new Error("Couldn't process the image.");
  }

  const side = Math.min(bitmap.width, bitmap.height);
  const sourceX = (bitmap.width - side) / 2;
  const sourceY = (bitmap.height - side) / 2;

  context.drawImage(
    bitmap,
    sourceX,
    sourceY,
    side,
    side,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );

  bitmap.close();

  return canvas.toDataURL("image/jpeg", 0.85);
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);

  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * Returns the saved profile image (or null). Stays in sync across the header
 * and the profile page, and across browser tabs.
 */
export function useProfileImage(userId?: string | null): string | null {
  return useSyncExternalStore(
    subscribe,
    () => readProfileImage(userId),
    () => null,
  );
}