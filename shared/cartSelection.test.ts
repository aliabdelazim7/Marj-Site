import { describe, expect, it } from "vitest";
import { preferredQuickAddSize } from "./cartSelection";

describe("preferredQuickAddSize", () => {
  it("uses M when that size is available for the quick-add path", () => {
    expect(preferredQuickAddSize(["S", "M", "L", "XL"])).toBe("M");
  });

  it("falls back to the first available size without inventing a variation", () => {
    expect(preferredQuickAddSize(["S", "L"])).toBe("S");
    expect(preferredQuickAddSize([])).toBe("");
  });
});
