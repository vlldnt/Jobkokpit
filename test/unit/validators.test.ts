import { describe, expect, it } from "vitest";

import {
  isValidEmail,
  isValidHttpUrl,
  isValidPhone,
} from "@/agents/quality-control/validators";

describe("quality validators", () => {
  it("validates emails", () => {
    expect(isValidEmail("a@b.co")).toBe(true);
    expect(isValidEmail("nope")).toBe(false);
    expect(isValidEmail("a@b")).toBe(false);
  });

  it("validates phones", () => {
    expect(isValidPhone("+33 6 12 34 56 78")).toBe(true);
    expect(isValidPhone("0612345678")).toBe(true);
    expect(isValidPhone("123")).toBe(false);
    expect(isValidPhone("not-a-phone")).toBe(false);
  });

  it("validates http(s) urls", () => {
    expect(isValidHttpUrl("https://example.com")).toBe(true);
    expect(isValidHttpUrl("http://example.com")).toBe(true);
    expect(isValidHttpUrl("ftp://example.com")).toBe(false);
    expect(isValidHttpUrl("example.com")).toBe(false);
  });
});
