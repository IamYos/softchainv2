import { describe, it, expect } from "vitest";
import { buildIcs, buildIcsFeed } from "./ics";

describe("buildIcs", () => {
  it("produces a REQUEST method ICS with correct UID and SEQUENCE", () => {
    const ics = buildIcs({
      method: "REQUEST",
      uid: "test-uid-123@softchain.ae",
      sequence: 0,
      startUtc: new Date("2026-05-04T06:00:00Z"),
      endUtc: new Date("2026-05-04T06:30:00Z"),
      summary: "Call with Softchain",
      description: "Join: https://meet.google.com/abc",
      location: "https://meet.google.com/abc",
      organizerEmail: "info@softchain.ae",
      attendeeEmail: "jane@example.com",
      attendeeName: "Jane",
    });
    expect(ics).toContain("METHOD:REQUEST");
    expect(ics).toContain("UID:test-uid-123@softchain.ae");
    expect(ics).toContain("SEQUENCE:0");
    expect(ics).toContain("SUMMARY:Call with Softchain");
    expect(ics).toContain("DTSTART:20260504T060000Z");
    expect(ics).toContain("DTEND:20260504T063000Z");
    expect(ics).toContain("ORGANIZER");
    expect(ics).toContain("info@softchain.ae");
    expect(ics).toContain("ATTENDEE");
    expect(ics).toContain("jane@example.com");
  });

  it("produces a CANCEL method ICS with incremented SEQUENCE", () => {
    const ics = buildIcs({
      method: "CANCEL",
      uid: "test-uid-456@softchain.ae",
      sequence: 2,
      startUtc: new Date("2026-05-04T06:00:00Z"),
      endUtc: new Date("2026-05-04T06:30:00Z"),
      summary: "Call with Softchain",
      description: "Cancelled",
      location: "",
      organizerEmail: "info@softchain.ae",
      attendeeEmail: "jane@example.com",
      attendeeName: "Jane",
    });
    expect(ics).toContain("METHOD:CANCEL");
    expect(ics).toContain("SEQUENCE:2");
    expect(ics).toContain("STATUS:CANCELLED");
  });
});

describe("buildIcsFeed", () => {
  it("wraps multiple events in one VCALENDAR with METHOD:PUBLISH", () => {
    const feed = buildIcsFeed([
      {
        uid: "a@softchain.ae",
        sequence: 0,
        startUtc: new Date("2026-05-04T06:00:00Z"),
        endUtc: new Date("2026-05-04T06:30:00Z"),
        summary: "Call: Jane",
        description: "topic a",
        location: "",
      },
      {
        uid: "b@softchain.ae",
        sequence: 1,
        startUtc: new Date("2026-05-05T10:00:00Z"),
        endUtc: new Date("2026-05-05T10:30:00Z"),
        summary: "Call: Kai",
        description: "topic b",
        location: "",
      },
    ]);
    expect(feed).toContain("METHOD:PUBLISH");
    expect(feed.match(/BEGIN:VEVENT/g)?.length).toBe(2);
    expect(feed.match(/END:VEVENT/g)?.length).toBe(2);
    expect(feed).toContain("UID:a@softchain.ae");
    expect(feed).toContain("UID:b@softchain.ae");
    expect(feed).toContain("DTSTART:20260504T060000Z");
    expect(feed).toContain("DTSTART:20260505T100000Z");
  });

  it("produces a valid empty calendar when no events", () => {
    const feed = buildIcsFeed([]);
    expect(feed).toContain("BEGIN:VCALENDAR");
    expect(feed).toContain("END:VCALENDAR");
    expect(feed).not.toContain("BEGIN:VEVENT");
  });
});
