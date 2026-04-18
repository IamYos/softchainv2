import { describe, it, expect } from "vitest";
import { groupSlotsByDate } from "./groupSlotsByDate";

describe("groupSlotsByDate", () => {
  it("groups slots by visitor-local calendar date", () => {
    // 2026-05-04 is a Monday.
    // Dubai 10:00 / 13:30 / 17:00 → UTC 06:00 / 09:30 / 13:00
    const slots = [
      { startUtc: "2026-05-04T06:00:00.000Z", endUtc: "2026-05-04T06:30:00.000Z" },
      { startUtc: "2026-05-04T09:30:00.000Z", endUtc: "2026-05-04T10:00:00.000Z" },
      { startUtc: "2026-05-04T13:00:00.000Z", endUtc: "2026-05-04T13:30:00.000Z" },
    ];
    const grouped = groupSlotsByDate(slots, "Asia/Dubai");
    expect(Object.keys(grouped)).toEqual(["2026-05-04"]);
    expect(grouped["2026-05-04"]).toHaveLength(3);
  });

  it("splits slots across two calendar dates when visitor timezone crosses midnight", () => {
    // UTC 22:30 on 2026-05-03 → 18:30 New York (2026-05-03)
    // UTC 04:30 on 2026-05-04 → 00:30 New York (2026-05-04)
    const slots = [
      { startUtc: "2026-05-03T22:30:00.000Z", endUtc: "2026-05-03T23:00:00.000Z" },
      { startUtc: "2026-05-04T04:30:00.000Z", endUtc: "2026-05-04T05:00:00.000Z" },
    ];
    const grouped = groupSlotsByDate(slots, "America/New_York");
    expect(Object.keys(grouped).sort()).toEqual(["2026-05-03", "2026-05-04"]);
    expect(grouped["2026-05-03"]).toHaveLength(1);
    expect(grouped["2026-05-04"]).toHaveLength(1);
  });

  it("returns an empty object when slots is empty", () => {
    expect(groupSlotsByDate([], "Asia/Dubai")).toEqual({});
  });

  it("preserves the order of slots within a day", () => {
    const slots = [
      { startUtc: "2026-05-04T13:00:00.000Z", endUtc: "2026-05-04T13:30:00.000Z" },
      { startUtc: "2026-05-04T06:00:00.000Z", endUtc: "2026-05-04T06:30:00.000Z" },
      { startUtc: "2026-05-04T09:30:00.000Z", endUtc: "2026-05-04T10:00:00.000Z" },
    ];
    const grouped = groupSlotsByDate(slots, "Asia/Dubai");
    expect(grouped["2026-05-04"].map((s) => s.startUtc)).toEqual([
      "2026-05-04T13:00:00.000Z",
      "2026-05-04T06:00:00.000Z",
      "2026-05-04T09:30:00.000Z",
    ]);
  });
});
