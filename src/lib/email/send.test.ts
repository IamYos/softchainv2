import { describe, it, expect } from "vitest";
import { adminRecipients } from "./send";

describe("adminRecipients", () => {
  it("includes the owner email and the info@ notify address", () => {
    expect(adminRecipients("yosmouawad@gmail.com")).toEqual([
      "yosmouawad@gmail.com",
      "info@softchain.ae",
    ]);
  });

  it("does not duplicate when the owner email is the notify address", () => {
    expect(adminRecipients("info@softchain.ae")).toEqual(["info@softchain.ae"]);
    expect(adminRecipients("Info@Softchain.ae")).toEqual(["Info@Softchain.ae"]);
  });
});
