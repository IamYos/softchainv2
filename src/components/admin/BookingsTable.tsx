"use client";

import { useCallback, useEffect, useState } from "react";
import { BookingDetailDrawer, type AdminBooking } from "./BookingDetailDrawer";
import { RescheduleModal } from "./RescheduleModal";

type Tab = "upcoming" | "past" | "cancelled";
type ContactLinks = { zoom: string; meet: string; teams: string; whatsappNumber: string };

type Props = {
  ownerTimezone: string;
  contactLinks: ContactLinks;
};

function formatInTz(iso: string, tz: string): string {
  return new Date(iso).toLocaleString(undefined, {
    timeZone: tz,
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function meetingLinkFor(links: ContactLinks, method: AdminBooking["contactMethod"]): string {
  if (method === "zoom") return links.zoom;
  if (method === "meet") return links.meet;
  if (method === "teams") return links.teams;
  return "";
}

const AUTO_REFRESH_MS = 60_000;

export function BookingsTable({ ownerTimezone, contactLinks }: Props) {
  const [tab, setTab] = useState<Tab>("upcoming");
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [rescheduleId, setRescheduleId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  useEffect(() => {
    void load(tab);
  }, [tab, load]);

  // Mark bookings as seen when the view mounts (any tab).
  useEffect(() => {
    void fetch("/api/admin/bookings/unread", { method: "POST" });
  }, []);

  // Auto-refresh: every 60s and when the tab regains focus.
  useEffect(() => {
    const interval = window.setInterval(() => void load(tab), AUTO_REFRESH_MS);
    const onVisibility = () => {
      if (document.visibilityState === "visible") void load(tab);
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onVisibility);
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onVisibility);
    };
  }, [tab, load]);

  const openBooking = bookings.find((b) => b.id === openId) ?? null;
  const reschBooking = bookings.find((b) => b.id === rescheduleId) ?? null;

  const stopRowOpen = (e: React.MouseEvent) => e.stopPropagation();

  const cancelRow = async (b: AdminBooking) => {
    if (!confirm(`Cancel ${b.visitorName}'s call on ${formatInTz(b.startAt, ownerTimezone)}? This emails the visitor.`)) return;
    const res = await fetch(`/api/admin/bookings/${b.id}/cancel`, { method: "POST" });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      alert(body.error ?? `HTTP ${res.status}`);
      return;
    }
    await load(tab);
  };

  const toggleNoShow = async (b: AdminBooking) => {
    const res = await fetch(`/api/admin/bookings/${b.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noShow: !b.noShow }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      alert(body.error ?? `HTTP ${res.status}`);
      return;
    }
    await load(tab);
  };

  const copyLink = async (b: AdminBooking) => {
    const link = meetingLinkFor(contactLinks, b.contactMethod);
    if (!link) {
      alert(
        b.contactMethod === "whatsapp"
          ? `WhatsApp ${b.visitorName} at ${b.visitorPhone ?? "(no phone)"}`
          : "No meeting link configured for this method. Set one in Settings."
      );
      return;
    }
    try {
      await navigator.clipboard.writeText(link);
      setCopiedId(b.id);
      window.setTimeout(() => setCopiedId(null), 1500);
    } catch {
      alert(link);
    }
  };

  return (
    <div>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", alignItems: "center", flexWrap: "wrap" }}>
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
          style={{
            padding: "0.35rem 0.8rem",
            border: "1px solid rgba(0,0,0,0.15)",
            borderRadius: "999px",
            textDecoration: "none",
            color: "inherit",
            fontSize: "0.85rem",
          }}
        >
          Export CSV
        </a>
      </div>

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "#f60" }}>{error}</p>}
      {!loading && !error && bookings.length === 0 && <p style={{ opacity: 0.6 }}>No bookings.</p>}

      {bookings.length > 0 && (
        <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "960px", fontSize: "0.9rem" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                <th style={{ padding: "0.5rem" }}>when</th>
                <th style={{ padding: "0.5rem" }}>name</th>
                <th style={{ padding: "0.5rem" }}>email</th>
                <th style={{ padding: "0.5rem" }}>company</th>
                <th style={{ padding: "0.5rem" }}>via</th>
                <th style={{ padding: "0.5rem" }}>phone</th>
                <th style={{ padding: "0.5rem" }}>topic</th>
                <th style={{ padding: "0.5rem" }}>status</th>
                <th style={{ padding: "0.5rem", textAlign: "right" }}>actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => {
                const isUpcoming = tab === "upcoming" && b.status === "confirmed";
                return (
                  <tr
                    key={b.id}
                    onClick={() => setOpenId(b.id)}
                    style={{ cursor: "pointer", borderBottom: "1px solid rgba(0,0,0,0.05)" }}
                  >
                    <td style={{ padding: "0.5rem" }}>
                      <div>{formatInTz(b.startAt, ownerTimezone)}</div>
                      {b.visitorTimezone !== ownerTimezone && (
                        <div style={{ fontSize: "0.75rem", opacity: 0.5 }}>
                          {formatInTz(b.startAt, b.visitorTimezone)} visitor
                        </div>
                      )}
                    </td>
                    <td style={{ padding: "0.5rem" }}>{b.visitorName}</td>
                    <td style={{ padding: "0.5rem", opacity: 0.8 }}>{b.visitorEmail}</td>
                    <td style={{ padding: "0.5rem", opacity: 0.7 }}>{b.visitorCompany ?? "—"}</td>
                    <td style={{ padding: "0.5rem" }}>{b.contactMethod}</td>
                    <td style={{ padding: "0.5rem", opacity: 0.7 }}>{b.visitorPhone ?? "—"}</td>
                    <td style={{ padding: "0.5rem", opacity: 0.7 }}>
                      {b.topic.length > 48 ? `${b.topic.slice(0, 48)}…` : b.topic}
                    </td>
                    <td style={{ padding: "0.5rem" }}>
                      {b.status}
                      {b.noShow ? " · no-show" : ""}
                    </td>
                    <td style={{ padding: "0.5rem", textAlign: "right", whiteSpace: "nowrap" }} onClick={stopRowOpen}>
                      {isUpcoming && (
                        <>
                          <button
                            type="button"
                            onClick={() => setRescheduleId(b.id)}
                            style={actionBtnStyle}
                          >
                            Reschedule
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleNoShow(b)}
                            style={actionBtnStyle}
                          >
                            {b.noShow ? "Unmark" : "No-show"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void copyLink(b)}
                            style={actionBtnStyle}
                          >
                            {copiedId === b.id ? "Copied" : "Copy link"}
                          </button>
                          <button
                            type="button"
                            onClick={() => void cancelRow(b)}
                            style={{ ...actionBtnStyle, borderColor: "#f60", color: "#f60" }}
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <BookingDetailDrawer
        booking={openBooking}
        ownerTimezone={ownerTimezone}
        onClose={() => setOpenId(null)}
        onRefresh={() => load(tab)}
      />

      {reschBooking && (
        <RescheduleModal
          bookingId={reschBooking.id}
          visitorName={reschBooking.visitorName}
          visitorTimezone={reschBooking.visitorTimezone}
          ownerTimezone={ownerTimezone}
          currentStartAtIso={reschBooking.startAt}
          onClose={() => setRescheduleId(null)}
          onDone={async () => {
            await load(tab);
          }}
        />
      )}
    </div>
  );
}

const actionBtnStyle: React.CSSProperties = {
  padding: "0.25rem 0.6rem",
  margin: "0 0 0 0.25rem",
  border: "1px solid rgba(0,0,0,0.15)",
  background: "transparent",
  borderRadius: "999px",
  cursor: "pointer",
  fontFamily: "inherit",
  fontSize: "0.75rem",
};
