"use client";

import { useEffect, useState } from "react";

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

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "40rem" }}>
      {!isOwner && (
        <p style={{ padding: "0.75rem 1rem", background: "rgba(0,0,0,0.04)", borderRadius: "8px", fontSize: "0.9rem" }}>
          You&apos;re signed in as <strong>{currentEmail}</strong>. Only the owner can add or remove admins.
        </p>
      )}

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "#f60" }}>{error}</p>}

      {state && (
        <>
          <section>
            <h2 style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>Current admins</h2>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <li style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.75rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px" }}>
                <span>
                  <strong>{state.ownerEmail}</strong>
                  <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", opacity: 0.6, padding: "0.1rem 0.45rem", background: "rgba(0,0,0,0.06)", borderRadius: "999px" }}>owner</span>
                </span>
                <span style={{ fontSize: "0.8rem", opacity: 0.5 }}>immutable</span>
              </li>
              {state.admins.length === 0 && (
                <li style={{ padding: "0.6rem 0.75rem", opacity: 0.6, fontSize: "0.9rem" }}>No additional admins.</li>
              )}
              {state.admins.map((a) => (
                <li key={a} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.6rem 0.75rem", border: "1px solid rgba(0,0,0,0.1)", borderRadius: "8px" }}>
                  <span>{a}</span>
                  {isOwner && (
                    <button
                      type="button"
                      onClick={() => void remove(a)}
                      disabled={busy}
                      style={{ padding: "0.25rem 0.65rem", border: "1px solid rgba(0,0,0,0.15)", background: "transparent", borderRadius: "999px", cursor: "pointer", fontFamily: "inherit", fontSize: "0.8rem" }}
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
                  style={{ flex: 1, minWidth: "14rem", padding: "0.55rem 0.75rem", border: "1px solid rgba(0,0,0,0.15)", borderRadius: "8px", fontFamily: "inherit" }}
                />
                <button
                  type="button"
                  onClick={add}
                  disabled={busy || !newEmail.trim()}
                  style={{ padding: "0.55rem 1rem", border: "1px solid currentColor", borderRadius: "999px", background: "transparent", cursor: "pointer", fontFamily: "inherit" }}
                >
                  {busy ? "…" : "Add"}
                </button>
              </div>
              <p style={{ fontSize: "0.8rem", opacity: 0.6, marginTop: "0.5rem" }}>
                New admin must sign in with their Google account on that exact email.
              </p>
            </section>
          )}
        </>
      )}
    </div>
  );
}
