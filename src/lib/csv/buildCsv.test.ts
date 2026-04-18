import { describe, it, expect } from "vitest";
import { buildCsv } from "./buildCsv";

describe("buildCsv", () => {
  it("serializes a simple table", () => {
    const csv = buildCsv(["a", "b"], [{ a: "1", b: "2" }, { a: "3", b: "4" }]);
    expect(csv).toBe("a,b\r\n1,2\r\n3,4\r\n");
  });

  it("escapes values containing commas, quotes, or newlines", () => {
    const csv = buildCsv(["a"], [{ a: "hello, world" }, { a: "she said \"hi\"" }, { a: "line1\nline2" }]);
    expect(csv).toBe('a\r\n"hello, world"\r\n"she said ""hi"""\r\n"line1\nline2"\r\n');
  });

  it("renders missing values as empty strings", () => {
    const csv = buildCsv(["a", "b"], [{ a: "1" }]);
    expect(csv).toBe("a,b\r\n1,\r\n");
  });

  it("returns header-only output when rows is empty", () => {
    expect(buildCsv(["a", "b"], [])).toBe("a,b\r\n");
  });
});
