import { describe, expect, it } from "vitest";
import { calculateShippingForGovernorate } from "./shippingRules";

describe("governorate shipping", () => {
  it("uses the selected governorate fee until the configured free-shipping threshold is reached", () => {
    expect(calculateShippingForGovernorate(900, 70, 1500)).toBe(70);
    expect(calculateShippingForGovernorate(1500, 70, 1500)).toBe(0);
    expect(calculateShippingForGovernorate(900, 70, null)).toBe(70);
  });

  it("does not add shipping to an empty subtotal", () => {
    expect(calculateShippingForGovernorate(0, 70, null)).toBe(0);
  });
});
