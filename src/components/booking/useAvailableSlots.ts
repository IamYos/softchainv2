"use client";

import { useEffect, useState } from "react";
import { utcToIsoDateInTz } from "@/lib/booking/timezone";
import type { SlotIso } from "./groupSlotsByDate";

type FetchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; slots: SlotIso[]; visitorTimezone: string; ownerTimezone: string }
  | { status: "error"; message: string };

export function useAvailableSlots(timezone: string, days: number): FetchState {
  const [state, setState] = useState<FetchState>({ status: "idle" });

  useEffect(() => {
    if (!timezone) return;
    let cancelled = false;
    setState({ status: "loading" });

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
        setState({ status: "error", message: err.message });
      });

    return () => {
      cancelled = true;
    };
  }, [timezone, days]);

  return state;
}
