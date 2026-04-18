"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { AvailabilityException } from "@/lib/booking/types";
import { useFocusTrap } from "./useFocusTrap";

type ExceptionRow = AvailabilityException & { id: string };

type Props = {
  exceptions: ExceptionRow[];
  ownerTimezone: string;
  onAdd: (input: {
    type: "block" | "extra";
    date: string;
    startTime?: string;
    endTime?: string;
    note?: string;
  }) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
};

function isoFromParts(y: number, m: number, d: number): string {
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function todayIsoInTz(tz: string): string {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  return parts; // en-CA yields YYYY-MM-DD
}

function daysInMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

function monthLabel(y: number, m: number): string {
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

// Which ISO weekday Monday=0…Sunday=6 is the 1st of the month? Using UTC noon
// to avoid timezone edge cases.
function firstWeekdayOffset(y: number, m: number): number {
  const first = new Date(Date.UTC(y, m - 1, 1, 12, 0, 0));
  const dow = first.getUTCDay(); // 0 = Sun
  return (dow + 6) % 7; // Mon-first
}

type DayCell = { iso: string; day: number } | null;

function buildMonth(y: number, m: number): DayCell[] {
  const offset = firstWeekdayOffset(y, m);
  const days = daysInMonth(y, m);
  const cells: DayCell[] = Array(offset).fill(null);
  for (let d = 1; d <= days; d++) cells.push({ iso: isoFromParts(y, m, d), day: d });
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function AvailabilityCalendar({ exceptions, ownerTimezone, onAdd, onRemove }: Props) {
  const today = todayIsoInTz(ownerTimezone);
  const [y, m] = today.split("-").map(Number);
  const monthsToShow = [
    { year: y, month: m },
    { year: m === 12 ? y + 1 : y, month: m === 12 ? 1 : m + 1 },
  ];

  // Group exceptions by ISO date.
  const byDate = useMemo(() => {
    const map: Record<string, ExceptionRow[]> = {};
    for (const e of exceptions) (map[e.date] ??= []).push(e);
    return map;
  }, [exceptions]);

  const [openDate, setOpenDate] = useState<string | null>(null);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
          gap: "1.5rem",
        }}
      >
        {monthsToShow.map(({ year, month }) => {
          const cells = buildMonth(year, month);
          return (
            <div key={`${year}-${month}`}>
              <h3 style={{ fontSize: "0.95rem", marginBottom: "0.5rem" }}>
                {monthLabel(year, month)}
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, 1fr)",
                  gap: "0.25rem",
                  fontSize: "0.8rem",
                }}
              >
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} style={{ opacity: 0.5, textAlign: "center", fontSize: "0.7rem", padding: "0.25rem 0" }}>
                    {d}
                  </div>
                ))}
                {cells.map((cell, i) => {
                  if (!cell) return <div key={i} />;
                  const rows = byDate[cell.iso] ?? [];
                  const hasBlock = rows.some((r) => r.type === "block");
                  const hasExtra = rows.some((r) => r.type === "extra");
                  const isPast = cell.iso < today;
                  return (
                    <button
                      key={cell.iso}
                      type="button"
                      onClick={() => setOpenDate(cell.iso)}
                      disabled={isPast}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "0.45rem 0",
                        border: "1px solid rgba(0,0,0,0.08)",
                        borderRadius: "6px",
                        background: "transparent",
                        cursor: isPast ? "default" : "pointer",
                        opacity: isPast ? 0.35 : 1,
                        fontFamily: "inherit",
                        lineHeight: 1.1,
                        minHeight: "2.4rem",
                      }}
                    >
                      <span style={{ fontSize: "0.85rem" }}>{cell.day}</span>
                      <span style={{ fontSize: "0.65rem", height: "0.75rem", display: "flex", gap: "0.15rem" }}>
                        {hasBlock && <span style={{ color: "#f60" }}>–</span>}
                        {hasExtra && <span style={{ color: "#2da44e" }}>+</span>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ fontSize: "0.75rem", opacity: 0.5, marginTop: "1rem", display: "flex", gap: "1rem" }}>
        <span><span style={{ color: "#f60" }}>–</span> blocked</span>
        <span><span style={{ color: "#2da44e" }}>+</span> extra window</span>
      </p>

      {openDate && (
        <DayPopover
          date={openDate}
          existing={byDate[openDate] ?? []}
          onClose={() => setOpenDate(null)}
          onAdd={onAdd}
          onRemove={onRemove}
        />
      )}
    </div>
  );
}

