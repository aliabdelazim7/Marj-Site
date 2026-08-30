import { describe, expect, it } from "vitest";
import { calculateTotals, resolveCatalogUnitPrice, validateCatalogStock, validateCommerceLine } from "./commerce";

describe("local commerce rules", () => {
  it("adds shipping below the free-shipping threshold", () => {
    expect(calculateTotals([{ productId: "signal-red", size: "M", quantity: 1 }])).toEqual({ subtotal: 899, shipping: 60, total: 959 });
  });
  it("makes shipping free at 2000 EGP", () => {
    expect(calculateTotals([{ productId: "night-grid", size: "L", quantity: 2 }, { productId: "paper-white", size: "M", quantity: 1 }])).toEqual({ subtotal: 2747, shipping: 0, total: 2747 });
  });
  it("rejects unknown products, sizes, and unsafe quantities", () => {
    expect(validateCommerceLine({ productId: "missing", size: "M", quantity: 1 }).ok).toBe(false);
    expect(validateCommerceLine({ productId: "signal-red", size: "XXL", quantity: 1 }).ok).toBe(false);
    expect(validateCommerceLine({ productId: "signal-red", size: "M", quantity: 6 }).ok).toBe(false);
  });
  it("accepts a valid local catalog line", () => {
    expect(validateCommerceLine({ productId: "concrete-grey", size: "XL", quantity: 2 }).ok).toBe(true);
  });
  it("uses a variation price override and rejects quantities above stock", () => {
    const product = { price: 949, manageStock: true, stockStatus: "instock", variants: [{ size: "M", stock: 2, priceOverride: 899, stockStatus: "instock", status: "active" }] };
    expect(resolveCatalogUnitPrice(product, "M").unitPrice).toBe(899);
    expect(validateCatalogStock(product, "M", 2).ok).toBe(true);
    expect(validateCatalogStock(product, "M", 3).ok).toBe(false);
  });
  it("rejects an out-of-stock product or variation", () => {
    expect(validateCatalogStock({ price: 949, stockStatus: "outofstock" }, "M", 1).ok).toBe(false);
    expect(validateCatalogStock({ price: 949, variants: [{ size: "M", stock: 0, priceOverride: null, stockStatus: "outofstock", status: "active" }] }, "M", 1).ok).toBe(false);
  });
});
