"use client";

import { useState } from "react";
import { getCountryForTimezone } from "countries-and-timezones";
import {
  AsYouType,
  getCountryCallingCode,
  parsePhoneNumberFromString,
  isSupportedCountry,
} from "libphonenumber-js/min";
import type { CountryCode } from "libphonenumber-js/min";
import styles from "@/components/marketing/sf/SFPostFrame.module.css";
import { StepShell } from "../StepShell";
import { CountrySelect } from "../CountrySelect";
import { devLogInvalid, validatePhone } from "../validators";
import type { Action } from "../useBookingState";
import type { Dispatch } from "react";

type Props = {
  value: string;
  timezone: string;
  error: string | null;
  dispatch: Dispatch<Action>;
};

// Defaults: prefer the country detected from a saved phone number, then the
// country implied by the visitor's timezone (e.g. Asia/Beirut → LB), then LB.
function initialCountry(value: string, timezone: string): CountryCode {
  if (value) {
    const parsed = parsePhoneNumberFromString(value);
    if (parsed?.country) return parsed.country;
  }
  if (timezone) {
    const tzCountry = getCountryForTimezone(timezone);
    if (tzCountry && isSupportedCountry(tzCountry.id)) {
      return tzCountry.id as CountryCode;
    }
  }
  return "LB";
}

function initialDigits(value: string): string {
  if (!value) return "";
  const parsed = parsePhoneNumberFromString(value);
  return parsed?.nationalNumber ?? "";
}

export function StepPhone({ value, timezone, error, dispatch }: Props) {
  const [country, setCountry] = useState<CountryCode>(() =>
    initialCountry(value, timezone),
  );
  const [digits, setDigits] = useState<string>(() => initialDigits(value));
  const [touched, setTouched] = useState(false);

  const e164 = digits ? `+${getCountryCallingCode(country)}${digits}` : "";
  const formattedDisplay = digits ? new AsYouType(country).input(digits) : "";

  const localError = digits ? validatePhone(e164) : null;
  const canContinue = digits.length > 0 && localError === null;
  const displayError = error ?? (touched ? localError : null);

  const commit = (nextCountry: CountryCode, nextDigits: string) => {
    const next = nextDigits
      ? `+${getCountryCallingCode(nextCountry)}${nextDigits}`
      : "";
    dispatch({ type: "setField", field: "visitorPhone", value: next });
  };

  const onCountryChange = (code: CountryCode) => {
    setCountry(code);
    commit(code, digits);
  };

  const onDigitsChange = (raw: string) => {
    const next = raw.replace(/\D/g, "");
    setDigits(next);
    commit(country, next);
  };

  return (
    <StepShell
      label="Your WhatsApp number"
      canContinue={canContinue}
      onContinue={() => {
        setTouched(true);
        dispatch({ type: "advance" });
      }}
      onBack={() => dispatch({ type: "back" })}
      error={displayError}
      footnote="Pick your country, then enter your number."
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 12,
          justifyContent: "center",
          width: "100%",
        }}
      >
        <CountrySelect value={country} onChange={onCountryChange} />
        <label htmlFor="book-phone" className={styles.srOnly}>
          Your WhatsApp number
        </label>
        <input
          id="book-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          autoFocus
          className={styles.emailInput}
          placeholder="Phone number"
          value={formattedDisplay}
          onChange={(e) => onDigitsChange(e.target.value)}
          onBlur={() => {
            if (digits.length === 0) return;
            setTouched(true);
            devLogInvalid("phone", localError, e164);
          }}
          aria-invalid={displayError ? true : undefined}
          style={{ flex: 1, minWidth: 0 }}
        />
      </div>
    </StepShell>
  );
}
