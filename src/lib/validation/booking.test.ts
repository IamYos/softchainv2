import { describe, it, expect } from "vitest";
import { createBookingInputSchema } from "./booking";

const baseInput = {
  visitorName: "Jane Doe",
  visitorEmail: "jane@example.com",
  visitorCompany: null,
  topic: "Discuss a consulting engagement for our Q3 launch.",
  contactMethod: "meet" as const,
  visitorPhone: "+14155551212",
  visitorTimezone: "America/New_York",
  startAtIso: "2026-05-04T13:00:00.000Z",
  turnstileToken: "dummy-token",
  honeypot: "",
};

describe("createBookingInputSchema", () => {
  it("accepts a valid booking with a phone", () => {
    const result = createBookingInputSchema.safeParse(baseInput);
    expect(result.success).toBe(true);
  });

  it("requires a phone regardless of contact method", () => {
    const input = { ...baseInput, contactMethod: "meet" as const, visitorPhone: null };
    const result = createBookingInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("accepts whatsapp with a valid phone", () => {
    const input = { ...baseInput, contactMethod: "whatsapp" as const, visitorPhone: "+14155551212" };
    const result = createBookingInputSchema.safeParse(input);
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const input = { ...baseInput, visitorEmail: "not-an-email" };
    const result = createBookingInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects a topic under 10 characters", () => {
    const input = { ...baseInput, topic: "short" };
    const result = createBookingInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects an invalid IANA timezone", () => {
    const input = { ...baseInput, visitorTimezone: "Mars/Olympus" };
    const result = createBookingInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("rejects a non-UTC startAtIso", () => {
    const input = { ...baseInput, startAtIso: "2026-05-04T13:00:00+04:00" };
    const result = createBookingInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });

  it("trims long topic and enforces max length", () => {
    const input = { ...baseInput, topic: "x".repeat(2001) };
    const result = createBookingInputSchema.safeParse(input);
    expect(result.success).toBe(false);
  });
});
