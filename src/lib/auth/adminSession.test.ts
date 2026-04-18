// @vitest-environment node
import { describe, it, expect } from "vitest";
import { isAllowedOwner, isAllowedAdmin } from "./adminSession";

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

describe("isAllowedAdmin", () => {
  it("accepts the owner", () => {
    expect(isAllowedAdmin({ email: "yosmouawad@gmail.com", email_verified: true }, "yosmouawad@gmail.com", [])).toBe(true);
  });

  it("accepts an admin in the list (case-insensitive)", () => {
    expect(isAllowedAdmin({ email: "sara@example.com", email_verified: true }, "yos@example.com", ["sara@example.com"])).toBe(true);
    expect(isAllowedAdmin({ email: "SARA@Example.com", email_verified: true }, "yos@example.com", ["sara@example.com"])).toBe(true);
  });

  it("rejects someone not in the list and not the owner", () => {
    expect(isAllowedAdmin({ email: "nope@x.com", email_verified: true }, "yos@example.com", ["sara@example.com"])).toBe(false);
  });

  it("rejects unverified even if listed", () => {
    expect(isAllowedAdmin({ email: "sara@example.com", email_verified: false }, "yos@example.com", ["sara@example.com"])).toBe(false);
  });

  it("handles missing admins parameter", () => {
    expect(isAllowedAdmin({ email: "yos@example.com", email_verified: true }, "yos@example.com")).toBe(true);
    expect(isAllowedAdmin({ email: "nope@x.com", email_verified: true }, "yos@example.com")).toBe(false);
  });
});
