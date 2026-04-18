"use client";

import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { StepShell } from "../StepShell";
import type { Action } from "../useBookingState";
import type { Dispatch } from "react";

type Props = {
  value: string;
  error: string | null;
  dispatch: Dispatch<Action>;
};

export function StepEmail({ value, error, dispatch }: Props) {
  const canContinue = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  return (
    <StepShell
      label="Enter your email"
      canContinue={canContinue}
      onContinue={() => dispatch({ type: "advance" })}
      error={error}
    >
      <label htmlFor="book-email" className={styles.srOnly}>Enter your email</label>
      <input
        id="book-email"
        type="email"
        autoComplete="email"
        autoFocus
        className={styles.emailInput}
        placeholder="Enter your email"
        value={value}
        onChange={(e) => dispatch({ type: "setField", field: "visitorEmail", value: e.target.value })}
      />
    </StepShell>
  );
}
