import { parsePhoneNumberFromString } from "libphonenumber-js/min";

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(value: string): string | null {
  return EMAIL_RE.test(value.trim()) ? null : "Enter a valid email.";
}

export function validateName(value: string): string | null {
  return value.trim().length >= 2 ? null : "Name must be at least 2 characters.";
}

// Uses libphonenumber-js for per-country length + prefix rules. The picker
// always produces an E.164 string (with +), so we only reach here after the
// user has typed digits. Error messages name the detected country so the
// user knows exactly which format is expected.
export function validatePhone(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Enter your phone number.";
  const parsed = parsePhoneNumberFromString(trimmed);
  if (!parsed) return "Enter a valid phone number.";
  if (!parsed.isValid()) {
    const name = parsed.country ? regionName(parsed.country) : null;
    return name
      ? `Enter a valid phone number for ${name}.`
      : "Enter a valid phone number.";
  }
  return null;
}

function regionName(code: string): string {
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    return dn.of(code) ?? code;
  } catch {
    return code;
  }
}

export function validateTopic(value: string): string | null {
  return value.trim().length >= 10
    ? null
    : "Tell us a bit more — at least 10 characters.";
}

export function devLogInvalid(field: string, error: string | null, value: string): void {
  if (error && process.env.NODE_ENV !== "production") {
    console.warn(`[booking] ${field} invalid:`, error, JSON.stringify(value));
  }
}
