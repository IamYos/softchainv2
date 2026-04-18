"use client";

import { useCallback, useEffect, useState } from "react";
import { BookingDetailDrawer, type AdminBooking } from "./BookingDetailDrawer";
import { RescheduleModal } from "./RescheduleModal";
import s from "./admin.module.css";

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

  useEffect(() => {
    void fetch("/api/admin/bookings/unread", { method: "POST" });
  }, []);

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

  const renderActions = (b: AdminBooking, isUpcoming: boolean) => {
    if (!isUpcoming) return null;
    return (
      <>
        <button type="button" className={s.pill} onClick={() => setRescheduleId(b.id)}>Reschedule</button>
        <button type="button" className={s.pill} onClick={() => void toggleNoShow(b)}>
          {b.noShow ? "Unmark" : "No-show"}
        </button>
        <button type="button" className={s.pill} onClick={() => void copyLink(b)}>
          {copiedId === b.id ? "Copied" : "Copy link"}
        </button>
        <button type="button" className={`${s.pill} ${s.pillDanger}`} onClick={() => void cancelRow(b)}>Cancel</button>
      </>
    );
  };

  return (
    <div>
      <div className={s.tabs} style={{ marginBottom: "1rem" }}>
        {(["upcoming", "past", "cancelled"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`${s.pill} ${tab === t ? s.pillActive : ""}`}
          >
            {t}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <a href="/api/admin/bookings/export" className={s.pill}>Export CSV</a>
      </div>

      {loading && <p className={s.muted}>Loading…</p>}
      {error && <p style={{ color: "var(--sc-admin-accent)" }}>{error}</p>}
      {!loading && !error && bookings.length === 0 && (
        <div className={s.empty}>No bookings.</div>
      )}

      {bookings.length > 0 && (
        <>
          {/* Desktop / tablet table */}
          <div className={s.tableWrap}>
            <table className={s.table}>
              <thead>
                <tr>
                  <th>when</th>
                  <th>name</th>
                  <th>email</th>
                  <th>company</th>
                  <th>via</th>
                  <th>phone</th>
                  <th>topic</th>
                  <th>status</th>
                  <th style={{ textAlign: "right" }}>actions</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => {
                  const isUpcoming = tab === "upcoming" && b.status === "confirmed";
                  return (
                    <tr key={b.id} onClick={() => setOpenId(b.id)}>
                      <td>
                        <div>{formatInTz(b.startAt, ownerTimezone)}</div>
                        {b.visitorTimezone !== ownerTimezone && (
                          <div style={{ fontSize: "0.7rem" }} className={s.dim}>
                            {formatInTz(b.startAt, b.visitorTimezone)} visitor
                          </div>
                        )}
                      </td>
                      <td>{b.visitorName}</td>
                      <td className={s.muted}>{b.visitorEmail}</td>
                      <td className={s.muted}>{b.visitorCompany ?? "—"}</td>
                      <td>{b.contactMethod}</td>
                      <td className={s.muted}>{b.visitorPhone ?? "—"}</td>
                      <td className={s.muted}>
                        {b.topic.length > 48 ? `${b.topic.slice(0, 48)}…` : b.topic}
                      </td>
                      <td>
                        {b.status}
                        {b.noShow ? " · no-show" : ""}
                      </td>
                      <td style={{ textAlign: "right", whiteSpace: "nowrap" }} onClick={stopRowOpen}>
                        <div style={{ display: "inline-flex", gap: "0.35rem", flexWrap: "wrap", justifyContent: "flex-end" }}>
                          {renderActions(b, isUpcoming)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className={s.cardList}>
            {bookings.map((b) => {
              const isUpcoming = tab === "upcoming" && b.status === "confirmed";
              return (
                <article
                  key={b.id}
                  className={s.bookingCard}
                  onClick={() => setOpenId(b.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setOpenId(b.id);
                    }
                  }}
                >
                  <div className={s.bookingCardHead}>
                    <div>
                      <div className={s.bookingCardName}>{b.visitorName}</div>
                      <div className={s.muted} style={{ fontSize: "0.8rem" }}>
                        {formatInTz(b.startAt, ownerTimezone)}
                        {b.visitorTimezone !== ownerTimezone && (
                          <> · <span className={s.dim}>{formatInTz(b.startAt, b.visitorTimezone)}</span></>
                        )}
                      </div>
                    </div>
                    <span style={{ fontSize: "0.75rem" }} className={s.dim}>
                      {b.status}{b.noShow ? " · no-show" : ""}
                    </span>
                  </div>

                  <dl className={s.bookingCardMeta}>
                    <dt>email</dt><dd>{b.visitorEmail}</dd>
                    <dt>company</dt><dd>{b.visitorCompany ?? "—"}</dd>
                    <dt>via</dt><dd>{b.contactMethod}{b.visitorPhone ? ` · ${b.visitorPhone}` : ""}</dd>
                    <dt>topic</dt><dd style={{ whiteSpace: "pre-wrap" }}>{b.topic}</dd>
                  </dl>

                  {isUpcoming && (
                    <div className={s.bookingCardActions} onClick={stopRowOpen}>
                      {renderActions(b, true)}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </>
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
