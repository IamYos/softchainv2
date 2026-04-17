import { describe, it, expect, beforeEach } from "vitest";
import { checkRateLimit, _resetForTests } from "./ratelimit";

describe("checkRateLimit", () => {
  beforeEach(() => _resetForTests());

  it("allows up to the max within the window", () => {
    expect(checkRateLimit("1.2.3.4", 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit("1.2.3.4", 3, 60_000).allowed).toBe(true);
    expect(checkRateLimit("1.2.3.4", 3, 60_000).allowed).toBe(true);
  });

  it("rejects beyond the max within the window", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("1.2.3.4", 3, 60_000);
    expect(checkRateLimit("1.2.3.4", 3, 60_000).allowed).toBe(false);
  });

  it("scopes limits per key", () => {
    for (let i = 0; i < 3; i++) checkRateLimit("1.2.3.4", 3, 60_000);
    expect(checkRateLimit("5.6.7.8", 3, 60_000).allowed).toBe(true);
  });
});
