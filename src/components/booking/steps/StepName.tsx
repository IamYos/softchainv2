"use client";

import { useState } from "react";
import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { StepShell } from "../StepShell";
import { devLogInvalid, validateName } from "../validators";
import type { Action } from "../useBookingState";
import type { Dispatch } from "react";

type Props = {
  value: string;
  error: string | null;
  dispatch: Dispatch<Action>;
};

export function StepName({ value, error, dispatch }: Props) {
  const [touched, setTouched] = useState(false);
  const localError = validateName(value);
  const canContinue = localError === null;
  const displayError = error ?? (touched ? localError : null);

  return (
    <StepShell
      label="Your name"
      canContinue={canContinue}
      onContinue={() => {
        setTouched(true);
        dispatch({ type: "advance" });
      }}
      onBack={() => dispatch({ type: "back" })}
      error={displayError}
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
        onBlur={() => {
          if (value.trim().length === 0) return;
          setTouched(true);
          devLogInvalid("name", localError, value);
        }}
        aria-invalid={displayError ? true : undefined}
      />
    </StepShell>
  );
}