function DayPopover({
  date,
  existing,
  onClose,
  onAdd,
  onRemove,
}: {
  date: string;
  existing: ExceptionRow[];
  onClose: () => void;
  onAdd: Props["onAdd"];
  onRemove: Props["onRemove"];
}) {
  const [kind, setKind] = useState<"block-day" | "block-range" | "extra">("block-day");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, true, onClose);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      if (kind === "block-day") {
        await onAdd({ type: "block", date, note: note || undefined });
      } else if (kind === "block-range") {
        if (!startTime || !endTime) throw new Error("Pick a start + end time");
        await onAdd({ type: "block", date, startTime, endTime, note: note || undefined });
      } else {
        if (!startTime || !endTime) throw new Error("Pick a start + end time");
        await onAdd({ type: "extra", date, startTime, endTime, note: note || undefined });
      }
      setStartTime("");
      setEndTime("");
      setNote("");
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const dateLabel = new Date(`${date}T12:00:00Z`).toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 60 }}
      />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Exceptions for ${dateLabel}`}
        tabIndex={-1}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(28rem, 95vw)",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "var(--sc-admin-surface)",
          borderRadius: "12px",
          padding: "1.25rem",
          zIndex: 70,
          boxShadow: "0 24px 60px rgba(0,0,0,0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "1rem" }}>{dateLabel}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.25rem" }}
          >
            ×
          </button>
        </div>

        {existing.length > 0 && (
          <section style={{ marginBottom: "1rem" }}>
            <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, marginBottom: "0.4rem" }}>
              Existing
            </h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, fontSize: "0.85rem" }}>
              {existing.map((e) => (
                <li
                  key={e.id}
                  style={{ display: "flex", justifyContent: "space-between", padding: "0.25rem 0", borderBottom: "1px dashed rgba(0,0,0,0.08)" }}
                >
                  <span>
                    {e.type === "block" ? "Block " : "Extra "}
                    {e.startTime && e.endTime ? `${e.startTime}–${e.endTime}` : "(all day)"}
                    {e.note ? ` · ${e.note}` : ""}
                  </span>
                  <button
                    type="button"
                    onClick={() => void onRemove(e.id)}
                    style={{ border: "none", background: "transparent", cursor: "pointer", fontSize: "0.75rem", opacity: 0.7 }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h4 style={{ fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, marginBottom: "0.4rem" }}>
            Add an exception
          </h4>
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem", flexWrap: "wrap" }}>
            {(["block-day", "block-range", "extra"] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                style={{
                  padding: "0.3rem 0.7rem",
                  border: `1px solid ${kind === k ? "currentColor" : "rgba(0,0,0,0.15)"}`,
                  borderRadius: "999px",
                  background: kind === k ? "rgba(0,0,0,0.05)" : "transparent",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  fontSize: "0.8rem",
                }}
              >
                {k === "block-day" ? "Block whole day" : k === "block-range" ? "Block a range" : "Extra window"}
              </button>
            ))}
          </div>

          {kind !== "block-day" && (
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                aria-label="Start time"
                style={{ padding: "0.4rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "6px", flex: 1 }}
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                aria-label="End time"
                style={{ padding: "0.4rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "6px", flex: 1 }}
              />
            </div>
          )}

          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (optional)"
            style={{ width: "100%", padding: "0.4rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "6px", marginBottom: "0.5rem" }}
          />

          <button
            type="button"
            onClick={submit}
            disabled={busy}
            style={{
              padding: "0.45rem 1rem",
              border: "1px solid currentColor",
              borderRadius: "999px",
              background: "transparent",
              cursor: busy ? "default" : "pointer",
              fontFamily: "inherit",
            }}
          >
            {busy ? "Saving…" : "Add exception"}
          </button>
          {err && <p role="alert" style={{ color: "#f60", marginTop: "0.5rem", fontSize: "0.85rem" }}>{err}</p>}
        </section>
      </div>
    </>
  );
}
