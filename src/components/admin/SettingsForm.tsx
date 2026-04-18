"use client";

import { useState } from "react";
import type { SettingsDoc } from "@/lib/booking/types";

type Props = { initial: SettingsDoc };

const DAY_LABELS: Array<{ key: keyof SettingsDoc["defaultHours"]; label: string }> = [
  { key: "mon", label: "Mon" },
  { key: "tue", label: "Tue" },
  { key: "wed", label: "Wed" },
  { key: "thu", label: "Thu" },
  { key: "fri", label: "Fri" },
  { key: "sat", label: "Sat" },
  { key: "sun", label: "Sun" },
];

export function SettingsForm({ initial }: Props) {
  const [settings, setSettings] = useState(initial);
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

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
