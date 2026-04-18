import { describe, it, expect } from "vitest";
import { reducer, initialState, type State } from "./useBookingState";

function step(s: State) { return s.currentStep; }

describe("booking reducer", () => {
  it("starts at the email step with empty data", () => {
    expect(step(initialState)).toBe("email");
    expect(initialState.data.visitorEmail).toBe("");
    expect(initialState.completedSteps).toEqual([]);
  });

  it("advances from email to name on valid email", () => {
    const s1 = reducer(initialState, { type: "setField", field: "visitorEmail", value: "jane@example.com" });
    const s2 = reducer(s1, { type: "advance" });
    expect(step(s2)).toBe("name");
    expect(s2.completedSteps).toEqual(["email"]);
  });

  it("refuses to advance from email on an invalid email", () => {
    const s1 = reducer(initialState, { type: "setField", field: "visitorEmail", value: "not-an-email" });
    const s2 = reducer(s1, { type: "advance" });
    expect(step(s2)).toBe("email");
    expect(s2.stepError).toBeTruthy();
  });

  it("walks through the full happy-path step sequence", () => {
    const walk = (s: State, actions: Array<Parameters<typeof reducer>[1]>) =>
      actions.reduce((acc, a) => reducer(acc, a), s);

    const final = walk(initialState, [
      { type: "setField", field: "visitorEmail", value: "jane@example.com" },
      { type: "advance" }, // email → name
      { type: "setField", field: "visitorName", value: "Jane Doe" },
      { type: "advance" }, // name → company
      { type: "advance" }, // company (optional, empty) → timezone
      { type: "setField", field: "visitorTimezone", value: "America/New_York" },
      { type: "advance" }, // timezone → date
      { type: "setField", field: "selectedDate", value: "2026-05-04" },
      { type: "advance" }, // date → time
      { type: "setField", field: "startAtIso", value: "2026-05-04T13:00:00.000Z" },
      { type: "advance" }, // time → contactMethod
      { type: "setField", field: "contactMethod", value: "zoom" },
      { type: "advance" }, // contactMethod → topic (phone skipped for non-WA)
      { type: "setField", field: "topic", value: "Exploring a software build for a client portal." },
      { type: "advance" }, // topic → submit
    ]);

    expect(step(final)).toBe("submit");
    expect(final.completedSteps).toContain("email");
    expect(final.completedSteps).toContain("contactMethod");
    expect(final.data.visitorPhone).toBe("");
  });

  it("routes through phone step when contactMethod is whatsapp", () => {
    let s: State = {
      ...initialState,
      data: {
        ...initialState.data,
        visitorEmail: "jane@example.com",
        visitorName: "Jane Doe",
        visitorCompany: "",
        visitorTimezone: "Asia/Dubai",
        selectedDate: "2026-05-04",
        startAtIso: "2026-05-04T06:00:00.000Z",
      },
      currentStep: "contactMethod",
      completedSteps: ["email", "name", "company", "timezone", "date", "time"],
    };
    s = reducer(s, { type: "setField", field: "contactMethod", value: "whatsapp" });
    s = reducer(s, { type: "advance" });
    expect(step(s)).toBe("phone");

    s = reducer(s, { type: "setField", field: "visitorPhone", value: "+14155551212" });
    s = reducer(s, { type: "advance" });
    expect(step(s)).toBe("topic");
  });

  it("rejects advance from phone step when the number is not E.164", () => {
    const s0: State = {
      ...initialState,
      currentStep: "phone",
      completedSteps: ["email", "name", "company", "timezone", "date", "time", "contactMethod"],
      data: { ...initialState.data, contactMethod: "whatsapp", visitorPhone: "abc" },
    };
    const s1 = reducer(s0, { type: "advance" });
    expect(step(s1)).toBe("phone");
    expect(s1.stepError).toBeTruthy();
  });

  it("back action walks the completedSteps list in reverse", () => {
    const s0: State = {
      ...initialState,
      currentStep: "contactMethod",
      completedSteps: ["email", "name", "company", "timezone", "date", "time"],
    };
    const s1 = reducer(s0, { type: "back" });
    expect(step(s1)).toBe("time");
    expect(s1.completedSteps).toEqual(["email", "name", "company", "timezone", "date"]);
  });

  it("edit jumps to any already-completed step and trims completedSteps to that point", () => {
    const s0: State = {
      ...initialState,
      currentStep: "topic",
      completedSteps: ["email", "name", "company", "timezone", "date", "time", "contactMethod"],
    };
    const s1 = reducer(s0, { type: "edit", step: "timezone" });
    expect(step(s1)).toBe("timezone");
    expect(s1.completedSteps).toEqual(["email", "name", "company"]);
  });

  it("submitSuccess records the server response and moves to confirmation", () => {
    const s0: State = { ...initialState, currentStep: "submit" };
    const s1 = reducer(s0, {
      type: "submitSuccess",
      result: {
        bookingId: "abc",
        rescheduleUrl: "https://example.com/reschedule/rtok",
        cancelUrl: "https://example.com/cancel/ctok",
        startUtc: "2026-05-04T06:00:00.000Z",
        endUtc: "2026-05-04T06:30:00.000Z",
      },
    });
    expect(step(s1)).toBe("confirmation");
    expect(s1.result?.bookingId).toBe("abc");
  });

  it("submitError keeps step=submit and records the error message", () => {
    const s0: State = { ...initialState, currentStep: "submit", isSubmitting: true };
    const s1 = reducer(s0, { type: "submitError", message: "Slot just taken" });
    expect(step(s1)).toBe("submit");
    expect(s1.isSubmitting).toBe(false);
    expect(s1.stepError).toBe("Slot just taken");
  });
});
