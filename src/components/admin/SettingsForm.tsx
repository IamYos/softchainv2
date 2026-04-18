"use client";

import { useEffect, useState } from "react";
import type { SettingsDoc } from "@/lib/booking/types";
import { TIMEZONE_OPTIONS } from "@/components/booking/timezoneOptions";

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "44rem" }}>
      <section>
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
                  : resendStatus.status === "failed" || resendStatus.status === "not_found" ? "#f60"
                  : "#999",
              }}
            />
            <span>
              {resendStatus.domain ? `${resendStatus.domain} — ` : ""}
              <strong>{resendStatus.status.replace(/_/g, " ")}</strong>
            </span>
          </p>
        ) : (
          <p style={{ fontSize: "0.9rem", opacity: 0.6, margin: 0 }}>Checking Resend domain status…</p>
        )}
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Owner timezone</h2>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.5rem" }}>
          <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>timezone (IANA)</span>
          <select
            value={settings.ownerTimezone}
            onChange={(e) => setSettings((s) => ({ ...s, ownerTimezone: e.target.value }))}
            style={{ padding: "0.5rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "6px", fontFamily: "inherit" }}
          >
            {TIMEZONE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </label>
        <p style={{ fontSize: "0.8rem", opacity: 0.6 }}>All weekly default hours are interpreted in this timezone.</p>
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Contact links</h2>
        {(["zoom", "meet", "teams", "whatsappNumber"] as const).map((k) => (
          <label key={k} style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.75rem" }}>
            <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>{k}</span>
            <input
              value={settings.contactLinks[k]}
              onChange={(e) =>
                setSettings((s) => ({ ...s, contactLinks: { ...s.contactLinks, [k]: e.target.value } }))
              }
              style={{ padding: "0.5rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "6px", fontFamily: "inherit" }}
            />
          </label>
        ))}
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Weekly default hours (in ownerTimezone)</h2>
        {DAY_LABELS.map(({ key, label }) => {
          const val = settings.defaultHours[key];
          return (
            <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
              <label style={{ width: "3rem" }}>
                <input
                  type="checkbox"
                  checked={val !== null}
                  onChange={(e) =>
                    setSettings((s) => ({
                      ...s,
                      defaultHours: {
                        ...s.defaultHours,
                        [key]: e.target.checked ? { start: "09:00", end: "17:00" } : null,
                      },
                    }))
                  }
                />{" "}
                {label}
              </label>
              <input
                type="time"
                disabled={!val}
                value={val?.start ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    defaultHours: {
                      ...s.defaultHours,
                      [key]: { start: e.target.value, end: s.defaultHours[key]?.end ?? "17:00" },
                    },
                  }))
                }
              />
              <span>–</span>
              <input
                type="time"
                disabled={!val}
                value={val?.end ?? ""}
                onChange={(e) =>
                  setSettings((s) => ({
                    ...s,
                    defaultHours: {
                      ...s.defaultHours,
                      [key]: { start: s.defaultHours[key]?.start ?? "09:00", end: e.target.value },
                    },
                  }))
                }
              />
            </div>
          );
        })}
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Rules</h2>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>min notice hours</span>
          <input
            type="number"
            min={0}
            max={168}
            value={settings.rules.minNoticeHours}
            onChange={(e) =>
              setSettings((s) => ({ ...s, rules: { ...s.rules, minNoticeHours: Number(e.target.value) } }))
            }
            style={{ padding: "0.5rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "6px", width: "8rem" }}
          />
        </label>
        <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", marginBottom: "0.75rem" }}>
          <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>max lookahead days</span>
          <input
            type="number"
            min={1}
            max={180}
            value={settings.rules.maxLookaheadDays}
            onChange={(e) =>
              setSettings((s) => ({ ...s, rules: { ...s.rules, maxLookaheadDays: Number(e.target.value) } }))
            }
            style={{ padding: "0.5rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "6px", width: "8rem" }}
          />
        </label>
        <p style={{ opacity: 0.5, fontSize: "0.85rem" }}>Slot duration is fixed at 30 minutes.</p>
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>ICS calendar feed</h2>
        <p style={{ fontSize: "0.85rem", opacity: 0.7, marginBottom: "0.75rem" }}>
          Subscribe in Google Calendar / Apple Calendar so new bookings appear automatically.
          Anyone with this URL can read your schedule — regenerate if it leaks.
        </p>
        <code
          style={{
            display: "block",
            padding: "0.6rem 0.75rem",
            background: "rgba(0,0,0,0.04)",
            borderRadius: "6px",
            fontSize: "0.8rem",
            wordBreak: "break-all",
            marginBottom: "0.5rem",
          }}
        >
          {feedUrl}
        </code>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={copyFeed}
            style={{ padding: "0.35rem 0.9rem", border: "1px solid rgba(0,0,0,0.2)", borderRadius: "999px", background: "transparent", cursor: "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}
          >
            {feedCopied ? "Copied" : "Copy"}
          </button>
          <button
            type="button"
            onClick={regenerate}
            disabled={regenerating}
            style={{ padding: "0.35rem 0.9rem", border: "1px solid #f60", color: "#f60", borderRadius: "999px", background: "transparent", cursor: regenerating ? "default" : "pointer", fontFamily: "inherit", fontSize: "0.85rem" }}
          >
            {regenerating ? "Regenerating…" : "Regenerate"}
          </button>
        </div>
      </section>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
        <button
          type="button"
          onClick={save}
          disabled={status === "saving"}
          style={{
            padding: "0.6rem 1.25rem",
            border: "1px solid currentColor",
            borderRadius: "999px",
            background: "transparent",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {message && (
          <span style={{ opacity: 0.7, fontSize: "0.9rem", color: status === "error" ? "#f60" : "inherit" }}>
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
