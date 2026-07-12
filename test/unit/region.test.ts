import { describe, expect, it } from "vitest";

import { isEuropeLocation, isInRegion } from "@/features/offers/region";
import { remoteBadge } from "@/features/offers/remote-badge";

describe("isInRegion", () => {
  it("matches région departments, cities and France Travail formats", () => {
    expect(isInRegion("Rodez")).toBe(true);
    expect(isInRegion("12 - RODEZ")).toBe(true);
    expect(isInRegion("Albi, Tarn")).toBe(true);
    expect(isInRegion("Paris")).toBe(false);
    expect(isInRegion(null)).toBe(false);
  });
});

describe("isEuropeLocation", () => {
  it("matches European countries and cities outside France", () => {
    expect(isEuropeLocation("Berlin, Germany")).toBe(true);
    expect(isEuropeLocation("Lisbon, Portugal")).toBe(true);
    expect(isEuropeLocation("Remote - Europe")).toBe(true);
    expect(isEuropeLocation("Madrid")).toBe(true);
  });

  it("never flags French locations", () => {
    expect(isEuropeLocation("Paris, France")).toBe(false);
    expect(isEuropeLocation("12 - RODEZ")).toBe(false);
    expect(isEuropeLocation("Île-de-France")).toBe(false);
    expect(isEuropeLocation(null)).toBe(false);
  });
});

describe("remoteBadge", () => {
  it("colore les modalités : vert télétravail, orange hybride, gris sur site", () => {
    expect(remoteBadge("REMOTE")).toEqual({
      label: "Télétravail",
      variant: "remote",
    });
    expect(remoteBadge("HYBRID")).toEqual({
      label: "Hybride",
      variant: "hybrid",
    });
    expect(remoteBadge("ONSITE")).toEqual({
      label: "Sur site",
      variant: "outline",
    });
    expect(remoteBadge("???")).toEqual({
      label: "Non précisé",
      variant: "outline",
    });
  });
});
