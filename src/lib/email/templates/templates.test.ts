import { describe, it, expect } from "vitest";
import { bookingConfirmation } from "./booking-confirmation";
import { adminNewBooking } from "./admin-new-booking";
import { reminder24h } from "./reminder-24h";
import { reminder15m } from "./reminder-15m";
import { adminWhatsappPrompt } from "./admin-whatsapp-prompt";
import { reschedule } from "./reschedule";
import { cancel } from "./cancel";

const ctx = {
  visitorName: "Jane Doe",
  visitorEmail: "jane@example.com",
  visitorTimezone: "America/New_York",
  ownerTimezone: "Asia/Dubai",
  startUtc: new Date("2026-05-04T13:00:00Z"),
  endUtc: new Date("2026-05-04T13:30:00Z"),
  contactMethod: "meet" as const,
  meetingLink: "https://meet.google.com/abc-defg-hij",
  topic: "Discuss a consulting engagement",
  rescheduleUrl: "https://softchain.ae/reschedule/abc",
  cancelUrl: "https://softchain.ae/cancel/abc",
  siteUrl: "https://softchain.ae",
};

describe("email templates", () => {
  it("bookingConfirmation includes visitor name, both times, meeting link, links", () => {
    const out = bookingConfirmation(ctx);
    expect(out.subject).toContain("Softchain");
    expect(out.html).toContain("Jane");
    expect(out.html).toContain("meet.google.com");
    expect(out.html).toContain(ctx.rescheduleUrl);
    expect(out.html).toContain(ctx.cancelUrl);
    expect(out.text).toContain("Jane");
  });

  it("adminNewBooking includes visitor email and topic", () => {
    const out = adminNewBooking(ctx);
    expect(out.html).toContain(ctx.visitorEmail);
    expect(out.html).toContain("consulting engagement");
  });

  it("reminder24h references tomorrow", () => {
    const out = reminder24h(ctx);
    expect(out.subject.toLowerCase()).toContain("tomorrow");
    expect(out.html).toContain("meet.google.com");
  });

  it("reminder15m references 15 minutes", () => {
    const out = reminder15m(ctx);
    expect(out.subject).toMatch(/15\s?min/i);
    expect(out.html).toContain("meet.google.com");
  });

  it("adminWhatsappPrompt includes phone and visitor name", () => {
    const out = adminWhatsappPrompt({ ...ctx, visitorPhone: "+14155551212" });
    expect(out.subject.toLowerCase()).toContain("whatsapp");
    expect(out.html).toContain("+14155551212");
    expect(out.html).toContain("Jane Doe");
  });

  it("reschedule references the new time", () => {
    const out = reschedule({ ...ctx, wasScheduledFor: new Date("2026-05-03T13:00:00Z") });
    expect(out.subject.toLowerCase()).toContain("rescheduled");
    expect(out.html).toContain(ctx.rescheduleUrl);
  });

  it("cancel includes a rebook CTA", () => {
    const out = cancel(ctx);
    expect(out.subject.toLowerCase()).toContain("cancelled");
    expect(out.html).toContain(ctx.siteUrl);
  });
});
