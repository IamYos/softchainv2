"use client";

import { useSyncExternalStore } from "react";

let cachedTz: string | null = null;

function detectBrowserTimezone(): string {
  if (cachedTz != null) return cachedTz;
  try {
    cachedTz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    cachedTz = "UTC";
  }
  return cachedTz;
}

// The browser timezone doesn't change during a session, so the subscribe
// callback is a no-op. React still calls getSnapshot on the client after
// hydration; getServerSnapshot supplies the SSR-safe fallback.
const subscribe = () => () => {};
const getServerSnapshot = () => "UTC";

export function useVisitorTimezone(): string {
  return useSyncExternalStore(subscribe, detectBrowserTimezone, getServerSnapshot);
}
