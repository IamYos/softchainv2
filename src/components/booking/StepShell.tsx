"use client";

import { KeyboardEvent, ReactNode } from "react";
import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import {
  SFLeftParenthesisIcon,
  SFRightParenthesisIcon,
} from "@/components/marketing/sf/SFSourceIcons";

type StepShellProps = {
  label: string;                  // srOnly accessible label
  children: ReactNode;            // the input control(s)
  continueLabel?: string;         // defaults to "Continue"
  canContinue: boolean;
  onContinue: () => void;
  onBack?: () => void;
  error?: string | null;
  footnote?: ReactNode;           // muted text below the field
};

export function StepShell({
  label,
  children,
  continueLabel = "Continue",
  canContinue,
  onContinue,
  onBack,
  error,
  footnote,
}: StepShellProps) {
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && canContinue) {
      e.preventDefault();
      onContinue();
    } else if (e.key === "Escape" && onBack) {
      e.preventDefault();
      onBack();
    }
  };

  return (
    <div
      className={styles.emailStage}
      role="group"
      aria-label={label}
      onKeyDown={onKeyDown}
    >
      {/*
        Separate live-region announcer. Some screen readers suppress
        aria-live when the same element carries a non-live role (role="group").
      */}
      <div role="status" aria-live="polite" aria-atomic="true" className={styles.srOnly}>
        {label}
      </div>
      <div className={styles.emailContent}>
        <SFLeftParenthesisIcon className={styles.parenthesisIcon} />
        <div className={styles.emailFieldWrap}>
          {children}
          <div className={styles.fieldLine} aria-hidden="true" />
        </div>
        <SFRightParenthesisIcon className={styles.parenthesisIcon} />
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className={`${styles.monoPill} ${styles.emailButton} ${styles.p}`}
      >
        {continueLabel}
      </button>

      {(footnote || error || onBack) && (
        <div style={{ marginTop: "0.75rem", textAlign: "center" }}>
          {error && (
            <p className={styles.p} role="alert" style={{ color: "var(--color-orange, #f60)", margin: 0 }}>
              {error}
            </p>
          )}
          {footnote && (
            <p className={styles.p} style={{ opacity: 0.6, margin: error ? "0.25rem 0 0" : 0 }}>{footnote}</p>
          )}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className={styles.p}
              style={{
                background: "transparent",
                border: "none",
                padding: "0.25rem 0.5rem",
                marginTop: "0.25rem",
                opacity: 0.6,
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Back
            </button>
          )}
        </div>
      )}
    </div>
  );
}
