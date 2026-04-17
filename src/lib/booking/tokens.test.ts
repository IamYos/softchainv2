import { describe, it, expect } from "vitest";
import { generateToken, isValidTokenShape } from "./tokens";

describe("generateToken", () => {
  it("returns a 64-character hex string", () => {
    const token = generateToken();
    expect(token).toHaveLength(64);
    expect(/^[0-9a-f]{64}$/.test(token)).toBe(true);
  });

  it("returns a different value on each call", () => {
    const a = generateToken();
    const b = generateToken();
    expect(a).not.toBe(b);
  });
});

describe("isValidTokenShape", () => {
  it("accepts a valid 64-char hex string", () => {
    expect(isValidTokenShape("a".repeat(64))).toBe(true);
  });

  it("rejects wrong length", () => {
    expect(isValidTokenShape("abc")).toBe(false);
  });

  it("rejects non-hex characters", () => {
    expect(isValidTokenShape("g".repeat(64))).toBe(false);
  });
});
