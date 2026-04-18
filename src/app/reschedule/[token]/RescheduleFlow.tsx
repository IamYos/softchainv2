"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useAvailableSlots } from "@/components/booking/useAvailableSlots";
import { groupSlotsByDate, type SlotIso } from "@/components/booking/groupSlotsByDate";
import { utcToIsoDateInTz } from "@/lib/booking/timezone";
import { DateStrip } from "@/components/booking/SlotPicker/DateStrip";
import { TimeGrid } from "@/components/booking/SlotPicker/TimeGrid";

type BookingView = {
  startAtIso: string;
  endAtIso: string;
  visitorName: string;
  visitorTimezone: string;
  ownerTimezone: string;
  contactMethod: "whatsapp" | "zoom" | "meet" | "teams";
};

function formatWhen(iso: string, timezone: string): string {
  return new Date(iso).toLocaleString(undefined, {
    timeZone: timezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function RescheduleFlow({ token, booking }: { token: string; booking: BookingView }) {
  // Fetch next 14 days of slots in the visitor's original timezone so the
  // reschedule picker feels identical to the initial flow.
  const slots = useAvailableSlots(booking.visitorTimezone, 14);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStartIso, setSelectedStartIso] = useState<string>("");
  const [state, setState] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const [confirmedStart, setConfirmedStart] = useState<string | null>(null);

  const grouped = useMemo(() => {
    if (slots.status !== "ready") return {} as Record<string, SlotIso[]>;
    return groupSlotsByDate(slots.slots, booking.visitorTimezone);
  }, [slots, booking.visitorTimezone]);

  const days = useMemo(() => {
    const today = utcToIsoDateInTz(new Date(), booking.visitorTimezone);
    const out: string[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(`${today}T12:00:00Z`);
      d.setUTCDate(d.getUTCDate() + i);
      out.push(utcToIsoDateInTz(d, booking.visitorTimezone));
    }
    return out;
  }, [booking.visitorTimezone]);

  const availability = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const iso of days) map[iso] = (grouped[iso]?.length ?? 0) > 0;
    return map;
  }, [days, grouped]);

  const daySlots = selectedDate ? grouped[selectedDate] ?? [] : [];

  const submit = async () => {
    if (!selectedStartIso) return;
    setState("submitting");
    setErr(null);
    const res = await fetch("/api/bookings/reschedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, newStartAtIso: selectedStartIso }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(body.error ?? `HTTP ${res.status}`);
      setState("error");
      return;
    }
    const body = (await res.json()) as { ok: true; startUtc: string };
    setConfirmedStart(body.startUtc);
    setState("done");
  };

  if (state === "done" && confirmedStart) {
    return (
      <main style={{ maxWidth: "36rem", margin: "4rem auto", padding: "1.5rem", fontFamily: "inherit" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Your call is rescheduled.</h1>
        <p style={{ marginBottom: "1rem" }}>
          Moved to <strong>{formatWhen(confirmedStart, booking.visitorTimezone)}</strong>{" "}
          <span style={{ opacity: 0.6 }}>({booking.visitorTimezone})</span>
        </p>
        <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>
          Your calendar invite has been updated automatically. A confirmation email is on its way.
        </p>
        <Link href="/" style={{ color: "inherit", textDecoration: "underline" }}>
          Back to Softchain →
        </Link>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: "40rem", margin: "4rem auto", padding: "1.5rem", fontFamily: "inherit" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Pick a new time</h1>
      <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>
        Currently scheduled for{" "}
        <strong>{formatWhen(booking.startAtIso, booking.visitorTimezone)}</strong>{" "}
        <span style={{ opacity: 0.6 }}>({booking.visitorTimezone})</span>.
      </p>

      {slots.status === "loading" && <p>Loading available times…</p>}
      {slots.status === "error" && <p style={{ color: "#f60" }}>{slots.message}</p>}

      {slots.status === "ready" && (
        <>
          <section style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, marginBottom: "0.5rem" }}>
              Choose a day
            </h2>
            <DateStrip
              days={days}
              availability={availability}
              selected={selectedDate}
              onSelect={(d) => {
                setSelectedDate(d);
                setSelectedStartIso("");
              }}
              timezone={booking.visitorTimezone}
            />
          </section>

          {selectedDate && (
            <section style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontSize: "0.8rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, marginBottom: "0.5rem" }}>
                Choose a time
              </h2>
              <TimeGrid
                slots={daySlots}
                selectedStartIso={selectedStartIso}
                onSelect={(startIso) => setSelectedStartIso(startIso)}
                timezone={booking.visitorTimezone}
                ownerTimezone={booking.ownerTimezone}
              />
            </section>
          )}

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={submit}
              disabled={!selectedStartIso || state === "submitting"}
              style={{
                padding: "0.6rem 1.2rem",
                border: "1px solid currentColor",
                borderRadius: "999px",
                background: "transparent",
                cursor: !selectedStartIso || state === "submitting" ? "default" : "pointer",
                opacity: !selectedStartIso ? 0.5 : 1,
                fontFamily: "inherit",
              }}
            >
              {state === "submitting" ? "Rescheduling…" : "Confirm new time"}
            </button>
            <Link
              href="/"
              style={{
                padding: "0.6rem 1.2rem",
                border: "1px solid rgba(0,0,0,0.2)",
                borderRadius: "999px",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              Keep my current time
            </Link>
          </div>

          {err && (
            <p role="alert" style={{ color: "#f60", marginTop: "1rem", fontSize: "0.9rem" }}>
              {err}
            </p>
          )}
        </>
      )}
    </main>
  );
}
