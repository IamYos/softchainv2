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

export function StepTopic({ value, error, dispatch }: Props) {
  const canContinue = value.trim().length >= 10;
  return (
    <StepShell
      label="What do you want to discuss?"
      canContinue={canContinue}
      onContinue={() => dispatch({ type: "advance" })}
      onBack={() => dispatch({ type: "back" })}
      error={error}
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
        style={{ width: "100%", background: "transparent", border: "none", resize: "vertical", textAlign: "center" }}
      />
    </StepShell>
  );
}
