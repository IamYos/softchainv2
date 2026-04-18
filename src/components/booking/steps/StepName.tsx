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

export function StepName({ value, error, dispatch }: Props) {
  const canContinue = value.trim().length >= 2;
  return (
    <StepShell
      label="Your name"
      canContinue={canContinue}
      onContinue={() => dispatch({ type: "advance" })}
      onBack={() => dispatch({ type: "back" })}
      error={error}
    >
      <label htmlFor="book-name" className={styles.srOnly}>Your name</label>
      <input
        id="book-name"
        type="text"
        autoComplete="name"
        autoFocus
        className={styles.emailInput}
        placeholder="Your name"
        value={value}
        onChange={(e) => dispatch({ type: "setField", field: "visitorName", value: e.target.value })}
      />
    </StepShell>
  );
}
