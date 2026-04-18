import { describe, it, expect } from "vitest";
import { extractIp } from "./ip";

function makeRequest(headers: Record<string, string>): Request {
  return new Request("https://example.com", { headers });
}

describe("extractIp", () => {
  it("prefers x-forwarded-for, taking the first IP in the list", () => {
    const req = makeRequest({ "x-forwarded-for": "203.0.113.1, 10.0.0.1" });
    expect(extractIp(req)).toBe("203.0.113.1");
  });

  it("falls back to x-real-ip", () => {
    const req = makeRequest({ "x-real-ip": "198.51.100.42" });
    expect(extractIp(req)).toBe("198.51.100.42");
  });

  it("returns 'unknown' when no headers are present", () => {
    const req = makeRequest({});
    expect(extractIp(req)).toBe("unknown");
  });
});
