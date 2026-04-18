"use client";

import { useState } from "react";
import Link from "next/link";

type BookingView = {
  startAtIso: string;
  endAtIso: string;
  visitorName: string;
  visitorTimezone: string;
  ownerTimezone: string;
  contactMethod: "whatsapp" | "zoom" | "meet" | "teams";
};

export function CancelConfirm({ token, booking }: { token: string; booking: BookingView }) {
  const [state, setState] = useState<"idle" | "confirming" | "done" | "error">("idle");
  const [err, setErr] = useState<string | null>(null);

  const doCancel = async () => {
    setState("confirming");
    setErr(null);
    const res = await fetch("/api/bookings/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(body.error ?? `HTTP ${res.status}`);
      setState("error");
      return;
    }
    setState("done");
  };

  if (state === "done") {
    return (
      <main style={{ maxWidth: "32rem", margin: "4rem auto", padding: "1.5rem", fontFamily: "inherit" }}>
        <h1 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Your call is cancelled.</h1>
        <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>
          A confirmation email is on its way. The calendar entry will update automatically.
        </p>
        <Link href="/#closing-cta" style={{ color: "inherit", textDecoration: "underline" }}>
          Book a different time →
        </Link>
      </main>
    );
  }

  const start = new Date(booking.startAtIso);
  const visitorLabel = start.toLocaleString(undefined, {
    timeZone: booking.visitorTimezone,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const showOwner = booking.visitorTimezone !== booking.ownerTimezone;
  const ownerLabel = showOwner
    ? start.toLocaleString(undefined, {
        timeZone: booking.ownerTimezone,
        weekday: "short",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : null;

  return (
    <main style={{ maxWidth: "32rem", margin: "4rem auto", padding: "1.5rem", fontFamily: "inherit" }}>
      <h1 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Cancel your call?</h1>
      <p style={{ opacity: 0.7, marginBottom: "1.5rem" }}>
        Hi {booking.visitorName}. Please confirm you want to cancel:
      </p>

      <dl
        style={{
          display: "grid",
          gridTemplateColumns: "max-content 1fr",
          gap: "0.5rem 1.25rem",
          fontSize: "0.95rem",
          marginBottom: "2rem",
        }}
      >
        <dt style={{ opacity: 0.6 }}>When</dt>
        <dd>
          {visitorLabel} <span style={{ opacity: 0.6 }}>({booking.visitorTimezone})</span>
        </dd>
        {showOwner && (
          <>
            <dt style={{ opacity: 0.6 }}>Also</dt>
            <dd style={{ opacity: 0.7 }}>
              {ownerLabel} <span style={{ opacity: 0.6 }}>({booking.ownerTimezone})</span>
            </dd>
          </>
        )}
        <dt style={{ opacity: 0.6 }}>Via</dt>
        <dd style={{ textTransform: "capitalize" }}>{booking.contactMethod}</dd>
      </dl>

      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={doCancel}
          disabled={state === "confirming"}
          style={{
            padding: "0.6rem 1.2rem",
            border: "1px solid #f60",
            color: "#f60",
            borderRadius: "999px",
            background: "transparent",
            cursor: state === "confirming" ? "default" : "pointer",
            fontFamily: "inherit",
          }}
        >
          {state === "confirming" ? "Cancelling…" : "Confirm cancellation"}
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
          Keep my booking
        </Link>
      </div>

      {err && (
        <p role="alert" style={{ color: "#f60", marginTop: "1rem", fontSize: "0.9rem" }}>
          {err}
        </p>
      )}
    </main>
  );
}
