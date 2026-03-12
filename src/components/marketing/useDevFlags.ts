"use client";

import { useSyncExternalStore } from "react";

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

const NOOP_SUBSCRIBE = () => () => {};
let cachedSearch = "";
let cachedFlags = DEFAULT_DEV_FLAGS;

function hasFlag(searchParams: URLSearchParams, name: string) {
  const value = searchParams.get(name);
  return value === "1" || value === "true";
}

export function getDevFlagsSnapshot(): DevFlags {
  if (process.env.NODE_ENV === "production" || typeof window === "undefined") {
    return DEFAULT_DEV_FLAGS;
  }

  const currentSearch = window.location.search;

  if (currentSearch === cachedSearch) {
    return cachedFlags;
  }

  const searchParams = new URLSearchParams(currentSearch);

  cachedSearch = currentSearch;
  cachedFlags = {
    perf: hasFlag(searchParams, "perf"),
    noCanvas: hasFlag(searchParams, "noCanvas"),
    noCursor: hasFlag(searchParams, "noCursor"),
    noMarquee: hasFlag(searchParams, "noMarquee"),
    noHeroBlur: hasFlag(searchParams, "noHeroBlur"),
    noBackdropBlur: hasFlag(searchParams, "noBackdropBlur"),
  };

  return cachedFlags;
}

function getServerSnapshot() {
  return DEFAULT_DEV_FLAGS;
}

export function useDevFlags() {
  return useSyncExternalStore(NOOP_SUBSCRIBE, getDevFlagsSnapshot, getServerSnapshot);
}
