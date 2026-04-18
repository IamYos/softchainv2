"use client";

import { useEffect, useState } from "react";
import type { SettingsDoc } from "@/lib/booking/types";
import { TIMEZONE_OPTIONS } from "@/components/booking/timezoneOptions";
import s from "./admin.module.css";

type ResendStatus = {
  domain: string | null;
  status: "pending" | "verified" | "failed" | "temporary_failure" | "not_started" | "not_found" | "unknown";
  reason?: string;
};

type Props = { initial: SettingsDoc; siteUrl: string };

const DAY_LABELS: Array<{ key: keyof SettingsDoc["defaultHours"]; label: string }> = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

const CONTACT_KEY_LABELS: Record<string, string> = {
  zoom: "Zoom",
  meet: "Google Meet",
  teams: "Microsoft Teams",
  whatsappNumber: "WhatsApp number",
};

export function SettingsForm({ initial, siteUrl }: Props) {
  const [settings, setSettings] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [feedCopied, setFeedCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);
  const [resendStatus, setResendStatus] = useState<ResendStatus | null>(null);

  useEffect(() => {
    void fetch("/api/admin/resend-status")
      .then((r) => (r.ok ? r.json() : null))
      .then((body: ResendStatus | null) => setResendStatus(body))
      .catch(() => setResendStatus(null));
  }, []);

  const feedUrl = `${siteUrl.replace(/\/$/, "")}/api/calendar/${settings.icsFeedSecret}`;

  const copyFeed = async () => {
    try {
      await navigator.clipboard.writeText(feedUrl);
      setFeedCopied(true);
      window.setTimeout(() => setFeedCopied(false), 1500);
    } catch {
      window.prompt("Copy this URL:", feedUrl);
    }
  };

  const regenerate = async () => {
    if (!confirm("Regenerate the feed URL? The old link will stop working.")) return;
    setRegenerating(true);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ regenerateIcsFeedSecret: true }),
    });
    setRegenerating(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      setMessage(body.error ?? `HTTP ${res.status}`);
      return;
    }
    const updated = (await res.json()) as SettingsDoc;
    setSettings(updated);
    setStatus("saved");
    setMessage("New feed URL generated.");
  };

  const save = async () => {
    setStatus("saving");
    setMessage(null);
    const res = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contactLinks: settings.contactLinks,
        rules: settings.rules,
        defaultHours: settings.defaultHours,
        ownerTimezone: settings.ownerTimezone,
      }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setStatus("error");
      setMessage(body.error ?? `HTTP ${res.status}`);
      return;
    }
    const updated = (await res.json()) as SettingsDoc;
    setSettings(updated);
    setStatus("saved");
    setMessage("Saved.");
  };

  const labelStyle: React.CSSProperties = { display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.75rem" };
  const labelTextStyle: React.CSSProperties = { fontSize: "0.75rem", letterSpacing: "0.05em", textTransform: "uppercase", color: "var(--sc-admin-muted)" };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "44rem" }}>
      <section className={s.card}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Email sending</h2>
        {resendStatus ? (
          <p style={{ fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem", margin: 0 }}>
            <span
              aria-hidden="true"
              style={{
                display: "inline-block",
                width: "0.65rem",
                height: "0.65rem",
                borderRadius: "50%",
                background:
                  resendStatus.status === "verified" ? "#2da44e"
                  : resendStatus.status === "pending" || resendStatus.status === "temporary_failure" ? "#d4a72c"
                  : resendStatus.status === "failed" || resendStatus.status === "not_found" ? "var(--sc-admin-accent)"
                  : "#999",
              }}
            />
            <span>
              {resendStatus.domain ? `${resendStatus.domain} — ` : ""}
              <strong>{resendStatus.status.replace(/_/g, " ")}</strong>
            </span>
          </p>
        ) : (
          <p className={s.muted} style={{ fontSize: "0.9rem", margin: 0 }}>Checking Resend domain status…</p>
        )}
      </section>

      <section className={s.card}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Owner timezone</h2>
        <label style={labelStyle}>
          <span style={labelTextStyle}>timezone (IANA)</span>
          <select
            value={settings.ownerTimezone}
            onChange={(e) => setSettings((ss) => ({ ...ss, ownerTimezone: e.target.value }))}
            className={s.select}
          >
            {TIMEZONE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <p className={s.muted} style={{ fontSize: "0.8rem", margin: 0 }}>All weekly default hours are interpreted in this timezone.</p>
      </section>

      <section className={s.card}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Contact links</h2>
        {(["zoom", "meet", "teams", "whatsappNumber"] as const).map((k) => (
          <label key={k} style={labelStyle}>
            <span style={labelTextStyle}>{CONTACT_KEY_LABELS[k] ?? k}</span>
            <input
              value={settings.contactLinks[k]}
              onChange={(e) =>
                setSettings((ss) => ({ ...ss, contactLinks: { ...ss.contactLinks, [k]: e.target.value } }))
              }
              className={s.input}
              placeholder={k === "whatsappNumber" ? "+971…" : "https://…"}
            />
          </label>
        ))}
      </section>

      <section className={s.card}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Weekly default hours</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {DAY_LABELS.map(({ key, label }) => {
            const val = settings.defaultHours[key];
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                <label style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", width: "4rem" }}>
                  <input
                    type="checkbox"
                    checked={val !== null}
                    onChange={(e) =>
                      setSettings((ss) => ({
                        ...ss,
                        defaultHours: {
                          ...ss.defaultHours,
                          [key]: e.target.checked ? { start: "09:00", end: "17:00" } : null,
                        },
                      }))
                    }
                  />
                  <span style={{ fontSize: "0.85rem" }}>{label}</span>
                </label>
                <input
                  type="time"
                  disabled={!val}
                  value={val?.start ?? ""}
                  onChange={(e) =>
                    setSettings((ss) => ({
                      ...ss,
                      defaultHours: {
                        ...ss.defaultHours,
                        [key]: { start: e.target.value, end: ss.defaultHours[key]?.end ?? "17:00" },
                      },
                    }))
                  }
                  className={s.input}
                  style={{ width: "7rem", padding: "0.35rem 0.5rem" }}
                />
                <span className={s.muted}>–</span>
                <input
                  type="time"
                  disabled={!val}
                  value={val?.end ?? ""}
                  onChange={(e) =>
                    setSettings((ss) => ({
                      ...ss,
                      defaultHours: {
                        ...ss.defaultHours,
                        [key]: { start: ss.defaultHours[key]?.start ?? "09:00", end: e.target.value },
                      },
                    }))
                  }
                  className={s.input}
                  style={{ width: "7rem", padding: "0.35rem 0.5rem" }}
                />
              </div>
            );
          })}
        </div>
      </section>

      <section className={s.card}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>Rules</h2>
        <label style={labelStyle}>
          <span style={labelTextStyle}>min notice hours</span>
          <input
            type="number"
            min={0}
            max={168}
            value={settings.rules.minNoticeHours}
            onChange={(e) =>
              setSettings((ss) => ({ ...ss, rules: { ...ss.rules, minNoticeHours: Number(e.target.value) } }))
            }
            className={s.input}
            style={{ width: "8rem" }}
          />
        </label>
        <label style={labelStyle}>
          <span style={labelTextStyle}>max lookahead days</span>
          <input
            type="number"
            min={1}
            max={180}
            value={settings.rules.maxLookaheadDays}
            onChange={(e) =>
              setSettings((ss) => ({ ...ss, rules: { ...ss.rules, maxLookaheadDays: Number(e.target.value) } }))
            }
            className={s.input}
            style={{ width: "8rem" }}
          />
        </label>
        <p className={s.muted} style={{ fontSize: "0.8rem", margin: 0 }}>Slot duration is fixed at 30 minutes.</p>
      </section>

      <section className={s.card}>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>ICS calendar feed</h2>
        <p className={s.muted} style={{ fontSize: "0.85rem", marginBottom: "0.75rem" }}>
          Subscribe in Google Calendar / Apple Calendar so new bookings appear automatically.
          Anyone with this URL can read your schedule — regenerate if it leaks.
        </p>
        <code
          style={{
            display: "block",
            padding: "0.6rem 0.75rem",
            background: "var(--sc-admin-bg)",
            border: "1px solid var(--sc-admin-border)",
            borderRadius: "6px",
            fontSize: "0.8rem",
            wordBreak: "break-all",
            marginBottom: "0.75rem",
          }}
        >
          {feedUrl}
        </code>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button type="button" onClick={copyFeed} className={s.pill}>
            {feedCopied ? "Copied" : "Copy"}
          </button>
          <button type="button" onClick={regenerate} disabled={regenerating} className={`${s.pill} ${s.pillDanger}`}>
            {regenerating ? "Regenerating…" : "Regenerate"}
          </button>
        </div>
      </section>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={save}
          disabled={status === "saving"}
          className={`${s.pill} ${s.pillActive}`}
          style={{ padding: "0.6rem 1.4rem" }}
        >
          {status === "saving" ? "Saving…" : "Save changes"}
        </button>
        {message && (
          <span className={s.muted} style={{ fontSize: "0.9rem", color: status === "error" ? "var(--sc-admin-accent)" : undefined }}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
