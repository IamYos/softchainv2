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

export function StepCompany({ value, error, dispatch }: Props) {
  return (
    <StepShell
      label="Company (optional)"
      canContinue={true}
      continueLabel={value.trim() ? "Continue" : "Skip"}
      onContinue={() => dispatch({ type: "advance" })}
      onBack={() => dispatch({ type: "back" })}
      error={error}
      footnote="Company is optional."
    >
      <label htmlFor="book-company" className={styles.srOnly}>Company (optional)</label>
      <input
        id="book-company"
        type="text"
        autoComplete="organization"
        autoFocus
        className={styles.emailInput}
        placeholder="Company (optional)"
        value={value}
        onChange={(e) => dispatch({ type: "setField", field: "visitorCompany", value: e.target.value })}
      />
    </StepShell>
  );
}
