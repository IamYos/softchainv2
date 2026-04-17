import { describe, it, expect } from "vitest";
import { computeAvailableSlots } from "./slots";
import type { SettingsDoc } from "./types";

const settings: SettingsDoc = {
  ownerEmail: "yosmouawad@gmail.com",
  ownerTimezone: "Asia/Dubai",
  defaultHours: {
    mon: { start: "09:00", end: "17:00" },
    tue: { start: "09:00", end: "17:00" },
    wed: { start: "09:00", end: "17:00" },
    thu: { start: "09:00", end: "17:00" },
    fri: { start: "09:00", end: "17:00" },
    sat: null,
    sun: null,
  },
  contactLinks: { zoom: "", meet: "", teams: "", whatsappNumber: "" },
  rules: { minNoticeHours: 4, maxLookaheadDays: 30, slotDurationMinutes: 30 },
  icsFeedSecret: "x",
};

// 2026-05-04 is a Monday.
const MONDAY = new Date("2026-05-04T05:00:00Z"); // 09:00 Dubai
const now = new Date("2026-05-01T00:00:00Z"); // Fri, 3 days before

describe("computeAvailableSlots", () => {
  it("returns 16 half-hour slots for a normal Monday (09:00-17:00 Dubai)", () => {
    const slots = computeAvailableSlots({
      settings,
      rangeStart: MONDAY,
      rangeEnd: new Date(MONDAY.getTime() + 24 * 3600 * 1000),
      exceptions: [],
      existingBookings: [],
      now,
    });
    expect(slots).toHaveLength(16);
    expect(slots[0].startUtc.toISOString()).toBe("2026-05-04T05:00:00.000Z");
    expect(slots[15].startUtc.toISOString()).toBe("2026-05-04T12:30:00.000Z");
  });

  it("returns 0 slots for Saturday (no default hours)", () => {
    const SATURDAY = new Date("2026-05-09T05:00:00Z");
    const slots = computeAvailableSlots({
      settings,
      rangeStart: SATURDAY,
      rangeEnd: new Date(SATURDAY.getTime() + 24 * 3600 * 1000),
      exceptions: [],
      existingBookings: [],
      now,
    });
    expect(slots).toHaveLength(0);
  });

  it("respects block exceptions (whole day)", () => {
    const slots = computeAvailableSlots({
      settings,
      rangeStart: MONDAY,
      rangeEnd: new Date(MONDAY.getTime() + 24 * 3600 * 1000),
      exceptions: [
        { type: "block", date: "2026-05-04", createdAt: null as any },
      ],
      existingBookings: [],
      now,
    });
    expect(slots).toHaveLength(0);
  });

  it("respects block exceptions (partial — blocks 10:00-12:00 Dubai)", () => {
    const slots = computeAvailableSlots({
      settings,
      rangeStart: MONDAY,
      rangeEnd: new Date(MONDAY.getTime() + 24 * 3600 * 1000),
      exceptions: [
        {
          type: "block",
          date: "2026-05-04",
          startTime: "10:00",
          endTime: "12:00",
          createdAt: null as any,
        },
      ],
      existingBookings: [],
      now,
    });
    // 16 - 4 (blocked slots at 10:00, 10:30, 11:00, 11:30) = 12
    expect(slots).toHaveLength(12);
  });

  it("adds extra windows outside defaults", () => {
    const SATURDAY = new Date("2026-05-09T05:00:00Z");
    const slots = computeAvailableSlots({
      settings,
      rangeStart: SATURDAY,
      rangeEnd: new Date(SATURDAY.getTime() + 24 * 3600 * 1000),
      exceptions: [
        {
          type: "extra",
          date: "2026-05-09",
          startTime: "10:00",
          endTime: "12:00",
          createdAt: null as any,
        },
      ],
      existingBookings: [],
      now,
    });
    expect(slots).toHaveLength(4); // 10:00, 10:30, 11:00, 11:30
  });

  it("removes slots that collide with existing bookings", () => {
    const slots = computeAvailableSlots({
      settings,
      rangeStart: MONDAY,
      rangeEnd: new Date(MONDAY.getTime() + 24 * 3600 * 1000),
      exceptions: [],
      existingBookings: [
        {
          startAt: new Date("2026-05-04T06:00:00Z"), // 10:00 Dubai
          endAt: new Date("2026-05-04T06:30:00Z"),
        },
      ],
      now,
    });
    expect(slots).toHaveLength(15);
    expect(
      slots.find((s) => s.startUtc.toISOString() === "2026-05-04T06:00:00.000Z")
    ).toBeUndefined();
  });

  it("removes slots starting before now + minNoticeHours", () => {
    const now2 = new Date("2026-05-04T04:00:00Z"); // 08:00 Dubai, same day
    // minNoticeHours = 4 → slots before 12:00 Dubai are out
    const slots = computeAvailableSlots({
      settings,
      rangeStart: MONDAY,
      rangeEnd: new Date(MONDAY.getTime() + 24 * 3600 * 1000),
      exceptions: [],
      existingBookings: [],
      now: now2,
    });
    // 16 total, minus 6 before 12:00 (09:00..11:30) = 10
    expect(slots).toHaveLength(10);
    expect(slots[0].startUtc.toISOString()).toBe("2026-05-04T08:00:00.000Z"); // 12:00 Dubai
  });

  it("removes slots beyond now + maxLookaheadDays", () => {
    const farFuture = new Date("2026-07-06T05:00:00Z"); // Monday, ~66 days out
    const slots = computeAvailableSlots({
      settings,
      rangeStart: farFuture,
      rangeEnd: new Date(farFuture.getTime() + 24 * 3600 * 1000),
      exceptions: [],
      existingBookings: [],
      now,
    });
    expect(slots).toHaveLength(0);
  });
});
