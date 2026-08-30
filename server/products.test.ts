import { describe, expect, it } from "vitest";
import { getHoodieById, getHoodieBySlug, getHoodieFromTryOnSearch, hoodieProducts } from "@shared/products";

describe("hoodie catalog selection", () => {
  it("resolves every catalog item by the same id used by try-on", () => {
    for (const product of hoodieProducts) {
      expect(getHoodieById(product.id)).toMatchObject({ id: product.id, name: product.name });
    }
  });

  it("resolves a detail-page slug to a complete product record", () => {
    const product = getHoodieBySlug("signal-red-hoodie");
    expect(product).toMatchObject({ id: "signal-red", slug: "signal-red-hoodie" });
    expect(product?.images[0]).toContain("signal-red-front");
    expect(product?.sizes).toEqual(["S", "M", "L", "XL"]);
  });

  it("restores the selected hoodie from the detail-page try-on query", () => {
    expect(getHoodieFromTryOnSearch("?tryOn=night-grid#try-on")?.id).toBe("night-grid");
    expect(getHoodieFromTryOnSearch("?tryOn=night-grid-hoodie#try-on")?.id).toBe("night-grid");
    expect(getHoodieFromTryOnSearch("?tryOn=missing")?.id).toBeUndefined();
  });

  it("keeps the selected garment data available for the generated prompt", () => {
    const selected = getHoodieById("night-grid");
    expect(selected?.nameArabic).toBe("شبكة ليلية");
    expect(selected?.color).toBe("أسود ليلي");
    expect(selected?.description).toContain("أسود عميق");
  });
});
