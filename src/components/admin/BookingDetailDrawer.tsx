"use client";

import { useEffect, useState } from "react";
import { RescheduleModal } from "./RescheduleModal";

export type AdminBooking = {
  id: string;
  visitorName: string;
  visitorEmail: string;
  visitorCompany: string | null;
  topic: string;
  contactMethod: "whatsapp" | "zoom" | "meet" | "teams";
  visitorPhone: string | null;
  visitorTimezone: string;
  startAt: string;
  endAt: string;
  status: "confirmed" | "cancelled";
  noShow: boolean;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  booking: AdminBooking | null;
  ownerTimezone: string;
  onClose: () => void;
  onRefresh: () => Promise<void>;
};

export function BookingDetailDrawer({ booking, ownerTimezone, onClose, onRefresh }: Props) {
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [rescheduleOpen, setRescheduleOpen] = useState(false);

  useEffect(() => {
    setNotes(booking?.adminNotes ?? "");
    setErr(null);
  }, [booking]);

  if (!booking) return null;

  const saveNotes = async () => {
    setSaving(true);
    setErr(null);
    const res = await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ adminNotes: notes }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(body.error ?? `HTTP ${res.status}`);
    } else {
      await onRefresh();
    }
    setSaving(false);
  };

  const toggleNoShow = async () => {
    const res = await fetch(`/api/admin/bookings/${booking.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noShow: !booking.noShow }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(body.error ?? `HTTP ${res.status}`);
    } else {
      await onRefresh();
    }
  };

  const cancel = async () => {
    if (!confirm(`Cancel ${booking.visitorName}'s call on ${new Date(booking.startAt).toLocaleString()}? This emails the visitor.`)) return;
    const res = await fetch(`/api/admin/bookings/${booking.id}/cancel`, { method: "POST" });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setErr(body.error ?? `HTTP ${res.status}`);
    } else {
      await onRefresh();
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Booking detail"
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        bottom: 0,
        width: "min(32rem, 100vw)",
        background: "var(--color-background, white)",
        borderLeft: "1px solid rgba(0,0,0,0.15)",
        padding: "1.5rem",
        overflowY: "auto",
        boxShadow: "-12px 0 32px rgba(0,0,0,0.08)",
        zIndex: 50,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem" }}>{booking.visitorName}</h2>
        <button type="button" onClick={onClose} style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "1.25rem" }}>×</button>
      </div>

      <dl style={{ display: "grid", gridTemplateColumns: "max-content 1fr", gap: "0.5rem 1rem", fontSize: "0.9rem", marginBottom: "1.5rem" }}>
        <dt style={{ opacity: 0.6 }}>email</dt>       <dd>{booking.visitorEmail}</dd>
        <dt style={{ opacity: 0.6 }}>company</dt>     <dd>{booking.visitorCompany ?? "—"}</dd>
        <dt style={{ opacity: 0.6 }}>when</dt>        <dd>{new Date(booking.startAt).toLocaleString()} – {new Date(booking.endAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</dd>
        <dt style={{ opacity: 0.6 }}>visitor TZ</dt>  <dd>{booking.visitorTimezone}</dd>
        <dt style={{ opacity: 0.6 }}>via</dt>         <dd>{booking.contactMethod}{booking.visitorPhone ? ` · ${booking.visitorPhone}` : ""}</dd>
        <dt style={{ opacity: 0.6 }}>status</dt>      <dd>{booking.status}{booking.noShow ? " · no-show" : ""}</dd>
        <dt style={{ opacity: 0.6 }}>created</dt>     <dd>{new Date(booking.createdAt).toLocaleString()}</dd>
      </dl>

      <section style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, marginBottom: "0.5rem" }}>Topic</h3>
        <p style={{ whiteSpace: "pre-wrap" }}>{booking.topic}</p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h3 style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.08em", opacity: 0.6, marginBottom: "0.5rem" }}>Admin notes</h3>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={4}
          style={{ width: "100%", padding: "0.5rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "6px", fontFamily: "inherit" }}
        />
        <button
          type="button"
          onClick={saveNotes}
          disabled={saving}
          style={{ marginTop: "0.5rem", padding: "0.4rem 0.9rem", border: "1px solid currentColor", borderRadius: "999px", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
        >
          {saving ? "Saving…" : "Save notes"}
        </button>
      </section>

      {booking.status === "confirmed" && (
        <section style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setRescheduleOpen(true)}
            style={{ padding: "0.4rem 0.9rem", border: "1px solid currentColor", borderRadius: "999px", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
          >
            Reschedule
          </button>
          <button type="button" onClick={toggleNoShow} style={{ padding: "0.4rem 0.9rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "999px", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}>
            {booking.noShow ? "Unmark no-show" : "Mark no-show"}
          </button>
          <button
            type="button"
            onClick={cancel}
            style={{ padding: "0.4rem 0.9rem", border: "1px solid #f60", color: "#f60", borderRadius: "999px", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
          >
            Cancel booking
          </button>
        </section>
      )}

      {err && <p style={{ color: "#f60", marginTop: "1rem", fontSize: "0.85rem" }}>{err}</p>}

      {rescheduleOpen && (
        <RescheduleModal
          bookingId={booking.id}
          visitorName={booking.visitorName}
          visitorTimezone={booking.visitorTimezone}
          ownerTimezone={ownerTimezone}
          currentStartAtIso={booking.startAt}
          onClose={() => setRescheduleOpen(false)}
          onDone={async () => {
            await onRefresh();
          }}
        />
      )}
    </div>
  );
}
