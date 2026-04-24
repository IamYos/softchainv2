"use client";

import { useState } from "react";
import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { StepShell } from "../StepShell";
import { devLogInvalid, validateEmail } from "../validators";
import type { Action } from "../useBookingState";
import type { Dispatch } from "react";

type Props = {
  value: string;
  error: string | null;
  dispatch: Dispatch<Action>;
};

export function StepEmail({ value, error, dispatch }: Props) {
  const [touched, setTouched] = useState(false);
  const localError = validateEmail(value);
  const canContinue = localError === null;
  // Only surface the local error after blur; while typing, the field stays quiet.
  // The reducer's stepError (passed in via `error`) takes precedence so server
  // or advance-time errors aren't masked by local state.
  const displayError = error ?? (touched ? localError : null);

  return (
    <StepShell
      label="Enter your email"
      canContinue={canContinue}
      onContinue={() => {
        setTouched(true);
        dispatch({ type: "advance" });
      }}
      error={displayError}
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
        onBlur={() => {
          if (value.trim().length === 0) return;
          setTouched(true);
          devLogInvalid("email", localError, value);
        }}
        aria-invalid={displayError ? true : undefined}
      />
    </StepShell>
  );
}
