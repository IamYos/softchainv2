import { describe, it, expect } from "vitest";
import { localDateTimeToUtc, utcToLocalHHMM, utcToIsoDateInTz } from "./timezone";

describe("localDateTimeToUtc", () => {
  it("converts Dubai 10:00 on 2026-05-04 to 06:00 UTC", () => {
    const utc = localDateTimeToUtc("2026-05-04", "10:00", "Asia/Dubai");
    expect(utc.toISOString()).toBe("2026-05-04T06:00:00.000Z");
  });

  it("converts New York 09:00 on 2026-05-04 to 13:00 UTC (EDT)", () => {
    const utc = localDateTimeToUtc("2026-05-04", "09:00", "America/New_York");
    expect(utc.toISOString()).toBe("2026-05-04T13:00:00.000Z");
  });
});

describe("utcToLocalHHMM", () => {
  it("formats UTC 06:00 as 10:00 in Asia/Dubai", () => {
    const utc = new Date("2026-05-04T06:00:00Z");
    expect(utcToLocalHHMM(utc, "Asia/Dubai")).toBe("10:00");
  });
});

describe("utcToIsoDateInTz", () => {
  it("returns 2026-05-04 for 06:00Z in Asia/Dubai", () => {
    const utc = new Date("2026-05-04T06:00:00Z");
    expect(utcToIsoDateInTz(utc, "Asia/Dubai")).toBe("2026-05-04");
  });

  it("returns 2026-05-03 for 03:00Z in America/New_York", () => {
    const utc = new Date("2026-05-04T03:00:00Z");
    expect(utcToIsoDateInTz(utc, "America/New_York")).toBe("2026-05-03");
  });
});
