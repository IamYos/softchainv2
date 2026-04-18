"use client";

import { useEffect, useState } from "react";
import type { AvailabilityException } from "@/lib/booking/types";

type ExceptionRow = AvailabilityException & { id: string };

function rangeIso(daysAhead: number): { from: string; to: string } {
  const now = new Date();
  const from = now.toISOString().slice(0, 10);
  const to = new Date(now.getTime() + daysAhead * 86400 * 1000).toISOString().slice(0, 10);
  return { from, to };
}

export function AvailabilityEditor() {
  const [exceptions, setExceptions] = useState<ExceptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formType, setFormType] = useState<"block" | "extra">("block");
  const [formDate, setFormDate] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formNote, setFormNote] = useState("");

  const refresh = async () => {
    setLoading(true);
    setError(null);
    const { from, to } = rangeIso(60);
    const res = await fetch(`/api/admin/availability?from=${from}&to=${to}`);
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
      setLoading(false);
      return;
    }
    const body = (await res.json()) as { exceptions: ExceptionRow[] };
    setExceptions(body.exceptions.sort((a, b) => a.date.localeCompare(b.date)));
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, []);

  const create = async () => {
    if (!formDate) return;
    const payload: Record<string, string> = { type: formType, date: formDate };
    if (formType === "extra" || formStart) payload.startTime = formStart;
    if (formType === "extra" || formEnd) payload.endTime = formEnd;
    if (formNote) payload.note = formNote;

    const res = await fetch("/api/admin/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
      return;
    }
    setFormDate("");
    setFormStart("");
    setFormEnd("");
    setFormNote("");
    await refresh();
  };

  const remove = async (id: string) => {
    const res = await fetch(`/api/admin/availability/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
      return;
    }
    await refresh();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "48rem" }}>
      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Add an exception</h2>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "end" }}>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>type</span>
            <select value={formType} onChange={(e) => setFormType(e.target.value as "block" | "extra")} style={{ padding: "0.5rem" }}>
              <option value="block">Block</option>
              <option value="extra">Extra window</option>
            </select>
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>date</span>
            <input type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} style={{ padding: "0.5rem" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>from (optional for block)</span>
            <input type="time" value={formStart} onChange={(e) => setFormStart(e.target.value)} style={{ padding: "0.5rem" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>to (optional for block)</span>
            <input type="time" value={formEnd} onChange={(e) => setFormEnd(e.target.value)} style={{ padding: "0.5rem" }} />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: "0.25rem", flex: 1 }}>
            <span style={{ fontSize: "0.75rem", opacity: 0.7 }}>note</span>
            <input value={formNote} onChange={(e) => setFormNote(e.target.value)} style={{ padding: "0.5rem" }} />
          </label>
          <button
            type="button"
            onClick={create}
            style={{ padding: "0.5rem 1rem", border: "1px solid currentColor", borderRadius: "999px", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
          >
            Add
          </button>
        </div>
        <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.5rem" }}>
          Block without times blocks the whole day. Extra requires times.
        </p>
      </section>

      <section>
        <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Exceptions (next 60 days)</h2>
        {loading && <p>Loading…</p>}
        {error && <p style={{ color: "#f60" }}>{error}</p>}
        {!loading && exceptions.length === 0 && <p style={{ opacity: 0.6 }}>No exceptions — weekly defaults apply.</p>}
        {exceptions.length > 0 && (
          <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <table style={{ borderCollapse: "collapse", width: "100%", minWidth: "560px" }}>
            <thead>
              <tr style={{ textAlign: "left", borderBottom: "1px solid rgba(0,0,0,0.1)" }}>
                <th style={{ padding: "0.5rem" }}>type</th>
                <th style={{ padding: "0.5rem" }}>date</th>
                <th style={{ padding: "0.5rem" }}>time</th>
                <th style={{ padding: "0.5rem" }}>note</th>
                <th style={{ padding: "0.5rem" }}></th>
              </tr>
            </thead>
            <tbody>
              {exceptions.map((x) => (
                <tr key={x.id} style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                  <td style={{ padding: "0.5rem" }}>{x.type}</td>
                  <td style={{ padding: "0.5rem" }}>{x.date}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {x.startTime && x.endTime ? `${x.startTime}–${x.endTime}` : "(all day)"}
                  </td>
                  <td style={{ padding: "0.5rem", opacity: 0.7 }}>{x.note ?? ""}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => void remove(x.id)}
                      style={{ padding: "0.25rem 0.5rem", border: "1px solid rgba(0,0,0,0.15)", background: "transparent", borderRadius: "6px", cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}
      </section>
    </div>
  );
}
