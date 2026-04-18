"use client";

import { useEffect, useRef } from "react";
import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { StepShell } from "../StepShell";
import type { Action, ContactMethod } from "../useBookingState";
import type { Dispatch } from "react";

type Props = {
  value: ContactMethod | "";
  error: string | null;
  dispatch: Dispatch<Action>;
};

const OPTIONS: Array<{ value: ContactMethod; label: string }> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "meet",     label: "Google Meet" },
  { value: "zoom",     label: "Zoom" },
  { value: "teams",    label: "Microsoft Teams" },
];

export function StepContactMethod({ value, error, dispatch }: Props) {
  const gridRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (value) return;
    gridRef.current?.querySelector<HTMLButtonElement>("button")?.focus();
  }, [value]);

  return (
    <StepShell
      label="How should we talk?"
      canContinue={value !== ""}
      onContinue={() => dispatch({ type: "advance" })}
      onBack={() => dispatch({ type: "back" })}
      error={error}
      footnote="For WhatsApp we'll message you at the time; for others we'll send a meeting link."
    >
      <div
        ref={gridRef}
        role="radiogroup"
        aria-label="Contact method"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(9rem, 1fr))",
          gap: "0.5rem",
          width: "100%",
        }}
      >
        {OPTIONS.map((o) => {
          const isSelected = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => dispatch({ type: "setField", field: "contactMethod", value: o.value })}
              className={styles.p}
              style={{
                padding: "0.75rem 1rem",
                border: `1px solid ${isSelected ? "var(--color-foreground, currentColor)" : "rgba(0,0,0,0.12)"}`,
                borderRadius: "999px",
                background: isSelected ? "var(--color-foreground, currentColor)" : "transparent",
                color: isSelected ? "var(--color-background, white)" : "inherit",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </StepShell>
  );
}
