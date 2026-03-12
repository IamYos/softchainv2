"use client";

import { useMemo, useSyncExternalStore } from "react";

export type DevFlags = {
  perf: boolean;
  noCanvas: boolean;
  noCursor: boolean;
  noMarquee: boolean;
  noHeroBlur: boolean;
  noBackdropBlur: boolean;
};

const DEFAULT_DEV_FLAGS: DevFlags = {
  perf: false,
  noCanvas: false,
  noCursor: false,
  noMarquee: false,
  noHeroBlur: false,
  noBackdropBlur: false,
};

function hasFlag(searchParams: URLSearchParams, name: string) {
  const value = searchParams.get(name);
  return value === "1" || value === "true";
}

function parseDevFlags(search: string): DevFlags {
  if (process.env.NODE_ENV === "production" || !search) {
    return DEFAULT_DEV_FLAGS;
  }

  const searchParams = new URLSearchParams(search);

  return {
    perf: hasFlag(searchParams, "perf"),
    noCanvas: hasFlag(searchParams, "noCanvas"),
    noCursor: hasFlag(searchParams, "noCursor"),
    noMarquee: hasFlag(searchParams, "noMarquee"),
    noHeroBlur: hasFlag(searchParams, "noHeroBlur"),
    noBackdropBlur: hasFlag(searchParams, "noBackdropBlur"),
  };
}

export function getDevFlagsSnapshot(): DevFlags {
  if (typeof window === "undefined") {
    return DEFAULT_DEV_FLAGS;
  }

  return parseDevFlags(window.location.search);
}

function subscribeToSearch(callback: () => void) {
  window.addEventListener("popstate", callback);
  window.addEventListener("hashchange", callback);

  return () => {
    window.removeEventListener("popstate", callback);
    window.removeEventListener("hashchange", callback);
  };
}

function getSearchSnapshot() {
  return window.location.search;
}

function getServerSearchSnapshot() {
  return "";
}

export function useDevFlags() {
  const search = useSyncExternalStore(
    subscribeToSearch,
    getSearchSnapshot,
    getServerSearchSnapshot,
  );

  return useMemo(() => parseDevFlags(search), [search]);
}
