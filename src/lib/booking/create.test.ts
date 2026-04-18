import { describe, it, expect } from "vitest";
import { buildBookingDocFromInput, BookingInput } from "./create";

describe("buildBookingDocFromInput", () => {
  const input: BookingInput = {
    visitorName: "Jane Doe",
    visitorEmail: "Jane@Example.com",
    visitorCompany: null,
    topic: "Discuss engagement",
    contactMethod: "meet",
    visitorPhone: null,
    visitorTimezone: "America/New_York",
    startUtc: new Date("2026-05-04T13:00:00Z"),
    endUtc: new Date("2026-05-04T13:30:00Z"),
  };

  it("normalizes email to lowercase", () => {
    const doc = buildBookingDocFromInput(input);
    expect(doc.visitorEmail).toBe("jane@example.com");
  });

  it("sets status to confirmed and noShow false", () => {
    const doc = buildBookingDocFromInput(input);
    expect(doc.status).toBe("confirmed");
    expect(doc.noShow).toBe(false);
  });

  it("generates unique 64-char hex tokens and a UID", () => {
    const a = buildBookingDocFromInput(input);
    const b = buildBookingDocFromInput(input);
    expect(a.rescheduleToken).toMatch(/^[0-9a-f]{64}$/);
    expect(a.cancelToken).toMatch(/^[0-9a-f]{64}$/);
    expect(a.rescheduleToken).not.toBe(b.rescheduleToken);
    expect(a.cancelToken).not.toBe(b.cancelToken);
    expect(a.icsUid).not.toBe(b.icsUid);
    expect(a.icsUid).toContain("@softchain.ae");
  });

  it("initializes sequence to 0, previousSlots empty, reminderJobIds null", () => {
    const doc = buildBookingDocFromInput(input);
    expect(doc.icsSequence).toBe(0);
    expect(doc.previousSlots).toEqual([]);
    expect(doc.reminderJobIds.h24).toBeNull();
    expect(doc.reminderJobIds.m15).toBeNull();
  });
});
