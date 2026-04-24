"use client";

import { useEffect, useState } from "react";
import { utcToIsoDateInTz } from "@/lib/booking/timezone";
import type { SlotIso } from "./groupSlotsByDate";

export type SlotsFetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; slots: SlotIso[]; visitorTimezone: string; ownerTimezone: string }
  | { status: "error"; message: string };

// Internal state carries the timezone each response was for, so we can
// derive "loading" purely from state + props — no synchronous setState
// inside the effect body.
type InternalState =
  | { status: "idle" }
  | { status: "ready"; slots: SlotIso[]; visitorTimezone: string; ownerTimezone: string }
  | { status: "error"; message: string; forTimezone: string };

export function useAvailableSlots(timezone: string, days: number): SlotsFetchState {
  const [state, setState] = useState<InternalState>({ status: "idle" });

  useEffect(() => {
    if (!timezone) return;
    let cancelled = false;

    const now = new Date();
    const fromIso = utcToIsoDateInTz(now, timezone);
    const to = new Date(now.getTime() + days * 86400 * 1000);
    const toIso = utcToIsoDateInTz(to, timezone);

    const params = new URLSearchParams({ from: fromIso, to: toIso, tz: timezone });
    fetch(`/api/slots?${params.toString()}`, { method: "GET" })
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(body.error ?? `HTTP ${res.status}`);
        }
        return res.json() as Promise<{
          visitorTimezone: string;
          ownerTimezone: string;
          slots: SlotIso[];
        }>;
      })
      .then((data) => {
        if (cancelled) return;
        setState({
          status: "ready",
          slots: data.slots,
          visitorTimezone: data.visitorTimezone,
          ownerTimezone: data.ownerTimezone,
        });
      })
      .catch((err: Error) => {
        if (cancelled) return;
        setState({ status: "error", message: err.message, forTimezone: timezone });
      });

    return () => {
      cancelled = true;
    };
  }, [timezone, days]);

  if (!timezone) return { status: "idle" };
  if (state.status === "idle") return { status: "loading" };
  if (state.status === "ready" && state.visitorTimezone !== timezone) {
    return { status: "loading" };
  }
  if (state.status === "error" && state.forTimezone !== timezone) {
    return { status: "loading" };
  }
  if (state.status === "error") {
    return { status: "error", message: state.message };
  }
  return state;
}
