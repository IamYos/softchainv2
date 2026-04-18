"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAvailableSlots } from "@/components/booking/useAvailableSlots";
import { groupSlotsByDate, type SlotIso } from "@/components/booking/groupSlotsByDate";
import { utcToIsoDateInTz } from "@/lib/booking/timezone";
import { DateStrip } from "@/components/booking/SlotPicker/DateStrip";
import { TimeGrid } from "@/components/booking/SlotPicker/TimeGrid";

type Props = {
  bookingId: string;
  visitorName: string;
  visitorTimezone: string;
  ownerTimezone: string;
  currentStartAtIso: string;
  onClose: () => void;
  onDone: () => Promise<void>;
};

export function RescheduleModal({
  bookingId,
  visitorName,
  visitorTimezone,
  ownerTimezone,
  currentStartAtIso,
  onClose,
  onDone,
}: Props) {
  const slots = useAvailableSlots(visitorTimezone, 14);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedStartIso, setSelectedStartIso] = useState<string>("");
  const [state, setState] = useState<"idle" | "submitting" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Esc closes the modal.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && state !== "submitting") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, state]);

  // Initial focus on the close button for accessibility.
  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  const grouped = useMemo(() => {
    if (slots.status !== "ready") return {} as Record<string, SlotIso[]>;
    return groupSlotsByDate(slots.slots, visitorTimezone);
  }, [slots, visitorTimezone]);

  const days = useMemo(() => {
    const today = utcToIsoDateInTz(new Date(), visitorTimezone);
    const out: string[] = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(`${today}T12:00:00Z`);
      d.setUTCDate(d.getUTCDate() + i);
      out.push(utcToIsoDateInTz(d, visitorTimezone));
    }
    return out;
  }, [visitorTimezone]);

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
      body: JSON.stringify({ bookingId, newStartAtIso: selectedStartIso }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(body.error ?? `HTTP ${res.status}`);
      setState("error");
      return;
    }
    await onDone();
    onClose();
  };

  const currentLabel = new Date(currentStartAtIso).toLocaleString(undefined, {
    timeZone: ownerTimezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 60 }}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Reschedule ${visitorName}`}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(40rem, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--sc-admin-surface)",
          borderRadius: "12px",
          padding: "1.5rem",
          zIndex: 70,
          boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "1.1rem" }}>Reschedule {visitorName}</h2>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.25rem" }}
          >
            ×
          </button>
        </div>

        <p style={{ opacity: 0.7, marginBottom: "1rem", fontSize: "0.9rem" }}>
          Currently: <strong>{currentLabel}</strong>{" "}
          <span style={{ opacity: 0.6 }}>({ownerTimezone})</span>
        </p>

        {slots.status === "loading" && <p>Loading available times…</p>}
        {slots.status === "error" && <p style={{ color: "var(--sc-admin-accent)" }}>{slots.message}</p>}

        {slots.status === "ready" && (
          <>
            <section style={{ marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, marginBottom: "0.5rem" }}>Day</h3>
              <DateStrip
                days={days}
                availability={availability}
                selected={selectedDate}
                onSelect={(d) => {
                  setSelectedDate(d);
                  setSelectedStartIso("");
                }}
                timezone={visitorTimezone}
              />
            </section>

            {selectedDate && (
              <section style={{ marginBottom: "1rem" }}>
                <h3 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, marginBottom: "0.5rem" }}>Time</h3>
                <TimeGrid
                  slots={daySlots}
                  selectedStartIso={selectedStartIso}
                  onSelect={(startIso) => setSelectedStartIso(startIso)}
                  timezone={visitorTimezone}
                  ownerTimezone={ownerTimezone}
                />
              </section>
            )}

            <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
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
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: "0.6rem 1.2rem",
                  border: "1px solid var(--sc-admin-border-subtle)",
                  color: "inherit",
                  borderRadius: "999px",
                  background: "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            </div>

            {err && (
              <p role="alert" style={{ color: "var(--sc-admin-accent)", marginTop: "1rem", fontSize: "0.9rem" }}>
                {err}
              </p>
            )}
          </>
        )}
      </div>
    </>
  );
}
