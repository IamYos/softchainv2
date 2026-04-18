"use client";

import { useEffect, useState } from "react";
import s from "./admin.module.css";

type UsersState = { ownerEmail: string; admins: string[] };

export function AdminUsers({ currentEmail, isOwner }: { currentEmail: string; isOwner: boolean }) {
  const [state, setState] = useState<UsersState | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    const res = await fetch("/api/admin/users");
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
      setLoading(false);
      return;
    }
    setState((await res.json()) as UsersState);
    setLoading(false);
  };

  useEffect(() => { void refresh(); }, []);

  const add = async () => {
    if (!newEmail.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: newEmail.trim() }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
    } else {
      setNewEmail("");
      setState((await res.json()) as UsersState);
    }
    setBusy(false);
  };

  const remove = async (email: string) => {
    if (!confirm(`Remove ${email} from admins?`)) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/admin/users", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setError(body.error ?? `HTTP ${res.status}`);
    } else {
      setState((await res.json()) as UsersState);
    }
    setBusy(false);
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.6rem 0.75rem",
    border: "1px solid var(--sc-admin-border)",
    borderRadius: "8px",
    background: "var(--sc-admin-surface)",
    gap: "0.75rem",
    flexWrap: "wrap",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "40rem" }}>
      {!isOwner && (
        <p className={s.ribbon}>
          You&apos;re signed in as <strong>{currentEmail}</strong>. Only the owner can add or remove admins.
        </p>
      )}

      {loading && <p className={s.muted}>Loading…</p>}
      {error && <p style={{ color: "var(--sc-admin-accent)" }}>{error}</p>}

      {state && (
        <>
          <section>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Current admins</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li style={rowStyle}>
                <span>
                  <strong>{state.ownerEmail}</strong>
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.7rem", padding: "0.15rem 0.5rem", background: "var(--sc-admin-surface-hover)", border: "1px solid var(--sc-admin-border)", borderRadius: "999px", color: "var(--sc-admin-muted)" }}>owner</span>
                </span>
                <span className={s.dim} style={{ fontSize: "0.8rem" }}>immutable</span>
              </li>
              {state.admins.length === 0 && (
                <li className={s.muted} style={{ padding: "0.6rem 0.75rem", fontSize: "0.9rem" }}>No additional admins.</li>
              )}
              {state.admins.map((a) => (
                <li key={a} style={rowStyle}>
                  <span>{a}</span>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => void remove(a)}
                      disabled={busy}
                      className={s.pill}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </section>

          {isOwner && (
            <section>
              <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Add admin</h2>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className={s.input}
                  style={{ flex: 1, minWidth: "14rem" }}
                />
                <button
                  type="button"
                  onClick={add}
                  disabled={busy || !newEmail.trim()}
                  className={s.pill}
                >
                  {busy ? "…" : "Add"}
                </button>
              </div>
              <p className={s.muted} style={{ fontSize: "0.8rem", marginTop: "0.5rem" }}>
                New admin must sign in with their Google account on that exact email.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
