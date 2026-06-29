import { describe, expect, it } from "vitest";

import { parseJsonResponse } from "@/agents/shared/json";

describe("parseJsonResponse", () => {
  it("parses plain JSON", () => {
    expect(parseJsonResponse('{"a":1}')).toEqual({ a: 1 });
  });

  it("strips code fences", () => {
    expect(parseJsonResponse('```json\n{"a":1}\n```')).toEqual({ a: 1 });
  });

  it("extracts an object embedded in prose", () => {
    expect(parseJsonResponse('Voici: {"a":1} merci')).toEqual({ a: 1 });
  });

  it("throws on unrecoverable output", () => {
    expect(() => parseJsonResponse("pas de json ici")).toThrow();
  });
});
