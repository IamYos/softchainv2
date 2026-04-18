"use client";

import { useEffect, useState } from "react";
import type { AvailabilityException } from "@/lib/booking/types";
import { AvailabilityCalendar } from "./AvailabilityCalendar";

type ExceptionRow = AvailabilityException & { id: string };

type Props = {
  ownerTimezone: string;
};

function rangeIso(daysAhead: number): { from: string; to: string } {
  const now = new Date();
  const from = now.toISOString().slice(0, 10);
  const to = new Date(now.getTime() + daysAhead * 86400 * 1000).toISOString().slice(0, 10);
  return { from, to };
}

function formatNextAvailable(iso: string, tz: string): string {
  return new Date(iso).toLocaleString(undefined, {
    timeZone: tz,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function AvailabilityEditor({ ownerTimezone }: Props) {
  const [exceptions, setExceptions] = useState<ExceptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextAvailable, setNextAvailable] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    const { from, to } = rangeIso(60);
    const res = await fetch(`/api/admin/availability?from=${from}&to=${to}`);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
      setLoading(false);
      return;
    }
    const body = (await res.json()) as { exceptions: ExceptionRow[] };
    setExceptions(body.exceptions);
    setLoading(false);
  };

  const refreshNextAvailable = async () => {
    const { from, to } = rangeIso(14);
    const params = new URLSearchParams({ from, to, tz: ownerTimezone });
    try {
      const res = await fetch(`/api/slots?${params.toString()}`);
      if (!res.ok) return;
      const body = (await res.json()) as { slots: Array<{ startUtc: string }> };
      setNextAvailable(body.slots[0]?.startUtc ?? null);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    void refresh();
    void refreshNextAvailable();
  }, [ownerTimezone]);

  const addException = async (input: {
    type: "block" | "extra";
    date: string;
    startTime?: string;
    endTime?: string;
    note?: string;
  }) => {
    const res = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      throw new Error(body.error ?? `HTTP ${res.status}`);
    }
    await refresh();
    await refreshNextAvailable();
  };

  const removeException = async (id: string) => {
    const res = await fetch(`/api/admin/availability/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
      return;
    }
    await refresh();
    await refreshNextAvailable();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", maxWidth: "60rem" }}>
      <section
        style={{
          padding: "0.75rem 1rem",
          background: "rgba(0,0,0,0.04)",
          borderRadius: "8px",
          fontSize: "0.9rem",
        }}
      >
        <strong>Next available:</strong>{" "}
        {nextAvailable
          ? `${formatNextAvailable(nextAvailable, ownerTimezone)} (${ownerTimezone})`
          : "no open slot in the next 14 days"}
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Exceptions (next 60 days)</h2>
        {loading && <p style={{ opacity: 0.6 }}>Loading…</p>}
        {error && <p style={{ color: "#f60" }}>{error}</p>}
        {!loading && !error && (
          <AvailabilityCalendar
            exceptions={exceptions}
            ownerTimezone={ownerTimezone}
            onAdd={addException}
            onRemove={removeException}
          />
        )}
        <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.75rem" }}>
          Weekly default hours are edited in{" "}
          <a href="/admin/settings" style={{ color: "inherit" }}>Settings</a>. Exceptions here
          override the defaults for specific dates.
        </p>
      </section>
    </div>
  );
}
