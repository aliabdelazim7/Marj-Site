import { describe, expect, it } from "vitest";
import { createOrderInputSchema, normalizePublishedCatalogLine, orderLookupInputSchema } from "./routers";
import { isValidCustomerEmail } from "@shared/commerce";

const validOrder = { customerName: "أحمد علي", email: "ahmed@example.com", phone: "01012345678", address: "شارع التحرير، مبنى ١٠", city: "القاهرة", paymentMethod: "cod", consent: true as const, items: [{ productId: "signal-red", size: "M" as const, quantity: 1 }] };

describe("checkout order input", () => {
  it("accepts a complete valid checkout payload", () => {
    expect(createOrderInputSchema.safeParse(validOrder).success).toBe(true);
  });
  it("rejects empty cart and malformed contact fields", () => {
    expect(createOrderInputSchema.safeParse({ ...validOrder, items: [] }).success).toBe(false);
    expect(createOrderInputSchema.safeParse({ ...validOrder, email: "not-an-email" }).success).toBe(false);
    expect(createOrderInputSchema.safeParse({ ...validOrder, phone: "123" }).success).toBe(false);
    expect(createOrderInputSchema.safeParse({ ...validOrder, consent: false }).success).toBe(false);
    expect(createOrderInputSchema.safeParse({ ...validOrder, paymentMethod: "" }).success).toBe(false);
  });
  it("keeps the shared customer email rule explicit", () => {
    expect(isValidCustomerEmail("ahmed@example.com")).toBe(true);
    expect(isValidCustomerEmail("bad-email")).toBe(false);
    expect(isValidCustomerEmail("  ahmed@example.com  ")).toBe(true);
  });
  it("validates order lookup contact input with the same email rule", () => {
    expect(orderLookupInputSchema.safeParse({ orderNumber: "HF-2026-ABC123", email: "ahmed@example.com" }).success).toBe(true);
    expect(orderLookupInputSchema.safeParse({ orderNumber: "HF-2026-ABC123", email: "bad-email" }).success).toBe(false);
  });
  it("rejects an unsupported size or quantity above the per-line limit", () => {
    expect(createOrderInputSchema.safeParse({ ...validOrder, items: [{ productId: "signal-red", size: "XXL", quantity: 1 }] }).success).toBe(false);
    expect(createOrderInputSchema.safeParse({ ...validOrder, items: [{ productId: "signal-red", size: "M", quantity: 6 }] }).success).toBe(false);
  });

  it("rechecks the published variation price and stock before creating an order", () => {
    const catalog = [{ id: "signal-red", price: 899, sizes: ["S", "M"], stockStatus: "instock", manageStock: true, variants: [{ size: "M", status: "active", stockStatus: "instock", stock: 2, priceOverride: 925 }] }];
    expect(normalizePublishedCatalogLine({ productId: "signal-red", size: "M", quantity: 2 }, catalog)).toMatchObject({ unitPrice: 925, lineTotal: 1850 });
    expect(() => normalizePublishedCatalogLine({ productId: "signal-red", size: "M", quantity: 3 }, catalog)).toThrow("الكمية المتاحة");
    expect(() => normalizePublishedCatalogLine({ productId: "signal-red", size: "L", quantity: 1 }, catalog)).toThrow("المقاس L غير متاح");
  });
});
