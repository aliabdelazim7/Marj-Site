import { describe, expect, it } from "vitest";

describe("brand configuration", () => {
  it("uses the confirmed Marj application title", () => {
    expect(process.env.VITE_APP_TITLE).toContain("مرج");
  });
});
