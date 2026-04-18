// @vitest-environment node
import { describe, it, expect } from "vitest";
import { isAllowedOwner } from "./adminSession";

describe("isAllowedOwner", () => {
  it("accepts the exact owner email (case-insensitive)", () => {
    expect(isAllowedOwner({ email: "yosmouawad@gmail.com", email_verified: true }, "yosmouawad@gmail.com")).toBe(true);
    expect(isAllowedOwner({ email: "YosMouawad@Gmail.com", email_verified: true }, "yosmouawad@gmail.com")).toBe(true);
  });

  it("rejects a different email", () => {
    expect(isAllowedOwner({ email: "someone@else.com", email_verified: true }, "yosmouawad@gmail.com")).toBe(false);
  });

  it("rejects an unverified Google account even when email matches", () => {
    expect(isAllowedOwner({ email: "yosmouawad@gmail.com", email_verified: false }, "yosmouawad@gmail.com")).toBe(false);
  });

  it("rejects missing email", () => {
    expect(isAllowedOwner({ email: undefined, email_verified: true }, "yosmouawad@gmail.com")).toBe(false);
  });
});
