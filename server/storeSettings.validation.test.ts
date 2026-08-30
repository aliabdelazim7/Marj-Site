import { describe, expect, it } from "vitest";
import { storeSettingsInputSchema } from "./routers";

const validSettings = {
  brandName: "مرج",
  shippingScope: "الشحن متاح لجميع محافظات مصر",
  shippingFee: 60,
  freeShippingThreshold: 2000,
  shippingNotice: "تظهر الرسوم النهائية في ملخص الطلب قبل التأكيد.",
  returnPolicy: "يتم تطبيق سياسة الاستبدال والإرجاع الموضحة في المتجر.",
  paymentNotice: "الدفع عند الاستلام متاح بعد تأكيد الطلب.",
};

describe("store settings validation", () => {
  it("accepts configurable Egypt shipping and payment disclosures", () => {
    expect(storeSettingsInputSchema.parse(validSettings)).toMatchObject(validSettings);
  });

  it("rejects a negative shipping fee and invalid free-shipping threshold", () => {
    expect(storeSettingsInputSchema.safeParse({ ...validSettings, shippingFee: -1 }).success).toBe(false);
    expect(storeSettingsInputSchema.safeParse({ ...validSettings, freeShippingThreshold: 0 }).success).toBe(false);
  });
});
