"use client";

import { useState } from "react";
import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { StepShell } from "../StepShell";
import { devLogInvalid, validateTopic } from "../validators";
import type { Action } from "../useBookingState";
import type { Dispatch } from "react";

type Props = {
  value: string;
  error: string | null;
  dispatch: Dispatch<Action>;
};

export function StepTopic({ value, error, dispatch }: Props) {
  const [touched, setTouched] = useState(false);
  const localError = validateTopic(value);
  const canContinue = localError === null;
  const displayError = error ?? (touched ? localError : null);

  return (
    <StepShell
      label="What do you want to discuss?"
      canContinue={canContinue}
      onContinue={() => {
        setTouched(true);
        dispatch({ type: "advance" });
      }}
      onBack={() => dispatch({ type: "back" })}
      error={displayError}
      footnote={`${value.trim().length} / 2000`}
    >
      <label htmlFor="book-topic" className={styles.srOnly}>What do you want to discuss?</label>
      <textarea
        id="book-topic"
        autoFocus
        className={styles.fieldTextarea}
        placeholder="A few sentences on what you'd like to discuss."
        value={value}
        maxLength={2000}
        rows={3}
        onChange={(e) => dispatch({ type: "setField", field: "topic", value: e.target.value })}
        onBlur={() => {
          if (value.trim().length === 0) return;
          setTouched(true);
          devLogInvalid("topic", localError, value);
        }}
        aria-invalid={displayError ? true : undefined}
        style={{ width: "100%", background: "transparent", border: "none", resize: "vertical", textAlign: "center" }}
      />
    </StepShell>
  );
}
