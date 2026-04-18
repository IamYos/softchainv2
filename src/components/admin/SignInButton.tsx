"use client";

import { useState } from "react";
import { signInWithPopup } from "firebase/auth";
import { clientAuth, googleProvider } from "@/lib/firebase/client";
import { useRouter, useSearchParams } from "next/navigation";

export function SignInButton() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/admin/bookings";

  const onClick = async () => {
    setBusy(true);
    setError(null);
    try {
      const cred = await signInWithPopup(clientAuth(), googleProvider);
      const idToken = await cred.user.getIdToken();
      const res = await fetch("/api/admin/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      router.replace(redirect);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", alignItems: "center" }}>
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        style={{
          padding: "0.75rem 1.5rem",
          border: "1px solid currentColor",
          borderRadius: "999px",
          background: "transparent",
          cursor: busy ? "wait" : "pointer",
          fontFamily: "inherit",
          fontSize: "1rem",
        }}
      >
        {busy ? "Signing in…" : "Sign in with Google"}
      </button>
      {error && <p style={{ color: "#f60", fontSize: "0.85rem" }}>{error}</p>}
    </div>
  );
}
