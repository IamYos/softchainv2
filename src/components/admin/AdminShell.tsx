"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { AdminNav } from "./AdminNav";
import s from "./admin.module.css";

// Admin-scoped palette tokens. Defined once on the shell root so every
// nested surface (sidebar, drawer, modal, calendar popover) reads from the
// same variables. Kept in sync with marketing site's mf-* tokens.
const adminVars: React.CSSProperties = {
  ["--sc-admin-bg" as string]: "var(--mf-bg-base, #0a0a0a)",
  ["--sc-admin-surface" as string]: "var(--mf-surface, #111111)",
  ["--sc-admin-surface-hover" as string]: "var(--mf-surface-hover, #1a1a1a)",
  ["--sc-admin-border" as string]: "var(--mf-border, #262626)",
  ["--sc-admin-border-subtle" as string]: "var(--mf-border-subtle, #404040)",
  ["--sc-admin-text" as string]: "var(--mf-text-heading, #ffffff)",
  ["--sc-admin-muted" as string]: "var(--mf-text-muted, #a3a3a3)",
  ["--sc-admin-dim" as string]: "var(--mf-text-dim, #737373)",
  ["--sc-admin-accent" as string]: "var(--mf-brand-red, #dc2626)",
  ["--sc-admin-accent-soft" as string]: "var(--mf-brand-green-soft, #14532d)",
};

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (menuOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [menuOpen]);

  return (
    <div className={s.shell} style={adminVars}>
      <aside className={s.sidebar}>
        <AdminNav />
      </aside>

      <header className={s.mobileBar}>
        <span className={s.mobileBarTitle}>Softchain admin</span>
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className={s.mobileBarButton}
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </header>

      {menuOpen && (
        <>
          <div
            role="presentation"
            onClick={() => setMenuOpen(false)}
            className={s.mobileDrawerBackdrop}
          />
          <aside
            className={s.mobileDrawer}
            role="dialog"
            aria-label="Admin navigation"
          >
            <AdminNav onNavigate={() => setMenuOpen(false)} />
          </aside>
        </>
      )}

      <main className={s.main}>
        <div className={s.mainInner}>{children}</div>
      </main>
    </div>
  );
}
