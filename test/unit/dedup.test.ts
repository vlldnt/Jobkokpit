import { describe, expect, it } from "vitest";

import { offerDedupHash } from "@/lib/dedup";

describe("offerDedupHash", () => {
  it("is stable across whitespace/case/diacritic-insensitive-ish variants", () => {
    const a = offerDedupHash("  Dev   Senior ", "ACME", "Paris");
    const b = offerDedupHash("dev senior", "acme", "paris");
    expect(a).toBe(b);
  });

  it("differs when a component changes", () => {
    const a = offerDedupHash("Dev", "ACME", "Paris");
    const b = offerDedupHash("Dev", "ACME", "Lyon");
    expect(a).not.toBe(b);
  });

  it("treats missing company/location consistently", () => {
    expect(offerDedupHash("Dev")).toBe(offerDedupHash("Dev", null, null));
  });
});
