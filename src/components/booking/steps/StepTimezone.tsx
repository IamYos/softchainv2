"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { StepShell } from "../StepShell";
import { TIMEZONE_OPTIONS, isKnownTimezone } from "../timezoneOptions";
import { useVisitorTimezone } from "../useVisitorTimezone";
import type { Action } from "../useBookingState";
import type { Dispatch } from "react";

type Props = {
  value: string;
  error: string | null;
  dispatch: Dispatch<Action>;
};

export function StepTimezone({ value, error, dispatch }: Props) {
  const detected = useVisitorTimezone();
  const [query, setQuery] = useState("");

  useEffect(() => {
    // Seed reducer with detected value once, when it first becomes available.
    if (!value && detected) {
      dispatch({ type: "setField", field: "visitorTimezone", value: detected });
    }
  }, [detected, value, dispatch]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return TIMEZONE_OPTIONS;
    return TIMEZONE_OPTIONS.filter(
      (o) => o.value.toLowerCase().includes(q) || o.label.toLowerCase().includes(q)
    );
  }, [query]);

  const canContinue = value.length > 0;
  const resolvedLabel = TIMEZONE_OPTIONS.find((o) => o.value === value)?.label
    ?? (value ? value : "—");

  return (
    <StepShell
      label="Your timezone"
      canContinue={canContinue}
      onContinue={() => dispatch({ type: "advance" })}
      onBack={() => dispatch({ type: "back" })}
      error={error}
      footnote={
        isKnownTimezone(value)
          ? `Times will be shown in ${resolvedLabel}.`
          : value
            ? `Auto-detected: ${value}. Search below to override.`
            : "Detecting timezone…"
      }
    >
      <label htmlFor="book-tz" className={styles.srOnly}>Timezone</label>
      <input
        id="book-tz"
        type="text"
        autoComplete="off"
        autoFocus
        className={styles.emailInput}
        placeholder="Search timezone (e.g. Dubai, New York)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {query && (
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0.5rem 0 0 0",
            maxHeight: "10rem",
            overflowY: "auto",
            textAlign: "left",
          }}
        >
          {filtered.slice(0, 8).map((o) => (
            <li key={o.value}>
              <button
                type="button"
                onClick={() => {
                  dispatch({ type: "setField", field: "visitorTimezone", value: o.value });
                  setQuery("");
                }}
                className={styles.p}
                style={{
                  background: "transparent",
                  border: "none",
                  padding: "0.25rem 0.5rem",
                  width: "100%",
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  opacity: value === o.value ? 1 : 0.7,
                }}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </StepShell>
  );
}
