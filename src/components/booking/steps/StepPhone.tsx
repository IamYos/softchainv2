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

export function StepPhone({ value, error, dispatch }: Props) {
  const canContinue = /^\+[1-9]\d{6,14}$/.test(value.trim());
  return (
    <StepShell
      label="Your WhatsApp number"
      canContinue={canContinue}
      onContinue={() => dispatch({ type: "advance" })}
      onBack={() => dispatch({ type: "back" })}
      error={error}
      footnote="Include country code, e.g. +971501234567."
    >
      <label htmlFor="book-phone" className={styles.srOnly}>Your WhatsApp number</label>
      <input
        id="book-phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        autoFocus
        className={styles.emailInput}
        placeholder="+971501234567"
        value={value}
        onChange={(e) => dispatch({ type: "setField", field: "visitorPhone", value: e.target.value })}
      />
    </StepShell>
  );
}
