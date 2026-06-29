import { describe, expect, it } from "vitest";

import { assertSafeUrl } from "@/lib/ssrf";

describe("assertSafeUrl", () => {
  it("rejects non-http(s) protocols", async () => {
    await expect(assertSafeUrl("ftp://example.com")).rejects.toThrow();
  });

  it("rejects loopback and private IP literals", async () => {
    await expect(assertSafeUrl("http://127.0.0.1")).rejects.toThrow();
    await expect(assertSafeUrl("http://10.0.0.5")).rejects.toThrow();
    await expect(assertSafeUrl("http://192.168.1.1")).rejects.toThrow();
    await expect(assertSafeUrl("http://169.254.1.1")).rejects.toThrow();
  });

  it("accepts a public IP literal (no DNS lookup needed)", async () => {
    const url = await assertSafeUrl("https://8.8.8.8/path");
    expect(url.hostname).toBe("8.8.8.8");
  });
});
