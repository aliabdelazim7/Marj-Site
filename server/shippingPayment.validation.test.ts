import { describe, expect, it } from "vitest";
import { paymentMethodUpdateSchema, shippingZoneUpdateSchema } from "./routers";

describe("shipping and payment admin inputs", () => {
  it("accepts an editable Egyptian governorate fee and delivery note", () => {
    expect(shippingZoneUpdateSchema.safeParse({ id: 1, fee: 75, enabled: true, deliveryNote: "التوصيل متاح للعنوان المسجل." }).success).toBe(true);
  });

  it("rejects a negative shipping fee and an invalid payment label", () => {
    expect(shippingZoneUpdateSchema.safeParse({ id: 1, fee: -1, enabled: true, deliveryNote: null }).success).toBe(false);
    expect(paymentMethodUpdateSchema.safeParse({ id: 1, label: "", enabled: true, instructions: "تعليمات" }).success).toBe(false);
  });
});
