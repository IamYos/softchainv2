"use client";

import { useEffect, useState } from "react";

function detectBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function useVisitorTimezone(): string {
  const [tz, setTz] = useState<string>("UTC"); // SSR-safe fallback

  useEffect(() => {
    setTz(detectBrowserTimezone());
  }, []);

  return tz;
}
