"use client";

import { useCallback, useEffect, useState } from "react";
import { BookingDetailDrawer, type AdminBooking } from "./BookingDetailDrawer";

type Tab = "upcoming" | "past" | "cancelled";

export function BookingsTable() {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async (t: Tab) => {
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/admin/bookings?tab=${t}`);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
      setLoading(false);
      return;
    }
    const body = (await res.json()) as { bookings: AdminBooking[] };
    setBookings(body.bookings);
    setLoading(false);
  }, []);

  useEffect(() => { void load(tab); }, [tab, load]);

  // Mark bookings as seen when the view mounts (any tab).
  useEffect(() => {
    void fetch("/api/admin/bookings/unread", { method: "POST" });
  }, []);

  const openBooking = bookings.find((b) => b.id === openId) ?? null;

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center" }}>
        {(["upcoming", "past", "cancelled"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            style={{
              padding: "0.35rem 0.8rem",
              border: `1px solid ${tab === t ? "currentColor" : "rgba(0,0,0,0.15)"}`,
              background: tab === t ? "rgba(0,0,0,0.08)" : "transparent",
              borderRadius: "999px",
              cursor: "pointer",
              fontFamily: "inherit",
              fontSize: "0.85rem",
            }}
          >
            {t}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <a
          href="/api/admin/bookings/export"
          style={{ padding: "0.35rem 0.8rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "999px", textDecoration: "none", color: "inherit", fontSize: "0.85rem" }}
        >
          Export CSV
        </a>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "#f60" }}>{error}</p>}
      {!loading && !error && bookings.length === 0 && <p style={{ opacity: 0.6 }}>No bookings.</p>}

      {bookings.length > 0 && (
        <table style={{ borderCollapse: "collapse", width: "100%", fontSize: "0.9rem" }}>
          <thead>
            <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
              <th style={{ padding: "0.5rem" }}>when</th>
              <th style={{ padding: "0.5rem" }}>name</th>
              <th style={{ padding: "0.5rem" }}>email</th>
              <th style={{ padding: "0.5rem" }}>via</th>
              <th style={{ padding: "0.5rem" }}>topic</th>
              <th style={{ padding: "0.5rem" }}>status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} onClick={() => setOpenId(b.id)} style={{ cursor: "pointer", borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                <td style={{ padding: "0.5rem" }}>{new Date(b.startAt).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</td>
                <td style={{ padding: "0.5rem" }}>{b.visitorName}</td>
                <td style={{ padding: "0.5rem", opacity: 0.8 }}>{b.visitorEmail}</td>
                <td style={{ padding: "0.5rem" }}>{b.contactMethod}</td>
                <td style={{ padding: "0.5rem", opacity: 0.7 }}>{b.topic.length > 48 ? `${b.topic.slice(0, 48)}…` : b.topic}</td>
                <td style={{ padding: "0.5rem" }}>{b.status}{b.noShow ? " · no-show" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <BookingDetailDrawer
        booking={openBooking}
        onClose={() => setOpenId(null)}
        onRefresh={() => load(tab)}
      />
    </div>
  );
}
