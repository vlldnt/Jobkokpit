import { describe, expect, it } from "vitest";

import { cn } from "@/lib/utils";
import { err, ok } from "@/lib/result";

describe("cn", () => {
  it("merges classes and resolves Tailwind conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
    expect(cn("a", false && "b", "c")).toBe("a c");
  });
});

describe("result", () => {
  it("constructs ok and err variants", () => {
    expect(ok(1)).toEqual({ ok: true, value: 1 });
    expect(err("boom")).toEqual({ ok: false, error: "boom" });
  });
});
