import { describe, expect, it } from "vitest";

import { isDevJobTitle } from "@/features/offers/title-filter";

describe("isDevJobTitle", () => {
  it("garde les intitulés dev / informatique", () => {
    expect(isDevJobTitle("Développeur Full Stack H/F")).toBe(true);
    expect(isDevJobTitle("Developpeuse web junior")).toBe(true);
    expect(isDevJobTitle("Software Engineer")).toBe(true);
    expect(isDevJobTitle("DevOps Engineer")).toBe(true);
    expect(isDevJobTitle("Ingénieur d'études et développement")).toBe(true);
    expect(isDevJobTitle("Data Engineer (H/F)")).toBe(true);
    expect(isDevJobTitle("Technicien informatique")).toBe(true);
    expect(isDevJobTitle("Lead Dev React")).toBe(true);
    expect(isDevJobTitle("Architecte logiciel")).toBe(true);
    expect(isDevJobTitle("Testeur logiciel QA")).toBe(true);
    expect(isDevJobTitle("Développeur PHP Symfony")).toBe(true);
  });

  it("écarte les intitulés hors sujet remontés par les providers", () => {
    expect(
      isDevJobTitle(
        "Conseiller / Conseillère de vente - Esthéticien / Esthéticienne",
      ),
    ).toBe(false);
    expect(isDevJobTitle("Esthéticien - Conseiller de Beauté H/F")).toBe(false);
    expect(isDevJobTitle("Agent de contrôle (F/H)")).toBe(false);
    expect(isDevJobTitle("Vendeur en boulangerie")).toBe(false);
    expect(isDevJobTitle("Chauffeur poids lourd")).toBe(false);
    expect(isDevJobTitle("Aide-soignant de nuit")).toBe(false);
    expect(isDevJobTitle(null)).toBe(false);
    expect(isDevJobTitle("")).toBe(false);
  });
});
